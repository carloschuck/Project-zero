-- Create email_templates table for customizable email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on template_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Add trigger to update updated_at
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO email_templates (template_key, name, subject, body, description) VALUES
  ('request_created', 'Request Created (User)', 'Request Created: {{ticket_number}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">New Request Created</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p>Your request has been created successfully.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Category:</strong> {{category_name}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background-color: #10B981; color: white; padding: 2px 8px; border-radius: 4px;">{{status}}</span></p>
      <p style="margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>
    </div>
    
    <p>You can track your request in the dashboard.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent to user when a new request is created'),

  ('request_updated', 'Request Updated (User)', 'Request Updated: {{ticket_number}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Request Status Updated</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p>Your request status has been updated.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>New Status:</strong> <span style="background-color: #3B82F6; color: white; padding: 2px 8px; border-radius: 4px;">{{status}}</span></p>
      <p style="margin: 5px 0;"><strong>Updated By:</strong> {{updated_by}}</p>
    </div>
    
    <p>Check the dashboard for more details.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent to user when request status is updated'),

  ('request_assigned', 'Request Assigned (Staff)', 'Request Assigned: {{ticket_number}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Request Assigned to You</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{assigned_to_name}},</p>
    <p>A new request has been assigned to you by {{assigned_by}}.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>
      <p style="margin: 5px 0;"><strong>Category:</strong> {{category_name}}</p>
      <p style="margin: 5px 0;"><strong>Requester:</strong> {{user_name}}</p>
    </div>
    
    <p>Please review and take action on this request.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent to staff when a request is assigned to them'),

  ('request_commented', 'Request Comment Added', 'New Comment on Request: {{ticket_number}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">New Comment Added</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p>A new comment has been added to your request.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Comment By:</strong> {{commenter_name}}</p>
      <p style="margin: 5px 0;"><strong>Comment:</strong></p>
      <div style="background-color: white; padding: 10px; border-radius: 4px; border-left: 4px solid #4F46E5;">
        {{comment_text}}
      </div>
    </div>
    
    <p>Check the dashboard for more details.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent when a comment is added to a request'),

  ('project_created', 'Project Created', 'New Project Created: {{project_title}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">New Project Created</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p>A new project has been created and you have been added as a member.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Project Number:</strong> {{project_number}}</p>
      <p style="margin: 5px 0;"><strong>Title:</strong> {{project_title}}</p>
      <p style="margin: 5px 0;"><strong>Priority:</strong> {{priority}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
      <p style="margin: 5px 0;"><strong>Owner:</strong> {{owner_name}}</p>
    </div>
    
    <p>You can view and contribute to this project in the dashboard.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent when a new project is created'),

  ('project_updated', 'Project Updated', 'Project Updated: {{project_title}}', 
   '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Project Updated</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p>The project you are involved in has been updated.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Project Number:</strong> {{project_number}}</p>
      <p style="margin: 5px 0;"><strong>Title:</strong> {{project_title}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
      <p style="margin: 5px 0;"><strong>Updated By:</strong> {{updated_by}}</p>
    </div>
    
    <p>Check the dashboard for more details.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>', 
   'Email sent when a project is updated')

ON CONFLICT (template_key) DO NOTHING;
