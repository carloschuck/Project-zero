import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { projectsApi, usersApi } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    source: 'meeting',
    startDate: '',
    dueDate: '',
    ownerId: user?.role === 'admin' ? '' : user?.id || '',
    members: [],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update ownerId when user data loads (for non-admin users)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setFormData(prev => ({
        ...prev,
        ownerId: user.id
      }));
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure ownerId is set for non-admin users
      const submitData = {
        ...formData,
        ownerId: user?.role !== 'admin' ? user.id : formData.ownerId
      };
      
      const response = await projectsApi.create(submitData);
      navigate(`/projects/${response.data.project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Project
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Track projects from meetings, emails, texts, and other sources
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  placeholder="Enter project title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[120px]"
                  placeholder="Provide project details, goals, requirements, etc..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input"
                  >
                    <option value="meeting">Meeting 🤝</option>
                    <option value="email">Email 📧</option>
                    <option value="text">Text/Message 💬</option>
                    <option value="phone">Phone Call 📞</option>
                    <option value="other">Other 📋</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Project Owner - Only for Admin users */}
          {user?.role === 'admin' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Owner
              </h2>
              <select
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                className="input"
                required
              >
                <option value="">Select owner...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.email})
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                The project owner has full control over the project
              </p>
            </div>
          )}

          {/* Project Owner Info for Non-Admin users */}
          {user?.role !== 'admin' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Owner
              </h2>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">You will be the project owner</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  As the creator, you have full control over this project
                </p>
              </div>
            </div>
          )}

          {/* Team Members */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Team Members (Optional)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select team members to collaborate on this project
            </p>
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((u) => (
                <label
                  key={u.id}
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.members.includes(u.id)}
                    onChange={() => handleMemberToggle(u.id)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {u.email} • {u.department || 'No department'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateProject;

