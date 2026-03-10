import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Register all slash commands with Discord's API
 * This makes them appear in Discord when typing /
 */
export async function registerCommands(client) {
  const commands = [];
  const commandsPath = join(__dirname, '../commands');
  const commandFolders = readdirSync(commandsPath);

  // Collect all command data
  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const command = await import(filePath);

      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }

  // Register with Discord API
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(`📤 Registering ${commands.length} slash command(s) with Discord...`);

    // Check if GUILD_ID is set for faster testing
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      // Register to specific guild (instant, useful for development)
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
        body: commands,
      });
      console.log(`✅ Slash commands registered to guild ${guildId} (instant)!`);
    } else {
      // Register globally (can take up to 1 hour to propagate everywhere)
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log('✅ Slash commands registered globally! (may take up to 1 hour to appear)');
      console.log('💡 Tip: For faster testing, add GUILD_ID to .env file');
    }
  } catch (error) {
    console.error('❌ Failed to register slash commands:', error);
  }
}
