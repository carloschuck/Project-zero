import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Home,
  Users,
  Settings,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Shield,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      roles: ['admin', 'user', 'department_lead', 'event_coordinator'] 
    },
    { 
      name: 'Admin Panel', 
      icon: Shield, 
      roles: ['admin'],
      isExpandable: true,
      subItems: [
        { name: 'Users', href: '/users', icon: Users },
        { name: 'Categories', href: '/categories', icon: FolderKanban },
        { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className={`flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600 relative">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white">Request System</h1>
            )}
            {sidebarCollapsed && (
              <h1 className="text-xl font-bold text-white">RS</h1>
            )}
            
            {/* Collapse Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              
              if (item.isExpandable) {
                const isAnySubItemActive = item.subItems?.some(sub => location.pathname === sub.href);
                
                if (sidebarCollapsed) {
                  // Show only icon with tooltip for collapsed state
                  return (
                    <div key={item.name} className="relative group">
                      <button
                        onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                        title={item.name}
                        className={`w-full flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-colors ${
                          isAnySubItemActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                      
                      {/* Tooltip menu for collapsed sidebar */}
                      {adminPanelOpen && (
                        <div className="absolute left-full top-0 ml-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isActive = location.pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                                  isActive
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                              >
                                <SubIcon className="w-4 h-4 mr-3" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Expanded state - show full menu
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isAnySubItemActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      {adminPanelOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {adminPanelOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems?.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isActive = location.pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                              }`}
                            >
                              <SubIcon className="w-4 h-4 mr-3" />
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              const isActive = location.pathname === item.href;
              
              if (sidebarCollapsed) {
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    title={item.name}
                    className={`flex items-center justify-center p-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            )}
            
            {sidebarCollapsed && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-full flex items-center justify-center p-3 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between h-16 px-4 bg-primary-600">
              <h1 className="text-xl font-bold text-white">Request System</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                
                if (item.isExpandable) {
                  const isAnySubItemActive = item.subItems?.some(sub => location.pathname === sub.href);
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => setAdminPanelOpen(!adminPanelOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                          isAnySubItemActive
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </div>
                        {adminPanelOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {adminPanelOpen && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.subItems?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isActive = location.pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                              >
                                <SubIcon className="w-4 h-4 mr-3" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <NotificationDropdown />

              <Link
                to="/profile"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;


