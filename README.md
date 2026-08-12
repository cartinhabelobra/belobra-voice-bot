# Belobra Voice Bot

Bot que cria salas de voz temporarias no servidor Discord do Belobra.
Quando alguem entra no canal "➕ Criar Sala", o bot cria uma sala nova
so pra essa pessoa e ja move ela pra dentro. A sala some sozinha quando
fica vazia.

## Variaveis de ambiente necessarias

- `DISCORD_BOT_TOKEN` — o token do bot (Discord Developer Portal > Bot > Token)
- `DISCORD_GUILD_ID` — o ID do servidor Belobra

## Como fazer o deploy no Koyeb

1. Crie um repositorio novo no GitHub (pode ser `belobra-voice-bot`) e suba
   esses 3 arquivos: `index.js`, `package.json`, `README.md`

2. No Koyeb, clique em **"Create Service"**

3. Escolha **"GitHub"** como fonte, autorize se pedido, e selecione o
   repositorio `belobra-voice-bot`

4. Nas configuracoes de build, o Koyeb deve detectar automaticamente que
   e um app Node.js (por causa do `package.json`). Se pedir comando de
   start, use: `npm start`

5. Em **"Environment variables"**, adicione:
   - `DISCORD_BOT_TOKEN` = (o token do seu bot)
   - `DISCORD_GUILD_ID` = (o ID do servidor Belobra)

6. Em **"Ports"**, configure a porta **8000** (ou deixe a que o Koyeb
   sugerir — o bot ja usa `process.env.PORT` automaticamente)

7. Clique em **Deploy**

8. Espere o build terminar. Nos logs, deve aparecer:
   ```
   Bot conectado como NomeDoBot#1234
   ```

Depois disso, o bot cria sozinho a categoria "SALAS TEMPORARIAS" e o
canal "➕ Criar Sala" no servidor, caso ainda nao existam.

## Permissoes do bot necessarias

Ao convidar o bot pro servidor (OAuth2 > URL Generator > escopo "bot"),
marque pelo menos:
- Manage Channels
- Move Members
- Connect
- View Channels
