# Design Document

## Overview

The WhatsApp Auto Reply Bot is a Node.js application that combines a WhatsApp messaging bot with a web-based management interface. The system uses the Baileys library for WhatsApp integration and Express.js for the web server. It provides real-time auto-reply functionality based on configurable rules managed through an intuitive web dashboard.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP/WebSocket
         ▼
┌─────────────────────────────────┐
│      Express.js Server          │
│  ┌──────────┐  ┌─────────────┐ │
│  │   Web    │  │   API       │ │
│  │  Routes  │  │  Endpoints  │ │
│  └──────────┘  └─────────────┘ │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│     Bot Service Layer           │
│  ┌──────────┐  ┌─────────────┐ │
│  │ WhatsApp │  │    Rule     │ │
│  │  Client  │  │   Engine    │ │
│  │(Baileys) │  │             │ │
│  └──────────┘  └─────────────┘ │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Data Storage Layer         │
│  ┌──────────┐  ┌─────────────┐ │
│  │   Auth   │  │    Rules    │ │
│  │  Store   │  │    Store    │ │
│  └──────────┘  └─────────────┘ │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│     WhatsApp Servers            │
└─────────────────────────────────┘
```

### Technology Stack

- **Runtime**: Node.js (v18 or higher)
- **WhatsApp Integration**: @whiskeysockets/baileys
- **Web Framework**: Express.js
- **Template Engine**: EJS for server-side rendering
- **Data Storage**: JSON file-based storage (with option to upgrade to database)
- **Real-time Updates**: Server-Sent Events (SSE) or polling
- **Deployment**: Render.com compatible configuration

## Components and Interfaces

### 1. WhatsApp Client Module (`src/whatsapp/client.js`)

**Responsibilities:**
- Initialize and manage Baileys WhatsApp connection
- Handle QR code generation for authentication
- Manage connection state and reconnection logic
- Emit events for incoming messages and connection status changes

**Key Methods:**
```javascript
class WhatsAppClient {
  async initialize()
  async getQRCode()
  async sendMessage(jid, text)
  async disconnect()
  getConnectionState()
  on(event, handler) // Event emitter for messages and status
}
```

**Events:**
- `qr`: Emitted when QR code is generated
- `ready`: Emitted when connection is established
- `message`: Emitted when a message is received
- `disconnected`: Emitted when connection is lost

### 2. Rule Engine Module (`src/bot/ruleEngine.js`)

**Responsibilities:**
- Load and manage auto-reply rules
- Match incoming messages against rule patterns
- Apply rule filters (chat type, enabled status)
- Execute auto-reply with configured delays

**Key Methods:**
```javascript
class RuleEngine {
  loadRules()
  addRule(rule)
  updateRule(id, rule)
  deleteRule(id)
  getRules()
  async processMessage(message, chatType)
}
```

**Rule Structure:**
```javascript
{
  id: string,
  pattern: string,
  response: string,
  enabled: boolean,
  caseSensitive: boolean,
  chatType: 'all' | 'individual' | 'group',
  delay: number (seconds),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Storage Module (`src/storage/storage.js`)

**Responsibilities:**
- Persist authentication session data
- Store and retrieve auto-reply rules
- Maintain message logs
- Handle file I/O operations

**Key Methods:**
```javascript
class Storage {
  async saveAuthState(state)
  async loadAuthState()
  async saveRules(rules)
  async loadRules()
  async addMessageLog(log)
  async getMessageLogs(limit)
}
```

**Storage Structure:**
```
data/
├── auth/
│   └── creds.json (Baileys auth credentials)
├── rules.json (Auto-reply rules)
└── logs.json (Message logs - last 100)
```

### 4. Web Server Module (`src/server/app.js`)

**Responsibilities:**
- Serve web interface
- Provide REST API endpoints
- Handle real-time updates
- Manage HTTP requests and responses

**API Endpoints:**

```
GET  /                    - Dashboard page
GET  /api/status          - Bot connection status
GET  /api/qr              - Get QR code for authentication
GET  /api/rules           - Get all rules
POST /api/rules           - Create new rule
PUT  /api/rules/:id       - Update rule
DELETE /api/rules/:id     - Delete rule
PATCH /api/rules/:id/toggle - Toggle rule enabled status
GET  /api/logs            - Get message logs
GET  /api/stats           - Get bot statistics
GET  /health              - Health check endpoint
```

### 5. Web Interface (`views/`)

**Pages:**
- `dashboard.ejs`: Main dashboard with connection status and quick stats
- `rules.ejs`: Rule management interface
- `logs.ejs`: Message logs viewer

**Components:**
- QR Code display modal
- Rule creation/edit form
- Rule list with toggle switches
- Message log table with auto-refresh
- Connection status indicator

## Data Models

### Rule Model
```javascript
{
  id: "uuid-v4",
  pattern: "hello",
  response: "Hi! How can I help you?",
  enabled: true,
  caseSensitive: false,
  chatType: "all", // 'all', 'individual', 'group'
  delay: 0, // seconds
  createdAt: "2025-11-17T10:00:00Z",
  updatedAt: "2025-11-17T10:00:00Z"
}
```

### Message Log Model
```javascript
{
  id: "uuid-v4",
  timestamp: "2025-11-17T10:00:00Z",
  sender: "1234567890@s.whatsapp.net",
  senderName: "John Doe",
  message: "hello",
  matchedRule: "uuid-of-rule",
  response: "Hi! How can I help you?",
  chatType: "individual"
}
```

### Connection State Model
```javascript
{
  status: "connected", // 'disconnected', 'connecting', 'connected'
  qr: "base64-qr-code-data",
  lastConnected: "2025-11-17T10:00:00Z",
  messageCount: 150
}
```

## Error Handling

### WhatsApp Connection Errors
- **QR Code Timeout**: Regenerate QR code after 60 seconds
- **Connection Lost**: Attempt automatic reconnection with exponential backoff (5s, 10s, 30s, 60s)
- **Authentication Failed**: Clear stored credentials and require re-authentication
- **Rate Limiting**: Implement message queue with delays to avoid WhatsApp blocks

### API Errors
- **Invalid Rule Data**: Return 400 with validation error details
- **Rule Not Found**: Return 404 with error message
- **Storage Errors**: Return 500 with generic error message, log details
- **Unauthorized Access**: Return 401 (if authentication is added later)

### Error Response Format
```javascript
{
  success: false,
  error: {
    code: "RULE_NOT_FOUND",
    message: "Rule with ID xyz not found"
  }
}
```

## Testing Strategy

### Unit Tests
- Rule matching logic (exact match, case sensitivity)
- Rule filtering (chat type, enabled status)
- Storage operations (save, load, update)
- Message pattern validation

### Integration Tests
- WhatsApp client initialization and connection
- End-to-end message flow (receive → match → reply)
- API endpoint functionality
- Rule CRUD operations through API

### Manual Testing Checklist
- QR code scanning and authentication
- Creating and editing rules through web interface
- Auto-reply triggering with various message patterns
- Connection recovery after disconnect
- Web interface responsiveness on mobile devices
- Deployment on Render.com

## Deployment Configuration

### Render.com Setup

**render.yaml:**
```yaml
services:
  - type: web
    name: whatsapp-auto-reply-bot
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    disk:
      name: bot-data
      mountPath: /app/data
      sizeGB: 1
```

### Environment Variables
```
PORT=3000
NODE_ENV=production
DATA_DIR=/app/data
LOG_LEVEL=info
```

### Persistent Storage
- Use Render disk for storing authentication and rules
- Mount point: `/app/data`
- Ensure data directory is created on startup
- Implement graceful shutdown to save state

## Security Considerations

1. **Authentication Data**: Store Baileys credentials securely in persistent storage
2. **Web Interface**: Consider adding basic authentication for production use
3. **Rate Limiting**: Implement rate limiting on API endpoints to prevent abuse
4. **Input Validation**: Sanitize all user inputs for rule patterns and responses
5. **CORS**: Configure CORS appropriately for API endpoints
6. **Environment Variables**: Never commit sensitive data to version control

## Performance Optimization

1. **Message Processing**: Use async/await for non-blocking message handling
2. **Rule Matching**: Optimize pattern matching for large rule sets (consider caching)
3. **Log Storage**: Limit in-memory logs to 100 entries, implement log rotation
4. **Connection Management**: Implement connection pooling if needed
5. **Static Assets**: Serve static files efficiently with proper caching headers

## Future Enhancements

1. **Advanced Pattern Matching**: Support regex patterns and wildcards
2. **Multiple Responses**: Random selection from multiple response options
3. **Scheduled Messages**: Send messages at specific times
4. **Analytics Dashboard**: Track response rates and popular patterns
5. **Database Integration**: Migrate from JSON to PostgreSQL/MongoDB
6. **Multi-user Support**: Allow multiple administrators with role-based access
7. **Webhook Integration**: Trigger external APIs based on messages
8. **AI Integration**: Use AI for intelligent response generation
