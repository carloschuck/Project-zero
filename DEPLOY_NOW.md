# 🚀 Deploy to DigitalOcean - Step by Step

**Region:** San Francisco (sfo)  
**Instance Size:** Smallest available (basic-xxs)  
**Database:** Dev Database ($7/month)  
**Total Cost:** ~$12/month

---

## ✅ Pre-Deployment Setup (COMPLETED)

- ✅ Environment files created (`.env`)
- ✅ Rate limiting added for security
- ✅ DigitalOcean config updated for SF region
- ✅ Smallest instances configured
- ✅ JWT secret generated

---

## 📋 Step 1: Verify Local Setup (Optional - 5 minutes)

Test everything works locally before deploying:

```bash
# Start services
docker-compose up -d

# Wait for database
sleep 10

# Run migrations
cd backend && npm run migrate && cd ..

# Check health
curl http://localhost:5000/health
```

If all good, stop the containers:
```bash
docker-compose down
```

---

## 📦 Step 2: Commit and Push to GitHub (5 minutes)

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ticketing-system` (or your preferred name)
3. **Important:** Make it **Private** (contains sensitive config)
4. Don't initialize with README (you already have one)
5. Click "Create repository"

### Push Your Code

```bash
cd /Users/carloschuck/Project-zero

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production ready: Ticketing system for DigitalOcean deployment"

# Add your GitHub repository (replace with YOUR username and repo name)
git remote add origin https://github.com/YOUR-USERNAME/ticketing-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**⚠️ Important:** Update `digitalocean-app.yaml` lines 18 and 59 with your GitHub repo:

```bash
# Edit the file to replace:
# repo: your-username/your-repo
# With your actual GitHub username/repo

# For example:
# repo: carloschuck/ticketing-system
```

Or run this command (replace YOUR-USERNAME and YOUR-REPO):
```bash
sed -i '' 's/your-username\/your-repo/YOUR-USERNAME\/YOUR-REPO/g' digitalocean-app.yaml
git add digitalocean-app.yaml
git commit -m "Update GitHub repo in app spec"
git push
```

---

## ☁️ Step 3: Deploy to DigitalOcean (20 minutes)

### Option A: Using DigitalOcean Console (Recommended - Easiest)

1. **Login to DigitalOcean**
   - Go to https://cloud.digitalocean.com
   - Click "Create" → "Apps"

2. **Connect GitHub**
   - Choose "GitHub" as source
   - Click "Authorize DigitalOcean"
   - Select your `ticketing-system` repository
   - Select `main` branch
   - Click "Next"

3. **Review Auto-Detected Resources**
   
   DigitalOcean should detect 2 services. Edit them:

   **Backend Service:**
   - Name: `backend`
   - Type: Web Service
   - Source Directory: `/backend`
   - Dockerfile Path: `backend/Dockerfile`
   - HTTP Port: `5000`
   - HTTP Routes: `/api`
   - Instance Size: **Basic XXS (512MB RAM, $5/month)**
   - Click "Edit" → Under "Resources" → Select "Basic XXS"

   **Frontend Service:**
   - Name: `frontend`
   - Type: Static Site
   - Source Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - HTTP Routes: `/`
   
4. **Add Database**
   - Click "Add Resource" → "Database"
   - Engine: **PostgreSQL**
   - Version: **15**
   - Name: `ticketing-db`
   - **Size: Dev Database ($7/month)** ← Important!
   - Click "Add Database"

5. **Configure Environment Variables**
   
   Click on **backend** component → "Environment Variables":
   
   Add these variables:
   ```
   NODE_ENV = production
   PORT = 5000
   DB_HOST = ${ticketing-db.HOSTNAME}
   DB_PORT = ${ticketing-db.PORT}
   DB_NAME = ${ticketing-db.DATABASE}
   DB_USER = ${ticketing-db.USERNAME}
   DB_PASSWORD = ${ticketing-db.PASSWORD}
   JWT_SECRET = dbfcb85badd5a9e134956f1b17b6d682c0e82107a8a7ed940b911df2f3436184572a790cc4030c4e990f3c9522594fe3aee343150685e210c2ed627e842836dd
   JWT_EXPIRES_IN = 7d
   FRONTEND_URL = ${APP_URL}
   ```

   Click on **frontend** component → "Environment Variables":
   ```
   VITE_API_URL = ${backend.PUBLIC_URL}/api
   ```

6. **Review and Launch**
   - Review your configuration
   - **Total cost should show ~$12/month**
   - Click "Create Resources"
   - Wait 5-10 minutes for deployment

7. **Monitor Build Progress**
   - Watch the logs in the DigitalOcean console
   - Both backend and frontend should build successfully
   - Wait until status shows "Deployed"

---

### Option B: Using doctl CLI (Advanced)

```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Update digitalocean-app.yaml with your GitHub repo first!
# Then create the app
doctl apps create --spec digitalocean-app.yaml

# Get your app ID
doctl apps list

# Monitor deployment
doctl apps get <YOUR-APP-ID>
```

---

## 🗄️ Step 4: Run Database Migrations (5 minutes)

After deployment completes:

### Using Console (Easiest):

1. Go to your app in DigitalOcean
2. Click "Console" tab
3. Select "backend" component
4. Wait for console to connect
5. Run:
   ```bash
   npm run migrate
   ```
6. You should see success messages for each migration

### Using doctl:

```bash
# Get your app ID
doctl apps list

# Run migrations
doctl apps exec <YOUR-APP-ID> --component backend -- npm run migrate
```

---

## 🎉 Step 5: Test Your Deployed App (5 minutes)

1. **Get Your App URL**
   - In DigitalOcean, go to your app overview
   - Copy the URL (e.g., `https://ticketing-system-xxxxx.ondigitalocean.app`)

2. **Open in Browser**
   - Visit the URL
   - You should see the login page

3. **Login with Default Credentials**
   - Email: `admin@ticketing.com`
   - Password: `Admin123!`

4. **Change Admin Password Immediately**
   - Click on your profile
   - Go to "Profile" → "Change Password"
   - Set a strong new password

5. **Test Basic Functionality**
   - Create a test ticket
   - Check notifications
   - Test dark mode toggle
   - Verify dashboard statistics

---

## 🔒 Step 6: Security Hardening (5 minutes)

1. **Update Admin Credentials** ✅ (Should be done in Step 5)

2. **Create Test Users**
   - Login as admin
   - Go to Users → Add User
   - Create users with different roles to test

3. **Test Role-Based Access**
   - Login as different users
   - Verify they see appropriate permissions

4. **Enable Database Backups**
   - Go to your database in DigitalOcean
   - Enable automatic backups
   - Set retention to 7 days minimum

5. **Set Up Alerts**
   - Go to App Settings → Alerts
   - Enable downtime alerts
   - Add your email for notifications

---

## 💰 Cost Summary

**San Francisco Region - Smallest Instances:**

| Resource | Type | Cost |
|----------|------|------|
| Backend | Basic XXS (512MB) | $5/month |
| Frontend | Static Site | $0/month |
| Database | Dev Database | $7/month |
| **Total** | | **$12/month** |

**Free trial:** DigitalOcean offers $200 credit for 60 days for new users!

---

## 🔧 Post-Deployment Management

### View Logs:
```bash
doctl apps logs <APP-ID> --component backend --tail
```

Or in console: App → Runtime Logs → Select component

### Update Application:
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push

# DigitalOcean auto-deploys on push to main branch
```

### Manual Deployment:
1. Go to your app
2. Click "Deploy" 
3. Select branch
4. Click "Deploy"

### Scale Up (if needed later):
1. App Settings → Components
2. Select backend
3. Change instance size
4. Save and redeploy

---

## 🆘 Troubleshooting

### Build Fails

**Frontend:**
- Check `VITE_API_URL` is set correctly
- Verify build logs for specific errors
- Check Node version compatibility

**Backend:**
- Verify all environment variables are set
- Check Dockerfile syntax
- Review build logs

### Can't Login

1. Verify migrations ran successfully:
   ```bash
   doctl apps exec <APP-ID> --component backend -- npm run migrate
   ```

2. Check backend logs for errors

3. Verify JWT_SECRET is set

### Database Connection Errors

1. Check database is running (green status)
2. Verify environment variables: `DB_HOST`, `DB_PORT`, etc.
3. Check trusted sources include your app

### 500 Errors

1. Check runtime logs in DigitalOcean console
2. Verify all environment variables
3. Check database connection
4. Test health endpoint: `https://your-app.ondigitalocean.app/api/health`

---

## 📞 Support

- **DigitalOcean Docs:** https://docs.digitalocean.com/products/app-platform/
- **Community:** https://www.digitalocean.com/community
- **Your Documentation:**
  - `README.md` - Full documentation
  - `DEPLOYMENT.md` - Detailed deployment guide
  - `SECURITY_AUDIT.md` - Security review
  - `DEPLOYMENT_CHECKLIST.md` - Complete checklist

---

## ✅ Deployment Checklist

- [ ] Local testing passed
- [ ] Code committed to Git
- [ ] Pushed to GitHub
- [ ] Updated `digitalocean-app.yaml` with GitHub repo
- [ ] Created DigitalOcean app
- [ ] Connected GitHub repository
- [ ] Configured environment variables
- [ ] Added PostgreSQL database (Dev tier)
- [ ] Selected smallest instances (Basic XXS)
- [ ] Set region to San Francisco
- [ ] Deployment completed successfully
- [ ] Database migrations ran successfully
- [ ] Tested login functionality
- [ ] Changed admin password
- [ ] Enabled database backups
- [ ] Set up monitoring alerts
- [ ] Verified all features work

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (Optional)
   - App Settings → Domains
   - Add your domain
   - Update DNS records

2. **Email Notifications** (Optional)
   - Add email environment variables
   - Test notification sending

3. **Monitoring**
   - Set up Uptime monitoring
   - Configure error tracking
   - Enable performance monitoring

4. **Scaling**
   - Monitor usage
   - Scale up if needed
   - Add horizontal scaling if traffic increases

---

**🎉 Congratulations! Your ticketing system is now live on DigitalOcean!** 🚀

**Your app will be at:** `https://ticketing-system-xxxxx.ondigitalocean.app`


