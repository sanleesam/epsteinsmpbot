import { EmbedBuilder } from 'discord.js';

/**
 * Create a server status embed message
 * @param {Object} status - Server status object from MinecraftServerMonitor
 * @returns {EmbedBuilder} Discord embed message
 */
export function createStatusEmbed(status) {
  const { ip, online, playerCount, maxPlayers, motd, version } = status;

  const embed = new EmbedBuilder()
    .setTitle('🎮 Minecraft Server Status')
    .setColor(online ? '#00FF00' : '#FF0000')
    .addFields(
      {
        name: 'Server Status',
        value: online ? '✅ Online' : '❌ Offline',
        inline: true,
      },
      {
        name: 'Players Online',
        value: online ? `${playerCount}/${maxPlayers}` : 'N/A',
        inline: true,
      },
      {
        name: 'Version',
        value: '1.21.11',
        inline: true,
      },
      {
        name: 'Server IP',
        value: 'video-progress.gl.joinmc.link',
        inline: false,
      }
    );

  if (motd && online) {
    embed.addFields({
      name: 'MOTD',
      value: motd,
      inline: false,
    });
  }

  embed.setTimestamp();
  embed.setFooter({ text: 'Last updated' });

  return embed;
}

/**
 * Create an offline announcement embed
 * @returns {EmbedBuilder} Discord embed message
 */
export function createOfflineAnnouncement() {
  const embed = new EmbedBuilder()
    .setTitle('⚠️ Server Offline Alert')
    .setColor('#FF0000')
    .setDescription(
      '@everyone The Minecraft server is currently offline. The admin will inform the reason and it will be resolved as soon as possible.'
    )
    .setTimestamp()
    .setFooter({ text: 'Alert issued at' });

  return embed;
}

/**
 * Create a server coming online notification
 * @param {Object} status - Server status object from MinecraftServerMonitor
 * @returns {EmbedBuilder} Discord embed message
 */
export function createServerOnlineNotification(status) {
  const { ip, playerCount, maxPlayers } = status;

  const embed = new EmbedBuilder()
    .setTitle('✅ Server Back Online')
    .setColor('#00FF00')
    .setDescription('The Minecraft server is now back online!')
    .addFields(
      {
        name: 'Server Address',
        value: `\`${ip}\``,
        inline: false,
      },
      {
        name: 'Current Players',
        value: `${playerCount}/${maxPlayers}`,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Server came online at' });

  return embed;
}
