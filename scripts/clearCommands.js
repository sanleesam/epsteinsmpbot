/**
 * Script to clear all slash commands from Discord
 * Useful when you have duplicate commands registered
 * 
 * Run with: node scripts/clearCommands.js
 */

import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const BOT_ID = process.env.BOT_ID; // You'll need to add this, or we'll get it from the token

if (!TOKEN) {
  console.error('❌ DISCORD_TOKEN not found in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

async function clearCommands() {
  try {
    console.log('🗑️  Clearing slash commands...');

    // Get bot user ID from token
    const botUser = await rest.get(Routes.currentUser());
    const botId = botUser.id;
    console.log(`Bot ID: ${botId}`);

    // Always clear global commands
    console.log('\n🌍 Clearing global commands...');
    await rest.put(Routes.applicationCommands(botId), {
      body: [],
    });
    console.log('✅ Global commands cleared!');

    // Also clear guild commands if GUILD_ID is set
    if (GUILD_ID) {
      console.log(`\n📍 Clearing guild commands for server ${GUILD_ID}...`);
      await rest.put(Routes.applicationGuildCommands(botId, GUILD_ID), {
        body: [],
      });
      console.log(`✅ Guild commands cleared!`);
    }

    console.log('\n✨ Done! Restart your bot to register fresh commands.');
  } catch (error) {
    console.error('❌ Error clearing commands:', error);
    process.exit(1);
  }
}

clearCommands();
