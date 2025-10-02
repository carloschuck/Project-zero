# Deployment Guide - DigitalOcean App Platform

This guide provides step-by-step instructions for deploying the Ticketing System to DigitalOcean App Platform.

## Prerequisites

- DigitalOcean account with billing enabled
- GitHub account with your code repository
- Basic understanding of Git and terminal commands

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Initialize Git Repository** (if not already done)
   ```bash
   cd /Users/carloschuck/Project-zero
   git init
   git add .
   git commit -m "Initial commit - Ticketing System"
   ```

2. **Create GitHub Repository**
   - Go to https://github.com/new
   - Create a new repository (e.g., `ticketing-system`)
   - Don't initialize with README (you already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/ticketing-system.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create App on DigitalOcean

1. **Navigate to App Platform**
   - Login to https://cloud.digitalocean.com
   - Click "Create" → "Apps"

2. **Connect GitHub**
   - Choose "GitHub" as your source
   - Authorize DigitalOcean to access your repositories
   - Select your repository and branch (main)
   - Click "Next"

3. **Configure Resources**

   DigitalOcean will auto-detect your components. Edit them:

   **Component 1: Backend API**
   - Name: `backend`
   - Type: Web Service
   - Source Directory: `/backend`
   - Dockerfile Path: `backend/Dockerfile`
   - HTTP Port: `5000`
   - HTTP Routes: `/api`
   - Health Check Path: `/health`
   - Instance Size: Basic (512MB RAM, $5/month)

   **Component 2: Frontend**
   - Name: `frontend`
   - Type: Static Site
   - Source Directory: `/frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - HTTP Routes: `/`

4. **Add Database**
   - Click "Add Resource" → "Database"
   - Choose PostgreSQL
   - Version: 15
   - Name: `ticketing-db`
   - Plan: Basic ($15/month for production, or Dev DB $7/month for testing)
   - Click "Add Database"

### Step 3: Configure Environment Variables

**Backend Environment Variables:**

Click on "backend" component → "Environment Variables" → Add:

```
NODE_ENV = production
PORT = 5000
DB_HOST = ${ticketing-db.HOSTNAME}
DB_PORT = ${ticketing-db.PORT}
DB_NAME = ${ticketing-db.DATABASE}
DB_USER = ${ticketing-db.USERNAME}
DB_PASSWORD = ${ticketing-db.PASSWORD}
JWT_SECRET = [Generate a secure random string, 32+ characters]
JWT_EXPIRES_IN = 7d
FRONTEND_URL = ${APP_URL}
```

**Optional Email Variables** (if you want email notifications):
```
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASSWORD = your-app-specific-password
EMAIL_FROM = noreply@ticketing.com
```

**Frontend Environment Variables:**

Click on "frontend" component → "Environment Variables" → Add:

```
VITE_API_URL = ${backend.PUBLIC_URL}/api
```

### Step 4: Deploy Application

1. **Review Configuration**
   - Review all settings
   - Estimated cost: ~$20-27/month (Basic setup)

2. **Click "Create Resources"**
   - DigitalOcean will start building your app
   - This process takes 5-10 minutes

3. **Monitor Build Progress**
   - Watch the build logs for any errors
   - Both frontend and backend should build successfully

### Step 5: Run Database Migrations

After successful deployment:

**Option A: Using Console**

1. Go to your app → "Console" tab
2. Select "backend" component
3. Run the migration:
   ```bash
   npm run migrate
   ```

**Option B: Using doctl CLI**

```bash
# Install doctl (if not installed)
brew install doctl  # macOS
# or download from https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# List your apps
doctl apps list

# Run migration
doctl apps exec YOUR_APP_ID --component backend -- npm run migrate
```

### Step 6: Access Your Application

1. **Get Your App URL**
   - In the app overview, you'll see the URL (e.g., `https://your-app-name.ondigitalocean.app`)

2. **Test the Application**
   - Open the URL in your browser
   - Login with default credentials:
     - Email: `admin@ticketing.com`
     - Password: `Admin123!`

3. **Change Default Password**
   - Go to Profile → Change Password
   - Set a strong password

### Step 7: Custom Domain (Optional)

1. **Add Domain**
   - Go to app settings → "Domains"
   - Click "Add Domain"
   - Enter your domain name

2. **Update DNS**
   - Add CNAME record in your DNS provider:
     ```
     Type: CNAME
     Name: @  (or www)
     Value: your-app.ondigitalocean.app
     ```

3. **Enable HTTPS**
   - DigitalOcean automatically provisions SSL certificate
   - Wait 5-10 minutes for certificate to be issued

## Cost Breakdown

### Basic Setup (Recommended for Testing)
- **Backend**: Basic (512MB) - $5/month
- **Frontend**: Static Site - $0/month
- **Database**: Dev Database - $7/month
- **Total**: ~$12/month

### Production Setup (Recommended)
- **Backend**: Basic (1GB) - $10/month
- **Frontend**: Static Site - $0/month
- **Database**: Basic - $15/month
- **Bandwidth**: Included (1TB/month)
- **Total**: ~$25/month

### Scaling Options
- **Professional**: 2GB RAM - $20/month per service
- **Database Scaling**: Up to 16GB RAM - $120/month
- **Multiple Regions**: Available for global deployment

## Monitoring and Maintenance

### View Logs

```bash
# Using doctl
doctl apps logs YOUR_APP_ID --component backend --tail

# Via Console
# Go to app → Runtime Logs → Select component
```

### Database Backups

1. Go to Database → Backups
2. Enable automatic daily backups
3. Set retention period (7-30 days recommended)

### Health Monitoring

- DigitalOcean monitors `/health` endpoint automatically
- Set up alerts: App Settings → Alerts
- Configure email notifications for downtime

### Scaling

**Vertical Scaling:**
- App Settings → Components → Select component
- Change instance size
- Save and redeploy

**Horizontal Scaling:**
- App Settings → Components → Backend
- Increase instance count (2-10 instances)
- Load balancing is automatic

## Troubleshooting

### Build Fails

**Frontend build fails:**
```bash
# Check build logs for specific error
# Common issues:
# - Missing environment variable VITE_API_URL
# - Node version mismatch (should be 18+)
# - Dependencies not installing
```

**Backend build fails:**
```bash
# Check Dockerfile
# Ensure all dependencies in package.json
# Verify Node version in Dockerfile
```

### Database Connection Issues

1. Check environment variables are correctly set
2. Verify database is running (green status)
3. Check database connection from backend logs
4. Ensure migrations ran successfully

### Application Not Loading

1. Check build logs for both components
2. Verify health check endpoint responds (backend/health)
3. Check frontend is correctly pointing to backend API
4. Review runtime logs for errors

### Cannot Login

1. Ensure migrations ran successfully
2. Check if default admin user was created
3. Verify JWT_SECRET is set in backend
4. Check browser console for errors

## Updating Your Application

### Automatic Deployments

By default, pushes to main branch trigger automatic deployment:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

DigitalOcean will automatically:
1. Detect the push
2. Build new containers
3. Deploy with zero downtime

### Manual Deployment

1. Go to your app
2. Click "Deploy"
3. Select branch
4. Click "Deploy"

### Rolling Back

1. Go to app → Deployments
2. Find previous successful deployment
3. Click "Rollback to this deployment"

## Security Best Practices

### After Deployment

1. **Change Default Credentials**
   - Login as admin
   - Change password immediately

2. **Review User Permissions**
   - Remove any test users
   - Set up proper roles

3. **Enable 2FA** (if implementing)
   - Add two-factor authentication
   - For admin accounts

4. **Database Security**
   - Database is in private network (secure)
   - Only backend can access it
   - Enable connection pooling

5. **HTTPS**
   - Already enabled by default
   - Certificate auto-renews

### Maintenance

1. **Regular Updates**
   - Update dependencies monthly
   - Check for security patches

2. **Backup Strategy**
   - Enable daily database backups
   - Test restore process

3. **Monitoring**
   - Set up uptime monitoring
   - Configure alerts for errors
   - Review logs regularly

## Support

### DigitalOcean Support
- Documentation: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community
- Support Tickets: Via control panel

### Application Support
- Check application logs first
- Review this deployment guide
- Check main README.md for troubleshooting

## Next Steps

1. ✅ Application deployed successfully
2. ✅ Database migrations completed
3. ✅ Default admin password changed
4. ⬜ Set up custom domain (optional)
5. ⬜ Configure email notifications (optional)
6. ⬜ Set up monitoring and alerts
7. ⬜ Create additional user accounts
8. ⬜ Customize categories for your needs

---

**Congratulations!** 🎉 Your ticketing system is now live on DigitalOcean!


