# DigitalOcean Spaces Setup Guide for File Uploads

## Why Spaces is Needed

DigitalOcean App Platform uses ephemeral file storage - any files uploaded to the server's filesystem are lost when the container restarts. To persist uploaded files (attachments in tickets and projects), we need to use **DigitalOcean Spaces**, which is an S3-compatible object storage service.

## Problem We're Solving

**Before this fix:**
- Files were uploaded to memory storage
- Downloads failed because files couldn't be persisted
- Uploads appeared to work but files were lost

**After this fix:**
- Files are uploaded to DigitalOcean Spaces
- Files persist across container restarts
- Downloads work correctly from Spaces

## Setup Instructions

### Step 1: Create a DigitalOcean Space

1. Log into your DigitalOcean account
2. Go to **Spaces & Object Storage** from the left menu
3. Click **Create a Space**
4. Configure your Space:
   - **Region**: Choose the region closest to your app (e.g., `NYC3`, `SFO3`)
   - **Name**: Choose a unique name (e.g., `ticketing-system-files`)
   - **File Listing**: Choose `Restrict File Listing` (recommended for security)
   - **CDN**: Optional - can enable for faster downloads
5. Click **Create Space**

### Step 2: Generate Spaces Access Keys

1. In the Spaces section, click **Manage Keys** (top right)
2. Click **Generate New Key**
3. Name it (e.g., `ticketing-system-uploads`)
4. **IMPORTANT**: Copy both the **Access Key** and **Secret Key** immediately
   - You won't be able to see the Secret Key again!
   - Store them securely

### Step 3: Configure Your App

#### Option A: Update via DigitalOcean Console (Recommended)

1. Go to your App in the DigitalOcean App Platform
2. Go to **Settings** → **backend** component
3. Click **Edit** next to Environment Variables
4. Update/Add these environment variables:
   ```
   SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
   SPACES_REGION=nyc3
   SPACES_BUCKET=your-bucket-name
   SPACES_KEY=your-spaces-access-key (mark as SECRET)
   SPACES_SECRET=your-spaces-secret-key (mark as SECRET)
   ```
5. Replace:
   - `nyc3` with your chosen region
   - `your-bucket-name` with your Space name
   - `your-spaces-access-key` with your Access Key
   - `your-spaces-secret-key` with your Secret Key
6. Click **Save** and your app will redeploy

#### Option B: Update via YAML (Advanced)

1. Edit `digitalocean-app.yaml` in your repository
2. Update the backend service environment variables:
   ```yaml
   - key: SPACES_ENDPOINT
     value: https://nyc3.digitaloceanspaces.com
   - key: SPACES_REGION
     value: nyc3
   - key: SPACES_BUCKET
     value: your-bucket-name
   - key: SPACES_KEY
     type: SECRET
     value: your-spaces-access-key
   - key: SPACES_SECRET
     type: SECRET
     value: your-spaces-secret-key
   ```
3. Commit and push to trigger a new deployment

### Step 4: Update Dependencies

The fix requires new npm packages. Run these commands in your backend directory:

```bash
cd backend
npm install @aws-sdk/client-s3@^3.490.0
```

Or if deploying, this will happen automatically during the build.

### Step 5: Test File Uploads

1. After deployment, log into your application
2. Go to a Project
3. Try uploading a file in the **Files** tab
4. Verify the file uploads successfully
5. Try downloading the file
6. Check your Space in DigitalOcean - you should see the file in the `projects/` folder

## File Organization in Spaces

Files are organized by entity type:
```
your-space/
├── tickets/
│   ├── file1-timestamp.pdf
│   └── file2-timestamp.jpg
└── projects/
    ├── file1-timestamp.pdf
    └── file2-timestamp.docx
```

## Security Notes

1. **Private Files**: Files are stored with `private` ACL - they require authentication to download
2. **Access Keys**: Mark `SPACES_KEY` and `SPACES_SECRET` as SECRET in environment variables
3. **Bucket Permissions**: Use "Restrict File Listing" for the Space
4. **CORS**: If you need direct browser uploads later, configure CORS in your Space settings

## Pricing

DigitalOcean Spaces pricing (as of 2024):
- **Storage**: $5/month for 250GB included
- **Bandwidth**: 1TB included, then $0.01/GB
- Very cost-effective for most applications

## Troubleshooting

### Files Not Uploading

Check the backend logs:
```bash
# If you're using doctl CLI
doctl apps logs YOUR_APP_ID --type BUILD

# Look for:
# ✅ DigitalOcean Spaces client configured successfully
```

If you see:
```
💻 Spaces not configured - using local/memory storage
```

Then your environment variables aren't set correctly.

### Download Fails

1. Verify the Space exists and is accessible
2. Check that the Access Keys have proper permissions
3. Look at the backend logs for specific errors

### Local Development

For local development, the system automatically falls back to disk storage. You don't need Spaces configured locally.

## Migration of Existing Files

If you have existing attachments in the database that weren't uploaded to Spaces, they will show as "File not found". You'll need to:

1. Either re-upload those files
2. Or run a migration script to move them from local storage to Spaces (if you have access to the original files)

## Alternative: PostgreSQL BYTEA Storage

If you don't want to use Spaces, you could store files as BYTEA in PostgreSQL, but this is **NOT recommended** because:
- Larger database size
- Slower query performance
- More expensive database costs
- Database backup size increases

Spaces is the recommended approach for production applications.

## Support

If you encounter issues:
1. Check the backend application logs in DigitalOcean
2. Verify your Space is in the same data center region as your app
3. Ensure Access Keys have proper permissions
4. Check that the bucket name doesn't have special characters

## Files Changed

This fix includes changes to:
- `backend/package.json` - Added AWS SDK and multer-s3
- `backend/src/config/spaces.js` - New Spaces configuration
- `backend/src/controllers/attachmentController.js` - Updated upload/download/delete logic
- `digitalocean-app.yaml` - Added Spaces environment variables
- This setup guide

## Next Steps

After setting up Spaces:
1. Test file uploads and downloads
2. Monitor your Spaces usage in the DigitalOcean dashboard
3. Consider enabling CDN if you need faster global access to files
4. Set up automatic backups of your Space if needed

