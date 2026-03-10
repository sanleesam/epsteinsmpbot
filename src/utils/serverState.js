import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../data');
const STATE_FILE = join(DATA_DIR, 'serverState.json');

/**
 * Load server state from storage
 */
function loadServerState() {
  try {
    const data = readFileSync(STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { launched: false, launchedAt: null };
  }
}

/**
 * Save server state to storage
 */
function saveServerState(state) {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving server state:', error);
  }
}

/**
 * Check if server has been launched
 */
export function isServerLaunched() {
  const state = loadServerState();
  return state.launched;
}

/**
 * Mark server as launched
 */
export function markServerLaunched() {
  const state = loadServerState();
  state.launched = true;
  state.launchedAt = new Date().toISOString();
  saveServerState(state);
}

/**
 * Reset launch state (for testing)
 */
export function resetLaunchState() {
  const state = { launched: false, launchedAt: null };
  saveServerState(state);
}
