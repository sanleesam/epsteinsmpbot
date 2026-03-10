import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadCommands(client) {
  const commandsPath = join(__dirname, '../commands');
  const commandFolders = readdirSync(commandsPath);

  let totalCommands = 0;

  for (const folder of commandFolders) {
    const folderPath = join(commandsPath, folder);
    const commandFiles = readdirSync(folderPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = join(folderPath, file);
      const command = await import(filePath);

      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        totalCommands++;
        console.log(`✓ Loaded command: ${command.data.name}`);
      } else {
        console.warn(`✗ Command ${file} is missing 'data' or 'execute'.`);
      }
    }
  }

  console.log(`Loaded ${totalCommands} command(s).`);
}
