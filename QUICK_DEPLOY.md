# ⚡ Quick Deploy Guide - ReplyFlow on Render.com

## 🚀 5-Minute Deployment

### Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "ReplyFlow - Ready to deploy"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/replyflow.git
git push -u origin main
```

### Step 2: Deploy on Render (3 minutes)

1. **Go to Render.com** → Sign up/Login with GitHub

2. **New Web Service** → Connect your `replyflow` repo

3. **Configure:**
   - Name: `replyflow`
   - Build: `npm install`
   - Start: `npm start`
   - Add Disk: `/app/data` (1GB)

4. **Click "Create Web Service"**

5. **Wait 2-3 minutes** → Done! 🎉

### Step 3: Connect WhatsApp (30 seconds)

1. Open your Render URL
2. Click "Show QR Code"
3. Scan with WhatsApp
4. Start using! ✅

---

## 📝 Important Settings

### Environment Variables (Optional)
```
NODE_ENV=production
PORT=3000
DATA_DIR=/app/data
```

### Persistent Disk (REQUIRED!)
```
Name: bot-data
Mount Path: /app/data
Size: 1 GB
```

---

## 💡 Pro Tips

✅ **Free Tier**: Works great for testing  
✅ **Paid Plan**: $7/month for 24/7 uptime  
✅ **Keep Alive**: Use UptimeRobot to prevent sleep  
✅ **Auto Deploy**: Push to GitHub = Auto deploy  

---

## 🆘 Quick Troubleshooting

**Build fails?**
→ Run `npm install` locally first

**App crashes?**
→ Check Render logs

**WhatsApp won't connect?**
→ Refresh page, try again

**Data not saving?**
→ Check persistent disk is mounted

---

## 🎯 Your URLs

After deployment:
- **Dashboard**: `https://your-app.onrender.com`
- **Health Check**: `https://your-app.onrender.com/health`
- **Rules**: `https://your-app.onrender.com/rules`
- **Logs**: `https://your-app.onrender.com/logs`

---

**That's it! Your ReplyFlow is live! 🚀**

For detailed guide, see `DEPLOYMENT_GUIDE.md`
