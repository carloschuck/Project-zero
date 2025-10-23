const pool = require('../config/database');
const { validationResult } = require('express-validator');
const { createNotification } = require('../utils/notifications');

// Generate unique project number
const generateProjectNumber = async (client) => {
  const prefix = 'PRJ';
  
  const lastProjectResult = await client.query(
    `SELECT project_number FROM projects 
     WHERE project_number LIKE $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [`${prefix}-%`]
  );
  
  let nextNumber = 1;
  if (lastProjectResult.rows.length > 0) {
    const lastNumber = lastProjectResult.rows[0].project_number;
    const match = lastNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  const numberPart = nextNumber.toString().padStart(4, '0');
  return `${prefix}-${numberPart}`;
};

// Create new project
const createProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      priority, 
      source, 
      startDate, 
      dueDate, 
      ownerId,
      members 
    } = req.body;
    
    const userId = req.user.id;

    await client.query('BEGIN');

    // Generate unique project number
    const projectNumber = await generateProjectNumber(client);

    // Create project
    const projectResult = await client.query(
      `INSERT INTO projects (project_number, title, description, priority, source, start_date, due_date, owner_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [projectNumber, title, description, priority || 'medium', source || 'meeting', startDate, dueDate, ownerId || userId, userId]
    );

    const project = projectResult.rows[0];

    // Add creator as project owner member
    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, ownerId || userId]
    );

    // Add additional members if provided
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        if (memberId !== (ownerId || userId)) {
          await client.query(
            `INSERT INTO project_members (project_id, user_id, role)
             VALUES ($1, $2, 'collaborator')
             ON CONFLICT (project_id, user_id) DO NOTHING`,
            [project.id, memberId]
          );

          // Notify new member
          await createNotification(
            client,
            memberId,
            null,
            'Added to Project',
            `You've been added to project: ${title}`,
            'project_assigned',
            project.id
          );
        }
      }
    }

    // Add to history
    await client.query(
      `INSERT INTO project_history (project_id, user_id, action, new_value)
       VALUES ($1, $2, 'created', $3)`,
      [project.id, userId, `Project created with status: planning`]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Project created successfully',
      project: project
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  } finally {
    client.release();
  }
};

// Get all projects with filters and pagination
const getProjects = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20, search, owner } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name,
        (SELECT COUNT(*) FROM project_tasks WHERE project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM project_tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM project_comments WHERE project_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      JOIN users c ON p.created_by = c.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Check if user has access to the project (owner, member, or admin)
    if (req.user.role !== 'admin') {
      query += ` AND (
        p.id IN (SELECT project_id FROM project_members WHERE user_id = $${paramCount})
        OR p.created_by = $${paramCount}
      )`;
      params.push(req.user.id);
      paramCount++;
    }

    // Owner filter
    if (owner === 'my_projects') {
      query += ` AND p.owner_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (owner === 'created_by_me') {
      query += ` AND p.created_by = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    }

    // Search filter
    if (search) {
      query += ` AND (
        p.project_number ILIKE $${paramCount} OR 
        p.title ILIKE $${paramCount} OR 
        p.description ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Status filter
    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Priority filter
    if (priority) {
      query += ` AND p.priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM projects p
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 1;

    // Apply same access filter
    if (req.user.role !== 'admin') {
      countQuery += ` AND (
        p.id IN (SELECT project_id FROM project_members WHERE user_id = $${countParamCount})
        OR p.created_by = $${countParamCount}
      )`;
      countParams.push(req.user.id);
      countParamCount++;
    }

    // Apply same filters
    if (owner === 'my_projects') {
      countQuery += ` AND p.owner_id = $${countParamCount}`;
      countParams.push(req.user.id);
      countParamCount++;
    } else if (owner === 'created_by_me') {
      countQuery += ` AND p.created_by = $${countParamCount}`;
      countParams.push(req.user.id);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (
        p.project_number ILIKE $${countParamCount} OR 
        p.title ILIKE $${countParamCount} OR 
        p.description ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (status) {
      countQuery += ` AND p.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (priority) {
      countQuery += ` AND p.priority = $${countParamCount}`;
      countParams.push(priority);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      projects: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get project by ID with all details
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get project details
    const projectResult = await pool.query(
      `SELECT 
        p.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name,
        c.email as creator_email
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN users c ON p.created_by = c.id
      WHERE p.id = $1`,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Check access
    if (req.user.role !== 'admin') {
      const memberCheck = await pool.query(
        `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2
         UNION
         SELECT 1 FROM projects WHERE id = $1 AND created_by = $2`,
        [id, req.user.id]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Get tasks
    const tasksResult = await pool.query(
      `SELECT 
        t.*,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name
      FROM project_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      JOIN users c ON t.created_by = c.id
      WHERE t.project_id = $1
      ORDER BY t.order_index ASC, t.created_at ASC`,
      [id]
    );

    // Get members
    const membersResult = await pool.query(
      `SELECT 
        pm.*,
        u.first_name,
        u.last_name,
        u.email,
        u.role as user_role,
        u.department
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY 
        CASE pm.role 
          WHEN 'owner' THEN 1 
          WHEN 'collaborator' THEN 2 
          WHEN 'viewer' THEN 3 
        END,
        u.first_name`,
      [id]
    );

    // Get comments
    const commentsResult = await pool.query(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.role
      FROM project_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.project_id = $1
      ORDER BY c.created_at DESC`,
      [id]
    );

    // Get attachments
    const attachmentsResult = await pool.query(
      `SELECT 
        a.*,
        u.first_name as uploader_first_name,
        u.last_name as uploader_last_name
      FROM attachments a
      JOIN users u ON a.uploaded_by = u.id
      WHERE a.project_id = $1
      ORDER BY a.uploaded_at DESC`,
      [id]
    );

    // Get history
    const historyResult = await pool.query(
      `SELECT 
        h.*,
        u.first_name,
        u.last_name
      FROM project_history h
      JOIN users u ON h.user_id = u.id
      WHERE h.project_id = $1
      ORDER BY h.created_at DESC
      LIMIT 50`,
      [id]
    );

    res.json({
      project,
      tasks: tasksResult.rows,
      members: membersResult.rows,
      comments: commentsResult.rows,
      attachments: attachmentsResult.rows,
      history: historyResult.rows
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Update project
const updateProject = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, description, status, priority, startDate, dueDate, ownerId } = req.body;

    await client.query('BEGIN');

    // Check project exists and access
    const projectCheck = await client.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectCheck.rows[0];

    // Check permission (owner, admin, or member with collaborator role)
    if (req.user.role !== 'admin' && project.owner_id !== req.user.id) {
      const memberCheck = await client.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [id, req.user.id]
      );

      if (memberCheck.rows.length === 0 || memberCheck.rows[0].role === 'viewer') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updates = [];
    const params = [id];
    let paramCount = 2;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
      await client.query(
        `INSERT INTO project_history (project_id, user_id, action, old_value, new_value)
         VALUES ($1, $2, 'title_updated', $3, $4)`,
        [id, req.user.id, project.title, title]
      );
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;

      if (status === 'completed' && !project.completed_at) {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
      }

      await client.query(
        `INSERT INTO project_history (project_id, user_id, action, old_value, new_value)
         VALUES ($1, $2, 'status_changed', $3, $4)`,
        [id, req.user.id, project.status, status]
      );

      // Notify all members
      const members = await client.query(
        'SELECT user_id FROM project_members WHERE project_id = $1',
        [id]
      );

      for (const member of members.rows) {
        if (member.user_id !== req.user.id) {
          await createNotification(
            client,
            member.user_id,
            null,
            'Project Status Updated',
            `Project "${project.title}" status changed to: ${status}`,
            'project_updated',
            id
          );
        }
      }
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      params.push(startDate);
      paramCount++;
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      params.push(dueDate);
      paramCount++;
    }

    if (ownerId !== undefined && req.user.role === 'admin') {
      updates.push(`owner_id = $${paramCount}`);
      params.push(ownerId);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await client.query(query, params);

    await client.query('COMMIT');

    res.json({
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  } finally {
    client.release();
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check access (admin or owner only)
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (req.user.role !== 'admin' && projectCheck.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Add comment to project
const addComment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { comment } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO project_comments (project_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, req.user.id, comment]
    );

    // Get project info
    const projectInfo = await client.query(
      'SELECT title, owner_id FROM projects WHERE id = $1',
      [id]
    );

    if (projectInfo.rows.length > 0) {
      const project = projectInfo.rows[0];
      
      // Notify all members except commenter
      const members = await client.query(
        'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id != $2',
        [id, req.user.id]
      );

      for (const member of members.rows) {
        await createNotification(
          client,
          member.user_id,
          null,
          'New Project Comment',
          `${req.user.first_name} ${req.user.last_name} commented on: ${project.title}`,
          'project_comment',
          id
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  } finally {
    client.release();
  }
};

// Task management functions
const createTask = async (req, res) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { title, description, priority, assignedTo, dueDate } = req.body;

    await client.query('BEGIN');

    // Get max order index
    const maxOrderResult = await client.query(
      'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM project_tasks WHERE project_id = $1',
      [projectId]
    );
    const orderIndex = maxOrderResult.rows[0].next_order;

    const result = await client.query(
      `INSERT INTO project_tasks (project_id, title, description, priority, assigned_to, due_date, order_index, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [projectId, title, description, priority || 'medium', assignedTo, dueDate, orderIndex, req.user.id]
    );

    // Notify assigned user if set
    if (assignedTo) {
      const projectInfo = await client.query(
        'SELECT title FROM projects WHERE id = $1',
        [projectId]
      );

      if (projectInfo.rows.length > 0) {
        await createNotification(
          client,
          assignedTo,
          null,
          'Task Assigned',
          `You've been assigned a task in project: ${projectInfo.rows[0].title}`,
          'task_assigned',
          projectId
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  } finally {
    client.release();
  }
};

const updateTask = async (req, res) => {
  const client = await pool.connect();
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    await client.query('BEGIN');

    const taskCheck = await client.query(
      'SELECT * FROM project_tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    const updates = [];
    const params = [taskId];
    let paramCount = 2;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;

      if (status === 'completed' && !task.completed_at) {
        updates.push(`completed_at = CURRENT_TIMESTAMP`);
        
        // Notify project members
        const projectInfo = await client.query(
          'SELECT title FROM projects WHERE id = $1',
          [task.project_id]
        );

        if (projectInfo.rows.length > 0) {
          const members = await client.query(
            'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id != $2',
            [task.project_id, req.user.id]
          );

          for (const member of members.rows) {
            await createNotification(
              client,
              member.user_id,
              null,
              'Task Completed',
              `Task "${task.title}" was marked as completed in project: ${projectInfo.rows[0].title}`,
              'task_completed',
              task.project_id
            );
          }
        }
      }
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount}`);
      params.push(assignedTo);
      paramCount++;
    }

    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      params.push(dueDate);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `UPDATE project_tasks SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await client.query(query, params);

    await client.query('COMMIT');

    res.json({
      message: 'Task updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  } finally {
    client.release();
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await pool.query('DELETE FROM project_tasks WHERE id = $1', [taskId]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// Member management functions
const addMember = async (req, res) => {
  const client = await pool.connect();
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE
       SET role = EXCLUDED.role
       RETURNING *`,
      [projectId, userId, role || 'collaborator', req.user.id]
    );

    // Notify new member
    const projectInfo = await client.query(
      'SELECT title FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectInfo.rows.length > 0) {
      await createNotification(
        client,
        userId,
        null,
        'Added to Project',
        `You've been added to project: ${projectInfo.rows[0].title}`,
        'project_assigned',
        projectId
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Member added successfully',
      member: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  } finally {
    client.release();
  }
};

const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, memberId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Get project stats
const getStats = async (req, res) => {
  try {
    let whereClause = '1=1';
    const params = [];

    if (req.user.role !== 'admin') {
      whereClause = `id IN (SELECT project_id FROM project_members WHERE user_id = $1)
                     OR created_by = $1`;
      params.push(req.user.id);
    }

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'planning') as planning,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'on_hold') as on_hold,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue
      FROM projects
      WHERE ${whereClause}`,
      params
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addComment,
  createTask,
  updateTask,
  deleteTask,
  addMember,
  removeMember,
  getStats
};

