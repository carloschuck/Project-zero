# Environment Variables Guide

## Backend Environment Variables

### Required for All Environments

```bash
# Server
NODE_ENV=production  # or 'development'
PORT=5000

# Database
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# JWT
JWT_SECRET=your-long-random-secret-key
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://your-app-url.com
```

### Required for Production (DigitalOcean)

```bash
# DigitalOcean Spaces - File Storage
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=your-bucket-name
SPACES_KEY=your-spaces-access-key
SPACES_SECRET=your-spaces-secret-key
```

### Optional

```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Ticketing System <noreply@yourdomain.com>

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes (default)
```

## Setting Environment Variables in DigitalOcean

### Via Console (Recommended)

1. Go to https://cloud.digitalocean.com/apps
2. Select your app
3. Click **Settings**
4. Select **backend** component
5. Scroll to **Environment Variables**
6. Click **Edit**
7. Add each variable
8. For sensitive data (passwords, keys), check **Encrypt**
9. Click **Save**

### Which Variables to Encrypt

Always encrypt these:
- ✅ `DB_PASSWORD`
- ✅ `JWT_SECRET`
- ✅ `SPACES_KEY`
- ✅ `SPACES_SECRET`
- ✅ `EMAIL_PASSWORD`

Don't need to encrypt:
- ❌ `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`
- ❌ `SPACES_ENDPOINT`, `SPACES_REGION`, `SPACES_BUCKET`
- ❌ `PORT`, `NODE_ENV`, `FRONTEND_URL`

## Getting Spaces Credentials

### 1. Create a Space

```
URL: https://cloud.digitalocean.com/spaces
Click: Create a Space
Region: Choose closest to your app
Name: ticketing-system-uploads (or your choice)
File Listing: Restrict File Listing (for security)
```

### 2. Generate API Keys

```
URL: https://cloud.digitalocean.com/spaces
Click: Manage Keys (top right)
Click: Generate New Key
Name: ticketing-system
```

**Copy both keys immediately!** You can't see the secret again.

### 3. Values for Environment Variables

```bash
SPACES_ENDPOINT=https://[REGION].digitaloceanspaces.com
# Examples:
#   nyc3: https://nyc3.digitaloceanspaces.com
#   sfo3: https://sfo3.digitaloceanspaces.com
#   sgp1: https://sgp1.digitaloceanspaces.com

SPACES_REGION=nyc3  # or your region: sfo3, sgp1, etc.

SPACES_BUCKET=ticketing-system-uploads  # Your Space name

SPACES_KEY=DO00ABC123...  # Access Key from step 2

SPACES_SECRET=abc123xyz...  # Secret Key from step 2
```

## Verification

After setting variables and deploying, check logs:

### Success Messages

```
✅ DigitalOcean Spaces client configured successfully
📦 Bucket: ticketing-system-uploads
🌐 Region: nyc3
```

### Warning Messages

```
💻 Spaces not configured - using local/memory storage
```
This means environment variables are missing or incorrect.

## Local Development

Create a `.env` file in the `backend/` directory:

```bash
# Copy from ENV_VARIABLES.md and fill in your values
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticketing_system
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Leave Spaces variables empty for local dev
# The app will automatically use disk storage
```

**Do NOT commit `.env` to git!** It's in `.gitignore`.

## Troubleshooting

### App won't start

**Check**: All required variables are set  
**Fix**: Add missing variables in App Settings

### Database connection fails

**Check**: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD  
**Fix**: Verify values match your database configuration

### File uploads fail

**Check**: SPACES_* variables  
**Fix**: Verify Space exists, keys are correct, region matches

### JWT errors

**Check**: JWT_SECRET is set  
**Fix**: Set to a long random string (at least 32 characters)

## Best Practices

1. **Use different JWT_SECRET** for dev and production
2. **Encrypt sensitive variables** in DigitalOcean console
3. **Use the same region** for Space and App (lower latency)
4. **Test in development** before deploying to production
5. **Document any new variables** you add

## Database Variables (Automatically Set)

DigitalOcean automatically sets these when you add a database:
- `${ticketing-db.HOSTNAME}` → DB_HOST
- `${ticketing-db.PORT}` → DB_PORT
- `${ticketing-db.DATABASE}` → DB_NAME
- `${ticketing-db.USERNAME}` → DB_USER
- `${ticketing-db.PASSWORD}` → DB_PASSWORD

These are configured in `digitalocean-app.yaml`.

## Next Steps

1. Set all required variables in DigitalOcean
2. Create and configure Spaces
3. Deploy the application
4. Test file uploads
5. Monitor logs for any errors

