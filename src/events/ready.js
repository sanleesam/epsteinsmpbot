import { registerCommands } from '../handlers/commandRegister.js';
import { createServerMonitor } from '../utils/minecraftMonitor.js';
import { createStatusEmbed, createOfflineAnnouncement, createServerOnlineNotification } from '../utils/embedBuilder.js';
import { getStatusMessageId, saveStatusMessageId, clearStatusMessageId } from '../utils/messageStorage.js';

// Global server monitor instance
let serverMonitor = null;
let previousStatus = null;
let monitoringInterval = null;

export const name = 'ready';

export async function execute(client) {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
  
  // Register slash commands with Discord
  await registerCommands(client);
  
  // Set bot presence/activity
  client.user.setActivity('Minecraft servers', { type: 'WATCHING' });
  
  // Initialize server monitoring
  initializeServerMonitoring(client);
}

/**
 * Initialize periodic server status monitoring
 * Updates a single embed message every 30 seconds
 */
function initializeServerMonitoring(client) {
  // Create monitor instance
  serverMonitor = createServerMonitor(
    process.env.MINECRAFT_SERVER_IP,
    parseInt(process.env.MINECRAFT_SERVER_PORT || '25565')
  );

  console.log(`🔍 Starting server monitoring for ${process.env.MINECRAFT_SERVER_IP}...`);

  // Check server status immediately
  checkServerStatus(client);

  // Then check periodically every 30 seconds
  monitoringInterval = setInterval(() => {
    checkServerStatus(client);
  }, 30000); // 30 seconds
}

/**
 * Check server status and update persistent embed message
 */
async function checkServerStatus(client) {
  try {
    const currentStatus = await serverMonitor.getServerStatus();
    const statusChannelId = process.env.STATUS_MESSAGE_CHANNEL_ID;
    const announcementChannelId = process.env.ANNOUNCEMENT_CHANNEL_ID;

    if (!statusChannelId) {
      console.warn('⚠️ STATUS_MESSAGE_CHANNEL_ID not set in .env');
      return;
    }

    // Get the status channel
    const statusChannel = client.channels.cache.get(statusChannelId);
    if (!statusChannel || !statusChannel.isTextBased()) {
      console.error('❌ Status channel not found or is not a text channel');
      return;
    }

    // Create the status embed
    const statusEmbed = createStatusEmbed(currentStatus);

    // Try to get and update existing message
    const storedMessageId = getStatusMessageId();
    let statusMessage = null;

    if (storedMessageId) {
      try {
        statusMessage = await statusChannel.messages.fetch(storedMessageId);
        // Update existing message
        await statusMessage.edit({ embeds: [statusEmbed] });
      } catch (error) {
        // Message was deleted, don't create a new one
        console.log('⚠️ Status message was deleted. No embed will be updated until you create one.');
        clearStatusMessageId();
      }
    } else {
      // No stored message, don't create one - user must set it up manually
      console.log('⚠️ No status message ID stored. Set one up with /setupstatus command.');
    }

    // Handle server state changes
    if (!previousStatus) {
      previousStatus = currentStatus;
      console.log(`[Server Status] Online: ${currentStatus.online}, Players: ${currentStatus.playerCount}/${currentStatus.maxPlayers}`);
      return;
    }

    // Check if server went offline
    if (previousStatus.online && !currentStatus.online) {
      console.log('⚠️ Server went OFFLINE!');
      if (announcementChannelId) {
        const announcementChannel = client.channels.cache.get(announcementChannelId);
        if (announcementChannel) {
          const announcement = createOfflineAnnouncement();
          await announcementChannel.send({
            content: '@everyone',
            embeds: [announcement],
          });
        }
      }
    }

    // Check if server came back online
    if (!previousStatus.online && currentStatus.online) {
      console.log('✅ Server came ONLINE!');
      if (announcementChannelId) {
        const announcementChannel = client.channels.cache.get(announcementChannelId);
        if (announcementChannel) {
          const notification = createServerOnlineNotification(currentStatus);
          await announcementChannel.send({ embeds: [notification] });
        }
      }
    }

    // Log status updates
    if (currentStatus.online) {
      console.log(`[Server Status] Players: ${currentStatus.playerCount}/${currentStatus.maxPlayers}`);
    }

    previousStatus = currentStatus;
  } catch (error) {
    console.error('[Monitoring Error]', error.message);
  }
}
