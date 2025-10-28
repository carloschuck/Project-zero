# 🔧 File Upload Fix - Quick Start

## 📋 TL;DR - What You Need to Do

Your file uploads aren't working because DigitalOcean App Platform has ephemeral storage. Files get deleted when containers restart. **Solution**: Use DigitalOcean Spaces (S3-compatible storage).

## ⚡ Quick Fix (5 Minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Create a Space
1. Go to: https://cloud.digitalocean.com/spaces
2. Click **Create a Space**
3. Name it: `ticketing-system-uploads`
4. Choose same region as your app
5. Click **Create**

### Step 3: Get API Keys
1. Click **Manage Keys** (top right)
2. Click **Generate New Key**
3. **Copy both keys NOW** (can't see secret again!)

### Step 4: Add Environment Variables
1. Go to your app: https://cloud.digitalocean.com/apps
2. Settings → backend → Environment Variables → Edit
3. Add these 5 variables:

```
SPACES_ENDPOINT = https://nyc3.digitaloceanspaces.com
SPACES_REGION = nyc3
SPACES_BUCKET = ticketing-system-uploads
SPACES_KEY = [your-access-key] ✓ Encrypt
SPACES_SECRET = [your-secret-key] ✓ Encrypt
```

4. Click **Save**

### Step 5: Deploy
```bash
git add .
git commit -m "Fix file uploads with Spaces"
git push origin main
```

### Step 6: Test
1. Wait for deployment (~5 min)
2. Open a project
3. Upload a file
4. Download it
5. ✅ It works!

## 📚 Detailed Documentation

Need more details? Check these guides:

### Quick References
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment
- **[ENV_VARIABLES.md](ENV_VARIABLES.md)** - All environment variables explained

### In-Depth Guides
- **[SPACES_SETUP.md](SPACES_SETUP.md)** - Complete Spaces setup guide
- **[FILE_UPLOAD_FIX.md](FILE_UPLOAD_FIX.md)** - Technical details of the fix

## 🔍 Verify It's Working

Check backend logs after deployment. You should see:

✅ **Success**:
```
✅ DigitalOcean Spaces client configured successfully
📦 Bucket: ticketing-system-uploads
🌐 Region: nyc3
```

❌ **Not Working**:
```
💻 Spaces not configured - using local/memory storage
```
→ Environment variables not set correctly

## 💰 Cost

**$5/month** for DigitalOcean Spaces
- Includes 250GB storage
- Includes 1TB bandwidth
- Very reasonable for most apps

## 🐛 Troubleshooting

### Upload fails
- Check bucket name matches exactly
- Verify region is correct
- Check API keys have permissions

### Download fails
- File exists in Spaces? Check: https://cloud.digitalocean.com/spaces
- Check backend logs for errors
- Verify SPACES_ENDPOINT is correct

### "Not configured" message
- Check all 5 environment variables are set
- Check for typos in variable names
- Try redeploying the app

## 📁 What Changed?

### New Files
- `backend/src/config/spaces.js` - Spaces configuration
- `SPACES_SETUP.md` - Setup guide
- `DEPLOYMENT_CHECKLIST.md` - Quick checklist
- `ENV_VARIABLES.md` - Environment variables reference
- `FILE_UPLOAD_FIX.md` - Technical summary
- This file!

### Modified Files
- `backend/package.json` - Added AWS SDK
- `backend/src/controllers/attachmentController.js` - Upload/download logic
- `digitalocean-app.yaml` - Added Spaces env vars

### How It Works Now

**Upload**:
```
File → Multer → Permission Check → Upload to Spaces → Save to DB
```

**Download**:
```
Request → Permission Check → Stream from Spaces → User
```

**Local Development** (unchanged):
```
File → Multer → Permission Check → Save to disk → DB
```

## ✨ Features

- ✅ Works in production (Spaces)
- ✅ Works in development (disk)
- ✅ Automatic fallback
- ✅ No code changes needed after setup
- ✅ Secure (private files, authentication required)
- ✅ Scalable (handle any file volume)

## 🎯 Testing Checklist

After deployment, test these:

- [ ] Upload file to project
- [ ] Download file from project
- [ ] Delete file from project
- [ ] Upload file to ticket
- [ ] Download file from ticket
- [ ] Delete file from ticket
- [ ] Files visible in Spaces dashboard
- [ ] Files in correct folders (projects/, tickets/)

## 🚀 Next Steps

1. Complete the 6 steps above
2. Test uploads/downloads
3. Monitor Spaces usage in DigitalOcean dashboard
4. Consider enabling CDN if needed (optional)

## 📞 Need Help?

1. Check logs: `doctl apps logs YOUR_APP_ID --type RUN`
2. Review guides: Start with `DEPLOYMENT_CHECKLIST.md`
3. Verify environment variables: See `ENV_VARIABLES.md`
4. Check Space exists: https://cloud.digitalocean.com/spaces

## 🎓 Learn More

- [DigitalOcean Spaces Documentation](https://docs.digitalocean.com/products/spaces/)
- [App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

---

**That's it!** Follow the 6 steps above and your file uploads will work. 🎉

