# Troubleshooting Guide

## Quick Diagnostics

Before diving into specific issues, run these quick checks:

1. **Is the bot running?**
   ```bash
   # Check if process is running
   # You should see output in the terminal
   ```

2. **Can you access the web interface?**
   - Open `http://localhost:3000`
   - Should see the dashboard

3. **Check connection status**
   - Look at the dashboard
   - Status should be "Connected" (green)

4. **Review console logs**
   - Check terminal for error messages
   - Look for connection issues

## Connection Issues

### QR Code Not Appearing

**Symptoms:**
- "Show QR Code" button doesn't work
- Modal opens but no QR code shows
- Loading spinner never stops

**Solutions:**

1. **Check Bot Status**
   ```bash
   # Restart the bot
   npm start
   ```

2. **Clear Browser Cache**
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear cached images and files
   - Refresh the page

3. **Check Console Logs**
   ```bash
   # Look for errors like:
   # "Error initializing WhatsApp client"
   # "QR Code generation failed"
   ```

4. **Verify Dependencies**
   ```bash
   npm install
   ```

### WhatsApp Won't Connect

**Symptoms:**
- QR code appears but scanning doesn't work
- Status stays on "Connecting..."
- Connection drops immediately after scanning

**Solutions:**

1. **Check WhatsApp App**
   - Ensure WhatsApp is updated to latest version
   - Check if you have internet connection on phone
   - Verify you're not at the linked devices limit (max 4 devices)

2. **Clear Auth Data**
   ```bash
   # Stop the bot (Ctrl+C)
   # Delete auth folder
   rm -rf data/auth
   # Or on Windows:
   # rmdir /s data\auth
   
   # Restart bot
   npm start
   ```

3. **Check Firewall**
   - Ensure Node.js is allowed through firewall
   - Check if ports are blocked

4. **Try Different Network**
   - Switch to different WiFi or mobile data
   - Some networks block WhatsApp Web

### Frequent Disconnections

**Symptoms:**
- Connection drops every few minutes
- Status changes from "Connected" to "Disconnected" repeatedly

**Solutions:**

1. **Check Internet Stability**
   - Test your internet connection
   - Try pinging google.com
   - Consider using wired connection instead of WiFi

2. **Verify Phone Connection**
   - Ensure your phone has stable internet
   - WhatsApp on phone must be online
   - Check if phone is in power-saving mode

3. **Review Reconnection Logs**
   ```bash
   # Look for patterns in console:
   # "Connection closed. Should reconnect: true"
   # "Reconnecting in X seconds..."
   ```

4. **Increase Reconnection Attempts**
   - Edit `src/whatsapp/client.js`
   - Increase `maxReconnectAttempts` if needed

## Rule Issues

### Rules Not Triggering

**Symptoms:**
- Send message with pattern but no auto-reply
- Logs show message received but no response

**Diagnostic Steps:**

1. **Check Rule Status**
   - Go to Rules page
   - Verify toggle switch is green (enabled)

2. **Test Pattern Matching**
   - Check if your message contains the exact pattern
   - Example: Pattern "hello" matches "hello there" but not "helo"

3. **Review Case Sensitivity**
   - If case-sensitive is enabled, "Hello" ≠ "hello"
   - Try disabling case sensitivity

4. **Check Chat Type Filter**
   - Individual rule won't work in groups
   - Group rule won't work in individual chats
   - Use "All" for testing

5. **Verify Rule Order**
   - Rules are checked top to bottom
   - First match wins
   - A general rule might be matching before your specific rule

**Solutions:**

1. **Simplify Pattern**
   ```
   Instead of: "what is your price for product"
   Try: "price"
   ```

2. **Disable Case Sensitivity**
   - Edit the rule
   - Uncheck "Case Sensitive"

3. **Change Chat Type to "All"**
   - Edit the rule
   - Select "All Chats"

4. **Check Logs Page**
   - See if message was received
   - Check what response was sent (if any)

### Wrong Rule Triggering

**Symptoms:**
- Different rule responds than expected
- Multiple patterns seem to conflict

**Solutions:**

1. **Reorder Rules**
   - More specific rules should be first
   - General rules should be last
   - Delete and recreate rules in correct order

2. **Make Patterns More Specific**
   ```
   Instead of: "price"
   Try: "what is the price"
   ```

3. **Use Chat Type Filters**
   - Separate individual and group rules
   - Prevents cross-triggering

### Delay Not Working

**Symptoms:**
- Reply is instant despite delay setting
- Delay seems random

**Solutions:**

1. **Check Delay Value**
   - Must be between 0-60 seconds
   - Verify in rule settings

2. **Review Console Logs**
   ```bash
   # Should see:
   # "Waiting X seconds before replying..."
   ```

3. **Test with Longer Delay**
   - Try 10 seconds to make it obvious
   - If it works, adjust to desired value

## Web Interface Issues

### Page Not Loading

**Symptoms:**
- Browser shows "Cannot connect"
- Page times out
- 404 error

**Solutions:**

1. **Verify Bot is Running**
   ```bash
   npm start
   ```

2. **Check Port**
   - Default is 3000
   - Try: `http://localhost:3000`
   - If changed, use your custom port

3. **Check for Port Conflicts**
   ```bash
   # On Windows:
   netstat -ano | findstr :3000
   
   # On Mac/Linux:
   lsof -i :3000
   ```

4. **Try Different Browser**
   - Chrome, Firefox, Safari, Edge
   - Clear cache and cookies

### Dashboard Not Updating

**Symptoms:**
- Statistics don't change
- Connection status stuck
- Logs don't refresh

**Solutions:**

1. **Hard Refresh**
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Clears cache and reloads

2. **Check Browser Console**
   - Press F12
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Verify API Endpoints**
   ```bash
   # Test in browser or curl:
   curl http://localhost:3000/api/status
   curl http://localhost:3000/api/stats
   ```

### Forms Not Submitting

**Symptoms:**
- Click "Add Rule" but nothing happens
- Form shows error but unclear why

**Solutions:**

1. **Check Required Fields**
   - Pattern and Response are required
   - Cannot be empty

2. **Validate Delay**
   - Must be 0-60
   - Cannot be negative

3. **Check Browser Console**
   - Press F12
   - Look for validation errors

4. **Try Different Values**
   - Use simple text first
   - Avoid special characters initially

## Performance Issues

### Slow Response Times

**Symptoms:**
- Auto-replies take long to send
- Web interface is sluggish
- High CPU usage

**Solutions:**

1. **Reduce Active Rules**
   - Disable unused rules
   - Keep under 50 active rules

2. **Clear Old Logs**
   - Logs are limited to 100 automatically
   - But you can manually clear data/logs.json

3. **Check System Resources**
   ```bash
   # Monitor CPU and memory
   # Close other applications
   ```

4. **Restart Bot**
   ```bash
   # Stop with Ctrl+C
   npm start
   ```

### Memory Leaks

**Symptoms:**
- Bot slows down over time
- Memory usage keeps increasing
- Eventually crashes

**Solutions:**

1. **Restart Regularly**
   - Set up a cron job or scheduled task
   - Restart daily or weekly

2. **Update Dependencies**
   ```bash
   npm update
   ```

3. **Monitor Logs**
   - Check for repeated errors
   - Look for connection issues

## Data Issues

### Lost Rules After Restart

**Symptoms:**
- Rules disappear after stopping bot
- Have to recreate rules every time

**Solutions:**

1. **Check Data Directory**
   ```bash
   # Verify files exist:
   ls data/
   # Should see: rules.json, logs.json, auth/
   ```

2. **Check File Permissions**
   ```bash
   # Ensure bot can write to data/
   chmod -R 755 data/
   ```

3. **Verify Storage Path**
   - Check `DATA_DIR` environment variable
   - Default is `./data`

### Lost WhatsApp Session

**Symptoms:**
- Have to scan QR code after every restart
- Session doesn't persist

**Solutions:**

1. **Check Auth Directory**
   ```bash
   ls data/auth/
   # Should see: creds.json and other files
   ```

2. **Verify Persistent Storage (Render.com)**
   - Ensure disk is mounted at `/app/data`
   - Check disk size isn't full

3. **Don't Delete data/ Folder**
   - Add to .gitignore
   - Don't clean it manually

## Deployment Issues (Render.com)

### Build Fails

**Symptoms:**
- Deployment fails during build
- "npm install" errors

**Solutions:**

1. **Check render.yaml**
   - Verify syntax is correct
   - Ensure file is in repository root

2. **Verify package.json**
   - All dependencies listed
   - No syntax errors

3. **Check Node Version**
   - Render uses Node 18 by default
   - Ensure compatibility

### App Crashes on Startup

**Symptoms:**
- Deployment succeeds but app won't start
- Health check fails

**Solutions:**

1. **Check Render Logs**
   - Go to Render dashboard
   - View logs for error messages

2. **Verify Environment Variables**
   - PORT should be set
   - DATA_DIR should be `/app/data`

3. **Check Disk Mount**
   - Ensure persistent disk is attached
   - Mount path is `/app/data`

### Can't Connect WhatsApp on Render

**Symptoms:**
- QR code appears but won't connect
- Connection drops immediately

**Solutions:**

1. **Check Render Service Type**
   - Must be "Web Service" not "Background Worker"
   - Needs to accept HTTP connections

2. **Verify Persistent Disk**
   - Without it, session won't persist
   - Check disk is properly mounted

3. **Check Render Logs**
   - Look for connection errors
   - Verify WhatsApp client initialization

## Error Messages

### "ENOENT: no such file or directory"

**Cause:** Missing data directory or files

**Solution:**
```bash
mkdir -p data/auth
npm start
```

### "EADDRINUSE: address already in use"

**Cause:** Port 3000 is already in use

**Solution:**
```bash
# Find and kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port:
PORT=3001 npm start
```

### "Cannot find module"

**Cause:** Missing dependencies

**Solution:**
```bash
rm -rf node_modules
npm install
```

### "Connection closed"

**Cause:** WhatsApp connection lost

**Solution:**
- Bot will auto-reconnect
- Check internet connection
- Verify phone is online

## Getting More Help

If none of these solutions work:

1. **Check Console Logs**
   - Copy full error message
   - Note when error occurs

2. **Review GitHub Issues**
   - Search for similar problems
   - Check Baileys repository issues

3. **Create New Issue**
   - Include error messages
   - Describe steps to reproduce
   - Mention your environment (OS, Node version)

4. **Check Baileys Documentation**
   - https://github.com/WhiskeySockets/Baileys
   - Many issues are related to Baileys library

## Prevention Tips

1. **Regular Backups**
   ```bash
   # Backup data directory
   cp -r data/ data_backup/
   ```

2. **Monitor Logs**
   - Check console regularly
   - Watch for warnings

3. **Keep Updated**
   ```bash
   npm update
   ```

4. **Test Changes**
   - Test new rules before deploying
   - Use development environment

5. **Document Custom Changes**
   - Keep notes on modifications
   - Makes troubleshooting easier

---

**Still stuck?** Open an issue on GitHub with detailed information about your problem.
