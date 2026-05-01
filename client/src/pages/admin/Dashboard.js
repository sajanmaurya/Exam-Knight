import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STAT_CONFIG = [
  { key: 'totalUsers',       label: 'Total Users',       colorClass: 'blue'   },
  { key: 'totalExams',       label: 'Total Exams',       colorClass: 'green'  },
  { key: 'totalSubmissions', label: 'Total Submissions', colorClass: 'orange' },
  { key: 'activeExams',      label: 'Active Exams',      colorClass: 'red'    },
];

const STATUS_BADGE = {
  submitted:   'badge-primary',
  graded:      'badge-success',
  in_progress: 'badge-warning',
  flagged:     'badge-danger',
};

export default function AdminDashboard() {
  useAuth(); // ensure authenticated context is available
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner" />;
  if (!data)   return null;

  const { stats, usersByRole, recentSubmissions } = data;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {STAT_CONFIG.map(({ key, label, colorClass }) => (
          <div key={key} className="stat-card">
            <div className={`stat-icon ${colorClass}`} />
            <div className="stat-value">{stats[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Users by Role */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Users by Role</h2>
        {usersByRole && usersByRole.length > 0 ? (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {usersByRole.map(({ role, count }) => (
              <div
                key={role}
                style={{
                  flex: '1 1 120px',
                  textAlign: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                }}
              >
                <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{count}</div>
                <div style={{ textTransform: 'capitalize', color: '#6c757d', marginTop: '0.25rem' }}>
                  {role}
                </div>
                {/* Simple proportional bar */}
                <div
                  style={{
                    marginTop: '0.5rem',
                    height: '6px',
                    borderRadius: '3px',
                    background: '#dee2e6',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      borderRadius: '3px',
                      background: '#4361ee',
                      width: `${Math.min(100, (count / (stats.totalUsers || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>No role data available.</p>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Recent Submissions</h2>
        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.id}</td>
                    <td>{sub.student?.name || '—'}</td>
                    <td>{sub.exam?.title || '—'}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[sub.status] || 'badge-secondary'}`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>No recent submissions.</p>
        )}
      </div>
    </div>
  );
}
