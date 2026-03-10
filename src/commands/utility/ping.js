/**
 * Example command structure for Epstein SMP Bot
 * Commands should follow this format
 */

import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong! and shows bot latency');

export async function execute(interaction) {
  const latency = interaction.client.ws.ping;
  
  await interaction.reply(
    `🏓 Pong! (${latency}ms)`
  );
}
