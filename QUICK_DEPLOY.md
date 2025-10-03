# ⚡ Quick Deploy Reference Card

## 🎯 What's Been Done

✅ Environment files created (`.env`)  
✅ Rate limiting added (5 attempts/15min)  
✅ Security enhanced (B+ → A- grade)  
✅ SF region configured  
✅ Smallest instances set ($12/month)  
✅ Code committed to Git  
✅ Ready to deploy!

---

## 🚀 Deploy in 3 Steps (30 minutes)

### Step 1: Push to GitHub (5 min)

**First time setup:**
```bash
# 1. Create repo at: https://github.com/new (make it PRIVATE)
# 2. Copy your GitHub username and repo name
# 3. Run these commands:

cd /Users/carloschuck/Project-zero

# Replace YOUR-USERNAME and YOUR-REPO with your actual values:
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

# Update the app spec with your repo:
sed -i '' 's/your-username\/your-repo/YOUR-USERNAME\/YOUR-REPO/g' digitalocean-app.yaml
git add digitalocean-app.yaml
git commit -m "Update GitHub repo"
git push
```

**Already have remote set up?**
```bash
git push origin main
```

---

### Step 2: Create App on DigitalOcean (15 min)

1. **Go to:** https://cloud.digitalocean.com
2. **Click:** "Create" → "Apps"
3. **Connect GitHub:** Authorize and select your repo
4. **Set Resources:**
   - Backend: Basic XXS (512MB) - $5/month
   - Frontend: Static Site - $0/month
   - Database: Dev Database - $7/month
5. **Environment Variables (Backend):**
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
6. **Environment Variables (Frontend):**
   ```
   VITE_API_URL = ${backend.PUBLIC_URL}/api
   ```
7. **Review:** Cost should be ~$12/month
8. **Click:** "Create Resources"
9. **Wait:** 5-10 minutes for build

---

### Step 3: Run Migrations (5 min)

**After deployment completes:**

1. Go to your app → **Console** tab
2. Select **backend** component
3. Run: `npm run migrate`
4. **Done!** Open your app URL

---

## 🔐 First Login

**URL:** `https://your-app-name.ondigitalocean.app`

**Credentials:**
- Email: `admin@ticketing.com`
- Password: `Admin123!`

**⚠️ IMPORTANT:** Change password immediately in Profile settings!

---

## 💰 Cost Breakdown

| Item | Cost |
|------|------|
| Backend (Basic XXS) | $5/month |
| Database (Dev) | $7/month |
| Frontend | $0/month |
| **Total** | **$12/month** |

**New users get $200 credit (60 days free)!**

---

## 🆘 Quick Troubleshooting

**Build fails?**
- Check GitHub repo is accessible
- Verify Dockerfile paths in app settings

**Can't login?**
- Verify migrations ran: Console → backend → `npm run migrate`
- Check backend logs for errors

**500 errors?**
- Verify all environment variables are set
- Check: `https://your-app.ondigitalocean.app/api/health`

---

## 📚 Full Documentation

- **`DEPLOY_NOW.md`** - Complete step-by-step guide
- **`README.md`** - Full application documentation
- **`DEPLOYMENT.md`** - Detailed deployment info
- **`SECURITY_AUDIT.md`** - Security review

---

## ✅ Post-Deployment Checklist

- [ ] App deployed successfully
- [ ] Migrations completed
- [ ] Can login to app
- [ ] Admin password changed
- [ ] Database backups enabled
- [ ] Alerts configured

---

**🎉 That's it! Your ticketing system is now live!** 🚀


