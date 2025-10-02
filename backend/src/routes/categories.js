const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().trim(),
  body('department').optional().trim()
];

// Routes
router.get('/', authenticateToken, getCategories);
router.post('/', authenticateToken, authorizeRoles('admin'), categoryValidation, createCategory);
router.patch('/:id', authenticateToken, authorizeRoles('admin'), updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteCategory);

module.exports = router;


