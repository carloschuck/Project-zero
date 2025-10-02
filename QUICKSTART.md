# Quick Start Guide

Get the Ticketing System running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- Git

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
cd /Users/carloschuck/Project-zero

# Copy environment files
cp backend/.env.example backend/.env
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

### 2. Configure Backend

Edit `backend/.env`:

```env
DB_NAME=ticketing_system
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=change-this-to-a-random-secret-key-minimum-32-characters
NODE_ENV=development
PORT=5000
```

### 3. Start with Docker (Easiest)

```bash
# Start database
docker-compose up -d postgres

# Wait 10 seconds for database to initialize
sleep 10

# Install backend dependencies and run migrations
cd backend
npm install
npm run migrate
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2 - new terminal)
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

### 5. Login

```
Email: admin@ticketing.com
Password: Admin123!
```

**⚠️ Change the password after first login!**

## Without Docker

If you have PostgreSQL installed locally:

```bash
# Create database
createdb ticketing_system

# Run migrations
cd backend
npm install
npm run migrate

# Start backend
npm run dev

# In another terminal, start frontend
cd frontend
npm install
npm run dev
```

## Next Steps

1. ✅ Login with default credentials
2. ✅ Change admin password (Profile → Change Password)
3. ✅ Create a test ticket
4. ✅ Try different user roles (see README.md for creating users)
5. ✅ Explore the dashboard and features

## Troubleshooting

### Port 5000 already in use

```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>
```

### Database connection error

```bash
# Check PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Frontend can't connect to backend

Check `frontend/.env` has:
```
VITE_API_URL=http://localhost:5000/api
```

## Creating Test Users

Use these API calls or the admin UI:

```bash
# Get auth token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ticketing.com","password":"Admin123!"}'

# Create a regular user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe",
    "role":"user",
    "department":"IT"
  }'
```

## Tech Stack Summary

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + PostgreSQL
- **Auth**: JWT with role-based access control
- **Deployment**: Docker + DigitalOcean ready

## Documentation

- **Full Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Reference**: See README.md → API Documentation

## Getting Help

1. Check the [README.md](README.md) for detailed documentation
2. Review the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Check logs in terminal for specific errors
4. Ensure all prerequisites are installed

---

**Happy ticketing!** 🎫


