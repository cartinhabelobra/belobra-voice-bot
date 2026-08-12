// ============================================================
// BELOBRA — Configuracao do PM2 (gerenciador de processos)
// Isso mantem o bot rodando pra sempre na VM, reiniciando
// sozinho se cair ou se o servidor reiniciar.
// ============================================================
// IMPORTANTE: preencha DISCORD_BOT_TOKEN e DISCORD_GUILD_ID
// abaixo antes de rodar "pm2 start ecosystem.config.js"

module.exports = {
  apps: [{
    name: "belobra-voice-bot",
    script: "index.js",
    env: {
      DISCORD_BOT_TOKEN: "COLE_AQUI_O_TOKEN_DO_BOT",
      DISCORD_GUILD_ID: "COLE_AQUI_O_ID_DO_SERVIDOR",
      PORT: 8000
    },
    autorestart: true,
    max_restarts: 20,
  }]
};
