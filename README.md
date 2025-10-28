# Ticketing System - Full-Stack Web Application

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)

A modern, enterprise-grade ticketing system with role-based access control, analytics, and automation features.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [File Uploads Fix](#-file-uploads-fix-digitalocean)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

A comprehensive ticketing system designed for organizations to manage internal requests, track issues, and coordinate events. Built with modern technologies and best practices, featuring real-time notifications, advanced analytics, and automated workflows.

**Perfect for:**
- IT Service Management
- Event Coordination
- Facilities Management
- Internal Request Tracking
- Help Desk Operations

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Authentication** - JWT-based with bcrypt password hashing
- **Role-Based Access Control (RBAC)** - 4 distinct roles with granular permissions
- **Password Security** - Enforced complexity requirements
- **Session Management** - Secure token handling

### 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full system access, user management, analytics, system settings |
| **Department Lead** | Manage department tickets, assign staff, view analytics |
| **Event Coordinator** | Handle event-related requests, track event status |
| **User** | Submit tickets, track requests, add comments |

### 🎫 Ticket Management
- **Dynamic Form Builder** - Create custom forms per category
- **File Attachments** - Upload documents, images (5MB limit per file)
- **Priority Levels** - Urgent, High, Medium, Low
- **Status Tracking** - Open, In Progress, Resolved, Closed
- **Comment System** - Public and internal comments
- **Assignment** - Assign tickets to specific staff members
- **History Tracking** - Complete audit trail of all changes

### 📁 Project Management (NEW)
- **Project Tracking** - Track projects from meetings, emails, texts, and phone calls
- **Task Checklists** - Create and manage tasks within projects with progress tracking
- **Team Collaboration** - Add team members with role-based permissions (Owner, Collaborator, Viewer)
- **File Attachments** - Share documents and files with the team
- **Source Tracking** - Tag projects by origin (Meeting, Email, Text, Phone, Other)
- **Project Status** - Planning, In Progress, On Hold, Completed, Cancelled
- **Comments & Updates** - Team discussion thread for collaboration
- **Member Management** - Add/remove team members with different access levels
- **Deadline Tracking** - Set start dates and due dates with visual progress
- **Statistics Dashboard** - Overview of all project statuses and overdue items

### 📊 Analytics & Reporting
- **Turnaround Time Analysis** - Average, median, min, max resolution times
- **Category Performance** - Track performance by request category
- **Priority Metrics** - Monitor SLA compliance by priority level
- **Staff Performance** - Individual productivity and success rates
- **Response Metrics** - Time to assignment, backlog tracking
- **Visual Dashboard** - Interactive charts and graphs
- **CSV Export** - Comprehensive data export with summary statistics
- **Date Range Filtering** - Today, This Week, This Month, Custom ranges

### 🔔 Notifications
- **In-App Notifications** - Real-time updates with badge counter
- **Email Notifications** - Configurable for all major events:
  - Request created (to user)
  - Status updated (to request owner)
  - Ticket assigned (to assigned staff)
  - New comment (to request owner)
  - New request notification (to admins)
- **Notification Preferences** - Admin-controlled toggle settings
- **Email Templates** - Professional HTML email designs

### ⚙️ System Settings
- **SMTP Configuration** - Gmail, Outlook, custom SMTP support
- **Email Testing** - Built-in test email functionality
- **Organization Settings** - Customize name, support email, website
- **Notification Controls** - Enable/disable specific notification types

### 🎨 User Experience
- **Dark Mode** - System-wide theme toggle with preference persistence
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Modern UI** - Clean interface with Tailwind CSS
- **Accessibility** - WCAG compliant design patterns
- **Search & Filters** - Advanced filtering and search capabilities
- **Real-time Updates** - Live data without page refreshes

### 🔄 Workflow Automation
- **Auto-Assignment** - Based on category and department
- **Status Automation** - Automatic resolved_at timestamp tracking
- **Email Automation** - Triggered by workflow events
- **Notification System** - Automated in-app alerts

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - Modern UI library
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **date-fns** - Date manipulation library

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.19** - Web application framework
- **PostgreSQL 16** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **DigitalOcean App Platform** - Cloud deployment
- **Nginx** - Frontend static file serving

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 16+
- Docker (optional, for containerized deployment)

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Project-zero
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ticketing_system
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# Email Configuration (optional for local dev)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
EOF

# Run database migrations
node src/migrations/run.js

# Start backend server
npm run dev
```

Backend runs on `http://localhost:5000`

#### 3. Setup Frontend
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start frontend dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

#### 4. Access the Application
- Open `http://localhost:5173` in your browser
- Register a new account (first user becomes admin)
- Start creating tickets!

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Access application at http://localhost:8080
```

---

## 📚 Documentation

Comprehensive guides are available in the `/docs` folder:

### User Guides
- **[Email Setup Guide](docs/EMAIL_SETUP.md)** - Configure SMTP and email notifications
- **[Notification Testing](docs/NOTIFICATION_TESTING.md)** - Test and verify notification settings
- **[Analytics Guide](docs/ANALYTICS_GUIDE.md)** - Understanding metrics and reports

### Developer Guides
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to this project
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes

### API Documentation

#### Authentication Endpoints
```
POST /api/auth/register - Create new user account
POST /api/auth/login    - User login
GET  /api/auth/me       - Get current user info
```

#### Tickets Endpoints
```
GET    /api/tickets           - List all tickets
POST   /api/tickets           - Create new ticket
GET    /api/tickets/:id       - Get ticket details
PATCH  /api/tickets/:id       - Update ticket
DELETE /api/tickets/:id       - Delete ticket (admin only)
POST   /api/tickets/:id/comments - Add comment
GET    /api/tickets/stats     - Get statistics
```

#### Users Endpoints (Admin only)
```
GET    /api/users           - List all users
POST   /api/users           - Create user
PATCH  /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user
```

#### Categories Endpoints (Admin only)
```
GET    /api/categories      - List categories
POST   /api/categories      - Create category
PATCH  /api/categories/:id  - Update category
DELETE /api/categories/:id  - Delete category
```

#### Attachments Endpoints
```
POST   /api/tickets/:ticketId/attachments  - Upload file
GET    /api/tickets/:ticketId/attachments  - List attachments
GET    /api/attachments/:id/download       - Download file
DELETE /api/attachments/:id                - Delete attachment
```

#### Settings Endpoints (Admin only)
```
GET    /api/settings           - Get all settings
PUT    /api/settings           - Update settings
POST   /api/settings/test-email - Send test email
```

---

## 🌐 Deployment

### DigitalOcean App Platform

#### 1. Prepare Database
- Create a PostgreSQL managed database on DigitalOcean
- Note the connection string

#### 2. Configure App
The `digitalocean-app.yaml` file is included for easy deployment:

```bash
# Deploy using doctl CLI
doctl apps create --spec digitalocean-app.yaml

# Or use the DigitalOcean control panel:
# 1. Create New App
# 2. Import from GitHub
# 3. Select this repository
# 4. It will auto-detect the yaml config
```

#### 3. Set Environment Variables
In the DigitalOcean control panel, add:

**Backend:**
```
DATABASE_URL=<your-database-url>
JWT_SECRET=<generate-secure-random-string>
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=noreply@yourdomain.com
```

**Frontend:**
```
VITE_API_URL=<your-backend-url>
```

#### 4. Deploy
```bash
doctl apps create-deployment <app-id>
```

#### 5. Run Migrations
```bash
# SSH into backend container or use console
node src/migrations/run.js
```

---

## 📤 File Uploads Fix (DigitalOcean)

**Important**: If deploying to DigitalOcean App Platform, file uploads require DigitalOcean Spaces (S3-compatible storage) because the filesystem is ephemeral.

### Quick Setup (5 Minutes)

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Create a DigitalOcean Space**:
   - Go to: https://cloud.digitalocean.com/spaces
   - Create new Space (e.g., `ticketing-system-uploads`)
   - Generate API keys (Manage Keys → Generate New Key)

3. **Add Environment Variables** in App Settings:
```bash
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_REGION=nyc3
SPACES_BUCKET=ticketing-system-uploads
SPACES_KEY=<your-access-key>  # Mark as encrypted
SPACES_SECRET=<your-secret-key>  # Mark as encrypted
```

4. **Deploy**:
```bash
git push origin main
```

### Complete Documentation

- **[UPLOAD_FIX_README.md](UPLOAD_FIX_README.md)** - Quick start guide (⭐ Start here!)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist
- **[SPACES_SETUP.md](SPACES_SETUP.md)** - Detailed Spaces setup
- **[ENV_VARIABLES.md](ENV_VARIABLES.md)** - All environment variables
- **[FILE_UPLOAD_FIX.md](FILE_UPLOAD_FIX.md)** - Technical details

### Why This is Needed

DigitalOcean App Platform uses containers with ephemeral storage. Files saved to the filesystem are lost on container restart. Spaces provides persistent S3-compatible object storage.

**Cost**: $5/month (includes 250GB storage + 1TB bandwidth)

### Local Development

No changes needed! The app automatically detects the environment:
- **Production**: Uses DigitalOcean Spaces
- **Development**: Uses local disk storage

### Custom Server Deployment

See deployment guides for:
- **AWS**: EC2 + RDS
- **Azure**: App Service + Azure Database
- **Google Cloud**: App Engine + Cloud SQL
- **Self-Hosted**: Docker + Reverse Proxy

---

## 📁 Project Structure

```
project-zero/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js    # PostgreSQL connection
│   │   │   └── multer.js      # File upload config
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── ticketController.js
│   │   │   ├── userController.js
│   │   │   ├── categoryController.js
│   │   │   ├── attachmentController.js
│   │   │   ├── notificationController.js
│   │   │   └── settingsController.js
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.js        # JWT authentication
│   │   ├── migrations/        # Database migrations
│   │   │   ├── schema.sql     # Main schema
│   │   │   └── run.js         # Migration runner
│   │   ├── routes/            # API routes
│   │   ├── utils/             # Utility functions
│   │   │   ├── email.js       # Email sending
│   │   │   └── notifications.js
│   │   └── server.js          # Express app entry point
│   ├── uploads/               # Uploaded files storage
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Layout.jsx     # Main layout wrapper
│   │   │   ├── FormBuilder.jsx
│   │   │   ├── DynamicFormRenderer.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── NotificationDropdown.jsx
│   │   ├── contexts/          # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── CreateRequest.jsx
│   │   │   ├── RequestDetail.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js         # Axios configuration
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── docs/                       # Documentation
│   ├── EMAIL_SETUP.md         # Email configuration guide
│   ├── NOTIFICATION_TESTING.md # Testing notifications
│   └── ANALYTICS_GUIDE.md     # Analytics features
│
├── README.md                   # This file
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT License
├── docker-compose.yml          # Docker orchestration
└── digitalocean-app.yaml       # DigitalOcean deployment config
```

---

## 🎯 Key Features Explained

### Dynamic Form Builder
Admins can create custom forms for each category with various field types:
- Text input (single line)
- Text area (multi-line)
- Select dropdown
- Date picker
- Number input
- File upload
- Checkbox
- Radio buttons

### Turnaround Time Tracking
Automatically tracks:
- Time from creation to resolution
- Average, median, min, max times
- Breakdown by category and priority
- Per-staff member performance

### Notification System
Two-tier notification system:
1. **In-App**: Real-time badge with dropdown
2. **Email**: Configurable HTML emails

All notifications respect admin-controlled preferences.

### File Attachments
- Supports: Images, PDFs, Office docs, ZIP files
- 5MB size limit per file
- Secure storage with unique filenames
- Access control (only uploader or admin can delete)

---

## 🔒 Security Features

- ✅ JWT authentication with secure token storage
- ✅ bcrypt password hashing (10 rounds)
- ✅ Role-based access control middleware
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ CORS configuration
- ✅ Rate limiting (production recommended)
- ✅ Secure file upload validation
- ✅ Environment variable configuration
- ✅ HTTPS enforced in production

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create ticket with attachments
- [ ] Update ticket status
- [ ] Assign ticket to staff
- [ ] Add comments
- [ ] Email notifications
- [ ] Analytics page loads
- [ ] Export CSV report
- [ ] Dark mode toggle
- [ ] Mobile responsiveness

---

## 📈 Performance

### Optimization Features
- Lazy loading for routes
- Indexed database queries
- Pagination for large datasets
- Image compression for uploads
- CSS minification
- JavaScript bundling with Vite
- Nginx caching for static assets

### Scalability
- Stateless API design
- Horizontal scaling ready
- Database connection pooling
- CDN-ready static files
- Microservices-compatible architecture

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of Conduct
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

### Quick Contribution Guide
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Latest Version: 1.0.0 (Current)
- ✨ Complete ticketing system
- ✨ Role-based access control
- ✨ Advanced analytics with turnaround tracking
- ✨ Email notifications with preferences
- ✨ File attachment support
- ✨ Dynamic form builder
- ✨ Dark mode support
- ✨ Comprehensive documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** - For the amazing frontend library
- **Express Team** - For the robust backend framework
- **PostgreSQL** - For the reliable database
- **Tailwind CSS** - For the beautiful styling
- **Lucide Icons** - For the modern icon set
- **DigitalOcean** - For the deployment platform

---

## 📞 Support

### Documentation
- 📖 [Email Setup Guide](docs/EMAIL_SETUP.md)
- 📖 [Notification Testing](docs/NOTIFICATION_TESTING.md)
- 📖 [Analytics Guide](docs/ANALYTICS_GUIDE.md)

### Getting Help
- 🐛 **Bug Reports**: Open an issue with detailed description
- 💡 **Feature Requests**: Create an issue with the "enhancement" label
- 📧 **Email**: support@example.com (update with your support email)
- 💬 **Discussions**: Use GitHub Discussions for questions

---

## 🗺️ Roadmap

### Planned Features
- [ ] **Mobile Apps** - iOS and Android native apps
- [ ] **Advanced SLA Management** - Custom SLA rules and tracking
- [ ] **Customer Portal** - External user ticket submission
- [ ] **Knowledge Base** - Self-service documentation
- [ ] **Live Chat** - Real-time support chat
- [ ] **Webhooks** - Integration with external services
- [ ] **Custom Reports** - Build your own report templates
- [ ] **Multi-language Support** - Internationalization (i18n)
- [ ] **Advanced Search** - Full-text search with filters
- [ ] **Audit Logs** - Comprehensive activity logging

---

<div align="center">

**Built with ❤️ for better ticket management**

[⬆ Back to Top](#ticketing-system---full-stack-web-application)

</div>
