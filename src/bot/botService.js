const { EventEmitter } = require('events');
const WhatsAppClient = require('../whatsapp/client');
const RuleEngine = require('./ruleEngine');
const { v4: uuidv4 } = require('uuid');

class BotService extends EventEmitter {
  constructor(storage) {
    super();
    this.storage = storage;
    this.whatsappClient = null;
    this.ruleEngine = null;
    this.messageCount = 0;
    this.startTime = new Date();
    this.isRunning = false;
  }

  async initialize() {
    try {
      console.log('Initializing Bot Service...');

      // Initialize storage
      await this.storage.initialize();

      // Initialize rule engine
      this.ruleEngine = new RuleEngine(this.storage);
      await this.ruleEngine.loadRules();

      // Initialize WhatsApp client
      const authDir = this.storage.getAuthDir();
      this.whatsappClient = new WhatsAppClient(authDir);

      // Set up event listeners
      this.setupEventListeners();

      // Initialize WhatsApp connection
      await this.whatsappClient.initialize();

      this.isRunning = true;
      console.log('Bot Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Bot Service:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // WhatsApp QR code event
    this.whatsappClient.on('qr', (qrCode) => {
      console.log('QR Code received');
      this.emit('qr', qrCode);
    });

    // WhatsApp ready event
    this.whatsappClient.on('ready', () => {
      console.log('WhatsApp connected and ready');
      this.emit('ready');
    });

    // WhatsApp disconnected event
    this.whatsappClient.on('disconnected', () => {
      console.log('WhatsApp disconnected');
      this.emit('disconnected');
    });

    // WhatsApp message event
    this.whatsappClient.on('message', async (messageData) => {
      await this.handleIncomingMessage(messageData);
    });
  }

  /**
   * Handle incoming WhatsApp messages
   * Processes message through rule engine and logs the interaction
   * 
   * @param {Object} messageData - Message data from WhatsApp client
   */
  async handleIncomingMessage(messageData) {
    try {
      const { message, from, sender, chatType, timestamp } = messageData;

      console.log(`Received message from ${from}: "${message}"`);

      // Process message through rule engine to find matching rule and send auto-reply
      const result = await this.ruleEngine.processMessage(messageData, this.whatsappClient);

      // Increment message counter for statistics
      this.messageCount++;

      // Create message log entry
      const log = {
        id: uuidv4(),
        timestamp: new Date(timestamp * 1000).toISOString(),
        sender: sender,
        senderName: this.formatPhoneNumber(sender),
        message: message,
        matchedRule: result.matched ? result.rule.id : null,
        matchedRulePattern: result.matched ? result.rule.pattern : null,
        response: result.matched ? result.rule.response : null,
        chatType: chatType
      };

      // Save log to storage (maintains last 100 logs)
      await this.storage.addMessageLog(log);

      // Emit event for real-time updates
      this.emit('messageProcessed', log);

      if (result.matched) {
        console.log(`Auto-reply sent: "${result.rule.response}"`);
      } else {
        console.log('No matching rule found');
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  formatPhoneNumber(jid) {
    // Extract phone number from JID
    const phone = jid.split('@')[0];
    return phone;
  }

  // Rule management methods
  async addRule(ruleData) {
    return await this.ruleEngine.addRule(ruleData);
  }

  async updateRule(id, ruleData) {
    return await this.ruleEngine.updateRule(id, ruleData);
  }

  async deleteRule(id) {
    return await this.ruleEngine.deleteRule(id);
  }

  async toggleRule(id) {
    return await this.ruleEngine.toggleRule(id);
  }

  getRules() {
    return this.ruleEngine.getRules();
  }

  getRule(id) {
    return this.ruleEngine.getRule(id);
  }

  // Message logs
  async getMessageLogs(limit = 100) {
    return await this.storage.getMessageLogs(limit);
  }

  // Connection status
  getConnectionStatus() {
    return this.whatsappClient.getConnectionState();
  }

  getQRCode() {
    return this.whatsappClient.getQRCode();
  }

  isConnected() {
    return this.whatsappClient.isConnected();
  }

  // Statistics
  getStats() {
    const ruleStats = this.ruleEngine.getStats();
    const uptime = Math.floor((new Date() - this.startTime) / 1000); // seconds

    return {
      messageCount: this.messageCount,
      uptime: uptime,
      uptimeFormatted: this.formatUptime(uptime),
      connectionStatus: this.whatsappClient.getConnectionState().status,
      isRunning: this.isRunning,
      ...ruleStats
    };
  }

  formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  // Graceful shutdown
  async shutdown() {
    try {
      console.log('Shutting down Bot Service...');
      this.isRunning = false;

      if (this.whatsappClient) {
        await this.whatsappClient.disconnect();
      }

      console.log('Bot Service shut down successfully');
    } catch (error) {
      console.error('Error during shutdown:', error);
      throw error;
    }
  }
}

module.exports = BotService;
