# ReplyFlow - Smart WhatsApp Auto Reply Bot

A modern Node.js application that provides intelligent automated WhatsApp message responses based on configurable rules through a beautiful web interface.

## Features

- 🔐 WhatsApp authentication via QR code
- 🌐 Web-based dashboard for managing auto-reply rules
- ⚡ Real-time auto-reply functionality
- 📊 Message logs and statistics
- 🎯 Advanced rule configuration (delays, chat type filtering)
- ☁️ Ready for deployment on Render.com

## Technology Stack

- **Node.js** - Runtime environment
- **Baileys** - WhatsApp Web API integration
- **Express.js** - Web server framework
- **EJS** - Template engine for web interface

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Getting Started

1. **Start the Application**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:3000`

2. **Connect WhatsApp**
   - Open the dashboard in your browser
   - Click "Show QR Code" button
   - Scan the QR code with your WhatsApp mobile app
   - Wait for the connection status to show "Connected"

3. **Create Your First Rule**
   - Navigate to the "Rules" page
   - Fill in the form:
     - **Message Pattern**: The keyword to trigger the reply (e.g., "hello", "price", "help")
     - **Auto Response**: The message to send automatically
     - **Chat Type**: Choose where the rule applies (All, Individual, or Group chats)
     - **Delay**: Optional delay in seconds before sending the reply (0-60)
     - **Case Sensitive**: Enable if pattern matching should be case-sensitive
   - Click "Add Rule"

4. **Test Your Bot**
   - Send a message to your WhatsApp number containing the pattern
   - The bot will automatically reply with your configured response
   - Check the "Logs" page to see the message history

### Web Interface Guide

#### Dashboard Page (`/`)
- **Connection Status**: Shows if WhatsApp is connected, connecting, or disconnected
- **Statistics**: Displays message count, active rules, total rules, and uptime
- **QR Code Modal**: Click "Show QR Code" to authenticate WhatsApp

#### Rules Page (`/rules`)
- **Add/Edit Rules**: Create new rules or modify existing ones
- **Rule List**: View all configured rules with their settings
- **Toggle Switch**: Quickly enable/disable rules without deleting them
- **Actions**: Edit or delete individual rules

#### Logs Page (`/logs`)
- **Message History**: View the last 100 messages received
- **Auto-Refresh**: Logs update automatically every 5 seconds
- **Details**: See sender, message content, matched rule, and bot response

### Rule Configuration Options

| Option | Description | Values |
|--------|-------------|--------|
| **Pattern** | Keyword or phrase to match | Any text (required) |
| **Response** | Message to send automatically | Any text (required) |
| **Chat Type** | Where the rule applies | All / Individual / Group |
| **Delay** | Wait time before replying | 0-60 seconds |
| **Case Sensitive** | Match exact case | Yes / No |
| **Enabled** | Rule active status | Yes / No |

### API Endpoints

The bot provides a REST API for programmatic access:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Get connection status |
| GET | `/api/qr` | Get QR code for authentication |
| GET | `/api/rules` | List all rules |
| POST | `/api/rules` | Create a new rule |
| PUT | `/api/rules/:id` | Update a rule |
| DELETE | `/api/rules/:id` | Delete a rule |
| PATCH | `/api/rules/:id/toggle` | Toggle rule enabled/disabled |
| GET | `/api/logs` | Get message logs |
| GET | `/api/stats` | Get bot statistics |
| GET | `/health` | Health check endpoint |

### Example API Usage

**Create a Rule:**
```bash
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "hello",
    "response": "Hi! How can I help you?",
    "chatType": "all",
    "delay": 0,
    "caseSensitive": false,
    "enabled": true
  }'
```

**Get All Rules:**
```bash
curl http://localhost:3000/api/rules
```

**Toggle a Rule:**
```bash
curl -X PATCH http://localhost:3000/api/rules/{rule-id}/toggle
```

## Deployment on Render.com

### Prerequisites
- A Render.com account
- This repository pushed to GitHub

### Steps

1. **Create a New Web Service on Render.com**
   - Go to your Render dashboard
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   - Render will automatically detect the `render.yaml` file
   - The service will be configured with:
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment: Node
     - Port: 3000

3. **Add Persistent Disk**
   - In the service settings, add a disk:
     - Name: `bot-data`
     - Mount Path: `/app/data`
     - Size: 1GB (or more as needed)
   - This stores your WhatsApp authentication and rules

4. **Environment Variables** (Optional)
   - `PORT`: 3000 (default)
   - `NODE_ENV`: production
   - `DATA_DIR`: /app/data

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Access your bot at the provided Render URL

6. **Connect WhatsApp**
   - Open your bot's URL in a browser
   - Scan the QR code with WhatsApp
   - Start creating auto-reply rules!

### Important Notes
- The persistent disk is crucial for maintaining your WhatsApp session
- Without it, you'll need to scan the QR code after every deployment
- Free tier on Render may spin down after inactivity
- Consider upgrading to a paid plan for 24/7 uptime

## Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
PORT=3000
NODE_ENV=development
DATA_DIR=./data
LOG_LEVEL=info
```

### Data Storage

The bot stores data in the `data/` directory:
- `data/auth/` - WhatsApp authentication credentials
- `data/rules.json` - Auto-reply rules
- `data/logs.json` - Message logs (last 100 messages)

**Important**: Add `data/` to `.gitignore` to avoid committing sensitive data.

## Troubleshooting

### QR Code Not Appearing
- Check if the bot is running: `npm start`
- Refresh the browser page
- Check console logs for errors

### WhatsApp Keeps Disconnecting
- Ensure stable internet connection
- Check if WhatsApp Web is logged out on your phone
- Delete `data/auth/` folder and re-scan QR code

### Rules Not Working
- Verify the rule is enabled (toggle switch is on)
- Check if the pattern matches the incoming message
- Review case sensitivity settings
- Check the "Logs" page to see if messages are being received

### Bot Not Responding
- Check connection status on dashboard
- Verify WhatsApp is connected (green status)
- Check if any rules match the incoming message pattern
- Review console logs for errors

### Deployment Issues on Render.com
- Ensure persistent disk is properly configured
- Check environment variables are set correctly
- Verify the `render.yaml` file is in the repository root
- Check Render logs for startup errors

## Best Practices

1. **Pattern Matching**
   - Use simple, common keywords for patterns
   - Avoid overly specific patterns that rarely match
   - Test patterns with different message variations

2. **Response Messages**
   - Keep responses clear and concise
   - Include helpful information or next steps
   - Use friendly, professional language

3. **Delays**
   - Use short delays (1-3 seconds) for natural conversation flow
   - Longer delays for complex queries that need "thinking time"
   - Zero delay for instant responses

4. **Chat Types**
   - Use "Individual" for personal customer support
   - Use "Group" for community management
   - Use "All" for general announcements

5. **Rule Management**
   - Disable rules instead of deleting them for temporary changes
   - Regularly review and update rules based on logs
   - Keep the number of rules manageable (< 50 for best performance)

## Security Considerations

⚠️ **Important Security Notes:**

- Never commit the `data/` directory to version control
- Keep your WhatsApp session secure - anyone with access can send messages
- Use environment variables for sensitive configuration
- Consider adding authentication to the web interface for production use
- Regularly backup your `data/` directory
- Monitor logs for suspicious activity

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues and questions:
- Check the Troubleshooting section above
- Review the [Baileys documentation](https://github.com/WhiskeySockets/Baileys)
- Open an issue on GitHub

## License

ISC

---

**Made with ❤️ using Node.js and Baileys**
