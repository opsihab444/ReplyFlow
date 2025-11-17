const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const { EventEmitter } = require('events');

class WhatsAppClient extends EventEmitter {
  constructor(authDir) {
    super();
    this.authDir = authDir;
    this.sock = null;
    this.qrCode = null;
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelays = [5000, 10000, 30000, 60000, 120000]; // Exponential backoff
  }

  async initialize() {
    try {
      console.log('Initializing WhatsApp client...');
      
      // Load auth state from storage
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      
      // Get latest Baileys version
      const { version } = await fetchLatestBaileysVersion();
      
      // Create WhatsApp socket
      this.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        browser: ['WhatsApp Auto Reply Bot', 'Chrome', '1.0.0']
      });

      // Save credentials whenever they update
      this.sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Handle QR code
        if (qr) {
          this.qrCode = await QRCode.toDataURL(qr);
          this.connectionState = 'connecting';
          this.emit('qr', this.qrCode);
          console.log('QR Code generated');
        }

        // Handle connection state
        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          
          console.log('Connection closed. Should reconnect:', shouldReconnect);
          this.connectionState = 'disconnected';
          this.emit('disconnected');

          if (shouldReconnect) {
            await this.handleReconnect();
          } else {
            console.log('Logged out. Please scan QR code again.');
            this.qrCode = null;
          }
        } else if (connection === 'open') {
          console.log('WhatsApp connection established!');
          this.connectionState = 'connected';
          this.qrCode = null;
          this.reconnectAttempts = 0;
          this.emit('ready');
        } else if (connection === 'connecting') {
          this.connectionState = 'connecting';
          console.log('Connecting to WhatsApp...');
        }
      });

      // Handle incoming messages
      this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify') {
          for (const msg of messages) {
            // Ignore messages from self
            if (msg.key.fromMe) continue;
            
            // Extract message content
            const messageContent = msg.message?.conversation || 
                                 msg.message?.extendedTextMessage?.text || '';
            
            if (messageContent) {
              const chatType = msg.key.remoteJid.endsWith('@g.us') ? 'group' : 'individual';
              
              this.emit('message', {
                id: msg.key.id,
                from: msg.key.remoteJid,
                sender: msg.key.participant || msg.key.remoteJid,
                message: messageContent,
                chatType: chatType,
                timestamp: msg.messageTimestamp
              });
            }
          }
        }
      });

      console.log('WhatsApp client initialized');
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error);
      throw error;
    }
  }

  /**
   * Handle automatic reconnection with exponential backoff
   * Attempts to reconnect up to maxReconnectAttempts times
   * with increasing delays between attempts
   */
  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached. Please restart the bot.');
      return;
    }

    // Get delay for current attempt (exponential backoff)
    const delay = this.reconnectDelays[this.reconnectAttempts] || 120000;
    console.log(`Reconnecting in ${delay / 1000} seconds... (Attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectAttempts++;
    
    setTimeout(async () => {
      try {
        await this.initialize();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  async sendMessage(jid, text) {
    try {
      if (!this.sock || this.connectionState !== 'connected') {
        throw new Error('WhatsApp is not connected');
      }

      await this.sock.sendMessage(jid, { text });
      console.log(`Message sent to ${jid}`);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
        this.connectionState = 'disconnected';
        console.log('WhatsApp client disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      throw error;
    }
  }

  getConnectionState() {
    return {
      status: this.connectionState,
      qr: this.qrCode
    };
  }

  getQRCode() {
    return this.qrCode;
  }

  isConnected() {
    return this.connectionState === 'connected';
  }
}

module.exports = WhatsAppClient;
