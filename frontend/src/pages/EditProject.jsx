import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { projectsApi, usersApi } from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';

const EditProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(true);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    source: 'meeting',
    startDate: '',
    dueDate: '',
    ownerId: user?.id || '',
    status: 'planning',
    members: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchProject();
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchProject = async () => {
    try {
      setLoadingProject(true);
      const response = await projectsApi.getById(id);
      const project = response.data.project;
      
      setFormData({
        title: project.title || '',
        description: project.description || '',
        priority: project.priority || 'medium',
        source: project.source || 'meeting',
        startDate: project.start_date ? project.start_date.split('T')[0] : '',
        dueDate: project.due_date ? project.due_date.split('T')[0] : '',
        ownerId: project.owner_id || user?.id || '',
        status: project.status || 'planning',
        members: [], // We'll load members separately if needed
      });
    } catch (error) {
      console.error('Failed to fetch project:', error);
      alert('Failed to load project. Please try again.');
      navigate('/projects');
    } finally {
      setLoadingProject(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        ownerId: formData.ownerId,
      };

      await projectsApi.update(id, updateData);
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Failed to update project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loadingProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Project
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update project details and settings
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="Enter project title"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="input"
                  placeholder="Enter project description"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Source
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="meeting">Meeting</option>
                  <option value="email">Email</option>
                  <option value="text">Text</option>
                  <option value="phone">Phone</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Owner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Owner
                </label>
                <select
                  name="ownerId"
                  value={formData.ownerId}
                  onChange={handleInputChange}
                  className="input"
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditProject;
