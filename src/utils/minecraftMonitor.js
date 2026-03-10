/**
 * Minecraft Server Monitoring Utility
 * Uses minecraft-server-util to query Java Edition servers
 */

import { status } from 'minecraft-server-util';

export class MinecraftServerMonitor {
  constructor(serverIp, serverPort = 25565) {
    this.serverIp = serverIp;
    this.serverPort = serverPort;
    this.isOnline = false;
    this.playerCount = 0;
    this.maxPlayers = 0;
    this.motd = '';
    this.version = '';
    this.lastUpdate = null;
    this.lastQueryResponse = null; // Cache the last successful query
  }

  /**
   * Check if the Minecraft server is online
   * Uses cached response from last query
   * @returns {Promise<boolean>} True if server is online, false otherwise
   */
  async isServerOnline() {
    return this.isOnline;
  }

  /**
   * Get the current player count on the server
   * Uses cached response from last query
   * @returns {Promise<number>} Number of players currently online
   */
  async getPlayerCount() {
    return this.playerCount;
  }

  /**
   * Get max player count on the server
   * Uses cached response from last query
   * @returns {Promise<number>} Maximum number of players
   */
  async getMaxPlayers() {
    return this.maxPlayers;
  }

  /**
   * Get server MOTD (Message of the Day)
   * Uses cached response from last query
   * @returns {Promise<string>} Server MOTD
   */
  async getServerMotd() {
    return this.motd || 'A Minecraft Server';
  }

  /**
   * Get server version
   * Uses cached response from last query
   * @returns {Promise<string>} Minecraft version
   */
  async getServerVersion() {
    return this.version || 'Unknown';
  }

  /**
   * Queries server ONCE and extracts all data from single response
   * @returns {Promise<Object>} Object containing all server information
   */
  async getServerStatus() {
    try {
      // Query the server ONCE
      const response = await this._queryServer();
      this.lastQueryResponse = response;
      
      // Validate that we got valid player data
      const playerCount = response.players?.online || 0;
      const maxPlayers = response.players?.max || 0;
      
      // If maxPlayers is 0 or invalid, treat as offline
      if (!maxPlayers || maxPlayers <= 0) {
        throw new Error('Invalid player data from server');
      }
      
      this.isOnline = true;
      this.playerCount = playerCount;
      this.maxPlayers = maxPlayers;
      this.motd = this._cleanMotd(response.motd || '');
      this.version = response.version?.name || 'Unknown';

      this.lastUpdate = new Date();

      return {
        ip: this.serverIp,
        port: this.serverPort,
        online: true,
        playerCount: this.playerCount,
        maxPlayers: this.maxPlayers,
        motd: this.motd,
        version: this.version,
        lastUpdate: this.lastUpdate,
      };
    } catch (error) {
      console.error('[ERROR] Failed to query server:', error.message);
      this.isOnline = false;
      this.lastQueryResponse = null;
      this.lastUpdate = new Date();

      return {
        ip: this.serverIp,
        port: this.serverPort,
        online: false,
        playerCount: 0,
        maxPlayers: 0,
        motd: 'Unknown',
        version: 'Unknown',
        lastUpdate: this.lastUpdate,
      };
    }
  }

  /**
   * Internal method to query the server
   * @private
   */
  async _queryServer() {
    // Set a reasonable timeout (15 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Server query timeout')), 15000)
    );

    const queryPromise = status(this.serverIp, { port: this.serverPort });

    return Promise.race([queryPromise, timeoutPromise]);
  }

  /**
   * Clean Minecraft color codes from MOTD text
   * @private
   */
  _cleanMotd(motd) {
    if (!motd) return '';
    // Remove Minecraft color codes (§x format)
    return motd.replace(/§[0-9a-fk-or]/g, '');
  }
}

/**
 * Create and initialize a Minecraft server monitor
 * @param {string} ip - Server IP address
 * @param {number} port - Server port (default 25565)
 * @returns {MinecraftServerMonitor} Initialized server monitor instance
 */
export function createServerMonitor(ip, port = 25565) {
  return new MinecraftServerMonitor(ip, port);
}
