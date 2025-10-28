const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const uploadAttachment = async (req, res) => {
  try {
    console.log('📁 Upload attachment started:', {
      ticketId: req.params.ticketId,
      projectId: req.params.projectId,
      userId: req.user?.id,
      userRole: req.user?.role,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      } : null
    });

    const { ticketId, projectId } = req.params;
    const file = req.file;
    const entityType = req.body.entity_type || 'ticket';

    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let canAddAttachment = false;

    if (ticketId) {
      // Verify ticket exists and user has access
      const ticketResult = await pool.query(
        `SELECT id, user_id FROM tickets WHERE id = $1`,
        [ticketId]
      );

      if (ticketResult.rows.length === 0) {
        // Only try to delete file if it's on disk (not memory storage)
        if (file.path) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const ticket = ticketResult.rows[0];
      canAddAttachment = 
        ticket.user_id === req.user.id || 
        req.user.role === 'admin' || 
        req.user.role === 'department_lead';
    } else if (projectId) {
      // Verify project exists and user has access
      const projectResult = await pool.query(
        `SELECT p.id, p.owner_id, pm.user_id as member_id
         FROM projects p
         LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
         WHERE p.id = $2`,
        [req.user.id, projectId]
      );

      if (projectResult.rows.length === 0) {
        // Only try to delete file if it's on disk (not memory storage)
        if (file.path) {
          fs.unlinkSync(file.path);
        }
        return res.status(404).json({ error: 'Project not found' });
      }

      const project = projectResult.rows[0];
      
      // Debug logging
      console.log('Project upload debug:', {
        userId: req.user.id,
        userRole: req.user.role,
        projectOwnerId: project.owner_id,
        memberId: project.member_id,
        isOwner: project.owner_id === req.user.id,
        isMember: project.member_id !== null,
        isAdmin: req.user.role === 'admin'
      });
      
      canAddAttachment = 
        project.owner_id === req.user.id || 
        project.member_id !== null ||
        req.user.role === 'admin';
    } else {
      // Only try to delete file if it's on disk (not memory storage)
      if (file.path) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'Either ticketId or projectId is required' });
    }

    if (!canAddAttachment) {
      // Only try to delete file if it's on disk (not memory storage)
      if (file.path) {
        fs.unlinkSync(file.path);
      }
      return res.status(403).json({ error: 'You do not have permission to add attachments' });
    }

    // Generate unique filename for database storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const dbFilename = `${nameWithoutExt}-${uniqueSuffix}${ext}`;

    // Save attachment info to database
    const result = await pool.query(
      `INSERT INTO attachments (ticket_id, project_id, entity_type, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        ticketId || null,
        projectId || null,
        entityType,
        dbFilename,
        file.originalname,
        file.path || 'memory-storage', // Use placeholder for memory storage
        file.size,
        file.mimetype,
        req.user.id
      ]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: {
        ...result.rows[0],
        file_path: undefined // Don't expose server path
      }
    });
  } catch (error) {
    console.error('❌ Upload attachment error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Request details:', {
      ticketId: req.params.ticketId,
      projectId: req.params.projectId,
      userId: req.user?.id,
      hasFile: !!req.file,
      filePath: req.file?.path
    });
    
    // Clean up file if database operation fails (only for disk storage)
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('✅ Cleaned up uploaded file');
      } catch (unlinkError) {
        console.error('❌ Failed to delete file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

const getAttachments = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Verify ticket exists and user has access
    const ticketResult = await pool.query(
      `SELECT t.*, u.role 
       FROM tickets t
       JOIN users u ON u.id = $1
       WHERE t.id = $2`,
      [req.user.id, ticketId]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const result = await pool.query(
      `SELECT 
        a.*,
        u.first_name,
        u.last_name,
        u.email
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.ticket_id = $1
       ORDER BY a.uploaded_at DESC`,
      [ticketId]
    );

    // Don't expose file paths
    const attachments = result.rows.map(att => ({
      ...att,
      file_path: undefined
    }));

    res.json({ attachments });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({ error: 'Failed to fetch attachments' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const result = await pool.query(
      `SELECT a.*, 
        t.user_id as ticket_user_id,
        p.owner_id as project_owner_id,
        pm.user_id as project_member_id
       FROM attachments a
       LEFT JOIN tickets t ON a.ticket_id = t.id
       LEFT JOIN projects p ON a.project_id = p.id
       LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
       WHERE a.id = $2`,
      [req.user.id, attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = result.rows[0];

    // Check if user has permission to download
    let canDownload = req.user.role === 'admin' || 
                      req.user.role === 'department_lead' ||
                      req.user.role === 'event_coordinator';
    
    if (!canDownload && attachment.ticket_user_id) {
      canDownload = attachment.ticket_user_id === req.user.id;
    }
    
    if (!canDownload && attachment.project_owner_id) {
      canDownload = attachment.project_owner_id === req.user.id || attachment.project_member_id !== null;
    }

    if (!canDownload) {
      return res.status(403).json({ error: 'You do not have permission to download this attachment' });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Send file
    res.download(attachment.file_path, attachment.original_filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    console.error('Download attachment error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download attachment' });
    }
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const result = await pool.query(
      `SELECT a.*,
        p.owner_id as project_owner_id
       FROM attachments a
       LEFT JOIN projects p ON a.project_id = p.id
       WHERE a.id = $1`,
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = result.rows[0];

    // Only uploader, project owner, or admin can delete
    const canDelete = 
      attachment.uploaded_by === req.user.id || 
      attachment.project_owner_id === req.user.id ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({ error: 'You do not have permission to delete this attachment' });
    }

    // Delete from database
    await pool.query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

    // Delete file from filesystem
    if (fs.existsSync(attachment.file_path)) {
      try {
        fs.unlinkSync(attachment.file_path);
      } catch (fsError) {
        console.error('Failed to delete file from filesystem:', fsError);
        // Continue anyway since DB record is deleted
      }
    }

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

module.exports = {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
};

