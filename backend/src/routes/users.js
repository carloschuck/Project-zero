const express = require('express');
const { body } = require('express-validator');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  resetUserPassword
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['admin', 'user', 'department_lead', 'event_coordinator']),
  body('department').optional().trim()
];

const updateUserValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'user', 'department_lead', 'event_coordinator']),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean()
];

const changePasswordValidation = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
];

const resetPasswordValidation = [
  body('newPassword').isLength({ min: 6 })
];

// Routes (admin only except password change)
router.post('/', authenticateToken, authorizeRoles('admin'), createUserValidation, createUser);
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUserById);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), updateUserValidation, updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);
router.post('/change-password', authenticateToken, changePasswordValidation, changePassword);
router.post('/:id/reset-password', authenticateToken, authorizeRoles('admin'), resetPasswordValidation, resetUserPassword);

module.exports = router;


