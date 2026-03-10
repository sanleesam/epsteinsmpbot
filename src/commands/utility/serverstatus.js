import { SlashCommandBuilder } from 'discord.js';
import { createServerMonitor } from '../../utils/minecraftMonitor.js';
import { createStatusEmbed } from '../../utils/embedBuilder.js';

export const data = new SlashCommandBuilder()
  .setName('serverstatus')
  .setDescription('Check the Minecraft server status and player count');

export async function execute(interaction) {
  // Defer the reply since server checks can take a moment
  await interaction.deferReply();

  try {
    // Create monitor with server from environment
    const monitor = createServerMonitor(
      process.env.MINECRAFT_SERVER_IP,
      parseInt(process.env.MINECRAFT_SERVER_PORT || '25565')
    );

    // Get server status
    const status = await monitor.getServerStatus();

    // Create and send the embed
    const embed = createStatusEmbed(status);
    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error checking server status:', error);
    await interaction.editReply({
      content: '❌ Failed to check server status. The server might be offline or unreachable.',
    });
  }
}
