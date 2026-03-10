import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadEvents } from './handlers/eventHandler.js';
import { loadCommands } from './handlers/commandHandler.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Initialize collections
client.commands = new Collection();
client.events = new Collection();

// Load event handlers
await loadEvents(client);

// Load commands
await loadCommands(client);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
