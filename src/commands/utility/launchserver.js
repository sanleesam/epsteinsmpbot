import { SlashCommandBuilder } from 'discord.js';
import { markServerLaunched } from '../../utils/serverState.js';
import { getStatusMessageId } from '../../utils/messageStorage.js';
import { createStatusEmbed } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('launchserver')
  .setDescription('Mark the server as launched and reveal the IP address on the status embed');

export async function execute(interaction) {
  try {
    // Mark server as launched
    markServerLaunched();

    // Try to update the existing status embed
    const statusChannelId = process.env.STATUS_MESSAGE_CHANNEL_ID;
    const storedMessageId = getStatusMessageId();

    if (storedMessageId && statusChannelId) {
      try {
        const statusChannel = interaction.client.channels.cache.get(statusChannelId);
        const statusMessage = await statusChannel.messages.fetch(storedMessageId);

        // Create updated embed with IP now visible
        const mockStatus = {
          online: false,
          playerCount: 0,
          maxPlayers: 0,
          motd: '',
          version: '1.21.11',
        };
        const updatedEmbed = createStatusEmbed(mockStatus);
        
        await statusMessage.edit({ embeds: [updatedEmbed] });
        console.log('✅ Status embed updated with server IP revealed!');
      } catch (error) {
        console.log('⚠️ Could not update status embed:', error.message);
      }
    }

    // Reply to user
    await interaction.reply({
      content: '🚀 Server launched! The IP address is now visible on the status embed.',
      ephemeral: true,
    });
  } catch (error) {
    console.error('Error launching server:', error);
    await interaction.reply({
      content: '❌ Error launching server. Please try again.',
      ephemeral: true,
    });
  }
}
