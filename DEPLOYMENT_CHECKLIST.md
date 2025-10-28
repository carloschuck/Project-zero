# Deployment Checklist - File Upload Fix

## Quick Fix for File Uploads on DigitalOcean

Your uploads are not working because DigitalOcean App Platform has ephemeral storage. Follow these steps to fix it:

## ✅ What's Been Done

1. ✅ Added AWS SDK for DigitalOcean Spaces support
2. ✅ Updated attachment controller to use Spaces
3. ✅ Added fallback to local storage for development
4. ✅ Updated `digitalocean-app.yaml` with Spaces env vars

## 🚀 What You Need to Do

### 1. Install Dependencies (Do this first!)

```bash
cd backend
npm install
```

This installs:
- `@aws-sdk/client-s3` - For DigitalOcean Spaces

### 2. Create a DigitalOcean Space

1. Go to: https://cloud.digitalocean.com/spaces
2. Click **Create a Space**
3. Settings:
   - Region: Choose closest to your app (recommend same region as your app)
   - Name: `ticketing-system-uploads` (or your preferred name)
   - File Listing: **Restrict File Listing** (for security)
4. Click **Create Space**

**Cost**: $5/month (includes 250GB storage + 1TB bandwidth)

### 3. Generate API Keys

1. In Spaces page, click **Manage Keys** (top right)
2. Click **Generate New Key**
3. Name: `ticketing-system`
4. **COPY BOTH KEYS NOW** - you can't see the secret again!
   - Access Key: `do00...` 
   - Secret Key: `abc123...`

### 4. Update Your App Environment Variables

#### Via DigitalOcean Console (Easiest):

1. Go to: https://cloud.digitalocean.com/apps
2. Click your app → **Settings** → **backend** component
3. Scroll to **Environment Variables**
4. Add/Update these:

```
SPACES_ENDPOINT = https://nyc3.digitaloceanspaces.com
SPACES_REGION = nyc3
SPACES_BUCKET = ticketing-system-uploads
SPACES_KEY = [Your Access Key] (✓ Encrypt)
SPACES_SECRET = [Your Secret Key] (✓ Encrypt)
```

**Important**: 
- Replace `nyc3` with your Space's region
- Replace `ticketing-system-uploads` with your Space name
- Check "Encrypt" for SPACES_KEY and SPACES_SECRET

5. Click **Save** → This will trigger a redeploy

### 5. Commit and Push Code Changes

```bash
git add .
git commit -m "Fix file uploads with DigitalOcean Spaces"
git push origin main
```

Your app will automatically redeploy (if auto-deploy is enabled).

### 6. Test the Fix

1. Wait for deployment to complete (~5 minutes)
2. Open your app
3. Go to a Project
4. Click **Files** tab
5. Try uploading a file
6. Try downloading the file
7. Check your Space - you should see the file in `projects/` folder!

## 🔍 Verification

Check if it's working:

1. **Backend logs should show**:
   ```
   ✅ DigitalOcean Spaces client configured successfully
   📦 Bucket: ticketing-system-uploads
   ```

2. **After upload, you should see**:
   ```
   ✅ File uploaded to Spaces: projects/filename-123456789.pdf
   ```

3. **In your Space**, you should see folders:
   ```
   ticketing-system-uploads/
   ├── tickets/
   └── projects/
   ```

## ❌ Troubleshooting

### "Spaces not configured - using local/memory storage"

**Problem**: Environment variables not set correctly

**Fix**: 
- Double-check variable names (no typos!)
- Make sure you saved in the DigitalOcean console
- Redeploy the app

### "Failed to upload file"

**Possible causes**:
1. Wrong bucket name
2. Wrong region
3. Wrong access keys
4. Keys don't have permissions

**Fix**:
- Verify bucket name exactly matches your Space name
- Check region matches (nyc3, sfo3, etc.)
- Try regenerating keys in Spaces → Manage Keys

### "File not found in storage" when downloading

**Problem**: File wasn't uploaded to Spaces

**Fix**:
- Check backend logs during upload
- Verify SPACES_BUCKET is correct
- Make sure access keys have write permissions

### npm install fails

**Problem**: Old package-lock.json

**Fix**:
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Cost Estimate

**DigitalOcean Spaces**: $5/month
- Includes 250GB storage
- Includes 1TB outbound transfer
- Additional storage: $0.02/GB/month
- Additional bandwidth: $0.01/GB

**Example usage**:
- 1000 files at 5MB each = 5GB storage = $5/month
- 10,000 downloads/month at 5MB = 50GB transfer = included

Very cost-effective for most applications!

## 🎯 Expected Results

After completing these steps:

✅ File uploads work in Projects  
✅ File uploads work in Tickets  
✅ File downloads work correctly  
✅ Files persist across deployments  
✅ No more "file not found" errors  

## 📚 More Information

See `SPACES_SETUP.md` for detailed information about:
- Security configuration
- CORS setup
- File migration
- Advanced troubleshooting

## Need Help?

Check your app logs:
```bash
# Install doctl if you haven't
brew install doctl  # Mac
# or snap install doctl  # Linux

# Authenticate
doctl auth init

# Get your app ID
doctl apps list

# View logs
doctl apps logs YOUR_APP_ID --type RUN
```

Look for Spaces-related messages at startup and during uploads.

