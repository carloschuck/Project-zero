const pool = require('../config/database');
const { validationResult } = require('express-validator');
const { createNotification } = require('../utils/notifications');
const { sendRequestEmail } = require('../utils/email');

const generateRequestNumber = async (client, categoryId) => {
  // Get category name
  const categoryResult = await client.query(
    'SELECT name FROM categories WHERE id = $1',
    [categoryId]
  );
  
  if (categoryResult.rows.length === 0) {
    throw new Error('Category not found');
  }
  
  const categoryName = categoryResult.rows[0].name;
  // Get first 3 letters of category (remove spaces, uppercase)
  const prefix = categoryName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  
  // Get the last request number for this category
  const lastRequestResult = await client.query(
    `SELECT ticket_number FROM tickets 
     WHERE ticket_number LIKE $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [`${prefix}-%`]
  );
  
  let nextNumber = 1;
  if (lastRequestResult.rows.length > 0) {
    const lastNumber = lastRequestResult.rows[0].ticket_number;
    const match = lastNumber.match(/-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  // Format as 3-digit number (001, 002, etc.)
  const numberPart = nextNumber.toString().padStart(3, '0');
  return `${prefix}-${numberPart}`;
};

const createTicket = async (req, res) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId, subject, description, priority, metadata } = req.body;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Generate unique request number based on category
    const requestNumber = await generateRequestNumber(client, categoryId);

    // Create request with metadata
    const requestResult = await client.query(
      `INSERT INTO tickets (ticket_number, user_id, category_id, subject, description, priority, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7)
       RETURNING *`,
      [requestNumber, userId, categoryId, subject, description, priority || 'medium', JSON.stringify(metadata || {})]
    );

    const request = requestResult.rows[0];

    // Add to history
    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, action, new_value)
       VALUES ($1, $2, 'created', $3)`,
      [request.id, userId, `Request created with status: open`]
    );

    // Create notification for admins and department leads
    const adminUsers = await client.query(
      `SELECT id FROM users WHERE role IN ('admin', 'department_lead') AND is_active = true`
    );

    for (const admin of adminUsers.rows) {
      await createNotification(
        client,
        admin.id,
        request.id,
        'New Request Created',
        `${req.user.first_name} ${req.user.last_name} created request ${requestNumber}: ${subject}`,
        'ticket_created'
      );
    }

    await client.query('COMMIT');

    // Send email notification (async, don't wait)
    sendRequestEmail('created', request, req.user).catch(err => 
      console.error('Email notification failed:', err)
    );

    res.status(201).json({
      message: 'Request created successfully',
      request: request
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  } finally {
    client.release();
  }
};

const getTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10, search, owner } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        c.name as category_name,
        a.first_name as assigned_first_name,
        a.last_name as assigned_last_name,
        (SELECT COUNT(*) FROM comments WHERE ticket_id = t.id) as comment_count
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Owner filter - overrides role-based filtering for admins
    if (owner === 'assigned_to_me') {
      // Show only requests assigned to the current user
      query += ` AND t.assigned_to = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (owner === 'created_by_me') {
      // Show only requests created by the current user
      query += ` AND t.user_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (owner === 'all_requests') {
      // For admins and department leads, show all requests they have access to
      if (req.user.role === 'department_lead') {
        query += ` AND (c.department = $${paramCount} OR t.assigned_to = $${paramCount + 1})`;
        params.push(req.user.department, req.user.id);
        paramCount += 2;
      } else if (req.user.role === 'event_coordinator') {
        query += ` AND (c.name LIKE '%Event%' OR t.assigned_to = $${paramCount})`;
        params.push(req.user.id);
        paramCount++;
      }
      // Admins see everything, no additional filter
    } else {
      // Default role-based filtering when no owner filter is specified
      if (req.user.role === 'user') {
        query += ` AND t.user_id = $${paramCount}`;
        params.push(req.user.id);
        paramCount++;
      } else if (req.user.role === 'department_lead') {
        query += ` AND (c.department = $${paramCount} OR t.assigned_to = $${paramCount + 1})`;
        params.push(req.user.department, req.user.id);
        paramCount += 2;
      } else if (req.user.role === 'event_coordinator') {
        query += ` AND (c.name LIKE '%Event%' OR t.assigned_to = $${paramCount})`;
        params.push(req.user.id);
        paramCount++;
      }
    }

    // Search filter
    if (search) {
      query += ` AND (
        t.ticket_number ILIKE $${paramCount} OR 
        t.subject ILIKE $${paramCount} OR 
        t.description ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Additional filters
    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND t.category_id = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count with same filters
    let countQuery = 'SELECT COUNT(*) FROM tickets t JOIN users u ON t.user_id = u.id JOIN categories c ON t.category_id = c.id WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    // Apply same owner filter
    if (owner === 'assigned_to_me') {
      countQuery += ` AND t.assigned_to = $${countParamCount}`;
      countParams.push(req.user.id);
      countParamCount++;
    } else if (owner === 'created_by_me') {
      countQuery += ` AND t.user_id = $${countParamCount}`;
      countParams.push(req.user.id);
      countParamCount++;
    } else if (owner === 'all_requests') {
      if (req.user.role === 'department_lead') {
        countQuery += ` AND (c.department = $${countParamCount} OR t.assigned_to = $${countParamCount + 1})`;
        countParams.push(req.user.department, req.user.id);
        countParamCount += 2;
      } else if (req.user.role === 'event_coordinator') {
        countQuery += ` AND (c.name LIKE '%Event%' OR t.assigned_to = $${countParamCount})`;
        countParams.push(req.user.id);
        countParamCount++;
      }
    } else {
      // Default role-based filtering
      if (req.user.role === 'user') {
        countQuery += ` AND t.user_id = $${countParamCount}`;
        countParams.push(req.user.id);
        countParamCount++;
      } else if (req.user.role === 'department_lead') {
        countQuery += ` AND (c.department = $${countParamCount} OR t.assigned_to = $${countParamCount + 1})`;
        countParams.push(req.user.department, req.user.id);
        countParamCount += 2;
      } else if (req.user.role === 'event_coordinator') {
        countQuery += ` AND (c.name LIKE '%Event%' OR t.assigned_to = $${countParamCount})`;
        countParams.push(req.user.id);
        countParamCount++;
      }
    }

    // Apply same search filter
    if (search) {
      countQuery += ` AND (
        t.ticket_number ILIKE $${countParamCount} OR 
        t.subject ILIKE $${countParamCount} OR 
        t.description ILIKE $${countParamCount} OR
        u.first_name ILIKE $${countParamCount} OR
        u.last_name ILIKE $${countParamCount}
      )`;
      countParams.push(`%${search}%`);
      countParamCount++;
    }

    if (status) {
      countQuery += ` AND t.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (category) {
      countQuery += ` AND t.category_id = $${countParamCount}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      requests: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        t.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        c.name as category_name,
        c.department as category_department,
        a.first_name as assigned_first_name,
        a.last_name as assigned_last_name,
        a.email as assigned_email
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      JOIN categories c ON t.category_id = c.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const ticket = result.rows[0];

    // Authorization check
    if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get comments (filter internal notes based on role)
    let commentsQuery = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.ticket_id = $1
    `;
    
    // Filter internal notes for non-privileged users
    if (req.user.role !== 'admin' && req.user.role !== 'department_lead') {
      commentsQuery += ` AND c.is_internal = false`;
    }
    
    commentsQuery += ` ORDER BY c.created_at ASC`;
    
    const comments = await pool.query(commentsQuery, [id]);

    // Get attachments
    const attachments = await pool.query(
      `SELECT * FROM attachments WHERE ticket_id = $1`,
      [id]
    );

    // Get history
    const history = await pool.query(
      `SELECT 
        h.*,
        u.first_name,
        u.last_name
      FROM ticket_history h
      JOIN users u ON h.user_id = u.id
      WHERE h.ticket_id = $1
      ORDER BY h.created_at DESC`,
      [id]
    );

    res.json({
      request: ticket,
      comments: comments.rows,
      attachments: attachments.rows,
      history: history.rows
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

const updateTicket = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, subject, description } = req.body;

    // Check authorization
    const ticketCheck = await client.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const ticket = ticketCheck.rows[0];

    if (req.user.role === 'user' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await client.query('BEGIN');

    const updates = [];
    const params = [id];
    let paramCount = 2;

    // Subject update (admin only)
    if (subject && req.user.role === 'admin') {
      updates.push(`subject = $${paramCount}`);
      params.push(subject);
      paramCount++;

      // Add to history
      await client.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
         VALUES ($1, $2, 'subject_updated', $3, $4)`,
        [id, req.user.id, ticket.subject, subject]
      );
    }

    // Description update (admin only)
    if (description && req.user.role === 'admin') {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;

      // Add to history
      await client.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
         VALUES ($1, $2, 'description_updated', $3, $4)`,
        [id, req.user.id, 'Description updated', 'New description']
      );
    }

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;

      // Add to history
      await client.query(
        `INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
         VALUES ($1, $2, 'status_changed', $3, $4)`,
        [id, req.user.id, ticket.status, status]
      );

      // Create notification
      await createNotification(
        client,
        ticket.user_id,
        id,
        'Request Status Updated',
        `Your request status changed to: ${status}`,
        'status_changed'
      );
    }

    if (priority) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount}`);
      params.push(assignedTo);
      paramCount++;

      if (assignedTo) {
        // Create notification for assigned user
        await createNotification(
          client,
          assignedTo,
          id,
          'Request Assigned',
          `You have been assigned to request ${ticket.ticket_number}`,
          'ticket_assigned'
        );
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await client.query(query, params);

    await client.query('COMMIT');

    res.json({
      message: 'Request updated successfully',
      request: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  } finally {
    client.release();
  }
};

const addComment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { comment, isInternal } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO comments (ticket_id, user_id, comment, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.user.id, comment, isInternal || false]
    );

    // Get request info
    const requestInfo = await client.query(
      'SELECT user_id, ticket_number FROM tickets WHERE id = $1',
      [id]
    );

    if (requestInfo.rows.length > 0) {
      const request = requestInfo.rows[0];
      
      // Notify request owner if commenter is different
      if (request.user_id !== req.user.id && !isInternal) {
        await createNotification(
          client,
          request.user_id,
          id,
          'New Comment',
          `${req.user.first_name} ${req.user.last_name} commented on request ${request.ticket_number}`,
          'comment_added'
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

const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if request exists
    const requestCheck = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Delete request (cascade will handle related records)
    await pool.query(
      'DELETE FROM tickets WHERE id = $1',
      [id]
    );

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
};

const getStats = async (req, res) => {
  try {
    let whereClause = '1=1';
    const params = [];

    if (req.user.role === 'user') {
      whereClause = 'user_id = $1';
      params.push(req.user.id);
    } else if (req.user.role === 'department_lead') {
      whereClause = 'category_id IN (SELECT id FROM categories WHERE department = $1)';
      params.push(req.user.department);
    }

    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved,
        COUNT(*) FILTER (WHERE status = 'closed') as closed
      FROM tickets
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
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  deleteTicket,
  getStats
};


