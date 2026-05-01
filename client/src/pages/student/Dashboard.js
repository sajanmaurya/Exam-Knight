import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await api.get('/submissions/my-submissions');
      setSubmissions(data.submissions || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const totalAttempted = submissions.length;
  const totalPassed = submissions.filter((s) => s.status === 'passed').length;
  const avgScore =
    totalAttempted > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / totalAttempted
        )
      : 0;

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name || 'Student'}</h1>
        <p>Here is an overview of your exam activity.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div>
            <div className="stat-value">{totalAttempted}</div>
            <div className="stat-label">Exams Attempted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">{totalPassed}</div>
            <div className="stat-label">Exams Passed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">📊</div>
          <div>
            <div className="stat-value">{avgScore}</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Submissions</h3>
          <Link to="/student/results" className="btn btn-outline btn-sm">
            View All
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>No exams attempted yet</h3>
            <p>Head over to Available Exams to get started.</p>
            <Link to="/student/exams" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Browse Exams
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map((sub) => (
                  <tr key={sub.id}>
                    <td>{sub.exam?.title || '—'}</td>
                    <td>{sub.exam?.subject || '—'}</td>
                    <td>
                      {sub.exam?.showResults
                        ? `${sub.totalScore ?? '—'} / ${sub.exam?.totalMarks ?? '—'}`
                        : <span className="badge badge-gray">Hidden</span>}
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    passed: 'badge-success',
    failed: 'badge-danger',
    pending: 'badge-warning',
    submitted: 'badge-info',
    grading: 'badge-warning',
  };
  const cls = map[status] || 'badge-gray';
  return <span className={`badge ${cls}`}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}</span>;
}
