import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ticketsApi, categoriesApi, usersApi } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Timer,
  Target,
  Activity,
  Zap,
  UserCheck,
  TrendingDown
} from 'lucide-react';
import { 
  formatDistanceToNow, 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  differenceInHours,
  differenceInDays,
  parseISO
} from 'date-fns';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all_time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchCategories();
    fetchUsers();
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
      const response = await usersApi.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  // Calculate turnaround time metrics
  const getTurnaroundMetrics = () => {
    const resolvedRequests = requests.filter(req => 
      (req.status === 'resolved' || req.status === 'closed') && req.resolved_at
    );
    
    if (resolvedRequests.length === 0) {
      return { avg: 'N/A', median: 'N/A', min: 'N/A', max: 'N/A', count: 0 };
    }
    
    const turnaroundTimes = resolvedRequests.map(req => {
      const created = parseISO(req.created_at);
      const resolved = parseISO(req.resolved_at);
      return differenceInHours(resolved, created);
    }).sort((a, b) => a - b);
    
    const avg = turnaroundTimes.reduce((sum, time) => sum + time, 0) / turnaroundTimes.length;
    const median = turnaroundTimes[Math.floor(turnaroundTimes.length / 2)];
    const min = turnaroundTimes[0];
    const max = turnaroundTimes[turnaroundTimes.length - 1];
    
    const formatTime = (hours) => {
      if (hours < 24) return `${Math.round(hours)}h`;
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    };
    
    return {
      avg: formatTime(avg),
      median: formatTime(median),
      min: formatTime(min),
      max: formatTime(max),
      count: resolvedRequests.length
    };
  };

  // Turnaround by category
  const getTurnaroundByCategory = () => {
    const categoryTurnaround = {};
    
    requests.forEach(req => {
      if ((req.status === 'resolved' || req.status === 'closed') && req.resolved_at) {
        const cat = req.category_name || 'Uncategorized';
        const hours = differenceInHours(parseISO(req.resolved_at), parseISO(req.created_at));
        
        if (!categoryTurnaround[cat]) {
          categoryTurnaround[cat] = { total: 0, count: 0 };
        }
        categoryTurnaround[cat].total += hours;
        categoryTurnaround[cat].count++;
      }
    });
    
    return Object.entries(categoryTurnaround)
      .map(([name, data]) => ({
        name,
        avgHours: data.total / data.count,
        avgDays: (data.total / data.count / 24).toFixed(1),
        count: data.count
      }))
      .sort((a, b) => b.avgHours - a.avgHours);
  };

  // Turnaround by priority
  const getTurnaroundByPriority = () => {
    const priorityTurnaround = { urgent: [], high: [], medium: [], low: [] };
    
    requests.forEach(req => {
      if ((req.status === 'resolved' || req.status === 'closed') && req.resolved_at) {
        const hours = differenceInHours(parseISO(req.resolved_at), parseISO(req.created_at));
        if (req.priority in priorityTurnaround) {
          priorityTurnaround[req.priority].push(hours);
        }
      }
    });
    
    return Object.entries(priorityTurnaround).map(([priority, times]) => ({
      priority,
      avgHours: times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : 0,
      avgDays: times.length > 0 ? (times.reduce((sum, t) => sum + t, 0) / times.length / 24).toFixed(1) : '0',
      count: times.length
    }));
  };

  // Time to first assignment
  const getTimeToAssignment = () => {
    const assignedRequests = requests.filter(req => req.assigned_to);
    
    if (assignedRequests.length === 0) return 'N/A';
    
    // Note: This is approximate since we don't track exact assignment time
    // We use updated_at as a proxy
    const totalHours = assignedRequests.reduce((sum, req) => {
      const created = parseISO(req.created_at);
      const updated = parseISO(req.updated_at);
      return sum + differenceInHours(updated, created);
    }, 0);
    
    const avgHours = totalHours / assignedRequests.length;
    if (avgHours < 24) return `${Math.round(avgHours)}h`;
    return `${(avgHours / 24).toFixed(1)}d`;
  };

  // Staff performance
  const getStaffPerformance = () => {
    const staffStats = {};
    
    requests.forEach(req => {
      if (req.assigned_to) {
        const staffKey = req.assigned_to;
        const staffName = req.assigned_first_name && req.assigned_last_name 
          ? `${req.assigned_first_name} ${req.assigned_last_name}`
          : 'Unknown';
        
        if (!staffStats[staffKey]) {
          staffStats[staffKey] = {
            name: staffName,
            total: 0,
            resolved: 0,
            active: 0,
            turnaroundTimes: []
          };
        }
        
        staffStats[staffKey].total++;
        
        if (req.status === 'resolved' || req.status === 'closed') {
          staffStats[staffKey].resolved++;
          if (req.resolved_at) {
            const hours = differenceInHours(parseISO(req.resolved_at), parseISO(req.created_at));
            staffStats[staffKey].turnaroundTimes.push(hours);
          }
        } else if (req.status === 'open' || req.status === 'in_progress') {
          staffStats[staffKey].active++;
        }
      }
    });
    
    return Object.values(staffStats)
      .map(staff => ({
        ...staff,
        resolutionRate: staff.total > 0 ? Math.round((staff.resolved / staff.total) * 100) : 0,
        avgTurnaround: staff.turnaroundTimes.length > 0
          ? (staff.turnaroundTimes.reduce((sum, t) => sum + t, 0) / staff.turnaroundTimes.length / 24).toFixed(1)
          : 'N/A'
      }))
      .sort((a, b) => b.resolved - a.resolved);
  };

  // Get requests over time for trend analysis
  const getRequestsTrend = () => {
    const trendData = {};
    
    requests.forEach(req => {
      const date = format(parseISO(req.created_at), 'yyyy-MM-dd');
      trendData[date] = (trendData[date] || 0) + 1;
    });
    
    return Object.entries(trendData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
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

  // Get requests by status
  const getRequestsByStatus = () => {
    return {
      open: requests.filter(r => r.status === 'open').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      resolved: requests.filter(r => r.status === 'resolved').length,
      closed: requests.filter(r => r.status === 'closed').length,
    };
  };

  const turnaroundMetrics = getTurnaroundMetrics();
  const turnaroundByCategory = getTurnaroundByCategory();
  const turnaroundByPriority = getTurnaroundByPriority();
  const timeToAssignment = getTimeToAssignment();
  const staffPerformance = getStaffPerformance();
  const requestsTrend = getRequestsTrend();
  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();
  const statusStats = getRequestsByStatus();
  
  // Calculate stats from filtered requests
  const filteredTotal = requests.length;
  const filteredResolved = requests.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  const resolutionRate = filteredTotal > 0 
    ? Math.round((filteredResolved / filteredTotal) * 100) 
    : 0;
  const activeRequestsCount = statusStats.open + statusStats.in_progress;

  const exportReport = () => {
    // Create comprehensive CSV content
    const headers = [
      'Request #', 'Subject', 'Status', 'Priority', 'Category', 
      'Created At', 'Resolved At', 'Turnaround (hours)', 'Assigned To'
    ];
    
    const rows = requests.map(req => {
      const turnaround = req.resolved_at 
        ? differenceInHours(parseISO(req.resolved_at), parseISO(req.created_at))
        : 'N/A';
      
      return [
        req.ticket_number,
        `"${req.subject}"`,
        req.status,
        req.priority,
        req.category_name || 'Uncategorized',
        format(parseISO(req.created_at), 'yyyy-MM-dd HH:mm:ss'),
        req.resolved_at ? format(parseISO(req.resolved_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
        turnaround,
        req.assigned_first_name ? `${req.assigned_first_name} ${req.assigned_last_name}` : 'Unassigned'
      ];
    });

    // Add summary section
    const summary = [
      [],
      ['SUMMARY STATISTICS'],
      ['Total Requests', filteredTotal],
      ['Resolved Requests', filteredResolved],
      ['Resolution Rate', `${resolutionRate}%`],
      ['Average Turnaround', turnaroundMetrics.avg],
      ['Median Turnaround', turnaroundMetrics.median],
      ['Min Turnaround', turnaroundMetrics.min],
      ['Max Turnaround', turnaroundMetrics.max],
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      ...summary.map(row => row.join(','))
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
              Comprehensive insights, performance metrics, and turnaround time analysis
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
                  Avg. Turnaround
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {turnaroundMetrics.avg}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {turnaroundMetrics.count} resolved
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

        {/* Turnaround Time Metrics */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Timer className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Turnaround Time Analysis
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Average</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{turnaroundMetrics.avg}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Median</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{turnaroundMetrics.median}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-200">Fastest</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{turnaroundMetrics.min}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-200">Slowest</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{turnaroundMetrics.max}</p>
            </div>
          </div>
        </div>

        {/* Turnaround by Priority & Time to Assignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Turnaround by Priority */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Turnaround by Priority
              </h2>
            </div>
            <div className="space-y-4">
              {turnaroundByPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${
                      item.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      item.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.priority}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.count} resolved
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.avgDays} days
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Response Metrics
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avg. Time to Assignment
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    How quickly requests are assigned
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  {timeToAssignment}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Backlog
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Open + In Progress
                  </p>
                </div>
                <span className="text-2xl font-bold text-yellow-600">
                  {activeRequestsCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Completion Rate
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Resolved in selected period
                  </p>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {filteredResolved}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        {staffPerformance.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Staff Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Staff Member
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Resolved
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Active
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Success Rate
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Avg. Turnaround
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.slice(0, 10).map((staff, index) => (
                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {staff.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300">
                        {staff.total}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                        {staff.resolved}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-yellow-600 dark:text-yellow-400 font-medium">
                        {staff.active}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          staff.resolutionRate >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          staff.resolutionRate >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {staff.resolutionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-gray-300 font-medium">
                        {staff.avgTurnaround !== 'N/A' ? `${staff.avgTurnaround}d` : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Turnaround by Category */}
        {turnaroundByCategory.length > 0 && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Turnaround by Category
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turnaroundByCategory.map((cat) => (
                <div key={cat.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cat.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {cat.count} resolved
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {cat.avgDays} days
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Average turnaround time
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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

