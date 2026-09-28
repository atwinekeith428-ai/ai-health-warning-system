import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUser, logout } from '../utils/auth';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 text-white flex flex-col shrink-0
          transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 text-lg font-bold border-b border-slate-700 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-2xl">❤️</span>
            <div>
              <div className="leading-tight">AI-Based Early</div>
              <div className="leading-tight text-blue-300 text-sm">Warning System</div>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-white/70 hover:text-white text-xl"
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
                className={`block p-3 rounded-lg cursor-pointer transition ${
                  isActive ? 'bg-blue-600 font-medium' : 'hover:bg-slate-800'
                }`}
              >
                {item.icon} {item.label}
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-blue-300 truncate">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-xs bg-slate-800 hover:bg-red-600 transition text-white py-2 rounded-lg font-medium"
            >
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 p-3 bg-white border-b border-gray-200 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700 text-2xl p-1"
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            <span className="font-bold text-slate-800 text-sm">AI Health Warning System</span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}