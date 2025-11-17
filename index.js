const Storage = require('./src/storage/storage');
const BotService = require('./src/bot/botService');
const WebServer = require('./src/server/app');

// Configuration
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || './data';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Global instances
let storage;
let botService;
let webServer;

async function startApplication() {
  try {
    console.log('='.repeat(50));
    console.log('WhatsApp Auto Reply Bot');
    console.log('='.repeat(50));
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    console.log(`Data Directory: ${DATA_DIR}`);
    console.log('='.repeat(50));

    // Initialize storage
    console.log('\n[1/3] Initializing storage...');
    storage = new Storage(DATA_DIR);
    await storage.initialize();
    console.log('✓ Storage initialized');

    // Initialize bot service
    console.log('\n[2/3] Initializing bot service...');
    botService = new BotService(storage);
    await botService.initialize();
    console.log('✓ Bot service initialized');

    // Start web server
    console.log('\n[3/3] Starting web server...');
    webServer = new WebServer(botService, PORT);
    await webServer.start();
    console.log('✓ Web server started');

    console.log('\n' + '='.repeat(50));
    console.log('🚀 Application started successfully!');
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
    console.log('='.repeat(50) + '\n');

    // Set up bot event listeners for logging
    botService.on('qr', () => {
      console.log('📱 QR Code generated - scan it in the web interface');
    });

    botService.on('ready', () => {
      console.log('✓ WhatsApp connected and ready!');
    });

    botService.on('disconnected', () => {
      console.log('⚠ WhatsApp disconnected');
    });

    botService.on('messageProcessed', (log) => {
      if (log.response) {
        console.log(`📨 Message from ${log.senderName}: "${log.message}" → Auto-replied`);
      } else {
        console.log(`📨 Message from ${log.senderName}: "${log.message}" → No rule matched`);
      }
    });

  } catch (error) {
    console.error('\n❌ Error starting application:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\n\n${signal} received. Shutting down gracefully...`);

  try {
    // Stop web server
    if (webServer) {
      console.log('Stopping web server...');
      await webServer.stop();
      console.log('✓ Web server stopped');
    }

    // Shutdown bot service
    if (botService) {
      console.log('Shutting down bot service...');
      await botService.shutdown();
      console.log('✓ Bot service shut down');
    }

    console.log('✓ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('UNHANDLED_REJECTION');
});

// Start the application
startApplication();
