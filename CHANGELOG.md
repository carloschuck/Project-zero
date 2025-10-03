# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-03

### Added
- Initial release of the Ticketing System
- Role-based access control (Admin, Department Lead, Event Coordinator, User)
- Modern dashboard with statistics and recent tickets
- Comprehensive ticketing system with categories, priorities, and statuses
- Real-time notifications (in-app and email)
- Dark mode toggle for better user experience
- Responsive design that works on all devices
- RESTful API with JWT authentication
- User management page with CRUD operations
- Category management for ticket organization
- Ticket commenting system with internal notes
- Email notifications for ticket updates
- Settings page for system configuration
- Docker support for easy deployment
- DigitalOcean App Platform deployment configuration

### Features by Role

#### Admin
- View and manage all tickets
- Full user management (create, edit, delete users)
- Create and manage categories
- Assign tickets to team members
- Update ticket statuses and priorities
- Access all system settings

#### Department Lead
- View tickets relevant to their department
- Update ticket statuses
- Assign tickets to team members
- Add comments and internal notes to tickets

#### Event Coordinator
- View event-related requests
- Track and update ticket statuses
- Add comments to tickets

#### Regular User
- Submit new tickets
- Track their own tickets
- Add comments to their tickets
- View ticket history

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization middleware
- CORS configuration
- Helmet.js for security headers
- SQL injection prevention with parameterized queries
- XSS protection

### Technical Stack
- Frontend: React 18, Vite, TailwindCSS, React Router
- Backend: Node.js, Express, PostgreSQL
- Authentication: JWT, bcrypt
- Email: Nodemailer
- Icons: Lucide React
- Containerization: Docker, Docker Compose

---

## How to Update This Changelog

### Types of Changes
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Example Entry
```markdown
## [1.1.0] - 2025-10-15

### Added
- File attachment support for tickets
- Advanced search functionality
- Export tickets to CSV

### Changed
- Improved dashboard performance
- Updated notification UI

### Fixed
- Fixed timezone issues in ticket timestamps
- Resolved email notification delivery issues
```

---

**Note:** This changelog is maintained manually. Please update it when making significant changes to the project.

