const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  sendTestEmail,
  sendTestTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  sendTestTemplateFromDB
} = require('../controllers/settingsController');

// All settings routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/test-email', sendTestEmail);
router.post('/test-template', sendTestTemplate);

// Email template routes
router.get('/email-templates', getEmailTemplates);
router.put('/email-templates/:templateKey', updateEmailTemplate);
router.post('/test-template-db', sendTestTemplateFromDB);

module.exports = router;

