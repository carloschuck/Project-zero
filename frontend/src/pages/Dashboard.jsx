import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { ticketsApi, usersApi, categoriesApi } from '../services/api';
import { FileText, Plus, TrendingUp, Clock, CheckCircle, Settings, UserPlus, Trash2, Search, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignToUser, setAssignToUser] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    owner: user?.role === 'user' ? 'created_by_me' : 'all_requests',
  });
  
  // Column visibility state - stored in localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('dashboardColumns');
    return saved ? JSON.parse(saved) : {
      submittedDate: true,
      submittedBy: true,
      status: true,
      urgency: true,
      category: true,
      assignedTo: true,
    };
  });

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('dashboardColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const fetchDashboardData = async () => {
    try {
      const params = {
        limit: 10,
        page: 1,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.owner && { owner: filters.owner }),
      };

      const [statsRes, requestsRes] = await Promise.all([
        ticketsApi.getStats(),
        ticketsApi.getAll(params),
      ]);
      setStats(statsRes.data);
      setRecentRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getAll({ limit: 100 });
      setUsers(response.data.users.filter(u => u.is_active));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      category: '',
      owner: user?.role === 'user' ? 'created_by_me' : 'all_requests',
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.category || 
    (user?.role !== 'user' && filters.owner !== 'all_requests') ||
    (user?.role === 'user' && filters.owner !== 'created_by_me');

  const handleAssign = (request) => {
    setSelectedRequest(request);
    setAssignToUser(request.assigned_to || '');
    setShowAssignModal(true);
  };

  const submitAssignment = async () => {
    try {
      await ticketsApi.update(selectedRequest.id, { assignedTo: assignToUser || null });
      setShowAssignModal(false);
      setSelectedRequest(null);
      setAssignToUser('');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to assign request:', error);
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Note: You'll need to add a delete endpoint in the backend
      await ticketsApi.delete(requestId);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete request:', error);
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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

  const statCards = [
    { 
      name: 'Total Requests', 
      value: stats?.total || 0, 
      icon: FileText, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    { 
      name: 'Open', 
      value: stats?.open || 0, 
      icon: Clock, 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    { 
      name: 'In Progress', 
      value: stats?.in_progress || 0, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    { 
      name: 'Resolved', 
      value: stats?.resolved || 0, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Here's what's happening with your requests today.
            </p>
          </div>
          <Link
            to="/requests/new"
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="glass-card glass-float">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/30 ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Requests */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Requests
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="btn flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Columns
              </button>
              <Link
                to="/requests"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                View all
              </Link>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6 p-4 glass-light rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Owner Filter */}
              <select
                value={filters.owner}
                onChange={(e) => handleFilterChange('owner', e.target.value)}
                className="input w-full"
              >
                {user?.role !== 'user' && (
                  <>
                    <option value="all_requests">All Requests</option>
                    <option value="assigned_to_me">Assigned to Me</option>
                  </>
                )}
                <option value="created_by_me">Created by Me</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Column Settings Dropdown */}
          {showColumnSettings && (
            <div className="mb-4 p-4 glass-light rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Toggle Columns
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.submittedDate}
                    onChange={() => toggleColumn('submittedDate')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Submitted Date</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.submittedBy}
                    onChange={() => toggleColumn('submittedBy')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Submitted By</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.status}
                    onChange={() => toggleColumn('status')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.urgency}
                    onChange={() => toggleColumn('urgency')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Urgency</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.category}
                    onChange={() => toggleColumn('category')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Category</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.assignedTo}
                    onChange={() => toggleColumn('assignedTo')}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Assigned To</span>
                </label>
              </div>
            </div>
          )}

          {recentRequests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No requests yet. Create your first request to get started.
              </p>
              <Link
                to="/requests/new"
                className="mt-4 inline-flex items-center btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Request
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Request #
                    </th>
                    {visibleColumns.category && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                    )}
                    {visibleColumns.submittedDate && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted Date
                      </th>
                    )}
                    {visibleColumns.submittedBy && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted By
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    )}
                    {visibleColumns.urgency && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Urgency
                      </th>
                    )}
                    {visibleColumns.assignedTo && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Assigned To
                      </th>
                    )}
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200 backdrop-blur-sm">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                        >
                          {request.ticket_number}
                        </Link>
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {request.subject}
                        </div>
                      </td>
                      {visibleColumns.category && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {request.category_name}
                        </td>
                      )}
                      {visibleColumns.submittedDate && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </td>
                      )}
                      {visibleColumns.submittedBy && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {request.user_first_name} {request.user_last_name}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={request.status} />
                        </td>
                      )}
                      {visibleColumns.urgency && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                            {request.priority}
                          </span>
                        </td>
                      )}
                      {visibleColumns.assignedTo && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                          {request.assigned_first_name ? 
                            `${request.assigned_first_name} ${request.assigned_last_name}` : 
                            'Unassigned'
                          }
                        </td>
                      )}
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAssign(request)}
                              className="p-2 text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-900/60 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50"
                              title="Assign"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="p-2 text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/60 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-red-200/50 dark:hover:border-red-700/50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-modal rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Assign Request
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Request: <strong>{selectedRequest?.ticket_number}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <select
                  value={assignToUser}
                  onChange={(e) => setAssignToUser(e.target.value)}
                  className="input"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="btn flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAssignment}
                  className="btn btn-primary flex-1"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
