# Projects Feature Documentation

## Overview

The Projects feature is a comprehensive project tracking system that allows users to manage projects from various sources (meetings, emails, texts, etc.) with task management, team collaboration, and file attachments.

## Features

### 1. Project Management
- **Create Projects**: Track projects from meetings, emails, text messages, phone calls, and other sources
- **Project Properties**:
  - Title and description
  - Status: Planning, In Progress, On Hold, Completed, Cancelled
  - Priority: Low, Medium, High, Urgent
  - Source tracking (Meeting, Email, Text, Phone, Other)
  - Start date and due date
  - Project owner and creator tracking
  - Automatic project numbering (PRJ-0001, PRJ-0002, etc.)

### 2. Task Management (Checklists)
- Create, update, and delete tasks within projects
- Task properties:
  - Title and description
  - Status: Pending, In Progress, Completed, Cancelled
  - Priority: Low, Medium, High
  - Assign tasks to team members
  - Due dates
  - Task ordering
- Visual progress tracking with progress bars
- Quick status toggle (mark complete/incomplete)

### 3. Team Collaboration
- **Member Management**:
  - Add/remove team members
  - Three role types:
    - **Owner**: Full project control (assigned at creation)
    - **Collaborator**: Can edit tasks and comment
    - **Viewer**: Read-only access
- **Comments & Updates**:
  - Team discussion thread
  - Real-time collaboration
  - Activity tracking

### 4. File Attachments
- Upload files to projects
- Download and manage attachments
- Track uploader and upload date
- File size and type tracking

### 5. Notifications
- Project creation notifications
- Task assignment notifications
- Status change notifications
- Comment notifications
- Task completion notifications
- Member addition notifications

### 6. Advanced Features
- **Search & Filters**:
  - Search by project title, number, or description
  - Filter by status and priority
  - Filter by ownership (My Projects, Created by Me, All Projects)
- **Statistics Dashboard**:
  - Total projects count
  - Status breakdown (Planning, In Progress, etc.)
  - Overdue projects tracking
- **Access Control**:
  - Role-based permissions
  - Project member-based access
  - Admin override capabilities

## Database Schema

### Main Tables

#### `projects`
- Stores project information
- Fields: id, project_number, title, description, status, priority, source, start_date, due_date, owner_id, created_by, timestamps

#### `project_tasks`
- Checklist items within projects
- Fields: id, project_id, title, description, status, priority, assigned_to, due_date, order_index, created_by, timestamps

#### `project_members`
- Team collaboration tracking
- Fields: id, project_id, user_id, role (owner/collaborator/viewer), added_by, added_at
- Unique constraint on (project_id, user_id)

#### `project_comments`
- Discussion and updates
- Fields: id, project_id, user_id, comment, created_at

#### `project_history`
- Audit trail for project changes
- Fields: id, project_id, user_id, action, old_value, new_value, created_at

#### `attachments` (Updated)
- Enhanced to support both tickets and projects
- New fields: project_id, entity_type
- Constraint ensures either ticket_id OR project_id (not both)

#### `notifications` (Updated)
- Enhanced to support project notifications
- New field: project_id
- New notification types for projects and tasks

## API Endpoints

### Projects
- `GET /api/projects` - List projects with filters
- `GET /api/projects/stats` - Get project statistics
- `GET /api/projects/:id` - Get project details with tasks, members, comments, attachments
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (owner/admin only)

### Comments
- `POST /api/projects/:id/comments` - Add comment to project

### Tasks
- `POST /api/projects/:projectId/tasks` - Create task
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task

### Members
- `POST /api/projects/:projectId/members` - Add team member
- `DELETE /api/projects/:projectId/members/:memberId` - Remove member

### Attachments
- `POST /api/projects/:projectId/attachments` - Upload file
- (Uses existing attachment download/delete endpoints)

## Frontend Pages

### 1. Projects List (`/projects`)
- Grid/card view of all projects
- Project cards show:
  - Project number and title
  - Status and priority badges
  - Source icon
  - Task progress bar
  - Due date and member count
  - Owner information
- Statistics dashboard at top
- Advanced filtering and search
- Pagination support

### 2. Project Detail (`/projects/:id`)
- Comprehensive project view with tabs:
  - **Tasks Tab**: Checklist management with quick toggles
  - **Team Tab**: Member management
  - **Comments Tab**: Discussion thread
  - **Files Tab**: Attachment management
- Project header with:
  - Title and description
  - Status and priority controls (for authorized users)
  - Progress visualization
  - Timeline information
- Modal dialogs for:
  - Adding/editing tasks
  - Adding team members

### 3. Create Project (`/projects/new`)
- Multi-section form:
  - Basic information (title, description, priority, source)
  - Timeline (start/due dates)
  - Project owner selection
  - Team member selection (multi-select)
- Form validation
- Navigation integration

## Navigation

Projects tab added to main navigation:
- Icon: Briefcase
- Position: Between Dashboard and QR Generator
- Available to all user roles

## Installation & Migration

### Step 1: Run Database Migration

```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration script
\i backend/src/migrations/add_projects.sql
```

Or using the migration API endpoint:
```bash
curl -X POST http://localhost:5000/api/migrate \
  -H "Content-Type: application/json" \
  -d '{"migrationName": "add_projects"}'
```

### Step 2: Restart Backend Server

```bash
cd backend
npm start
```

### Step 3: Restart Frontend (if needed)

```bash
cd frontend
npm run dev
```

## Permissions & Access Control

### Project Access
- **Admin**: Full access to all projects
- **Owner**: Full control over their projects
- **Members**: Access based on role (collaborator/viewer)
- **Non-members**: No access

### Actions by Role

| Action | Owner | Collaborator | Viewer | Admin |
|--------|-------|--------------|--------|-------|
| View Project | ✅ | ✅ | ✅ | ✅ |
| Edit Project | ✅ | ❌ | ❌ | ✅ |
| Delete Project | ✅ | ❌ | ❌ | ✅ |
| Create Task | ✅ | ✅ | ❌ | ✅ |
| Edit Task | ✅ | ✅ | ❌ | ✅ |
| Delete Task | ✅ | ✅ | ❌ | ✅ |
| Add Comment | ✅ | ✅ | ✅ | ✅ |
| Add Member | ✅ | ❌ | ❌ | ✅ |
| Remove Member | ✅ | ❌ | ❌ | ✅ |
| Upload Files | ✅ | ✅ | ❌ | ✅ |
| Download Files | ✅ | ✅ | ✅ | ✅ |
| Delete Files | ✅ (own) | ✅ (own) | ❌ | ✅ |

## Future Enhancements (Mentioned by User)

### Phase 2 Features
1. **Deadline Notifications**: Automatic notifications for upcoming project deadlines
2. **Reminder System**: Configurable reminders for open projects
3. **Weekly Digest**: Summary email of project activities and statuses
4. **Recurring Reminders**: Periodic notifications until project completion

### Implementation Notes for Phase 2
- Add scheduled job system (e.g., node-cron)
- Create notification preferences table
- Implement email digest templates
- Add reminder configuration UI in project settings

## Technical Implementation Details

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with UUID primary keys
- **File Upload**: Multer for multipart/form-data
- **Authentication**: JWT token-based
- **Validation**: Express-validator

### Frontend
- **Framework**: React with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom theme
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

### Key Design Patterns
1. **Transaction Management**: All multi-step operations use database transactions
2. **Access Control**: Consistent permission checking across all endpoints
3. **Notification System**: Centralized notification creation utility
4. **File Management**: Automatic cleanup on errors
5. **Audit Trail**: All major actions logged in history table

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure you have the latest schema and run migrations in order
2. **File upload fails**: Check uploads directory permissions and multer configuration
3. **Access denied**: Verify user is project owner or member
4. **Notifications not working**: Check notification table constraints

### Debug Tips
- Check browser console for frontend errors
- Check server logs for backend errors
- Verify database constraints and foreign keys
- Test API endpoints using curl or Postman

## Support & Contribution

For issues or feature requests related to the Projects feature:
1. Check existing documentation
2. Review the code in relevant files
3. Test in development environment first
4. Document any customizations

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-23  
**Status**: Production Ready

