# Documentação: Lógica de Viewers (Visualizações)

Este documento descreve como implementar a contagem de visualizações totais e espectadores simultâneos utilizando a tabela `streaming.view`.

## 1. O Conceito de Heartbeat (Ping)

Para saber se um usuário ainda está assistindo à stream (já que o protocolo HLS é via HTTP e não mantém uma conexão persistente), usamos um mecanismo de pulsos ou "Heartbeat".

### Fluxo Sugerido:

1.  **Início da Visualização:** Assim que o player carrega e inicia o vídeo, o frontend faz um `POST /streams/:id/view`.
2.  **Registro Inicial:** O servidor cria um registro na tabela `streaming.view` e retorna o `view_id` (UUID) para o frontend.
3.  **Pulso Contínuo (Ping):** O frontend armazena esse `view_id` e, a cada **30 segundos**, faz uma nova chamada para a mesma rota enviando o `view_id`.
4.  **Atualização:** O servidor busca o registro e atualiza o campo `last_ping_at` com o `now()`.

---

## 2. Consultas SQL Úteis

### Espectadores Simultâneos (Live Viewers)

Para considerar um usuário "online", verificamos se o último pulso dele aconteceu nos últimos 60 segundos (dando uma margem para pequenos atrasos de rede).

```sql
SELECT count(*) 
FROM streaming.view 
WHERE stream_id = 'ID_DA_STREAM'
  AND finished_at IS NULL
  AND last_ping_at > now() - interval '60 seconds';
```

### Total de Visualizações Únicas

Contagem de sessões iniciadas para aquela stream.

```sql
SELECT count(*) 
FROM streaming.view 
WHERE stream_id = 'ID_DA_STREAM';
```

---

## 3. Considerações de Implementação

### Backend (Node.js)
- A rota deve lidar com os dois casos:
    - **Sem `view_id`:** Gera um novo UUID e faz um `INSERT`.
    - **Com `view_id`:** Faz um `UPDATE streaming.view SET last_ping_at = now() WHERE view_id = ...`.

### Performance
- Em um sistema com muitos milhares de acessos, fazer um `UPDATE` no banco a cada 30 segundos pode sobrecarregar o disco. 
- **Otimização Futura:** Usar o **Redis** para armazenar os pings temporários e descarregar no PostgreSQL apenas no final da sessão ou em intervalos maiores.

### Encerramento de Sessão
- Quando o usuário fecha a aba, o campo `finished_at` pode ficar nulo. No entanto, para fins de métrica, o `last_ping_at` antigo já é suficiente para saber que ele saiu. 
- Opcionalmente, pode-se usar o evento `onbeforeunload` do navegador para enviar um último ping de encerramento (`finished_at = now()`), mas não é 100% garantido que o navegador completará a requisição.
