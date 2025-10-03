# 🔧 Environment Configuration Setup

This guide helps you create the required `.env` files for local development and deployment.

---

## 🔐 Your Generated JWT Secret

**Use this strong 128-character secret for production:**

```
dbfcb85badd5a9e134956f1b17b6d682c0e82107a8a7ed940b911df2f3436184572a790cc4030c4e990f3c9522594fe3aee343150685e210c2ed627e842836dd
```

---

## 📁 Backend Environment File

Create: `/Users/carloschuck/Project-zero/backend/.env`

### For Local Development:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticketing_system
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=dbfcb85badd5a9e134956f1b17b6d682c0e82107a8a7ed940b911df2f3436184572a790cc4030c4e990f3c9522594fe3aee343150685e210c2ed627e842836dd
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional - leave commented out if not using)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-specific-password
# EMAIL_FROM=noreply@ticketing.com
```

### For Production (DigitalOcean):

You'll set these as environment variables in the DigitalOcean console:

```env
NODE_ENV=production
PORT=5000
DB_HOST=${ticketing-db.HOSTNAME}
DB_PORT=${ticketing-db.PORT}
DB_NAME=${ticketing-db.DATABASE}
DB_USER=${ticketing-db.USERNAME}
DB_PASSWORD=${ticketing-db.PASSWORD}
JWT_SECRET=dbfcb85badd5a9e134956f1b17b6d682c0e82107a8a7ed940b911df2f3436184572a790cc4030c4e990f3c9522594fe3aee343150685e210c2ed627e842836dd
JWT_EXPIRES_IN=7d
FRONTEND_URL=${APP_URL}
```

---

## 📁 Frontend Environment File

Create: `/Users/carloschuck/Project-zero/frontend/.env`

### For Local Development:

```env
VITE_API_URL=http://localhost:5000/api
```

### For Production (DigitalOcean):

DigitalOcean will automatically inject this:

```env
VITE_API_URL=${backend.PUBLIC_URL}/api
```

---

## 🚀 Quick Setup Commands

### Create Backend .env File:

```bash
cat > /Users/carloschuck/Project-zero/backend/.env << 'EOF'
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticketing_system
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dbfcb85badd5a9e134956f1b17b6d682c0e82107a8a7ed940b911df2f3436184572a790cc4030c4e990f3c9522594fe3aee343150685e210c2ed627e842836dd
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
EOF
```

### Create Frontend .env File:

```bash
cat > /Users/carloschuck/Project-zero/frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF
```

### Verify Files Were Created:

```bash
ls -la /Users/carloschuck/Project-zero/backend/.env
ls -la /Users/carloschuck/Project-zero/frontend/.env
```

---

## 🔐 Email Configuration (Optional)

If you want email notifications, add these to backend `.env`:

### Gmail Configuration:

1. **Enable 2-factor authentication** on your Google account
2. **Create an App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Add to `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@ticketing.com
```

### Other Email Providers:

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@yourdomain.com
```

---

## ✅ Verify Setup

After creating the `.env` files:

```bash
# Start PostgreSQL (if using Docker)
cd /Users/carloschuck/Project-zero
docker-compose up -d postgres

# Wait for database
sleep 10

# Run migrations
cd backend
npm install
npm run migrate

# Start backend
npm run dev

# In another terminal, start frontend
cd /Users/carloschuck/Project-zero/frontend
npm install
npm run dev
```

Visit: http://localhost:5173

**Default Login:**
- Email: `admin@ticketing.com`
- Password: `Admin123!`

---

## 🔒 Security Notes

### ⚠️ Important:
- **NEVER commit `.env` files** to Git (already in `.gitignore`)
- **Use different secrets** for development and production
- **Rotate secrets** if they're ever exposed
- **Use strong database passwords** in production

### For Production:
- Set environment variables in DigitalOcean console (more secure)
- Use DigitalOcean's database credentials (auto-generated)
- Enable database connection encryption
- Enable automatic backups

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection settings match database
cat backend/.env | grep DB_
```

### "JWT malformed" or "Invalid token"
```bash
# Verify JWT_SECRET is set and matches in .env
cat backend/.env | grep JWT_SECRET

# Restart backend after changing JWT_SECRET
pkill -f "node.*server.js"
cd backend && npm run dev
```

### "Port already in use"
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### "CORS errors in browser"
```bash
# Verify FRONTEND_URL matches your frontend URL
cat backend/.env | grep FRONTEND_URL

# Should be: http://localhost:5173 for local dev
```

---

## 📋 Checklist

After setting up environment files:

- [ ] Created `backend/.env` file
- [ ] Created `frontend/.env` file
- [ ] Set strong JWT_SECRET (provided above)
- [ ] Database credentials are correct
- [ ] FRONTEND_URL matches frontend location
- [ ] Files are NOT committed to Git
- [ ] Backend starts without errors: `cd backend && npm run dev`
- [ ] Frontend starts without errors: `cd frontend && npm run dev`
- [ ] Can login to application
- [ ] Health check works: `curl http://localhost:5000/health`

---

**Once these files are created, proceed to DEPLOYMENT_CHECKLIST.md for deployment steps!** 🚀


