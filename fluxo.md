# Fluxo de Streaming: Do OBS ao Player

Este documento explica passo a passo como o sistema de streaming funciona, desde o momento que você aperta "Iniciar Transmissão" no OBS até o vídeo aparecer no navegador.

---

## Arquitetura Geral

```
┌─────────┐      RTMP (1935)      ┌────────────────┐      HLS Files      ┌─────────────┐
│   OBS   │ ──────────────────▶   │  Nginx-RTMP    │ ──────────────────▶ │   /hls/     │
└─────────┘                       │  (stream_server)│                     └─────────────┘
                                  └────────────────┘                            │
                                         │                                      │
                                         │ POST /auth                           │
                                         ▼                                      ▼
                                  ┌────────────────┐                     ┌─────────────┐
                                  │   Backend      │      HTTP (8080)    │   Player    │
                                  │   (Node.js)    │ ◀────────────────── │  (Browser)  │
                                  └────────────────┘                     └─────────────┘
```

---

## Passo a Passo Detalhado

### 1. OBS Inicia a Transmissão
- **O que acontece:** Você configura o OBS para enviar para `rtmp://localhost:1935/live` com a chave `lcuas`.
- **Protocolo:** O OBS usa o protocolo **RTMP** (Real-Time Messaging Protocol), que é ideal para enviar vídeo ao vivo com baixa latência.
- **Arquivo envolvido:** Configuração do OBS (externo).

---

### 2. Nginx Recebe o Stream e Valida
- **O que acontece:** O container `stream_server` (Nginx-RTMP) recebe a conexão na porta **1935**.
- **Validação:** Antes de aceitar, o Nginx faz um **POST** para o backend em `http://backend:3000/auth` enviando a chave (`name=lcuas`).
- **Arquivos envolvidos:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (linha ~30): `on_publish http://backend:3000/auth;`
  - [`src/api.ts`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/api.ts) (rota `/auth`): Valida e retorna `200 OK` ou `403 Forbidden`.

```nginx
# nginx.conf
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

### 3. Nginx Converte RTMP para HLS
- **O que acontece:** Se o backend autorizar, o Nginx começa a receber o fluxo de vídeo e o converte para **HLS** (HTTP Live Streaming).
- **Como funciona:**
  1. O vídeo é "picotado" em fragmentos de **3 segundos** (arquivos `.ts`).
  2. Uma playlist (`.m3u8`) é criada e atualizada constantemente.
- **Onde os arquivos são salvos:** No container, em `/hls/live/`. No host, em `./hls/live/`.
- **Arquivo envolvido:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (linhas ~34-46):

```nginx
hls on;
hls_path /hls/live;
hls_fragment 3;        # 3 segundos por pedaço
hls_playlist_length 60; # 60 segundos de buffer
```

---

### 4. Player Solicita o Vídeo
- **O que acontece:** O navegador acessa `http://localhost:3000`, que serve o arquivo [`src/public/index.html`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/public/index.html).
- **O Player (hls.js):** A biblioteca `hls.js` faz uma requisição para `http://localhost:8080/hls/lcuas.m3u8`.
- **Arquivo envolvido:**
  - [`src/public/index.html`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/public/index.html):

```javascript
const videoSrc = `http://localhost:8080/hls/${streamKey}.m3u8`;
const hls = new Hls();
hls.loadSource(videoSrc);
hls.attachMedia(video);
```

---

### 5. Nginx Serve os Arquivos HLS
- **O que acontece:** O bloco `http` do Nginx recebe a requisição na porta **8080** e serve os arquivos.
- **Mapeamento de URL:**
  - Requisição: `GET /hls/lcuas.m3u8`
  - Caminho no disco: `/hls/live/lcuas.m3u8` (graças ao `alias`)
- **CORS:** O cabeçalho `Access-Control-Allow-Origin: *` permite que o frontend (em `localhost:3000`) acesse o vídeo (em `localhost:8080`).
- **Arquivo envolvido:**
  - [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) (linhas ~58-76):

```nginx
location /hls/ {
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

### 6. Player Reproduz o Vídeo
- **O que acontece:** A biblioteca `hls.js` baixa a playlist, depois os fragmentos `.ts`, e os decodifica para mostrar o vídeo em tempo real.
- **Loop contínuo:** A cada poucos segundos, o player busca a playlist atualizada para pegar os novos fragmentos.

---

## Resumo dos Containers

| Container        | Porta(s)       | Responsabilidade                                     |
|------------------|----------------|------------------------------------------------------|
| `stream_server`  | 1935, 8080     | Receber stream RTMP, converter para HLS, servir HTTP |
| `backend`        | 3000           | API Node.js, autenticação, servir o Player HTML      |
| `db`             | 5432           | Banco de dados PostgreSQL                            |

---

## Arquivos-Chave

| Arquivo                                                                                          | Função                                      |
|--------------------------------------------------------------------------------------------------|---------------------------------------------|
| [`infra/nginx.conf`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/infra/nginx.conf) | Configuração do Nginx (RTMP + HTTP)         |
| [`src/api.ts`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/api.ts)             | Backend Node.js (API + Autenticação)        |
| [`src/public/index.html`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/src/public/index.html) | Player de vídeo com hls.js      |
| [`docker/docker-compose.rtmp.yaml`](file:///Users/lucaswesley/Desenvolvimento/lucas/streaming/docker/docker-compose.rtmp.yaml) | Definição do container Nginx-RTMP |
