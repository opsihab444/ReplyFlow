# WhatsApp Auto Reply Bot - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Connecting WhatsApp](#connecting-whatsapp)
3. [Creating Rules](#creating-rules)
4. [Managing Rules](#managing-rules)
5. [Viewing Logs](#viewing-logs)
6. [Advanced Features](#advanced-features)
7. [Tips & Best Practices](#tips--best-practices)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### First Time Setup

1. **Install and Start**
   ```bash
   npm install
   npm start
   ```

2. **Access the Dashboard**
   - Open your browser
   - Navigate to `http://localhost:3000`
   - You'll see the main dashboard

3. **Check Connection Status**
   - Look for the connection status indicator
   - It will show "Disconnected" initially

## Connecting WhatsApp

### Step-by-Step Connection

1. **Open Dashboard**
   - Go to `http://localhost:3000`

2. **Show QR Code**
   - Click the "Show QR Code" button
   - A modal will appear with a QR code

3. **Scan with WhatsApp**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code displayed on your screen

4. **Wait for Connection**
   - The status will change to "Connecting..."
   - Once connected, it will show "Connected" with a green indicator
   - The QR code modal will close automatically

### Connection Tips

- **QR Code Expires**: If the QR code expires, click "Show QR Code" again
- **Already Connected**: If you're already connected, you won't see the QR code
- **Reconnection**: The bot automatically reconnects if the connection drops

## Creating Rules

### Basic Rule Creation

1. **Navigate to Rules Page**
   - Click "Rules" in the navigation menu

2. **Fill in the Form**
   - **Message Pattern**: Enter the keyword to trigger the reply
     - Example: "hello", "price", "help"
   - **Auto Response**: Enter the message to send automatically
     - Example: "Hi! How can I help you today?"

3. **Click "Add Rule"**
   - The rule will be created and appear in the list below

### Rule Options Explained

#### Message Pattern
- The keyword or phrase that triggers the auto-reply
- Can be a single word or multiple words
- Example patterns:
  - "hello" - matches any message containing "hello"
  - "what is your price" - matches messages with this phrase
  - "help" - matches any message with "help"

#### Auto Response
- The message that will be sent automatically
- Can include:
  - Plain text
  - Multiple lines (use Enter key)
  - Emojis 😊
  - Links

#### Chat Type
- **All Chats**: Rule applies to both individual and group chats
- **Individual Only**: Rule only works in one-on-one conversations
- **Group Only**: Rule only works in group chats

#### Delay (seconds)
- Time to wait before sending the reply
- Range: 0-60 seconds
- Use cases:
  - 0 seconds: Instant reply
  - 1-3 seconds: Natural conversation feel
  - 5-10 seconds: Simulate "typing" time

#### Case Sensitive
- **Unchecked** (default): Matches "Hello", "hello", "HELLO"
- **Checked**: Only matches exact case

#### Enable Rule
- **Checked** (default): Rule is active
- **Unchecked**: Rule is disabled but saved

## Managing Rules

### Viewing Rules
- All rules are displayed on the Rules page
- Each rule shows:
  - Pattern and response
  - Status (Enabled/Disabled)
  - Chat type
  - Delay and case sensitivity settings

### Editing Rules

1. **Click "Edit" Button**
   - Find the rule you want to edit
   - Click the "Edit" button

2. **Modify Fields**
   - The form will populate with current values
   - Change any fields you want

3. **Click "Update Rule"**
   - Changes are saved immediately
   - Click "Cancel" to discard changes

### Enabling/Disabling Rules

- **Toggle Switch**: Use the switch next to each rule
  - Green = Enabled
  - Gray = Disabled
- Disabled rules are saved but won't trigger auto-replies

### Deleting Rules

1. **Click "Delete" Button**
2. **Confirm Deletion**
   - A confirmation dialog will appear
   - Click "OK" to permanently delete
   - Click "Cancel" to keep the rule

## Viewing Logs

### Message History

1. **Navigate to Logs Page**
   - Click "Logs" in the navigation menu

2. **View Recent Messages**
   - Shows the last 100 messages
   - Auto-refreshes every 5 seconds

### Log Information

Each log entry shows:
- **Sender**: Phone number and chat type (individual/group)
- **Timestamp**: When the message was received
- **Message**: The incoming message text
- **Auto-reply**: The response sent (or "No matching rule")

### Understanding Logs

- **Green arrow (↳)**: Indicates the bot's response
- **"No matching rule"**: Message received but no rule matched
- **Newest First**: Most recent messages appear at the top

## Advanced Features

### Multiple Rules

- You can create unlimited rules
- Rules are checked in order (top to bottom)
- **First match wins**: Only the first matching rule is applied
- Order matters! Organize rules from specific to general

### Pattern Matching

The bot uses **substring matching**:
- Pattern "hello" matches:
  - "hello"
  - "hello there"
  - "say hello"
  - "HELLO" (if case-insensitive)

### Chat Type Filtering

**Use Cases:**
- **Individual**: Customer support, personal inquiries
- **Group**: Community management, group announcements
- **All**: General information, FAQs

### Delay Strategy

**When to use delays:**
- **0s**: Instant responses (FAQs, quick info)
- **1-3s**: Natural conversation flow
- **5-10s**: Complex queries, detailed responses
- **10-30s**: Simulate research or processing time

## Tips & Best Practices

### Creating Effective Rules

1. **Start Simple**
   - Begin with common keywords
   - Test each rule before adding more

2. **Use Clear Patterns**
   - Choose obvious keywords
   - Avoid ambiguous patterns

3. **Write Helpful Responses**
   - Be clear and concise
   - Include next steps or additional info
   - Use friendly language

4. **Test Your Rules**
   - Send test messages to verify
   - Check the Logs page to see results
   - Adjust patterns as needed

### Rule Organization

1. **Specific Before General**
   - Put specific rules first
   - General rules last
   - Example order:
     1. "what is your price for product X"
     2. "what is your price"
     3. "price"

2. **Group Related Rules**
   - Keep similar topics together
   - Makes management easier

3. **Use Descriptive Patterns**
   - Make patterns easy to understand
   - Future you will thank you!

### Performance Tips

1. **Limit Active Rules**
   - Keep under 50 active rules for best performance
   - Disable unused rules instead of deleting

2. **Avoid Overlapping Patterns**
   - Prevent multiple rules from matching the same message
   - Remember: first match wins

3. **Monitor Logs Regularly**
   - Check which rules are being used
   - Remove or update ineffective rules

## Troubleshooting

### Common Issues

#### "QR Code Not Appearing"
**Solution:**
- Refresh the browser page
- Check if the bot is running (`npm start`)
- Check browser console for errors

#### "WhatsApp Keeps Disconnecting"
**Solution:**
- Check your internet connection
- Ensure WhatsApp Web isn't logged out on your phone
- Try deleting `data/auth/` folder and reconnecting

#### "Rules Not Working"
**Solution:**
- Verify the rule is enabled (toggle switch is green)
- Check if the pattern matches your test message
- Review case sensitivity settings
- Check Logs page to see if messages are being received

#### "Bot Not Responding"
**Solution:**
- Check connection status (should be green "Connected")
- Verify at least one rule matches the message
- Check console logs for errors
- Restart the bot: `npm start`

#### "Messages Not Appearing in Logs"
**Solution:**
- Ensure WhatsApp is connected
- Check if messages are being sent to the correct number
- Verify the bot isn't ignoring your own messages

### Getting Help

If you're still having issues:
1. Check the main README.md troubleshooting section
2. Review console logs for error messages
3. Verify all dependencies are installed
4. Try restarting the bot
5. Check GitHub issues for similar problems

## Keyboard Shortcuts

- **Ctrl/Cmd + R**: Refresh page
- **Ctrl/Cmd + W**: Close tab
- **Esc**: Close QR code modal

## Security Reminders

⚠️ **Important:**
- Keep your WhatsApp session secure
- Don't share your QR code
- Regularly review message logs
- Use strong patterns to avoid unintended replies
- Consider adding web interface authentication for production

---

**Need more help?** Check the main README.md or open an issue on GitHub.
