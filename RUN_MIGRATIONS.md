# 🗄️ Run Database Migrations

Your app is deployed but needs the database tables created!

## 📍 Your App Details

- **App ID:** `7c0342ca-990f-4a09-b599-a3a3b313f465`
- **Region:** San Francisco (sfo)
- **Status:** ✅ DEPLOYED (but backend unhealthy due to missing tables)

---

## 🚀 Option 1: Via DigitalOcean Console (Easiest)

### Step 1: Get Database Credentials

1. Go to: https://cloud.digitalocean.com/apps/7c0342ca-990f-4a09-b599-a3a3b313f465/settings
2. Scroll to **Components** → **ticketing-db**
3. Click **Connection Details** to see:
   - Host
   - Port
   - Database name
   - Username
   - Password

### Step 2: Connect to Database

Use the connection string format:
```bash
postgresql://username:password@host:port/database?sslmode=require
```

### Step 3: Run Migrations

From your local machine:
```bash
cd /Users/carloschuck/Project-zero/backend

# Set the database URL (use values from Step 1)
export DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Run migration script
node src/config/init-db.js
```

---

## 🛠️ Option 2: Via DigitalOcean CLI (Recommended)

### Install doctl (if not installed):
```bash
brew install doctl
doctl auth init
```

### Get database connection string:
```bash
doctl databases connection ticketing-db
```

### SSH into your backend container and run migrations:
```bash
# Get the app spec
doctl apps spec get 7c0342ca-990f-4a09-b599-a3a3b313f465

# Create a one-time job to run migrations
# (You'll need to add a job component to run init-db.js)
```

---

## 🔄 Option 3: Add Migration Job to App Spec (Automated)

Add this to your `digitalocean-app.yaml`:

```yaml
jobs:
  - name: db-migration
    kind: PRE_DEPLOY
    github:
      repo: carloschuck/Project-zero
      branch: main
      deploy_on_push: true
    source_dir: /backend
    dockerfile_path: backend/Dockerfile
    envs:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        value: ${ticketing-db.HOSTNAME}
      - key: DB_PORT
        value: ${ticketing-db.PORT}
      - key: DB_NAME
        value: ${ticketing-db.DATABASE}
      - key: DB_USER
        value: ${ticketing-db.USERNAME}
      - key: DB_PASSWORD
        value: ${ticketing-db.PASSWORD}
    run_command: "node src/config/init-db.js"
```

Then redeploy:
```bash
git add -A
git commit -m "Add database migration job"
git push origin main
```

---

## ✅ What Happens After Migrations?

Once migrations complete, the backend will:
1. ✅ Connect to the database successfully
2. ✅ Health check will pass
3. ✅ Backend status will become HEALTHY
4. ✅ Your app will be fully functional!

---

## 🌐 Access Your App

Once migrations are done, visit:
- **App Dashboard:** https://cloud.digitalocean.com/apps/7c0342ca-990f-4a09-b599-a3a3b313f465
- **Live URL:** Click "View Live App" in the dashboard

**Default Login:**
- Email: `admin@company.com`
- Password: `admin123` (⚠️ Change this immediately!)

---

## 🆘 Need Help?

If you run into issues, check the backend logs:
```bash
# Via console
https://cloud.digitalocean.com/apps/7c0342ca-990f-4a09-b599-a3a3b313f465/logs

# Or via CLI
doctl apps logs 7c0342ca-990f-4a09-b599-a3a3b313f465 --type RUN
```

