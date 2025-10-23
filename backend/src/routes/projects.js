const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
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
} = require('../controllers/projectController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Project routes
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('source').optional().isIn(['meeting', 'email', 'text', 'phone', 'other']),
    body('startDate').optional().isISO8601(),
    body('dueDate').optional().isISO8601(),
  ],
  createProject
);

router.get('/', getProjects);
router.get('/stats', getStats);
router.get('/:id', getProjectById);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('startDate').optional().isISO8601(),
    body('dueDate').optional().isISO8601(),
  ],
  updateProject
);

router.delete('/:id', deleteProject);

// Comment routes
router.post(
  '/:id/comments',
  [body('comment').trim().notEmpty().withMessage('Comment is required')],
  addComment
);

// Task routes
router.post(
  '/:projectId/tasks',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('assignedTo').optional().isUUID(),
    body('dueDate').optional().isISO8601(),
  ],
  createTask
);

router.put(
  '/:projectId/tasks/:taskId',
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('assignedTo').optional().isUUID(),
    body('dueDate').optional().isISO8601(),
  ],
  updateTask
);

router.delete('/:projectId/tasks/:taskId', deleteTask);

// Member routes
router.post(
  '/:projectId/members',
  [
    body('userId').isUUID().withMessage('Valid user ID is required'),
    body('role').optional().isIn(['owner', 'collaborator', 'viewer']),
  ],
  addMember
);

router.delete('/:projectId/members/:memberId', removeMember);

module.exports = router;

