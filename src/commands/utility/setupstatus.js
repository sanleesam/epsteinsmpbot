import { SlashCommandBuilder } from 'discord.js';
import { createStatusEmbed } from '../../utils/embedBuilder.js';
import { createServerMonitor } from '../../utils/minecraftMonitor.js';
import { saveStatusMessageId } from '../../utils/messageStorage.js';

export const data = new SlashCommandBuilder()
  .setName('setupstatus')
  .setDescription('Create the initial status embed message in the status channel');

export async function execute(interaction) {
  try {
    const statusChannelId = process.env.STATUS_MESSAGE_CHANNEL_ID;

    if (!statusChannelId) {
      await interaction.reply({
        content: '❌ STATUS_MESSAGE_CHANNEL_ID not configured.',
        ephemeral: true,
      });
      return;
    }

    // Get the correct status channel from client
    const statusChannel = interaction.client.channels.cache.get(statusChannelId);
    
    if (!statusChannel || !statusChannel.isTextBased()) {
      await interaction.reply({
        content: '❌ Status channel not found or is not a text channel.',
        ephemeral: true,
      });
      return;
    }

    // Create a monitor to get initial status
    const monitor = createServerMonitor(
      process.env.MINECRAFT_SERVER_IP,
      parseInt(process.env.MINECRAFT_SERVER_PORT || '25565')
    );

    const status = await monitor.getServerStatus();
    const embed = createStatusEmbed(status);

    // Send the initial status embed to the correct channel
    const message = await statusChannel.send({ embeds: [embed] });

    // Store the message ID so the bot knows to edit it
    saveStatusMessageId(message.id);

    // Reply to the command
    await interaction.reply({
      content: `✅ Status embed created in <#${statusChannelId}>! The bot will update this message every 30 seconds.`,
      ephemeral: true,
    });

    console.log(`📌 Status embed set up in channel ${statusChannelId}: ${message.url}`);
  } catch (error) {
    console.error('Error setting up status embed:', error);
    await interaction.reply({
      content: '❌ Failed to create status embed.',
      ephemeral: true,
    });
  }
}
