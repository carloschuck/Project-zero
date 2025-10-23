# 🚀 Projects Feature - Setup Guide

## ✅ What Was Built

A comprehensive **Project Management System** has been added to your application! This feature allows you to track projects from meetings, emails, texts, and other sources with full team collaboration.

### Key Capabilities:
1. ✅ **Project Tracking** - Create and manage projects with full lifecycle tracking
2. ✅ **Task Checklists** - Add tasks within projects with assignment and progress tracking
3. ✅ **Team Collaboration** - Invite team members with role-based access (Owner, Collaborator, Viewer)
4. ✅ **File Attachments** - Upload and share files within projects
5. ✅ **Comments System** - Team discussion and updates
6. ✅ **Notifications** - Get notified about project updates, task assignments, and deadlines
7. ✅ **Advanced Filtering** - Search and filter projects by status, priority, and ownership

---

## 📋 Installation Steps

### Step 1: Run the Database Migration

**Option A: Using the migration script (Recommended)**
```bash
cd backend
node run-projects-migration.js
```

**Option B: Using psql directly**
```bash
psql -U your_username -d your_database_name -f backend/src/migrations/add_projects.sql
```

**Option C: Using the API endpoint**
```bash
# Make sure your backend server is running, then:
curl -X POST http://localhost:5000/api/migrate/run \
  -H "Content-Type: application/json" \
  -d '{"filename": "add_projects.sql"}'
```

### Step 2: Restart Your Services

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎯 How to Use

### Creating a Project

1. **Navigate to Projects**
   - Click on "Projects" in the sidebar (briefcase icon)
   
2. **Click "New Project"**
   
3. **Fill in Project Details**:
   - **Title**: Name your project
   - **Description**: Add project details, goals, requirements
   - **Priority**: Low, Medium, High, or Urgent
   - **Source**: Where did this project come from? (Meeting, Email, Text, Phone, Other)
   - **Timeline**: Set start date and due date
   - **Owner**: Assign a project owner (defaults to you)
   - **Team Members**: Select team members to collaborate

4. **Click "Create Project"**

### Managing Tasks

1. **Open a Project** - Click on any project card
2. **Go to Tasks Tab**
3. **Click "Add Task"**
4. Fill in:
   - Task title and description
   - Priority level
   - Assign to team member
   - Set due date
5. **Click checkboxes** to mark tasks complete
6. **Edit/Delete** tasks using the action buttons

### Team Collaboration

1. **Go to Team Tab** in a project
2. **Click "Add Member"**
3. Select user and choose role:
   - **Owner**: Full control (set at creation)
   - **Collaborator**: Can edit tasks and comment
   - **Viewer**: Read-only access
4. Members can be removed by the owner or admin

### File Sharing

1. **Go to Files Tab** in a project
2. **Click "Upload File"**
3. Select file from your computer
4. Files can be downloaded or deleted by authorized users

### Comments & Updates

1. **Go to Comments Tab**
2. **Type your message** in the comment box
3. **Click "Post Comment"**
4. All team members will be notified

---

## 🔒 Permissions

### Who Can Do What?

| Action | Owner | Collaborator | Viewer | Admin |
|--------|-------|--------------|--------|-------|
| View Project | ✅ | ✅ | ✅ | ✅ |
| Edit Project Details | ✅ | ❌ | ❌ | ✅ |
| Delete Project | ✅ | ❌ | ❌ | ✅ |
| Create/Edit Tasks | ✅ | ✅ | ❌ | ✅ |
| Delete Tasks | ✅ | ✅ | ❌ | ✅ |
| Add Comments | ✅ | ✅ | ✅ | ✅ |
| Upload Files | ✅ | ✅ | ❌ | ✅ |
| Add/Remove Members | ✅ | ❌ | ❌ | ✅ |

---

## 📊 What's in the Database

The migration created these new tables:

1. **`projects`** - Main project information
2. **`project_tasks`** - Task checklists within projects
3. **`project_members`** - Team member assignments and roles
4. **`project_comments`** - Discussion threads
5. **`project_history`** - Audit trail of all changes

And updated these existing tables:
- **`attachments`** - Now supports both tickets AND projects
- **`notifications`** - Now includes project-related notifications

---

## 🎨 User Interface

### Projects List Page
- **Card-based grid view** of all projects
- **Statistics dashboard** showing project counts by status
- **Search bar** for finding projects
- **Filters** for status, priority, and ownership
- **Source icons** (🤝 Meeting, 📧 Email, 💬 Text, etc.)

### Project Detail Page
- **Tabbed interface**:
  - **Tasks**: Checklist with progress bar
  - **Team**: Member management
  - **Comments**: Discussion thread  
  - **Files**: Attachment management
- **Quick status updates** via dropdown
- **Visual progress tracking**

---

## 🔮 Future Enhancements (Mentioned)

These features are planned for future implementation:

1. **Deadline Notifications** - Automatic alerts for upcoming due dates
2. **Project Reminders** - Recurring reminders for open projects
3. **Weekly Digest** - Email summary of project activities
4. **Configurable Notifications** - User preferences for reminder frequency

---

## 🐛 Troubleshooting

### Migration Fails
- **Error**: "relation already exists"
  - **Solution**: Tables might already exist. Check if migration was already run.
  
### Can't See Projects Tab
- **Issue**: Navigation doesn't show Projects
  - **Solution**: Clear browser cache and refresh page
  
### File Upload Fails
- **Issue**: "Failed to upload file"
  - **Solution**: Check that `backend/uploads` directory exists and has write permissions
  ```bash
  mkdir -p backend/uploads
  chmod 755 backend/uploads
  ```

### Access Denied Errors
- **Issue**: "You do not have permission"
  - **Solution**: Make sure you're added as a team member or are the project owner

---

## 📚 Additional Documentation

For more detailed information, see:
- **[PROJECTS_FEATURE.md](docs/PROJECTS_FEATURE.md)** - Complete technical documentation
- **API Endpoints** - Full REST API reference
- **Database Schema** - Detailed table structures
- **Permission Matrix** - Complete access control documentation

---

## 🎉 You're All Set!

The Projects feature is now ready to use! 

**Quick Start Checklist:**
- [x] Run database migration
- [x] Restart backend and frontend
- [ ] Log in to your application
- [ ] Click "Projects" in the sidebar
- [ ] Create your first project!

**Need Help?**
- Check the detailed docs in `docs/PROJECTS_FEATURE.md`
- Review the code in the project-related files
- Test the API endpoints using the browser or Postman

Enjoy tracking your projects! 🚀

