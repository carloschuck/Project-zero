const nodemailer = require('nodemailer');
const pool = require('../config/database');

let transporter;
let emailSettings = {};

// Fetch email settings from database
const fetchEmailSettings = async () => {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value 
       FROM system_settings 
       WHERE setting_key LIKE 'smtp_%' OR setting_key LIKE 'email_%' OR setting_key LIKE 'notify_%' OR setting_key LIKE 'org_%'`
    );

    const settings = result.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});

    return settings;
  } catch (error) {
    console.error('Failed to fetch email settings:', error);
    // Fallback to environment variables
    return {
      smtp_host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      smtp_port: process.env.EMAIL_PORT || '587',
      smtp_secure: 'true',
      smtp_username: process.env.EMAIL_USER || '',
      smtp_password: process.env.EMAIL_PASSWORD || '',
      email_from_address: process.env.EMAIL_FROM || 'noreply@ticketing.com',
      email_from_name: 'Ticketing System',
    };
  }
};

// Check if notification preference is enabled
const isNotificationEnabled = async (settingKey) => {
  try {
    const result = await pool.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = $1',
      [settingKey]
    );
    
    if (result.rows.length === 0) {
      return true; // Default to enabled if setting doesn't exist
    }
    
    return result.rows[0].setting_value === 'true';
  } catch (error) {
    console.error('Failed to check notification preference:', error);
    return true; // Default to enabled on error
  }
};

// Initialize email transporter
const initEmailTransporter = async () => {
  try {
    emailSettings = await fetchEmailSettings();

    // Only create transporter if credentials are provided
    if (!emailSettings.smtp_username || !emailSettings.smtp_password) {
      console.warn('Email credentials not configured. Email notifications disabled.');
      return;
    }

    transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host || 'smtp.gmail.com',
      port: parseInt(emailSettings.smtp_port) || 587,
      secure: emailSettings.smtp_secure === 'true',
      auth: {
        user: emailSettings.smtp_username,
        pass: emailSettings.smtp_password,
      },
    });

    console.log('✉️  Email transporter initialized');
  } catch (error) {
    console.error('Email transporter initialization failed:', error);
  }
};

const sendRequestEmail = async (type, request, user, extraData = {}) => {
  try {
    // Check notification preferences first
    let notificationEnabled = true;
    
    switch (type) {
      case 'created':
        notificationEnabled = await isNotificationEnabled('notify_on_request_created');
        break;
      case 'updated':
        notificationEnabled = await isNotificationEnabled('notify_user_on_status_change');
        break;
      case 'assigned':
        notificationEnabled = await isNotificationEnabled('notify_on_request_assigned');
        break;
      case 'comment':
        notificationEnabled = await isNotificationEnabled('notify_on_request_commented');
        break;
      case 'admin_new_request':
        notificationEnabled = await isNotificationEnabled('notify_admin_on_new_request');
        break;
    }

    if (!notificationEnabled) {
      console.log(`⏭️  Email notification skipped for ${type} - preference disabled`);
      return;
    }

    // Refresh email settings and transporter
    if (!transporter) {
      await initEmailTransporter();
    }

    if (!transporter) {
      console.warn('Email transporter not configured - skipping email');
      return;
    }

    // Refresh settings to get org_name
    emailSettings = await fetchEmailSettings();

    let subject, html;
    const orgName = emailSettings.org_name || 'Ticketing System';

    switch (type) {
      case 'created':
        subject = `Request Created: ${request.ticket_number}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">New Request Created</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.first_name},</p>
              <p>Your request has been created successfully.</p>
              
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Request Number:</strong> ${request.ticket_number}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: #10B981; color: white; padding: 2px 8px; border-radius: 4px;">${request.status}</span></p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> ${request.priority}</p>
              </div>
              
              <p>You can track your request in the dashboard.</p>
              
              <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
              <p style="color: #6B7280; font-size: 12px;">
                This email was sent from ${orgName}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;
        break;

      case 'updated':
        subject = `Request Updated: ${request.ticket_number}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">Request Status Updated</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.first_name},</p>
              <p>Your request status has been updated.</p>
              
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Request Number:</strong> ${request.ticket_number}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject}</p>
                <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="background-color: #3B82F6; color: white; padding: 2px 8px; border-radius: 4px;">${request.status}</span></p>
              </div>
              
              <p>Check the dashboard for more details.</p>
              
              <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
              <p style="color: #6B7280; font-size: 12px;">
                This email was sent from ${orgName}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;
        break;

      case 'assigned':
        subject = `Request Assigned: ${request.ticket_number}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">Request Assigned to You</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.first_name},</p>
              <p>A new request has been assigned to you.</p>
              
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Request Number:</strong> ${request.ticket_number}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> ${request.priority}</p>
                <p style="margin: 5px 0;"><strong>Description:</strong> ${request.description}</p>
              </div>
              
              <p>Please review and take action on this request.</p>
              
              <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
              <p style="color: #6B7280; font-size: 12px;">
                This email was sent from ${orgName}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;
        break;

      case 'comment':
        const commenter = extraData.commenterName || 'Someone';
        const comment = extraData.comment || '';
        subject = `New Comment on Request: ${request.ticket_number}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">New Comment on Your Request</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello ${user.first_name},</p>
              <p><strong>${commenter}</strong> has commented on your request.</p>
              
              <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Request Number:</strong> ${request.ticket_number}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject}</p>
              </div>

              <div style="background-color: #FFF; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;">${comment}</p>
              </div>
              
              <p>Check the dashboard to view the full conversation and respond.</p>
              
              <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
              <p style="color: #6B7280; font-size: 12px;">
                This email was sent from ${orgName}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;
        break;

      case 'admin_new_request':
        const creator = extraData.creatorName || 'A user';
        subject = `New Request Submitted: ${request.ticket_number}`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">🔔 New Request Created</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Hello,</p>
              <p><strong>${creator}</strong> has submitted a new request that requires attention.</p>
              
              <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #DC2626;">
                <p style="margin: 5px 0;"><strong>Request Number:</strong> ${request.ticket_number}</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${request.subject}</p>
                <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="text-transform: uppercase; color: #DC2626; font-weight: bold;">${request.priority}</span></p>
                <p style="margin: 5px 0;"><strong>Category:</strong> ${extraData.categoryName || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${request.status}</p>
              </div>

              <div style="background-color: #F9FAFB; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;"><strong>Description:</strong></p>
                <p style="margin: 10px 0 0 0; color: #6B7280;">${request.description}</p>
              </div>
              
              <p>Please review and assign this request as needed.</p>
              
              <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
              <p style="color: #6B7280; font-size: 12px;">
                This email was sent from ${orgName}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;
        break;

      default:
        return;
    }

    await transporter.sendMail({
      from: `"${emailSettings.email_from_name || 'Ticketing System'}" <${emailSettings.email_from_address || 'noreply@ticketing.com'}>`,
      to: user.email,
      subject,
      html,
    });

    console.log(`✉️  Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error('Send email error:', error);
    // Don't throw error - email failures shouldn't break the main flow
  }
};

module.exports = { initEmailTransporter, sendRequestEmail, isNotificationEnabled };


