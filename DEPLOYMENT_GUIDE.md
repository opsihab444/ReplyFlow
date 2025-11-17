# 🚀 ReplyFlow - Render.com Deployment Guide

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ A GitHub account
- ✅ A Render.com account (free tier works!)
- ✅ Your code pushed to GitHub
- ✅ All files committed

## 🎯 Step-by-Step Deployment

### Step 1: Push Code to GitHub

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Name: `replyflow` (or any name you like)
   - Make it Public or Private
   - Don't initialize with README (we already have one)

2. **Push your code**
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit - ReplyFlow"
   
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/replyflow.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. **From Render Dashboard:**
   - Click "New +" button (top right)
   - Select "Web Service"

2. **Connect Repository:**
   - Find your `replyflow` repository
   - Click "Connect"

3. **Configure Service:**
   
   **Basic Settings:**
   - **Name**: `replyflow` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   
   **Build & Deploy:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
   **Instance Type:**
   - Select "Free" (for testing)
   - Or "Starter" ($7/month for better performance)

### Step 4: Add Environment Variables

Click "Advanced" and add these environment variables:

```
NODE_ENV=production
PORT=3000
DATA_DIR=/app/data
```

### Step 5: Add Persistent Disk (IMPORTANT!)

This is crucial for WhatsApp session persistence!

1. Scroll down to "Disks" section
2. Click "Add Disk"
3. Configure:
   - **Name**: `bot-data`
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB (free tier allows up to 1GB)

**Why this is important:**
- Stores WhatsApp authentication
- Saves your rules
- Keeps message logs
- Without this, you'll need to scan QR code after every restart!

### Step 6: Deploy!

1. Click "Create Web Service"
2. Wait for deployment (usually 2-5 minutes)
3. Watch the logs for any errors

### Step 7: Access Your Bot

Once deployed:

1. **Get Your URL:**
   - Render will give you a URL like: `https://replyflow.onrender.com`
   - Or you can use a custom domain

2. **Open in Browser:**
   - Visit your URL
   - You should see the ReplyFlow dashboard!

3. **Connect WhatsApp:**
   - Click "Show QR Code"
   - Scan with your WhatsApp mobile app
   - Wait for "Connected & Active" status

## 🔧 Important Configuration

### render.yaml (Already Created!)

Your project already has a `render.yaml` file:

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

This file auto-configures everything!

### Auto-Deploy from GitHub

Render automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Render will automatically deploy!
```

## 📱 Post-Deployment Steps

### 1. Connect WhatsApp

1. Open your Render URL
2. Go to Dashboard
3. Click "Show QR Code"
4. Scan with WhatsApp on your phone:
   - Open WhatsApp
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Scan the QR code

### 2. Create Your First Rule

1. Go to "Rules" page
2. Click "Add New Rule"
3. Fill in:
   - Pattern: `hello`
   - Response: `Hi! How can I help you?`
4. Click "Save Rule"

### 3. Test It!

1. Send "hello" to your WhatsApp number
2. Bot should auto-reply!
3. Check "Logs" page to see activity

## ⚠️ Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 1 GB persistent disk
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Takes ~30 seconds to wake up

**What happens when it spins down:**
- WhatsApp connection is lost
- Need to reconnect when it wakes up
- Rules and data are preserved (thanks to persistent disk!)

**Solution:**
- Upgrade to Starter plan ($7/month) for 24/7 uptime
- Or use a service like UptimeRobot to ping your URL every 5 minutes

### Keeping Bot Alive (Free Tier)

Use UptimeRobot to prevent spin-down:

1. Go to https://uptimerobot.com
2. Create free account
3. Add new monitor:
   - Type: HTTP(s)
   - URL: Your Render URL + `/health`
   - Interval: 5 minutes
4. This keeps your bot awake!

## 🔒 Security Best Practices

### 1. Add Authentication (Optional)

For production, consider adding basic auth:

```javascript
// In src/server/app.js
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
  users: { 'admin': 'your-password' },
  challenge: true
}));
```

### 2. Environment Variables

Never commit sensitive data:
- Use Render's environment variables
- Keep `.env` in `.gitignore`
- Use strong passwords

### 3. Rate Limiting

Already implemented in the code!
- Prevents abuse
- Protects your bot

## 📊 Monitoring

### View Logs

1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time logs

### Check Health

Visit: `https://your-url.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T..."
}
```

## 🐛 Troubleshooting

### Build Fails

**Error: "npm install failed"**
- Check `package.json` is valid
- Ensure all dependencies are listed
- Check Node version compatibility

**Solution:**
```bash
# Test locally first
npm install
npm start
```

### App Crashes on Startup

**Check Logs:**
1. Go to Render Dashboard
2. View logs
3. Look for error messages

**Common Issues:**
- Port already in use (shouldn't happen on Render)
- Missing environment variables
- Database connection issues

### WhatsApp Won't Connect

**Issue: QR code not appearing**
- Check if bot is running (view logs)
- Refresh the page
- Check `/api/status` endpoint

**Issue: Connection drops frequently**
- Free tier spins down after inactivity
- Upgrade to paid plan
- Use UptimeRobot to keep alive

### Persistent Disk Issues

**Data not persisting:**
- Verify disk is mounted at `/app/data`
- Check disk size (1GB limit on free tier)
- Ensure `DATA_DIR` env var is set

## 💰 Cost Breakdown

### Free Tier
- **Cost**: $0/month
- **Uptime**: Spins down after 15 min inactivity
- **Disk**: 1 GB
- **Best for**: Testing, personal use

### Starter Plan
- **Cost**: $7/month
- **Uptime**: 24/7
- **Disk**: 1 GB included
- **Best for**: Production, business use

### Pro Plan
- **Cost**: $25/month
- **Uptime**: 24/7
- **Disk**: 10 GB included
- **Best for**: High traffic, enterprise

## 🎉 Success Checklist

After deployment, verify:

- ✅ App is accessible via Render URL
- ✅ Dashboard loads correctly
- ✅ Can scan QR code
- ✅ WhatsApp connects successfully
- ✅ Can create rules
- ✅ Auto-reply works
- ✅ Logs are visible
- ✅ Data persists after restart
- ✅ Dark mode works
- ✅ All pages load correctly

## 📞 Support

### Need Help?

1. **Check Logs**: Most issues show up in logs
2. **Render Docs**: https://render.com/docs
3. **GitHub Issues**: Create an issue in your repo
4. **Render Community**: https://community.render.com

### Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **Render Docs**: https://render.com/docs
- **Status Page**: https://status.render.com
- **Pricing**: https://render.com/pricing

## 🚀 Next Steps

After successful deployment:

1. **Custom Domain** (Optional)
   - Buy a domain
   - Add to Render
   - Update DNS settings

2. **SSL Certificate**
   - Automatic with Render!
   - HTTPS enabled by default

3. **Monitoring**
   - Set up UptimeRobot
   - Monitor logs regularly
   - Check health endpoint

4. **Backup**
   - Export rules regularly
   - Save WhatsApp session data
   - Keep code in GitHub

## 🎊 Congratulations!

Your ReplyFlow bot is now live on the internet! 🌐

Share your URL with others and start automating WhatsApp replies! 🤖

---

**ReplyFlow** - Smart Auto Reply for WhatsApp  
*Deployed with ❤️ on Render.com*
