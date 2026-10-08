import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';
import { getTheme, toggleTheme } from '../utils/theme';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setThemeState] = useState(getTheme());

  const navItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/maternal', icon: '👤', label: 'Maternal Assessment' },
    { path: '/newborn', icon: '👶', label: 'Newborn Assessment' },
    { path: '/records', icon: '📋', label: 'View Records' },
    { path: '/reports', icon: '📊', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const handleLogout = () => {
    if (confirm("Sign out?")) {
      logout();
      navigate('/login');
    }
  };

  const handleThemeToggle = () => {
    const next = toggleTheme();
    setThemeState(next);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col shrink-0
          bg-white dark:bg-slate-900
          border-r border-gray-200 dark:border-slate-800
          transition-all duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand with logo */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/maternova-logo.png"
              alt="Maternova"
              className="w-12 h-12 object-contain shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="leading-tight min-w-0">
              <div className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">Maternova</div>
              <div className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-300/70 truncate">AI Health Monitoring</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-slate-500 dark:text-white/70 hover:text-slate-800 dark:hover:text-white text-xl shrink-0"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`block p-3 rounded-lg cursor-pointer transition flex items-center gap-3 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-medium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 pb-2">
          <button
            onClick={handleThemeToggle}
            className="w-full flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-700 dark:text-white py-2.5 px-3 rounded-lg font-medium"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? '🌙' : '☀️'}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <span className={`relative w-8 h-4 rounded-full transition ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-400'}`}>
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
            </span>
          </button>
        </div>

        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300/70 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-xs bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white transition text-slate-700 dark:text-white py-2 rounded-lg font-medium"
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-700 dark:text-slate-200 text-2xl p-1"
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/maternova-logo.png"
                alt="Maternova"
                className="w-8 h-8 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-bold text-slate-800 dark:text-white text-sm">Maternova</span>
            </div>
          </div>
          <button onClick={handleThemeToggle} className="text-xl p-1" aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}