# Implementation Plan

- [x] 1. Set up project structure and dependencies



  - Initialize Node.js project with package.json
  - Install required dependencies: @whiskeysockets/baileys, express, ejs, qrcode, uuid
  - Create directory structure: src/, views/, public/, data/
  - Set up .gitignore to exclude node_modules and data directory
  - Create basic README.md with project description
  - _Requirements: 6.1, 6.2_

- [x] 2. Implement storage module for data persistence



  - Create src/storage/storage.js with Storage class
  - Implement saveAuthState() and loadAuthState() methods for Baileys credentials
  - Implement saveRules() and loadRules() methods for auto-reply rules
  - Implement addMessageLog() and getMessageLogs() methods with 100-entry limit
  - Add error handling for file I/O operations
  - Create data/ directory initialization on first run
  - _Requirements: 1.5, 6.5_

- [x] 3. Implement WhatsApp client module with Baileys


  - Create src/whatsapp/client.js with WhatsAppClient class
  - Implement initialize() method to set up Baileys connection with auth state
  - Implement QR code generation and getQRCode() method
  - Implement connection state management (connecting, connected, disconnected)
  - Add event emitters for 'qr', 'ready', 'message', and 'disconnected' events
  - Implement sendMessage() method to send WhatsApp messages
  - Add automatic reconnection logic with exponential backoff
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Implement rule engine for auto-reply logic


  - Create src/bot/ruleEngine.js with RuleEngine class
  - Implement loadRules() method to load rules from storage
  - Implement addRule(), updateRule(), deleteRule() methods with UUID generation
  - Implement getRules() method to retrieve all rules
  - Implement processMessage() method to match incoming messages against rule patterns
  - Add case-insensitive pattern matching logic
  - Add chat type filtering (individual, group, all)
  - Add enabled/disabled rule filtering
  - Implement delay functionality before sending auto-replies
  - Apply only first matching rule when multiple rules match
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 5. Create bot service to integrate WhatsApp client and rule engine


  - Create src/bot/botService.js with BotService class
  - Initialize WhatsAppClient and RuleEngine instances
  - Set up message event listener to process incoming messages
  - Implement message logging with sender info and matched rule
  - Add message counter for statistics
  - Handle connection state changes and emit status updates
  - Implement graceful shutdown to save state before exit
  - _Requirements: 3.1, 3.2, 5.1, 5.2, 5.3, 5.5_

- [x] 6. Implement Express.js web server with API endpoints


  - Create src/server/app.js with Express application setup
  - Configure EJS as template engine
  - Set up static file serving from public/ directory
  - Implement GET / route for dashboard page
  - Implement GET /api/status endpoint for connection status
  - Implement GET /api/qr endpoint to retrieve QR code
  - Implement GET /api/rules endpoint to list all rules
  - Implement POST /api/rules endpoint to create new rule with validation
  - Implement PUT /api/rules/:id endpoint to update existing rule
  - Implement DELETE /api/rules/:id endpoint to delete rule
  - Implement PATCH /api/rules/:id/toggle endpoint to enable/disable rule
  - Implement GET /api/logs endpoint to retrieve message logs
  - Implement GET /api/stats endpoint for bot statistics
  - Implement GET /health endpoint for Render.com health checks
  - Add error handling middleware for API errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 6.4, 7.3_



- [ ] 7. Create web interface views with EJS templates
  - Create views/layout.ejs with common HTML structure and navigation
  - Create views/dashboard.ejs with connection status display and QR code modal
  - Create views/rules.ejs with rule list, create/edit form, and toggle switches
  - Create views/logs.ejs with message log table
  - Add responsive CSS styling in public/css/style.css
  - Add client-side JavaScript for API calls in public/js/app.js
  - Implement auto-refresh for connection status every 5 seconds
  - Implement auto-refresh for message logs every 5 seconds
  - Add form validation for rule creation and editing
  - Add confirmation dialogs for delete operations
  - _Requirements: 1.1, 2.3, 2.4, 2.5, 4.1, 5.1, 5.2, 5.4, 7.1, 7.2, 7.3, 7.4_

- [x] 8. Add input validation and error handling


  - Implement validation for rule pattern (non-empty string)
  - Implement validation for rule response (non-empty string)
  - Implement validation for delay (0-60 seconds)
  - Add try-catch blocks for all async operations
  - Implement error response format with code and message
  - Add user-friendly error messages in web interface
  - Log errors to console with appropriate log levels
  - _Requirements: 2.2, 7.3, 8.1_

- [x] 9. Configure application for Render.com deployment


  - Create render.yaml with web service configuration
  - Configure persistent disk mount for data directory
  - Set up environment variable handling (PORT, NODE_ENV, DATA_DIR)
  - Create start script in package.json
  - Add health check endpoint verification
  - Create .env.example file with required environment variables
  - Update README.md with deployment instructions for Render.com
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Create main application entry point



  - Create index.js as main entry point
  - Initialize BotService and Express server
  - Handle graceful shutdown on SIGTERM and SIGINT
  - Set up error handling for uncaught exceptions
  - Add startup logging with configuration details
  - Ensure data directory exists before starting services
  - _Requirements: 6.3, 6.5_

- [x]* 11. Add comprehensive testing


  - [x] 11.1 Write unit tests for rule matching logic


    - Test exact pattern matching
    - Test case-insensitive matching
    - Test chat type filtering
    - Test enabled/disabled filtering
    - _Requirements: 3.3, 3.4, 4.3_
  
  - [x] 11.2 Write unit tests for storage operations


    - Test saving and loading rules
    - Test saving and loading auth state
    - Test message log operations with limit
    - _Requirements: 1.5, 2.2, 5.3_
  

  - [ ] 11.3 Write integration tests for API endpoints

    - Test rule CRUD operations through API
    - Test rule toggle functionality
    - Test error responses for invalid data
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2_


- [x] 12. Add documentation and final polish


  - Document all API endpoints in README.md
  - Add code comments for complex logic
  - Create user guide for web interface usage
  - Add troubleshooting section in README.md
  - Document environment variables and configuration options
  - _Requirements: 7.2, 7.3_
