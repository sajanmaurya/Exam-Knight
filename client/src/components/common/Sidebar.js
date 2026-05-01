import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiShield, FiHome, FiBook, FiFileText, FiUsers,
  FiBarChart2, FiDatabase, FiList, FiLogOut, FiUpload,
} from 'react-icons/fi';

const navItems = {
  student: [
    { to: '/student/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/student/exams',     icon: <FiBook />, label: 'Available Exams' },
    { to: '/student/results',   icon: <FiBarChart2 />, label: 'My Results' },
  ],
  teacher: [
    { to: '/teacher/dashboard',     icon: <FiHome />,     label: 'Dashboard' },
    { to: '/teacher/exams/create',  icon: <FiFileText />, label: 'Create Exam' },
    { to: '/teacher/question-bank', icon: <FiDatabase />, label: 'Question Bank' },
  ],
  admin: [
    { to: '/admin/dashboard',       icon: <FiHome />,     label: 'Dashboard' },
    { to: '/admin/users',           icon: <FiUsers />,    label: 'Users' },
    { to: '/teacher/dashboard',     icon: <FiFileText />, label: 'Exams' },
    { to: '/admin/proctoring-logs', icon: <FiList />,     label: 'Proctoring Logs' },
    { to: '/admin/bulk-import',     icon: <FiUpload />,   label: 'Bulk Import' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const items = navItems[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FiShield className="sidebar-logo-icon" />
        <span className="sidebar-brand">Exam Knight</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">{user?.role} menu</div>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">{initials}</div>
        <div>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.role}</div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </aside>
  );
}
