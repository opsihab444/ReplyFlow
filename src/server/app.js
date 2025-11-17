const express = require('express');
const path = require('path');

class WebServer {
  constructor(botService, port = 3000) {
    this.botService = botService;
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files
    this.app.use(express.static(path.join(__dirname, '../../public')));

    // Set EJS as template engine
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '../../views'));

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Web pages
    this.app.get('/', (req, res) => {
      res.render('dashboard', { 
        title: 'Dashboard - WhatsApp Auto Reply Bot' 
      });
    });

    this.app.get('/rules', (req, res) => {
      res.render('rules', { 
        title: 'Rules - WhatsApp Auto Reply Bot' 
      });
    });

    this.app.get('/logs', (req, res) => {
      res.render('logs', { 
        title: 'Logs - WhatsApp Auto Reply Bot' 
      });
    });

    // API endpoints
    // Connection status
    this.app.get('/api/status', (req, res) => {
      try {
        const status = this.botService.getConnectionStatus();
        res.json({
          success: true,
          data: status
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STATUS_ERROR',
            message: error.message
          }
        });
      }
    });

    // Get QR code
    this.app.get('/api/qr', (req, res) => {
      try {
        const qr = this.botService.getQRCode();
        res.json({
          success: true,
          data: { qr }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'QR_ERROR',
            message: error.message
          }
        });
      }
    });

    // Get all rules
    this.app.get('/api/rules', (req, res) => {
      try {
        const rules = this.botService.getRules();
        res.json({
          success: true,
          data: rules
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'RULES_FETCH_ERROR',
            message: error.message
          }
        });
      }
    });

    // Create new rule
    this.app.post('/api/rules', async (req, res) => {
      try {
        const { pattern, response, enabled, caseSensitive, chatType, delay } = req.body;

        // Validation
        if (!pattern || pattern.trim() === '') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Pattern is required and cannot be empty'
            }
          });
        }

        if (!response || response.trim() === '') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Response is required and cannot be empty'
            }
          });
        }

        if (delay !== undefined && (delay < 0 || delay > 60)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Delay must be between 0 and 60 seconds'
            }
          });
        }

        const rule = await this.botService.addRule({
          pattern: pattern.trim(),
          response: response.trim(),
          enabled,
          caseSensitive,
          chatType,
          delay
        });

        res.status(201).json({
          success: true,
          data: rule
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'RULE_CREATE_ERROR',
            message: error.message
          }
        });
      }
    });

    // Update rule
    this.app.put('/api/rules/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { pattern, response, enabled, caseSensitive, chatType, delay } = req.body;

        // Validation
        if (pattern !== undefined && pattern.trim() === '') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Pattern cannot be empty'
            }
          });
        }

        if (response !== undefined && response.trim() === '') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Response cannot be empty'
            }
          });
        }

        if (delay !== undefined && (delay < 0 || delay > 60)) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Delay must be between 0 and 60 seconds'
            }
          });
        }

        const updateData = {};
        if (pattern !== undefined) updateData.pattern = pattern.trim();
        if (response !== undefined) updateData.response = response.trim();
        if (enabled !== undefined) updateData.enabled = enabled;
        if (caseSensitive !== undefined) updateData.caseSensitive = caseSensitive;
        if (chatType !== undefined) updateData.chatType = chatType;
        if (delay !== undefined) updateData.delay = delay;

        const rule = await this.botService.updateRule(id, updateData);

        res.json({
          success: true,
          data: rule
        });
      } catch (error) {
        if (error.message === 'Rule not found') {
          return res.status(404).json({
            success: false,
            error: {
              code: 'RULE_NOT_FOUND',
              message: `Rule with ID ${req.params.id} not found`
            }
          });
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'RULE_UPDATE_ERROR',
            message: error.message
          }
        });
      }
    });

    // Delete rule
    this.app.delete('/api/rules/:id', async (req, res) => {
      try {
        const { id } = req.params;
        await this.botService.deleteRule(id);

        res.json({
          success: true,
          message: 'Rule deleted successfully'
        });
      } catch (error) {
        if (error.message === 'Rule not found') {
          return res.status(404).json({
            success: false,
            error: {
              code: 'RULE_NOT_FOUND',
              message: `Rule with ID ${req.params.id} not found`
            }
          });
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'RULE_DELETE_ERROR',
            message: error.message
          }
        });
      }
    });

    // Toggle rule enabled/disabled
    this.app.patch('/api/rules/:id/toggle', async (req, res) => {
      try {
        const { id } = req.params;
        const rule = await this.botService.toggleRule(id);

        res.json({
          success: true,
          data: rule
        });
      } catch (error) {
        if (error.message === 'Rule not found') {
          return res.status(404).json({
            success: false,
            error: {
              code: 'RULE_NOT_FOUND',
              message: `Rule with ID ${req.params.id} not found`
            }
          });
        }

        res.status(500).json({
          success: false,
          error: {
            code: 'RULE_TOGGLE_ERROR',
            message: error.message
          }
        });
      }
    });

    // Get message logs
    this.app.get('/api/logs', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await this.botService.getMessageLogs(limit);

        res.json({
          success: true,
          data: logs
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'LOGS_FETCH_ERROR',
            message: error.message
          }
        });
      }
    });

    // Get bot statistics
    this.app.get('/api/stats', (req, res) => {
      try {
        const stats = this.botService.getStats();

        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: 'STATS_ERROR',
            message: error.message
          }
        });
      }
    });

    // Health check endpoint for Render.com
    this.app.get('/health', (req, res) => {
      const isHealthy = this.botService.isRunning;
      
      if (isHealthy) {
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'error',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });

    // Global error handler
    this.app.use((err, req, res, next) => {
      console.error('Server error:', err);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        }
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.log(`Web server running on http://localhost:${this.port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Web server stopped');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = WebServer;
