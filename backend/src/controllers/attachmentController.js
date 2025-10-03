const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

const uploadAttachment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify ticket exists and user has access
    const ticketResult = await pool.query(
      `SELECT id, user_id FROM tickets WHERE id = $1`,
      [ticketId]
    );

    if (ticketResult.rows.length === 0) {
      // Delete uploaded file if ticket doesn't exist
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = ticketResult.rows[0];

    // Check if user has permission to add attachments
    // User can add if they're the ticket owner, admin, or department_lead
    const canAddAttachment = 
      ticket.user_id === req.user.id || 
      req.user.role === 'admin' || 
      req.user.role === 'department_lead';

    if (!canAddAttachment) {
      fs.unlinkSync(file.path);
      return res.status(403).json({ error: 'You do not have permission to add attachments to this ticket' });
    }

    // Save attachment info to database
    const result = await pool.query(
      `INSERT INTO attachments (ticket_id, filename, original_filename, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        ticketId,
        file.filename,
        file.originalname,
        file.path,
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
    console.error('Upload attachment error:', error);
    // Clean up file if database operation fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
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
      `SELECT a.*, t.user_id, t.id as ticket_id
       FROM attachments a
       JOIN tickets t ON a.ticket_id = t.id
       WHERE a.id = $1`,
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = result.rows[0];

    // Check if user has permission to download
    const canDownload = 
      attachment.user_id === req.user.id || 
      req.user.role === 'admin' || 
      req.user.role === 'department_lead' ||
      req.user.role === 'event_coordinator';

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
      `SELECT a.*, t.user_id
       FROM attachments a
       JOIN tickets t ON a.ticket_id = t.id
       WHERE a.id = $1`,
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = result.rows[0];

    // Only uploader or admin can delete
    const canDelete = 
      attachment.uploaded_by === req.user.id || 
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

