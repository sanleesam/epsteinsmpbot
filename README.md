# Epstein SMP Discord Bot

A scalable Discord bot for monitoring Minecraft server status using discord.js v14. Currently in base architecture phase with placeholder implementations.

## Project Structure

```
bot/
├── src/
│   ├── commands/           # Slash commands
│   │   └── utility/       # Utility commands (ping, etc.)
│   ├── events/            # Discord event handlers
│   ├── handlers/          # Command and event loaders
│   ├── utils/             # Utility functions and services
│   │   ├── minecraftMonitor.js    # Minecraft server monitoring
│   │   └── embedBuilder.js        # Discord embed utilities
│   └── index.js           # Bot entry point
├── .env                   # Environment variables (keep secret!)
├── .env.example           # Example environment variables
├── .gitignore            # Git ignore file
└── package.json          # Dependencies and scripts
```

## Prerequisites

- Node.js 16.9.0 or higher
- npm (comes with Node.js)
- A Discord bot token from [Discord Developer Portal](https://discord.com/developers/applications)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- **discord.js** v14: Discord API library
- **dotenv**: Environment variable management

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Your bot token from Discord Developer Portal
DISCORD_TOKEN=your_actual_bot_token_here

# Minecraft server details (will be provided later)
MINECRAFT_SERVER_IP=placeholder.example.com
MINECRAFT_SERVER_PORT=25565

# Discord channel IDs where bot will post updates
ANNOUNCEMENT_CHANNEL_ID=1234567890
STATUS_CHANNEL_ID=1234567890

# Environment mode
NODE_ENV=development
```

### 3. Get Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select existing one
3. Go to "Bot" section and click "Add Bot"
4. Under the TOKEN section, click "Copy" to copy your token
5. Paste it in your `.env` file as `DISCORD_TOKEN`

### 4. Invite Bot to Your Server

1. Go to your application's "OAuth2" → "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Mention @everyone/@here
4. Copy the generated URL and open it in your browser
5. Select the server and authorize

## Running the Bot

### Development Mode (with auto-restart)

```bash
npm run dev
```

This uses `node --watch` to automatically restart the bot when files change.

### Production Mode

```bash
npm start
```

## How Server Monitoring Works

### Automatic Status Updates
The bot **monitors the server and updates a single embed message** in your channel every 30 seconds (edit only, no new messages).

**Features:**
- ✅ Single persistent embed that updates in place (no spam)
- ✅ Real-time player count, server status, version, MOTD
- ✅ Automatic announcements when server goes **offline** or comes back **online**
- ✅ Bot only edits existing embed, never creates new ones

### Setup Instructions

1. **Configure your .env file:**
```env
STATUS_MESSAGE_CHANNEL_ID=1480243386202980372  # Channel where status will update
ANNOUNCEMENT_CHANNEL_ID=1480243487986290759    # Channel for offline/online alerts
```

2. **Run the bot:**
```bash
npm run dev
```

3. **Create the initial status embed:**
```
/setupstatus
```
Run this command once in the channel you want status updates. The bot will:
- Create the initial status embed message
- Store its ID
- Update it every 30 seconds with fresh data

### How It Works
- Bot fetches server status immediately and displays it
- Every 30 seconds: **Edits the same embed** with latest data
- No message spam, just continuous updates to one message
- When server goes offline/online: Sends `@everyone` announcement in `ANNOUNCEMENT_CHANNEL_ID`

Slash commands are **automatically registered** with Discord when the bot starts. There are two registration modes:

#### Global Registration (Default)
- Commands register to all servers the bot is in
- **Takes up to 1 hour** to appear across Discord
- Best for production

#### Guild Registration (Fast Testing)
- Commands appear instantly in a specific server
- Best for development and testing
- To enable: Add `GUILD_ID` to your `.env` file:

```env
GUILD_ID=1234567890  # Your test server ID
```

To get your server ID:
1. Enable Developer Mode in Discord (User Settings → Advanced)
2. Right-click the server name and select "Copy Server ID"
3. Paste it in `.env` as `GUILD_ID`

### Adding New Commands

1. Create a new file in `src/commands/<category>/` (e.g., `src/commands/utility/status.js`)
2. Export `data` (SlashCommandBuilder) and `execute` function
3. Commands are auto-loaded and registered on bot startup

See [src/commands/utility/ping.js](src/commands/utility/ping.js) for an example.

## Troubleshooting

### Slash commands don't appear in Discord

**Check these first:**
1. Bot has restarted and logged in (you should see "Slash commands registered" in console)
2. If using global registration, **wait up to 1 hour**
3. Verify bot has permission in the server (needs "Use Slash Commands")

**Solution:**
- Use guild-specific registration for testing (add `GUILD_ID` to `.env`)
- Restart the bot (`npm run dev` or `npm start`)

### Bot doesn't respond when I use /ping
- Check console for `interactionCreate` event (should show slash command handling)
- Verify bot has "Send Messages" and "Slash Commands" permissions
- Make sure `/ping` appears in your server's slash command list

## Features (In Development)

### ✅ Implemented
- Clean, scalable project structure
- Event-based architecture with automatic loading
- Slash command loading and registration with Discord
- Automatic interaction (slash command) handling
- **Real Minecraft server monitoring** with `minecraft-server-util`
- **Automatic status embed** that updates every 30 seconds
- **Server state change detection** (offline/online announcements)
- Discord embed builders for status and notifications
- Environment variable configuration
- Guild-specific command registration

### 🔄 Placeholder / In Progress
- Minecraft server status detection
- Player count monitoring
- Periodic status updates
- Offline server announcements
- Server comes online notifications

## Architecture

### Event Handler System
Events in `src/events/` are automatically loaded. Each event file must export:
- `name`: The Discord event name (e.g., 'ready', 'messageCreate')
- `execute(client, ...args)`: Async function to handle the event

### Command System
Commands in `src/commands/*/` are automatically loaded. Each command must export:
- `data`: SlashCommandBuilder from discord.js
- `execute(interaction)`: Async function to handle command execution

### Utilities
- **minecraftMonitor.js**: Minecraft server status checking (methods placeholder)
- **embedBuilder.js**: Creates formatted Discord embeds for status messages

## Next Steps

1. **Provide Minecraft Server IP**: Once the server IP is provided, update `.env` and implement actual server ping logic in `minecraftMonitor.js`

2. **Implement Monitoring Logic**:
   - Use a library like `minecraft-protocol` or `mcquery` for server communication
   - Add periodic checking in the `ready` event
   - Track server state changes

3. **Add More Commands**:
   - Create new command files in `src/commands/`
   - They'll be automatically loaded

4. **Customize Embeds**:
   - Update `embedBuilder.js` functions to match your server's branding

## Contributing

Guidelines for extending the bot:

1. **New Events**: Add file to `src/events/` with `name` and `execute` exports
2. **New Commands**: Add file to `src/commands/<category>/` with `data` and `execute` exports
3. **New Utilities**: Add to `src/utils/` and import as needed
4. **Keep structure clean**: One responsibility per file

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DISCORD_TOKEN` | Bot authentication token | (secret) |
| `GUILD_ID` | (Optional) Server ID for fast command testing | `123456789` |
| `MINECRAFT_SERVER_IP` | Minecraft server address | `drive-unawake.gl.joinmc.link` |
| `MINECRAFT_SERVER_PORT` | Minecraft server port | `25565` |
| `ANNOUNCEMENT_CHANNEL_ID` | Channel for offline/online alerts | `123456789` |
| `STATUS_MESSAGE_CHANNEL_ID` | Channel for auto-updating status embed | `123456789` |
| `STATUS_CHANNEL_ID` | (Legacy) Reserved for future use | `123456789` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## Resources

- [discord.js Documentation](https://discord.js.org/)
- [Discord.js Guide](https://discordjs.guide/)
- [Discord Developer Portal](https://discord.com/developers)
- [Minecraft Server Query](https://wiki.vg/Query)

## License

MIT
