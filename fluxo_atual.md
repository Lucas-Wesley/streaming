# Fluxo de Streaming: Do OBS ao Player

Este documento explica passo a passo como o sistema de streaming funciona, desde o momento que você aperta "Iniciar Transmissão" no OBS até o vídeo aparecer no navegador com **3 qualidades diferentes** (adaptativo).

---

## Arquitetura Geral

```
┌─────────┐    RTMP (1935)    ┌────────────────────────┐
│   OBS   │ ─────────────────▶│  Nginx-RTMP (live)     │
└─────────┘                   │  stream_server         │
                              └────────────────────────┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                     POST /auth              exec transcode.sh
                              │                     │
                              ▼                     ▼
                      ┌──────────────┐      ┌─────────────┐
                      │   Backend    │      │   FFmpeg    │
                      │  (Node.js)   │      │  (3 saídas) │
                      └──────────────┘      └─────────────┘
                                                    │
                              ┌─────────────────────┼─────────────────────┐
                              │                     │                     │
                         _mid (720p)           _low (480p)          _src (orig)
                              │                     │                     │
                              └─────────────────────┴─────────────────────┘
                                                    │
                                         RTMP (hls_transcoding)
                                                    │
                                                    ▼
                                    ┌────────────────────────────┐
                                    │  Nginx-RTMP                │
                                    │  (hls_transcoding)         │
                                    │  Gera arquivos HLS         │
                                    └────────────────────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │  /hls/live/  │
                                            │  - .m3u8     │
                                            │  - .ts       │
                                            └──────────────┘
                                                    │
                                         HTTP (8080)│
                                                    ▼
                                            ┌──────────────┐
                                            │   Player     │
                                            │  (Browser)   │
                                            └──────────────┘
```

---

## Passo a Passo Detalhado

### 1. OBS Inicia a Transmissão
- **O que acontece:** Você configura o OBS para enviar para `rtmp://localhost:1935/live` com a chave `lcuas`.
- **Protocolo:** O OBS usa o protocolo **RTMP** (Real-Time Messaging Protocol), que é ideal para enviar vídeo ao vivo com baixa latência.
- **Arquivo envolvido:** Configuração do OBS (externo).

---

### 2. Nginx Recebe o Stream e Valida
- **O que acontece:** O container `stream_server` (Nginx-RTMP) recebe a conexão na porta **1935** na aplicação `live`.
- **Validação:** Antes de aceitar, o Nginx faz um **POST** para o backend em `http://backend:3000/auth` enviando a chave (`name=lcuas`).
- **Arquivos envolvidos:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (application live): `on_publish http://backend:3000/auth;` (Nota: Configurado para porta 3000, mas backend roda na 4444)
  - [`src/api.ts`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/api.ts) (rota `/auth`): Valida e retorna `200 OK` ou `403 Forbidden`.

```nginx
# nginx.conf - application live
on_publish http://backend:3000/auth;
```

```typescript
// api.ts
app.post('/auth', (req, res) => {
  const streamKey = req.body.name;
  console.log(`[OBS Conectado] Chave: ${streamKey}`);
  res.status(200).send('OK'); // Autorizado!
});
```

---

### 3. Nginx Dispara o Script de Transcodificação
- **O que acontece:** Após a autenticação bem-sucedida, o Nginx executa o script [`infra/transcode.sh`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/transcode.sh) passando o nome da stream como argumento.
- **Como funciona:**
  1. O script recebe o stream RTMP de entrada (`rtmp://127.0.0.1:1935/live/lcuas`)
  2. Usa **FFmpeg** para gerar **3 qualidades simultâneas**:
     - `lcuas_mid` → 720p @ 1.5 Mbps
     - `lcuas_low` → 480p @ 800 kbps
     - `lcuas_src` → Original @ 4.5 Mbps
  3. Cada qualidade é enviada de volta para o Nginx na aplicação `hls_transcoding`.
- **Arquivos envolvidos:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf): `exec /usr/local/bin/transcode.sh $name;`
  - [`infra/transcode.sh`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/transcode.sh): Script bash com comando FFmpeg completo

```nginx
# nginx.conf - application live
exec /usr/local/bin/transcode.sh $name;
```

---

### 4. Nginx Converte os 3 Streams para HLS
- **O que acontece:** A aplicação `hls_transcoding` do Nginx recebe os 3 streams e converte cada um para HLS.
- **Como funciona:**
  1. Cada stream é "picotado" em fragmentos de **4 segundos** (arquivos `.ts`).
  2. São criadas playlists individuais para cada qualidade:
     - `lcuas_mid.m3u8`
     - `lcuas_low.m3u8`
     - `lcuas_src.m3u8`
  3. Uma **playlist master** (`lcuas.m3u8`) é criada com referências às 3 qualidades.
- **Onde os arquivos são salvos:** No container, em `/hls/live/lcuas/`. No host, em `./hls/live/lcuas/`.
- **Arquivo envolvido:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (application hls_transcoding):

```nginx
hls on;
hls_path /hls/live;
hls_fragment 4s;
hls_playlist_length 60s;
hls_nested on;

# Variantes com bandwidth para streaming adaptativo
hls_variant _mid BANDWIDTH=1600000;
hls_variant _low BANDWIDTH=900000;
hls_variant _src BANDWIDTH=5000000;
```

---

### 5. Player Solicita o Vídeo
- **O que acontece:** O navegador acessa `http://localhost:4444`, que serve o player HTML.
- **O Player (hls.js):** A biblioteca `hls.js` faz uma requisição para `http://localhost:8080/hls/lcuas.m3u8` (playlist master).
- **Streaming Adaptativo:** O player detecta a velocidade de internet e escolhe automaticamente entre `_mid`, `_low` ou `_src`.
- **Arquivo envolvido:**
  - [`src/index.html`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/index.html):

```javascript
const videoSrc = `http://localhost:8080/hls/${streamKey}.m3u8`;
const hls = new Hls();
hls.loadSource(videoSrc);
hls.attachMedia(video);
```

---

### 6. Nginx Serve os Arquivos HLS
- **O que acontece:** O bloco `http` do Nginx recebe a requisição na porta **8080** e serve os arquivos.
- **Mapeamento de URL:**
  - Requisição: `GET /hls/lcuas.m3u8`
  - Caminho no disco: `/hls/live/lcuas/lcuas.m3u8` (graças ao `alias` e `hls_nested`)
- **CORS:** O cabeçalho `Access-Control-Allow-Origin: *` permite que o frontend (em qualquer origem) acesse o vídeo.
- **Arquivo envolvido:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (bloco http):

```nginx
location /hls {
    types {
        application/vnd.apple.mpegurl m3u8;
        video/mp2t ts;
    }
    alias /hls/live/;
    add_header Cache-Control no-cache;
    add_header Access-Control-Allow-Origin * always;
}
```

---

### 7. Player Reproduz o Vídeo com Qualidade Adaptativa
- **O que acontece:** 
  1. O player baixa a playlist master (`lcuas.m3u8`)
  2. Escolhe a qualidade inicial baseado na largura de banda
  3. Baixa os fragmentos `.ts` da qualidade selecionada
  4. Decodifica e exibe o vídeo em tempo real
  5. **Monitora continuamente** a velocidade e troca de qualidade se necessário
- **Loop contínuo:** A cada poucos segundos, o player busca a playlist atualizada para pegar os novos fragmentos.

---

## Resumo dos Containers

| Container        | Porta(s)       | Responsabilidade                                     |
|------------------|----------------|------------------------------------------------------|
| `stream_server`  | 1935, 8080     | Receber stream RTMP, orquestrar FFmpeg, servir HLS   |
| `backend`        | 4444           | API Node.js, autenticação, servir o Player HTML (Nota: Nginx busca na 3000) |
| `db`             | 5432           | Banco de dados PostgreSQL                            |

---

## Arquivos-Chave

| Arquivo                                                                                          | Função                                      |
|--------------------------------------------------------------------------------------------------|---------------------------------------------|
| [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) | Configuração do Nginx (RTMP + HTTP)         |
| [`infra/transcode.sh`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/transcode.sh) | Script de transcodificação FFmpeg (3 qualidades) |
| [`src/api.ts`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/api.ts)             | Backend Node.js (API + Autenticação)        |
| [`src/index.html`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/index.html) | Player de vídeo com hls.js      |
| [`docker/docker-compose.yaml`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/docker/docker-compose.yaml) | Orquestração dos containers |

---

## Fluxo de Dados Completo

```
OBS (1080p@60fps, 6 Mbps)
         │
         ▼
Nginx-RTMP (application live)
         │
         ├──▶ POST /auth → Backend (autoriza)
         │
         ▼
transcode.sh (FFmpeg)
         │
         ├──▶ lcuas_mid (720p, 1.5 Mbps)  ──┐
         ├──▶ lcuas_low (480p, 800 kbps)   ├──▶ Nginx (hls_transcoding)
         └──▶ lcuas_src (orig, 4.5 Mbps)  ─┘           │
                                                        ▼
                                                /hls/live/lcuas/
                                                ├── lcuas.m3u8 (master)
                                                ├── lcuas_mid.m3u8
                                                ├── lcuas_low.m3u8
                                                ├── lcuas_src.m3u8
                                                └── *.ts (fragmentos)
                                                        │
                                                        ▼
                                                HTTP Server (8080)
                                                        │
                                                        ▼
                                                Player HLS.js
                                              (escolhe qualidade)
```

---

## Vantagens da Arquitetura Atual

1. **Streaming Adaptativo**: Player troca de qualidade automaticamente baseado na velocidade de internet do usuário.
2. **Script Isolado**: Toda lógica do FFmpeg está em um arquivo `.sh` separado, fácil de manter e testar.
3. **Escalável**: Adicionar novas qualidades é simples (editar apenas o `transcode.sh`).
4. **Redundância**: Se uma qualidade falhar, as outras continuam funcionando.
5. **Otimizado para Live**: Parâmetros `-tune zerolatency` e `-preset ultrafast` minimizam delay.
