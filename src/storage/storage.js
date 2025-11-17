const fs = require('fs').promises;
const path = require('path');

class Storage {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.authDir = path.join(dataDir, 'auth');
    this.rulesFile = path.join(dataDir, 'rules.json');
    this.logsFile = path.join(dataDir, 'logs.json');
    this.maxLogs = 100;
  }

  // Initialize storage directories
  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.authDir, { recursive: true });
      
      // Initialize rules file if it doesn't exist
      try {
        await fs.access(this.rulesFile);
      } catch {
        await fs.writeFile(this.rulesFile, JSON.stringify([], null, 2));
      }
      
      // Initialize logs file if it doesn't exist
      try {
        await fs.access(this.logsFile);
      } catch {
        await fs.writeFile(this.logsFile, JSON.stringify([], null, 2));
      }
      
      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Error initializing storage:', error);
      throw error;
    }
  }

  // Auth state methods for Baileys
  async saveAuthState(state) {
    try {
      const authFile = path.join(this.authDir, 'creds.json');
      await fs.writeFile(authFile, JSON.stringify(state, null, 2));
      console.log('Auth state saved');
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  }

  async loadAuthState() {
    try {
      const authFile = path.join(this.authDir, 'creds.json');
      const data = await fs.readFile(authFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null; // No auth state exists yet
      }
      console.error('Error loading auth state:', error);
      throw error;
    }
  }

  // Rules methods
  async saveRules(rules) {
    try {
      await fs.writeFile(this.rulesFile, JSON.stringify(rules, null, 2));
      console.log(`Saved ${rules.length} rules`);
    } catch (error) {
      console.error('Error saving rules:', error);
      throw error;
    }
  }

  async loadRules() {
    try {
      const data = await fs.readFile(this.rulesFile, 'utf-8');
      const rules = JSON.parse(data);
      console.log(`Loaded ${rules.length} rules`);
      return rules;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // No rules file exists yet
      }
      console.error('Error loading rules:', error);
      throw error;
    }
  }

  // Message logs methods
  async addMessageLog(log) {
    try {
      let logs = await this.getMessageLogs();
      
      // Add new log at the beginning
      logs.unshift(log);
      
      // Keep only the last 100 logs
      if (logs.length > this.maxLogs) {
        logs = logs.slice(0, this.maxLogs);
      }
      
      await fs.writeFile(this.logsFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error adding message log:', error);
      throw error;
    }
  }

  async getMessageLogs(limit = 100) {
    try {
      const data = await fs.readFile(this.logsFile, 'utf-8');
      const logs = JSON.parse(data);
      
      // Return only the requested number of logs
      return logs.slice(0, Math.min(limit, this.maxLogs));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // No logs file exists yet
      }
      console.error('Error loading message logs:', error);
      throw error;
    }
  }

  // Clear all logs
  async clearLogs() {
    try {
      await fs.writeFile(this.logsFile, JSON.stringify([], null, 2));
      console.log('Message logs cleared');
    } catch (error) {
      console.error('Error clearing logs:', error);
      throw error;
    }
  }

  // Get auth directory path (for Baileys)
  getAuthDir() {
    return this.authDir;
  }
}

module.exports = Storage;
