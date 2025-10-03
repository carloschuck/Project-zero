const express = require('express');
const upload = require('../config/multer');
const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Upload attachment to a ticket
router.post(
  '/tickets/:ticketId/attachments',
  authenticateToken,
  upload.single('file'),
  uploadAttachment
);

// Get all attachments for a ticket
router.get(
  '/tickets/:ticketId/attachments',
  authenticateToken,
  getAttachments
);

// Download specific attachment
router.get(
  '/attachments/:attachmentId/download',
  authenticateToken,
  downloadAttachment
);

// Delete attachment (uploader or admin only)
router.delete(
  '/attachments/:attachmentId',
  authenticateToken,
  deleteAttachment
);

module.exports = router;

