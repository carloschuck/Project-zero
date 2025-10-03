# 🗄️ Initialize Your Database - Final Step!

Your app is deployed, but you need to run migrations to set up the database tables.

## 🚀 Run This Command

**Go to your DigitalOcean app dashboard to get the live URL:**
https://cloud.digitalocean.com/apps/7c0342ca-990f-4a09-b599-a3a3b313f465

Look for the **"Live App"** URL at the top (it looks like `ticketing-system-xxxxx.ondigitalocean.app`)

Then run this command in your terminal:

```bash
curl -X POST https://YOUR-APP-URL/api/migrate/run
```

**Replace `YOUR-APP-URL` with your actual app URL from the dashboard!**

---

## ✅ What This Does

- Creates all database tables (users, tickets, comments, etc.)
- Sets up the default admin account
- Makes your app ready to use

---

## 📋 Expected Response

You should see:

```json
{
  "success": true,
  "message": "Database migrations completed successfully!",
  "defaultCredentials": {
    "email": "admin@company.com",
    "password": "admin123",
    "warning": "CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN"
  }
}
```

---

## 🎯 After Running Migrations

1. ✅ Go to your app URL
2. ✅ Log in with:
   - Email: `admin@company.com`
   - Password: `admin123`
3. ⚠️ **IMMEDIATELY change the password!**

---

## 🆘 If It Fails

If you see an error, you can run migrations manually from your computer:

```bash
cd /Users/carloschuck/Project-zero
./RUN_MIGRATION_NOW.sh
```

This script will ask for your database credentials (get them from the DigitalOcean dashboard).

