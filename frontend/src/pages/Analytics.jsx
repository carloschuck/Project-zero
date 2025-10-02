import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ticketsApi, categoriesApi } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek, startOfYear, endOfYear, isWithinInterval } from 'date-fns';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterRequestsByDateRange();
  }, [dateRange, allRequests, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, requestsRes] = await Promise.all([
        ticketsApi.getStats(),
        ticketsApi.getAll({ limit: 10000, page: 1 }),
      ]);
      setStats(statsRes.data);
      setAllRequests(requestsRes.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() };
      case 'this_week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: new Date(customStartDate), end: new Date(customEndDate) };
        }
        return null;
      case 'all_time':
      default:
        return null;
    }
  };

  const filterRequestsByDateRange = () => {
    const range = getDateRangeFilter();
    if (!range) {
      setRequests(allRequests);
      return;
    }

    const filtered = allRequests.filter(req => {
      const createdDate = new Date(req.created_at);
      return isWithinInterval(createdDate, { start: range.start, end: range.end });
    });
    
    setRequests(filtered);
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Calculate category distribution
  const getCategoryStats = () => {
    const categoryCount = {};
    requests.forEach(req => {
      const cat = req.category_name || 'Uncategorized';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate priority distribution
  const getPriorityStats = () => {
    const priorityCount = { urgent: 0, high: 0, medium: 0, low: 0 };
    requests.forEach(req => {
      if (req.priority in priorityCount) {
        priorityCount[req.priority]++;
      }
    });
    return priorityCount;
  };

  // Calculate average resolution time
  const getAverageResolutionTime = () => {
    const resolvedRequests = requests.filter(req => 
      req.status === 'resolved' || req.status === 'closed'
    );
    
    if (resolvedRequests.length === 0) return 'N/A';
    
    const totalDays = resolvedRequests.reduce((sum, req) => {
      const created = new Date(req.created_at);
      const updated = new Date(req.updated_at);
      const days = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    const avgDays = Math.round(totalDays / resolvedRequests.length);
    return `${avgDays} day${avgDays !== 1 ? 's' : ''}`;
  };

  // Get requests by status
  const getRequestsByStatus = () => {
    return {
      open: requests.filter(r => r.status === 'open').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
      closed: requests.filter(r => r.status === 'closed').length,
    };
  };

  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();
  const statusStats = getRequestsByStatus();
  const avgResolutionTime = getAverageResolutionTime();
  
  // Calculate stats from filtered requests
  const filteredTotal = requests.length;
  const filteredResolved = requests.filter(r => r.status === 'resolved').length;
  const resolutionRate = filteredTotal > 0 
    ? Math.round((filteredResolved / filteredTotal) * 100) 
    : 0;
  const activeRequestsCount = statusStats.open + statusStats.in_progress;

  const exportReport = () => {
    // Create CSV content
    const headers = ['Request #', 'Subject', 'Status', 'Priority', 'Category', 'Created At', 'Assigned To'];
    const rows = requests.map(req => [
      req.ticket_number,
      `"${req.subject}"`,
      req.status,
      req.priority,
      req.category_name,
      format(new Date(req.created_at), 'yyyy-MM-dd HH:mm:ss'),
      req.assigned_first_name ? `${req.assigned_first_name} ${req.assigned_last_name}` : 'Unassigned'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const dateRangeLabel = dateRange.replace('_', ' ').toUpperCase();
    const fileName = `analytics_report_${dateRangeLabel}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics & Reports
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Overview of request statistics and insights
            </p>
          </div>
          <button 
            onClick={exportReport}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Time Frame Filter */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Time Frame
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input w-full"
              >
                <option value="all_time">All Time</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing <strong className="text-gray-900 dark:text-white">{filteredTotal}</strong> requests
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {filteredTotal}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-200" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resolution Rate
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {resolutionRate}%
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-200" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Resolution Time
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {avgResolutionTime}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-200" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {activeRequestsCount}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Requests by Status
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Open</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{statusStats.open}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${filteredTotal > 0 ? (statusStats.open / filteredTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">In Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{statusStats.in_progress}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${filteredTotal > 0 ? (statusStats.in_progress / filteredTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Resolved</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{statusStats.resolved}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${filteredTotal > 0 ? (statusStats.resolved / filteredTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Closed</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{statusStats.closed}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gray-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${filteredTotal > 0 ? (statusStats.closed / filteredTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Requests by Priority
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Urgent</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{priorityStats.urgent}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-red-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${requests.length > 0 ? (priorityStats.urgent / requests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{priorityStats.high}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${requests.length > 0 ? (priorityStats.high / requests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{priorityStats.medium}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${requests.length > 0 ? (priorityStats.medium / requests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{priorityStats.low}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${requests.length > 0 ? (priorityStats.low / requests.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Requests by Category
          </h2>
          {categoryStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.slice(0, 6).map((cat) => (
                <div key={cat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cat.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {cat.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(cat.count / requests.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round((cat.count / requests.length) * 100)}% of total
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No category data available
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;

