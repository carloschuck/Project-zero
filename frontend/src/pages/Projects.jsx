import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { projectsApi, usersApi } from '../services/api';
import { Plus, Search, FolderKanban, Calendar, Users, CheckSquare, Edit, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    owner: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState(null);
  const [showActions, setShowActions] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
        ...(filters.owner && { owner: filters.owner }),
      };
      const response = await projectsApi.getAll(params);
      setProjects(response.data.projects);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleEditProject = (projectId) => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setDeleteConfirm(null);
      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const toggleActions = (projectId) => {
    setShowActions(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const canEditProject = (project) => {
    return user?.role === 'admin' || 
           project.owner_id === user?.id || 
           project.created_by === user?.id;
  };

  const canDeleteProject = (project) => {
    return user?.role === 'admin' || project.owner_id === user?.id;
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[status] || colors.planning;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority] || colors.medium;
  };

  const getSourceIcon = (source) => {
    const icons = {
      meeting: '🤝',
      email: '📧',
      text: '💬',
      phone: '📞',
      other: '📋',
    };
    return icons[source] || icons.other;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track projects from meetings, emails, and other sources
            </p>
          </div>
          <Link
            to="/projects/new"
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="card">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Planning</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">{stats.planning}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">In Progress</div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">{stats.in_progress}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">On Hold</div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-300 mt-1">{stats.on_hold}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-300 mt-1">{stats.completed}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Cancelled</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-300 mt-1">{stats.cancelled}</div>
            </div>
            <div className="card">
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-300 mt-1">{stats.overdue}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.owner}
              onChange={(e) => handleFilterChange('owner', e.target.value)}
              className="input"
            >
              <option value="">All Projects</option>
              <option value="my_projects">My Projects</option>
              <option value="created_by_me">Created by Me</option>
            </select>

            <button
              onClick={() => {
                setFilters({ status: '', priority: '', search: '', owner: '' });
                setPagination({ ...pagination, page: 1 });
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <Link to="/projects/new" className="btn-primary inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  New Project
                </Link>
              </div>
            </div>
          ) : (
            projects.map((project) => {
              const taskProgress = project.total_tasks > 0 
                ? Math.round((project.completed_tasks / project.total_tasks) * 100)
                : 0;
              
              return (
                <div
                  key={project.id}
                  className="card hover:shadow-lg transition-shadow duration-200 relative group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/projects/${project.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getSourceIcon(project.source)}</span>
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {project.project_number}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </Link>
                      
                      {/* Actions Menu */}
                      {(canEditProject(project) || canDeleteProject(project)) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleActions(project.id);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {showActions[project.id] && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[120px]">
                              {canEditProject(project) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleEditProject(project.id);
                                    setShowActions(prev => ({ ...prev, [project.id]: false }));
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </button>
                              )}
                              {canDeleteProject(project) && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDeleteConfirm(project);
                                    setShowActions(prev => ({ ...prev, [project.id]: false }));
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status and Priority */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>

                    {/* Task Progress */}
                    {project.total_tasks > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span className="flex items-center">
                            <CheckSquare className="w-3 h-3 mr-1" />
                            Tasks
                          </span>
                          <span>{project.completed_tasks} / {project.total_tasks}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${taskProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {project.due_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(project.due_date), 'MMM d')}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {project.member_count}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Owner */}
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Owner:</span>
                      <span className="ml-1">{project.owner_first_name} {project.owner_last_name}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!loading && projects.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> projects
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Project
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete the project "{deleteConfirm.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteConfirm.id)}
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;

