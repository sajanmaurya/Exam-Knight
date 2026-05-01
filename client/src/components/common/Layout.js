import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = {
  student: [
    { path: '/student', label: 'Dashboard', icon: '📊' },
    { path: '/student/exams', label: 'Available Exams', icon: '📝' },
    { path: '/student/results', label: 'My Results', icon: '📋' },
  ],
  teacher: [
    { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/teacher/exams/create', label: 'Create Exam', icon: '➕' },
    { path: '/teacher/question-bank', label: 'Question Bank', icon: '📚' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Manage Users', icon: '👥' },
    { path: '/admin/proctoring-logs', label: 'Proctoring Logs', icon: '🔍' },
    { path: '/admin/bulk-import', label: 'Bulk Import', icon: '📁' },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = navItems[user?.role] || [];

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Exam Knight</h2>
          <span>Online Examination</span>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${user?.role}`}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button className="sidebar-link" onClick={handleLogout}>
            <span>🚪</span>
            Logout
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <div className="page-inner">
          {children}
        </div>
      </main>
    </div>
  );
}
