import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Mail, Bell, FileText, Send, Save, Eye, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('email');
  const [selectedTemplate, setSelectedTemplate] = useState('request_created');
  const [showPreview, setShowPreview] = useState(false);
  
  const [settings, setSettings] = useState({
    // Email Configuration
    smtp_host: '',
    smtp_port: '587',
    smtp_secure: 'true',
    smtp_username: '',
    smtp_password: '',
    email_from_address: '',
    email_from_name: '',
    
    // Notification Preferences
    notify_on_request_created: 'true',
    notify_on_request_updated: 'true',
    notify_on_request_assigned: 'true',
    notify_on_request_commented: 'true',
    notify_admin_on_new_request: 'true',
    notify_user_on_status_change: 'true',
  });

  const [emailTemplates, setEmailTemplates] = useState({
    request_created: {
      name: 'Request Created (User)',
      subject: 'Request Created: {{ticket_number}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
</div>`
    },
    request_updated: {
      name: 'Request Updated (User)',
      subject: 'Request Updated: {{ticket_number}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
</div>`
    },
    request_assigned: {
      name: 'Request Assigned (Staff)',
      subject: 'Request Assigned: {{ticket_number}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">Request Assigned to You</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{assigned_to_name}},</p>
    <p>A new request has been assigned to you by {{assigned_by}}.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Category:</strong> {{category_name}}</p>
      <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="background-color: #EF4444; color: white; padding: 2px 8px; border-radius: 4px;">{{priority}}</span></p>
      <p style="margin: 5px 0;"><strong>Requested By:</strong> {{user_name}} ({{user_email}})</p>
      <p style="margin: 5px 0;"><strong>Department:</strong> {{user_department}}</p>
      <p style="margin: 5px 0;"><strong>Created:</strong> {{created_at}}</p>
    </div>
    
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
      <p style="margin: 0; font-weight: bold; color: #92400E;">Description:</p>
      <p style="margin: 5px 0 0 0; color: #92400E;">{{description}}</p>
    </div>
    
    <p>Please review and take action on this request.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>`
    },
    request_commented: {
      name: 'New Comment (All Participants)',
      subject: 'New Comment on {{ticket_number}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">💬 New Comment Added</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello {{user_name}},</p>
    <p><strong>{{commenter_name}}</strong> added a comment to request <strong>{{ticket_number}}</strong>.</p>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
    </div>
    
    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3B82F6;">
      <p style="margin: 0; font-weight: bold; color: #1E40AF;">{{commenter_name}} wrote:</p>
      <p style="margin: 10px 0 0 0; color: #1E3A8A;">{{comment_text}}</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #6B7280;">{{comment_date}}</p>
    </div>
    
    <p>View the full conversation in the dashboard.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>`
    },
    admin_new_request: {
      name: 'New Request (Admin Notification)',
      subject: '🔔 New Request Created: {{ticket_number}}',
      body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #DC2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">🔔 New Request Submitted</h1>
  </div>
  <div style="padding: 20px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hello Admin,</p>
    <p>A new request has been submitted and requires attention.</p>
    
    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #DC2626;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> {{ticket_number}}</p>
      <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject}}</p>
      <p style="margin: 5px 0;"><strong>Category:</strong> {{category_name}}</p>
      <p style="margin: 5px 0;"><strong>Priority:</strong> <span style="background-color: #EF4444; color: white; padding: 2px 8px; border-radius: 4px;">{{priority}}</span></p>
      <p style="margin: 5px 0;"><strong>Status:</strong> {{status}}</p>
    </div>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold;">Requester Information:</p>
      <p style="margin: 5px 0;"><strong>Name:</strong> {{user_name}}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> {{user_email}}</p>
      <p style="margin: 5px 0;"><strong>Department:</strong> {{user_department}}</p>
      <p style="margin: 5px 0;"><strong>Role:</strong> {{user_role}}</p>
      <p style="margin: 5px 0;"><strong>Submitted:</strong> {{created_at}}</p>
    </div>
    
    <div style="background-color: #FFFBEB; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold;">Description:</p>
      <p style="margin: 5px 0;">{{description}}</p>
    </div>
    
    <p><strong>Action Required:</strong> Please review and assign this request to the appropriate staff member.</p>
    
    <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This email was sent from {{org_name}}. Please do not reply to this email.
    </p>
  </div>
</div>`
    }
  });

  const [testEmail, setTestEmail] = useState('');
  const [testTemplateEmail, setTestTemplateEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      setSettings(prev => ({ ...prev, ...response.data.settings }));
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
    }));
  };

  const handleTemplateChange = (field, value) => {
    setEmailTemplates(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [field]: value
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`${API_URL}/settings`, { settings });
      showMessage('success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      showMessage('error', 'Please enter a test email recipient');
      return;
    }

    setSendingTest(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/settings/test-email`, { recipient: testEmail });
      showMessage('success', `Test email sent successfully to ${testEmail}!`);
    } catch (error) {
      console.error('Failed to send test email:', error);
      showMessage('error', error.response?.data?.error || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleTestTemplate = async () => {
    if (!testTemplateEmail) {
      showMessage('error', 'Please enter a test email recipient');
      return;
    }

    setSendingTest(true);
    setMessage({ type: '', text: '' });

    try {
      // Send test with current template
      await axios.post(`${API_URL}/settings/test-template`, { 
        recipient: testTemplateEmail,
        template: selectedTemplate,
        subject: emailTemplates[selectedTemplate].subject,
        body: emailTemplates[selectedTemplate].body
      });
      showMessage('success', `Test email sent successfully to ${testTemplateEmail}!`);
    } catch (error) {
      console.error('Failed to send test email:', error);
      showMessage('error', error.response?.data?.error || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getPreviewHTML = () => {
    return emailTemplates[selectedTemplate].body
      .replace(/\{\{user_name\}\}/g, 'John Doe')
      .replace(/\{\{user_email\}\}/g, 'john.doe@example.com')
      .replace(/\{\{user_department\}\}/g, 'Media Department')
      .replace(/\{\{user_role\}\}/g, 'User')
      .replace(/\{\{ticket_number\}\}/g, 'REQ-2024-001')
      .replace(/\{\{subject\}\}/g, 'Sample Request Subject')
      .replace(/\{\{description\}\}/g, 'This is a sample description of the request.')
      .replace(/\{\{status\}\}/g, 'open')
      .replace(/\{\{priority\}\}/g, 'high')
      .replace(/\{\{category_name\}\}/g, 'IT Support')
      .replace(/\{\{created_at\}\}/g, new Date().toLocaleString())
      .replace(/\{\{assigned_to_name\}\}/g, 'Jane Smith')
      .replace(/\{\{assigned_by\}\}/g, 'Admin User')
      .replace(/\{\{updated_by\}\}/g, 'Staff Member')
      .replace(/\{\{commenter_name\}\}/g, 'Mike Johnson')
      .replace(/\{\{comment_text\}\}/g, 'This is a sample comment on the request. It provides additional information or updates.')
      .replace(/\{\{comment_date\}\}/g, new Date().toLocaleString())
      .replace(/\{\{org_name\}\}/g, 'Media Ticketing System');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'email', label: 'Email Configuration', icon: Mail },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'templates', label: 'Email Templates', icon: FileText },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSave}>
          {/* Email Configuration Tab */}
          {activeTab === 'email' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Email Configuration
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Configure SMTP settings for outgoing emails
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="smtp_host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="smtp_host"
                    name="smtp_host"
                    value={settings.smtp_host}
                    onChange={handleChange}
                    className="input"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    id="smtp_port"
                    name="smtp_port"
                    value={settings.smtp_port}
                    onChange={handleChange}
                    className="input"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Common ports: 25 (plain), 465 (SSL), 587 (TLS)
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="smtp_secure"
                      checked={settings.smtp_secure === 'true'}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use SSL/TLS (Secure Connection)
                    </span>
                  </label>
                </div>

                <div>
                  <label htmlFor="smtp_username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtp_username"
                    name="smtp_username"
                    value={settings.smtp_username}
                    onChange={handleChange}
                    className="input"
                    placeholder="media@housesoflight.org"
                  />
                </div>

                <div>
                  <label htmlFor="smtp_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtp_password"
                    name="smtp_password"
                    value={settings.smtp_password}
                    onChange={handleChange}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="email_from_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    id="email_from_address"
                    name="email_from_address"
                    value={settings.email_from_address}
                    onChange={handleChange}
                    className="input"
                    placeholder="media@housesoflight.org"
                  />
                </div>

                <div>
                  <label htmlFor="email_from_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    id="email_from_name"
                    name="email_from_name"
                    value={settings.email_from_name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Houses of Light"
                  />
                </div>

                {/* Test Email Section */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label htmlFor="test_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Test Email Recipient
                  </label>
                  <input
                    type="email"
                    id="test_email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="input"
                    placeholder="your@email.com"
                  />
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={sendingTest}
                    className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {sendingTest ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Preferences Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control when email notifications are sent
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* User Notifications */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">User Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Request Created</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send email when user creates a new request</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notify_on_request_created"
                          checked={settings.notify_on_request_created === 'true'}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Status Updated</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send email when request status changes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notify_user_on_status_change"
                          checked={settings.notify_user_on_status_change === 'true'}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Request Assigned</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send email when request is assigned to staff</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notify_on_request_assigned"
                          checked={settings.notify_on_request_assigned === 'true'}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">New Comment</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send email when someone comments on request</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notify_on_request_commented"
                          checked={settings.notify_on_request_commented === 'true'}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Admin Notifications */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Admin Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">New Request</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Notify admins when a new request is created</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notify_admin_on_new_request"
                          checked={settings.notify_admin_on_new_request === 'true'}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template Selector */}
                <div className="lg:col-span-1">
                  <div className="card">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Email Templates</h3>
                    <div className="space-y-2">
                      {Object.keys(emailTemplates).map(templateKey => (
                        <button
                          key={templateKey}
                          type="button"
                          onClick={() => setSelectedTemplate(templateKey)}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                            selectedTemplate === templateKey
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {emailTemplates[templateKey].name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Editor */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        Edit Template
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={emailTemplates[selectedTemplate].subject}
                          onChange={(e) => handleTemplateChange('subject', e.target.value)}
                          className="input"
                          placeholder="Email subject"
                        />
                        <details className="mt-2">
                          <summary className="text-xs text-primary-600 dark:text-primary-400 cursor-pointer hover:underline">
                            📋 Available Variables (click to expand)
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs space-y-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Request Information:</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}ticket_number{'}}'}</code> - Request number (e.g., REQ-2024-001)<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}subject{'}}'}</code> - Request subject/title<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}description{'}}'}</code> - Request description<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}status{'}}'}</code> - Current status (open, in progress, resolved, closed)<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}priority{'}}'}</code> - Priority level (low, medium, high, urgent)<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}category_name{'}}'}</code> - Category name<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}created_at{'}}'}</code> - Creation date and time
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">User Information:</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}user_name{'}}'}</code> - Full name of requester<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}user_email{'}}'}</code> - Email address of requester<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}user_department{'}}'}</code> - Department of requester<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}user_role{'}}'}</code> - Role of requester
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Staff/Assignment Information:</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}assigned_to_name{'}}'}</code> - Name of assigned staff member<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}assigned_by{'}}'}</code> - Name of person who assigned<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}updated_by{'}}'}</code> - Name of person who updated
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">Comment Information:</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}commenter_name{'}}'}</code> - Name of person who commented<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}comment_text{'}}'}</code> - The comment text<br/>
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}comment_date{'}}'}</code> - When comment was added
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">System Information:</p>
                              <p className="text-gray-600 dark:text-gray-400">
                                <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">{'{{'}}org_name{'}}'}</code> - Organization/system name
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email Body (HTML)
                        </label>
                        <textarea
                          value={emailTemplates[selectedTemplate].body}
                          onChange={(e) => handleTemplateChange('body', e.target.value)}
                          rows={12}
                          className="input font-mono text-sm"
                          placeholder="Email HTML content"
                        />
                      </div>

                      {/* Preview */}
                      {showPreview && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preview
                          </label>
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 max-h-96 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: getPreviewHTML() }} />
                          </div>
                        </div>
                      )}

                      {/* Test Template */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Test Email Recipient
                        </label>
                        <input
                          type="email"
                          value={testTemplateEmail}
                          onChange={(e) => setTestTemplateEmail(e.target.value)}
                          className="input"
                          placeholder="your@email.com"
                        />
                        <button
                          type="button"
                          onClick={handleTestTemplate}
                          disabled={sendingTest}
                          className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {sendingTest ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Test with This Template
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Only show for email and notifications tabs */}
          {(activeTab === 'email' || activeTab === 'notifications') && (
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
