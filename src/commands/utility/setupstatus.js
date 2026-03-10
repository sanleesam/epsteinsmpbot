import { SlashCommandBuilder } from 'discord.js';
import { createStatusEmbed } from '../../utils/embedBuilder.js';
import { createServerMonitor } from '../../utils/minecraftMonitor.js';
import { saveStatusMessageId } from '../../utils/messageStorage.js';

export const data = new SlashCommandBuilder()
  .setName('setupstatus')
  .setDescription('Create the initial status embed message in this channel (bot will update it every 30s)');

export async function execute(interaction) {
  try {
    // Create a monitor to get initial status
    const monitor = createServerMonitor(
      process.env.MINECRAFT_SERVER_IP,
      parseInt(process.env.MINECRAFT_SERVER_PORT || '25565')
    );

    const status = await monitor.getServerStatus();
    const embed = createStatusEmbed(status);

    // Send the initial status embed
    const message = await interaction.channel.send({ embeds: [embed] });

    // Store the message ID so the bot knows to edit it
    saveStatusMessageId(message.id);

    // Reply to the command
    await interaction.reply({
      content: `✅ Status embed created! The bot will update this message every 30 seconds.`,
      ephemeral: true,
    });

    console.log(`📌 Status embed set up in channel ${interaction.channel.id}: ${message.url}`);
  } catch (error) {
    console.error('Error setting up status embed:', error);
    await interaction.reply({
      content: '❌ Failed to create status embed.',
      ephemeral: true,
    });
  }
}
