const nodemailer = require('nodemailer');

let transporter;

// Initialize email transporter
const initEmailTransporter = () => {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    console.error('Email transporter initialization failed:', error);
  }
};

const sendRequestEmail = async (type, request, user) => {
  if (!transporter) {
    initEmailTransporter();
  }

  if (!transporter) {
    console.warn('Email transporter not configured');
    return;
  }

  try {
    let subject, html;

    switch (type) {
      case 'created':
        subject = `Request Created: ${request.ticket_number}`;
        html = `
          <h2>New Request Created</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your request has been created successfully.</p>
          <p><strong>Request Number:</strong> ${request.ticket_number}</p>
          <p><strong>Subject:</strong> ${request.subject}</p>
          <p><strong>Status:</strong> ${request.status}</p>
          <p>You can track your request in the dashboard.</p>
        `;
        break;

      case 'updated':
        subject = `Request Updated: ${request.ticket_number}`;
        html = `
          <h2>Request Status Updated</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your request status has been updated.</p>
          <p><strong>Request Number:</strong> ${request.ticket_number}</p>
          <p><strong>New Status:</strong> ${request.status}</p>
          <p>Check the dashboard for more details.</p>
        `;
        break;

      default:
        return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error('Send email error:', error);
    throw error;
  }
};

module.exports = { initEmailTransporter, sendRequestEmail };


