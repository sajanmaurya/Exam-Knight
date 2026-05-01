import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/my-submissions')
      .then(r => setSubmissions(r.data.submissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed  = submissions.filter(s => s.status !== 'in_progress').length;
  const inProgress = submissions.filter(s => s.status === 'in_progress').length;
  const avgScore   = submissions.filter(s => s.totalScore != null).reduce((acc, s, _, arr) => {
    return acc + (s.totalScore / s.exam?.totalMarks * 100) / arr.length;
  }, 0);

  return (
    <>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's your exam activity overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><FiBook /></div>
          <div><div className="stat-value">{submissions.length}</div><div className="stat-label">Total Attempts</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiCheckCircle /></div>
          <div><div className="stat-value">{completed}</div><div className="stat-label">Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiClock /></div>
          <div><div className="stat-value">{inProgress}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><FiTrendingUp /></div>
          <div><div className="stat-value">{avgScore ? avgScore.toFixed(1) + '%' : '—'}</div><div className="stat-label">Avg Score</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Submissions</h3>
          <Link to="/student/exams" className="btn btn-primary btn-sm">Browse Exams</Link>
        </div>
        {loading ? <div className="spinner" /> : submissions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📝</div>
            <h3>No submissions yet</h3>
            <p>Take your first exam to see results here.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Exam</th><th>Subject</th><th>Status</th><th>Score</th><th>Date</th>
              </tr></thead>
              <tbody>
                {submissions.slice(0, 8).map(s => (
                  <tr key={s.id}>
                    <td style={{fontWeight:500, color:'var(--text)'}}>{s.exam?.title}</td>
                    <td>{s.exam?.subject || '—'}</td>
                    <td><span className={`badge badge-${s.status === 'graded' || s.status === 'submitted' ? 'success' : s.status === 'in_progress' ? 'warning' : 'gray'}`}>{s.status}</span></td>
                    <td>{s.totalScore != null ? `${s.totalScore} / ${s.exam?.totalMarks}` : '—'}</td>
                    <td style={{color:'var(--text-muted)', fontSize:'0.82rem'}}>{s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
