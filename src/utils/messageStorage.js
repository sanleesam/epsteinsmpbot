import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, '../data/messageIds.json');

/**
 * Load message IDs from storage
 */
function loadMessageIds() {
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { statusMessageId: null };
  }
}

/**
 * Save message IDs to storage
 */
function saveMessageIds(data) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving message IDs:', error);
  }
}

/**
 * Get stored status message ID
 */
export function getStatusMessageId() {
  const data = loadMessageIds();
  return data.statusMessageId;
}

/**
 * Save status message ID
 */
export function saveStatusMessageId(messageId) {
  const data = loadMessageIds();
  data.statusMessageId = messageId;
  saveMessageIds(data);
}

/**
 * Clear status message ID (when message is deleted)
 */
export function clearStatusMessageId() {
  const data = loadMessageIds();
  data.statusMessageId = null;
  saveMessageIds(data);
}
