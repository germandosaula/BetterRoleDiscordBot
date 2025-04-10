const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    REST,
    Routes,
    MessageFlags,
  } = require("discord.js");
  require("dotenv").config();
  
  const TOKEN = process.env.TOKEN;
  const CLIENT_ID = process.env.CLIENT_ID;
  const GUILD_ID = process.env.GUILD_ID;
  const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID;
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
    ],
  });

  const commands = [
    new SlashCommandBuilder()
      .setName("darrol")
      .setDescription("Da un rol a todos los usuarios en tu canal de voz")
      .addRoleOption((option) =>
        option
          .setName("rol")
          .setDescription("El rol que quieres asignar")
          .setRequired(true)
      ),
  ];
  
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  
  (async () => {
    try {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });
      console.log("✅ Comando registrado");
    } catch (error) {
      console.error("❌ Error al registrar el comando:", error);
    }
  })();
  
  client.on("ready", () => {
    console.log(`🤖 Bot listo como ${client.user.tag}`);
  });
  
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
  
    if (interaction.commandName === "darrol") {
      if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
        return interaction.reply({
          content: "❌ No tienes permiso para usar este comando.",
          flags: MessageFlags.Ephemeral,
        });
      }
  
      const role = interaction.options.getRole("rol");
      const member = interaction.member;
      const voiceChannel = member.voice.channel;
  
      // Verificar si está en un canal de voz
      if (!voiceChannel) {
        return interaction.reply({
          content: "⚠️ Debes estar en un canal de voz para usar este comando.",
          flags: MessageFlags.Ephemeral,
        });
      }
  
      const membersInChannel = voiceChannel.members;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  
      membersInChannel.forEach((member) => {
        member.roles.add(role).catch((err) => {
          console.error(`❌ Error al asignar rol a ${member.user.tag}:`, err);
        });
      });
  
      await interaction.editReply(
        `✅ Rol **${role.name}** asignado a ${membersInChannel.size} usuario(s).`
      );
    }
  });
  
  client.login(TOKEN);
  