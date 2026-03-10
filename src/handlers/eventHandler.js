import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function loadEvents(client) {
  const eventsPath = join(__dirname, '../events');
  const eventFiles = readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  console.log(`Loading ${eventFiles.length} event(s)...`);

  for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);

    if (event.name && event.execute) {
      client.on(event.name, (...args) => event.execute(client, ...args));
      console.log(`✓ Loaded event: ${event.name}`);
    } else {
      console.warn(`✗ Event ${file} is missing 'name' or 'execute'.`);
    }
  }
}
