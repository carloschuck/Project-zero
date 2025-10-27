-- Add missing project email templates
INSERT INTO email_templates (template_key, name, subject, body, description) VALUES
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
