const express = require('express');
const { body } = require('express-validator');
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  addComment,
  deleteTicket,
  getStats
} = require('../controllers/ticketController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createTicketValidation = [
  body('categoryId').isUUID(),
  body('subject').trim().notEmpty().isLength({ max: 255 }),
  body('description').trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
];

const updateTicketValidation = [
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignedTo').optional().isUUID()
];

const addCommentValidation = [
  body('comment').trim().notEmpty(),
  body('isInternal').optional().isBoolean()
];

// Routes
router.get('/stats', authenticateToken, getStats);
router.get('/', authenticateToken, getTickets);
router.get('/:id', authenticateToken, getTicketById);
router.post('/', authenticateToken, createTicketValidation, createTicket);
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'department_lead', 'event_coordinator'), updateTicketValidation, updateTicket);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteTicket);
router.post('/:id/comments', authenticateToken, addCommentValidation, addComment);

module.exports = router;


