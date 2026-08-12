// ============================================================
// BELOBRA — Bot de Salas de Voz Temporarias
// ============================================================
// Como funciona:
// - Existe um canal de voz fixo chamado "Criar Sala"
// - Quando alguem entra nesse canal, o bot cria uma sala nova
//   so pra essa pessoa, e ja move ela pra dentro
// - O dono da sala pode ajustar o limite de membros direto pelo
//   Discord (clique direito na sala > Editar Canal > Limite de
//   usuarios) — o bot ja da essa permissao pra ele automaticamente
// - Quando a sala fica vazia (o dono e todo mundo sai), o bot
//   apaga ela sozinho
// ============================================================

const { Client, GatewayIntentBits, ChannelType, PermissionsBitField } = require('discord.js');
const http = require('http');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if(!BOT_TOKEN || !GUILD_ID){
  console.error('Faltam as variaveis de ambiente DISCORD_BOT_TOKEN e/ou DISCORD_GUILD_ID.');
  process.exit(1);
}

const TRIGGER_CHANNEL_NAME = '➕ Criar Sala';
const CATEGORY_NAME = 'SALAS TEMPORARIAS';
const ROOM_PREFIX = '🔊 Sala de ';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Controla quais canais foram criados pelo bot (pra saber quais pode apagar)
const tempRooms = new Map(); // channelId -> ownerId

let triggerChannelId = null;
let categoryId = null;

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  await ensureSetup();
});

// Garante que a categoria e o canal de "Criar Sala" existem no servidor
async function ensureSetup(){
  const guild = await client.guilds.fetch(GUILD_ID);
  await guild.channels.fetch();

  let category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME);
  if(!category){
    category = await guild.channels.create({
      name: CATEGORY_NAME,
      type: ChannelType.GuildCategory,
    });
    console.log('Categoria criada:', category.name);
  }
  categoryId = category.id;

  let trigger = guild.channels.cache.find(c => c.type === ChannelType.GuildVoice && c.name === TRIGGER_CHANNEL_NAME);
  if(!trigger){
    trigger = await guild.channels.create({
      name: TRIGGER_CHANNEL_NAME,
      type: ChannelType.GuildVoice,
      parent: category.id,
    });
    console.log('Canal de criacao criado:', trigger.name);
  }
  triggerChannelId = trigger.id;
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  try{
    // Alguem entrou no canal "Criar Sala"
    if(newState.channelId === triggerChannelId && newState.member){
      await createRoomFor(newState);
    }

    // Alguem saiu de um canal — confere se era uma sala temporaria e se ficou vazia
    if(oldState.channelId && tempRooms.has(oldState.channelId)){
      const channel = oldState.channel;
      if(channel && channel.members.size === 0){
        await channel.delete().catch(() => {});
        tempRooms.delete(oldState.channelId);
        console.log('Sala temporaria removida (ficou vazia):', channel.name);
      }
    }
  }catch(err){
    console.error('Erro no voiceStateUpdate:', err);
  }
});

async function createRoomFor(voiceState){
  const guild = voiceState.guild;
  const member = voiceState.member;

  const room = await guild.channels.create({
    name: ROOM_PREFIX + member.displayName,
    type: ChannelType.GuildVoice,
    parent: categoryId,
    permissionOverwrites: [
      {
        id: member.id,
        allow: [
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.MoveMembers,
          PermissionsBitField.Flags.MuteMembers,
          PermissionsBitField.Flags.DeafenMembers,
        ],
      },
    ],
  });

  tempRooms.set(room.id, member.id);
  await member.voice.setChannel(room).catch(() => {});
  console.log(`Sala criada para ${member.displayName}: ${room.name}`);
}

client.login(BOT_TOKEN);

// ============================================================
// Servidor HTTP minimo, so pra satisfazer o "health check" do Koyeb
// (a plataforma espera algo respondendo numa porta, mesmo sendo um bot)
// ============================================================
const PORT = process.env.PORT || 8000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Belobra voice bot rodando.');
}).listen(PORT, () => {
  console.log('Servidor HTTP de saude rodando na porta', PORT);
});
