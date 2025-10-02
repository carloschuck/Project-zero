# Ticketing System - Full-Stack Web Application

A modern, full-featured ticketing system with role-based access control, built with React, Node.js, Express, and PostgreSQL. Designed for deployment on DigitalOcean App Platform.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control** (Admin, Department Lead, Event Coordinator, Regular User)
- **Modern Dashboard** with statistics and recent tickets
- **Comprehensive Ticketing System** with categories, priorities, and statuses
- **Real-time Notifications** (in-app and email)
- **Dark Mode Toggle** for better user experience
- **Responsive Design** that works on all devices
- **RESTful API** with JWT authentication
- **Modular Architecture** for easy expansion

### Role Capabilities

#### Admin
- View and manage all tickets
- Manage users and their roles
- Create and manage categories
- Assign tickets to team members
- Update ticket statuses and priorities

#### Department Lead
- View tickets relevant to their department
- Update ticket statuses
- Assign tickets to team members
- Add comments to tickets

#### Event Coordinator
- View event-related requests
- Track and update ticket statuses
- Add comments to tickets

#### Regular User
- Submit new tickets
- Track their own tickets
- Add comments to their tickets
- View ticket history

## 🏗️ Architecture

```
project-zero/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   ├── migrations/     # Database schema
│   │   └── utils/          # Helper functions
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Helper functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Local development setup
└── digitalocean-app.yaml  # DigitalOcean deployment config
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Multer** - File uploads
- **Helmet** - Security headers

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server
- **DigitalOcean** - Cloud platform

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (for containerized deployment)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Project-zero
```

### 2. Environment Configuration

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and configure:
- Database credentials
- JWT secret (use a strong, random string)
- Email settings (for notifications)

**Frontend (.env)**
```bash
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env
```

### 3. Database Setup

**Option A: Using Docker Compose (Recommended)**

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Wait for database to be ready (about 10 seconds)
sleep 10

# Run migrations
cd backend
npm install
npm run migrate
cd ..
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb ticketing_system

# Run migrations
cd backend
npm install
npm run migrate
cd ..
```

### 4. Install Dependencies

```bash
# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

### 6. Default Login Credentials

```
Email: admin@ticketing.com
Password: Admin123!
```

**⚠️ Important:** Change the default admin password after first login!

## 🐳 Docker Deployment

### Local Docker Deployment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env and configure your settings
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run database migrations
docker-compose exec backend npm run migrate
```

Access the application at http://localhost:3000

### Stop Services

```bash
docker-compose down

# To remove volumes (database data)
docker-compose down -v
```

## ☁️ DigitalOcean Deployment

### Prerequisites
- DigitalOcean account
- GitHub repository with your code
- `doctl` CLI (optional, for command-line deployment)

### Method 1: Using DigitalOcean Console (Recommended)

1. **Fork/Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Create App on DigitalOcean**
   - Go to [DigitalOcean Console](https://cloud.digitalocean.com)
   - Click "Create" → "Apps"
   - Connect your GitHub repository
   - Select your repository and branch

3. **Configure Components**

   **Backend Service:**
   - Type: Web Service
   - Build Command: `npm install`
   - Run Command: `npm start`
   - HTTP Port: 5000
   - Health Check: `/health`
   - Environment Variables:
     ```
     NODE_ENV=production
     PORT=5000
     JWT_SECRET=<generate-random-secret>
     JWT_EXPIRES_IN=7d
     ```

   **Frontend Service:**
   - Type: Static Site
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=${backend.PUBLIC_URL}/api
     ```

   **Database:**
   - Type: PostgreSQL
   - Version: 15
   - Plan: Basic (or higher for production)

4. **Run Database Migration**

   After deployment, run migrations via console:
   ```bash
   # SSH into backend container
   doctl apps exec <app-id> --component backend

   # Run migrations
   npm run migrate
   ```

### Method 2: Using App Spec (digitalocean-app.yaml)

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# Update digitalocean-app.yaml with your settings
nano digitalocean-app.yaml

# Create app
doctl apps create --spec digitalocean-app.yaml

# Get app ID
doctl apps list

# Update app (after changes)
doctl apps update <app-id> --spec digitalocean-app.yaml
```

### Post-Deployment Steps

1. **Update Environment Variables**
   - Set secure JWT_SECRET
   - Configure email settings (if using notifications)
   - Set FRONTEND_URL to your app's URL

2. **Run Database Migrations**
   ```bash
   # Via console or:
   doctl apps exec <app-id> --component backend -- npm run migrate
   ```

3. **Test the Application**
   - Login with default credentials
   - Change admin password
   - Create test users and tickets

4. **Configure Custom Domain (Optional)**
   - Go to App Settings → Domains
   - Add your domain
   - Update DNS records

## 🔒 Security Best Practices

### Production Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS (automatic on DigitalOcean)
- [ ] Configure CORS properly
- [ ] Set secure database password
- [ ] Enable database backups
- [ ] Configure rate limiting (optional)
- [ ] Set up monitoring and alerts
- [ ] Review user permissions regularly

### Environment Variables Security

Never commit `.env` files to git. Always use:
- DigitalOcean's encrypted environment variables
- GitHub Secrets for CI/CD
- Proper .gitignore configuration

## 📊 Database Schema

### Main Tables

- **users** - User accounts with roles
- **tickets** - Support tickets
- **categories** - Ticket categories
- **comments** - Ticket comments
- **notifications** - In-app notifications
- **attachments** - File attachments (planned)
- **ticket_history** - Audit trail

### Relationships

```
users (1) ──→ (many) tickets
users (1) ──→ (many) comments
users (1) ──→ (many) notifications
tickets (1) ──→ (many) comments
tickets (1) ──→ (many) attachments
tickets (1) ──→ (many) ticket_history
categories (1) ──→ (many) tickets
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ticketing.com","password":"Admin123!"}'

# Get tickets (with token)
curl http://localhost:5000/api/tickets \
  -H "Authorization: Bearer <your-token>"
```

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection settings in .env
# Verify DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

**Frontend Can't Connect to Backend**
```bash
# Check VITE_API_URL in frontend/.env
# Should be http://localhost:5000/api for local dev
# Should be your backend URL for production
```

**Migration Errors**
```bash
# Drop and recreate database (⚠️ destroys all data)
dropdb ticketing_system
createdb ticketing_system
npm run migrate
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :5000  # or :5173

# Kill process
kill -9 <PID>
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Enable multiple backend instances on DigitalOcean
- Use managed PostgreSQL with read replicas
- Implement Redis for session storage (future enhancement)

### Performance Optimization
- Enable database connection pooling (already configured)
- Add CDN for static assets
- Implement caching strategy
- Optimize database queries with indexes (already added)

## 🛣️ Roadmap

### Planned Features
- [ ] File attachments for tickets
- [ ] Advanced search and filtering
- [ ] Ticket templates
- [ ] SLA management
- [ ] Advanced reporting and analytics
- [ ] Email-to-ticket functionality
- [ ] Mobile app
- [ ] WebSocket for real-time updates
- [ ] API rate limiting
- [ ] Audit logs

## 📝 API Documentation

### Authentication Endpoints

```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET  /api/auth/profile - Get current user profile
```

### Ticket Endpoints

```
GET    /api/tickets - List tickets
GET    /api/tickets/:id - Get ticket details
POST   /api/tickets - Create ticket
PATCH  /api/tickets/:id - Update ticket
POST   /api/tickets/:id/comments - Add comment
GET    /api/tickets/stats - Get statistics
```

### User Endpoints (Admin only)

```
GET    /api/users - List users
GET    /api/users/:id - Get user
PATCH  /api/users/:id - Update user
DELETE /api/users/:id - Delete user
POST   /api/users/change-password - Change password
```

### Category Endpoints

```
GET    /api/categories - List categories
POST   /api/categories - Create category (Admin)
PATCH  /api/categories/:id - Update category (Admin)
DELETE /api/categories/:id - Delete category (Admin)
```

### Notification Endpoints

```
GET    /api/notifications - List notifications
GET    /api/notifications/unread-count - Get unread count
PATCH  /api/notifications/:id/read - Mark as read
POST   /api/notifications/mark-all-read - Mark all as read
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

## 🙏 Acknowledgments

- React team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- DigitalOcean for reliable cloud infrastructure
- Open source community for various libraries and tools

---

**Built with ❤️ for efficient ticket management**


