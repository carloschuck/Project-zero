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

## Quick Feature Guide

After logging in, here's what you can do:

### For All Users:
1. **Dashboard** - Create and view your requests
2. **Filters** - Use "Created by Me" to see your submitted requests
3. **Search** - Find requests by number, subject, or description
4. **Profile** - Update your information and change password
5. **Dark Mode** - Toggle between light and dark themes
6. **Notifications** - Check the bell icon for updates

### For Admins:
1. **Collapsible Sidebar** - Click the circular button to collapse/expand sidebar
2. **Admin Panel** → **Users** - Manage user accounts and roles
3. **Admin Panel** → **Categories** - Configure request categories
4. **Admin Panel** → **Analytics & Reports** - View comprehensive analytics
5. **All Filters** - Use "All Requests" or "Assigned to Me" filters
6. **Export Reports** - Download CSV reports with custom date ranges

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

## Key Features Overview

### 🎯 Dashboard
- **Smart Filters**: Filter requests by status, category, search term, and ownership
- **Owner Filter Options**:
  - **All Requests**: See all requests (role-based access)
  - **Assigned to Me**: View requests you're responsible for
  - **Created by Me**: See requests you've submitted
- **Advanced Search**: Search across request numbers, subjects, descriptions, and users
- **Real-time Stats**: View request counts by status
- **Column Visibility**: Customize which columns are displayed
- **Responsive Design**: Works perfectly on mobile and desktop

### 🛡️ Admin Panel (Admin Only)
Expandable navigation menu with three sub-sections:
- **👥 Users**: Manage user accounts, roles, and departments
- **📁 Categories**: Configure request categories and departments
- **📊 Analytics & Reports**: Comprehensive analytics dashboard

### 📊 Analytics & Reports (Admin Only)
- **Time Frame Filters**:
  - All Time / Today / This Week / This Month / Last Month / This Year
  - Custom Date Range picker
- **Key Metrics Cards**:
  - Total Requests
  - Resolution Rate
  - Average Resolution Time
  - Active Requests
- **Visual Charts**:
  - Requests by Status (with progress bars)
  - Requests by Priority (distribution)
  - Requests by Category (top categories)
- **Export Functionality**: Download CSV reports with filtered data

### 🎨 User Interface
- **Collapsible Sidebar**: Toggle between full view and icon-only view
  - Click the circular button on sidebar header to collapse/expand
  - Preference saved in browser (persists across sessions)
  - Tooltips show on hover when collapsed
- **Dark Mode**: Full dark theme support
- **Notifications**: Real-time notification system with dropdown
- **Responsive**: Mobile-friendly design with hamburger menu

### 🔐 Role-Based Access
- **Admin**: Full system access, user management, analytics
- **Department Lead**: Access to department-specific requests
- **Event Coordinator**: Access to event-related requests
- **User**: Access to own requests only

## Next Steps

1. ✅ Login with default credentials (admin@ticketing.com / Admin123!)
2. ✅ Change admin password (Profile → Change Password)
3. ✅ Explore the collapsible sidebar (click toggle button on sidebar header)
4. ✅ Create a test request from Dashboard
5. ✅ Try the dashboard filters (All Requests, Assigned to Me, Created by Me)
6. ✅ Check Analytics & Reports (Admin Panel → Analytics & Reports)
7. ✅ Export a report with custom time frame
8. ✅ Toggle dark mode and explore the UI
9. ✅ Create different user roles (see README.md for creating users)
10. ✅ Test the mobile responsive design

## Troubleshooting

### Changes not visible after update

If you don't see recent changes after rebuilding:

```bash
# 1. Rebuild containers with no cache
docker-compose up -d --build --force-recreate

# 2. Hard refresh browser (clears cache)
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# 3. Or open in incognito/private mode
```

### Port 5000 already in use

```bash
# Find and kill the process
lsof -i :5000
kill -9 <PID>

# Or change the port in backend/.env
PORT=5001
```

### Port 3000 already in use

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Database connection error

```bash
# Check PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# If migrations haven't run, run them manually
cd backend
npm run migrate
```

### Frontend can't connect to backend

Check `frontend/.env` has:
```
VITE_API_URL=http://localhost:5000/api
```

Verify backend is running:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok"}
```

### Docker build fails

```bash
# Clean up Docker resources
docker system prune -a

# Remove all containers and rebuild
docker-compose down -v
docker-compose up -d --build
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

## Production Deployment with Docker

The application is production-ready and can be deployed using Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- **Frontend**: http://localhost:3000 (Nginx + React production build)
- **Backend**: http://localhost:5000 (Node.js Express API)
- **Database**: PostgreSQL on port 5432

## Tech Stack Summary

- **Frontend**: React 18 + Vite + TailwindCSS + React Router
- **Backend**: Node.js + Express + PostgreSQL
- **Auth**: JWT with role-based access control (RBAC)
- **UI Libraries**: Lucide Icons, date-fns for date formatting
- **State Management**: React Context API (Auth, Theme)
- **Deployment**: Docker + Docker Compose + DigitalOcean App Platform ready
- **Database**: PostgreSQL 15+ with connection pooling
- **File Uploads**: Multer for attachment handling

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


