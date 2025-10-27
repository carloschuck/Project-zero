const pool = require('../config/database');
const nodemailer = require('nodemailer');

const getSettings = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value, setting_type FROM system_settings ORDER BY setting_key ASC'
    );

    // Convert to key-value object
    const settings = result.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const { settings } = req.body;

    await client.query('BEGIN');

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO system_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    client.release();
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    // Get email settings
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key LIKE 'smtp_%' OR setting_key LIKE 'email_%'`
    );

    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: parseInt(settings.smtp_port) || 587,
      secure: settings.smtp_secure === 'true',
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });

    // Send test email
    const info = await transporter.sendMail({
      from: `"${settings.email_from_name || 'Ticketing System'}" <${settings.email_from_address || 'noreply@ticketing.com'}>`,
      to: recipient,
      subject: 'Test Email from Ticketing System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">✅ Email Configuration Test</h2>
          <p>Congratulations! Your email configuration is working correctly.</p>
          <p>This is a test email sent from your Ticketing System.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 14px;">
            <strong>Email Settings:</strong><br>
            SMTP Host: ${settings.smtp_host}<br>
            SMTP Port: ${settings.smtp_port}<br>
            Secure: ${settings.smtp_secure === 'true' ? 'Yes (SSL/TLS)' : 'No'}<br>
            From: ${settings.email_from_name} &lt;${settings.email_from_address}&gt;
          </p>
        </div>
      `,
    });

    res.json({ 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
};

const sendTestTemplate = async (req, res) => {
  try {
    const { recipient, template, subject, body } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    // Get email settings
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key LIKE 'smtp_%' OR setting_key LIKE 'email_%'`
    );

    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: parseInt(settings.smtp_port) || 587,
      secure: settings.smtp_secure === 'true',
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });

    // Replace template variables with sample data
    const processedSubject = subject
      .replace(/\{\{user_name\}\}/g, 'John Doe')
      .replace(/\{\{ticket_number\}\}/g, 'REQ-2024-001')
      .replace(/\{\{subject\}\}/g, 'Sample Request Subject')
      .replace(/\{\{status\}\}/g, 'open')
      .replace(/\{\{priority\}\}/g, 'high')
      .replace(/\{\{org_name\}\}/g, settings.email_from_name || 'Ticketing System');

    const processedBody = body
      .replace(/\{\{user_name\}\}/g, 'John Doe')
      .replace(/\{\{ticket_number\}\}/g, 'REQ-2024-001')
      .replace(/\{\{subject\}\}/g, 'Sample Request Subject')
      .replace(/\{\{status\}\}/g, 'open')
      .replace(/\{\{priority\}\}/g, 'high')
      .replace(/\{\{description\}\}/g, 'This is a sample description of the request.')
      .replace(/\{\{org_name\}\}/g, settings.email_from_name || 'Ticketing System');

    // Send test email
    const info = await transporter.sendMail({
      from: `"${settings.email_from_name || 'Ticketing System'}" <${settings.email_from_address || 'noreply@ticketing.com'}>`,
      to: recipient,
      subject: `[TEST] ${processedSubject}`,
      html: processedBody,
    });

    res.json({ 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Send test template error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
};

const getEmailTemplates = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_templates WHERE is_active = true ORDER BY template_key ASC'
    );

    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
};

const updateEmailTemplate = async (req, res) => {
  const client = await pool.connect();
  try {
    const { templateKey } = req.params;
    const { name, subject, body, description } = req.body;

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE email_templates 
       SET name = $1, subject = $2, body = $3, description = $4, updated_at = CURRENT_TIMESTAMP
       WHERE template_key = $5
       RETURNING *`,
      [name, subject, body, description, templateKey]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email template not found' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Email template updated successfully',
      template: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update email template error:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  } finally {
    client.release();
  }
};

const sendTestTemplateFromDB = async (req, res) => {
  try {
    const { recipient, templateKey } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    if (!templateKey) {
      return res.status(400).json({ error: 'Template key is required' });
    }

    // Get email template
    const templateResult = await pool.query(
      'SELECT * FROM email_templates WHERE template_key = $1 AND is_active = true',
      [templateKey]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Email template not found' });
    }

    const template = templateResult.rows[0];

    // Get email settings
    const settingsResult = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key LIKE 'smtp_%' OR setting_key LIKE 'email_%'`
    );

    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: parseInt(settings.smtp_port) || 587,
      secure: settings.smtp_secure === 'true',
      auth: {
        user: settings.smtp_username,
        pass: settings.smtp_password,
      },
    });

    // Replace template variables with sample data
    const processedSubject = template.subject
      .replace(/\{\{user_name\}\}/g, 'John Doe')
      .replace(/\{\{ticket_number\}\}/g, 'REQ-2024-001')
      .replace(/\{\{subject\}\}/g, 'Sample Request Subject')
      .replace(/\{\{status\}\}/g, 'open')
      .replace(/\{\{priority\}\}/g, 'high')
      .replace(/\{\{project_number\}\}/g, 'PRJ-0001')
      .replace(/\{\{project_title\}\}/g, 'Sample Project')
      .replace(/\{\{org_name\}\}/g, settings.email_from_name || 'Ticketing System');

    const processedBody = template.body
      .replace(/\{\{user_name\}\}/g, 'John Doe')
      .replace(/\{\{ticket_number\}\}/g, 'REQ-2024-001')
      .replace(/\{\{subject\}\}/g, 'Sample Request Subject')
      .replace(/\{\{status\}\}/g, 'open')
      .replace(/\{\{priority\}\}/g, 'high')
      .replace(/\{\{description\}\}/g, 'This is a sample description of the request.')
      .replace(/\{\{project_number\}\}/g, 'PRJ-0001')
      .replace(/\{\{project_title\}\}/g, 'Sample Project')
      .replace(/\{\{org_name\}\}/g, settings.email_from_name || 'Ticketing System');

    // Send test email
    const info = await transporter.sendMail({
      from: `"${settings.email_from_name || 'Ticketing System'}" <${settings.email_from_address || 'noreply@ticketing.com'}>`,
      to: recipient,
      subject: `[TEST] ${processedSubject}`,
      html: processedBody,
    });

    res.json({ 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Send test template error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  sendTestEmail,
  sendTestTemplate,
  getEmailTemplates,
  updateEmailTemplate,
  sendTestTemplateFromDB
};

