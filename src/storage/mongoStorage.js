const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

class MongoStorage {
  constructor(mongoUri, dataDir = './data') {
    this.mongoUri = mongoUri;
    this.dataDir = dataDir;
    this.authDir = path.join(dataDir, 'auth');
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  // Initialize MongoDB connection
  async initialize() {
    try {
      console.log('Connecting to MongoDB Atlas...');
      
      // Create MongoDB client
      this.client = new MongoClient(this.mongoUri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });

      // Connect to MongoDB
      await this.client.connect();
      
      // Test connection
      await this.client.db("admin").command({ ping: 1 });
      console.log('✓ Successfully connected to MongoDB Atlas!');
      
      // Get database
      this.db = this.client.db('replyflow');
      this.isConnected = true;

      // Create local auth directory for Baileys
      await fs.mkdir(this.authDir, { recursive: true });
      
      console.log('✓ Storage initialized successfully');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  // Auth state methods (stored locally for Baileys compatibility)
  async saveAuthState(state) {
    try {
      const authFile = path.join(this.authDir, 'creds.json');
      await fs.writeFile(authFile, JSON.stringify(state, null, 2));
      console.log('Auth state saved locally');
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
        return null;
      }
      console.error('Error loading auth state:', error);
      throw error;
    }
  }

  // Rules methods (stored in MongoDB)
  async saveRules(rules) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const collection = this.db.collection('rules');
      
      // Clear existing rules and insert new ones
      await collection.deleteMany({});
      
      if (rules.length > 0) {
        await collection.insertMany(rules);
      }
      
      console.log(`✓ Saved ${rules.length} rules to MongoDB`);
    } catch (error) {
      console.error('Error saving rules to MongoDB:', error);
      throw error;
    }
  }

  async loadRules() {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const collection = this.db.collection('rules');
      const rules = await collection.find({}).toArray();
      
      console.log(`✓ Loaded ${rules.length} rules from MongoDB`);
      return rules;
    } catch (error) {
      console.error('Error loading rules from MongoDB:', error);
      return [];
    }
  }

  // Message logs methods (stored in MongoDB)
  async addMessageLog(log) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const collection = this.db.collection('logs');
      
      // Insert new log
      await collection.insertOne(log);
      
      // Keep only last 100 logs
      const count = await collection.countDocuments();
      if (count > 100) {
        const logsToDelete = await collection
          .find({})
          .sort({ timestamp: 1 })
          .limit(count - 100)
          .toArray();
        
        const idsToDelete = logsToDelete.map(log => log._id);
        await collection.deleteMany({ _id: { $in: idsToDelete } });
      }
    } catch (error) {
      console.error('Error adding message log to MongoDB:', error);
      throw error;
    }
  }

  async getMessageLogs(limit = 100) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const collection = this.db.collection('logs');
      const logs = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      
      return logs;
    } catch (error) {
      console.error('Error loading message logs from MongoDB:', error);
      return [];
    }
  }

  // Clear all logs
  async clearLogs() {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const collection = this.db.collection('logs');
      await collection.deleteMany({});
      console.log('Message logs cleared from MongoDB');
    } catch (error) {
      console.error('Error clearing logs from MongoDB:', error);
      throw error;
    }
  }

  // Get auth directory path (for Baileys)
  getAuthDir() {
    return this.authDir;
  }

  // Close MongoDB connection
  async close() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('MongoDB connection closed');
      }
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

module.exports = MongoStorage;
