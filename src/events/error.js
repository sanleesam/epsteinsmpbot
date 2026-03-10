export const name = 'error';

export async function execute(client, error) {
  console.error('❌ Discord.js Error:', error);
  
  // TODO: Add error handling/logging logic
  // - Log to file
  // - Send error notifications
  // - Implement graceful recovery
}
