import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams/my-exams');
      setExams(data.exams || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner" />;

  const totalExams = exams.length;
  const published = exams.filter((e) => e.status === 'published').length;
  const active = exams.filter((e) => e.status === 'active').length;
  const totalSubmissions = exams.reduce((sum, e) => sum + (e.submissions?.length || 0), 0);

  const recentExams = [...exams]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 10);

  const statusBadge = (status) => {
    const map = {
      draft: 'badge-gray',
      published: 'badge-info',
      active: 'badge-success',
      completed: 'badge-warning',
      cancelled: 'badge-danger',
    };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Teacher Dashboard</h1>
          <p>Welcome back, {user?.name}. Manage your exams and monitor students.</p>
        </div>
        <Link to="/teacher/exams/create" className="btn btn-primary">
          + New Exam
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📋</div>
          <div>
            <div className="stat-value">{totalExams}</div>
            <div className="stat-label">Total Exams</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value">{published}</div>
            <div className="stat-label">Published</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔴</div>
          <div>
            <div className="stat-value">{active}</div>
            <div className="stat-label">Active Now</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">📝</div>
          <div>
            <div className="stat-value">{totalSubmissions}</div>
            <div className="stat-label">Total Submissions</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Exams</h3>
        </div>
        {recentExams.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
            No exams yet.{' '}
            <Link to="/teacher/exams/create" style={{ color: 'var(--primary)' }}>
              Create your first exam
            </Link>
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Questions</th>
                  <th>Submissions</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((exam) => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 500 }}>{exam.title}</td>
                    <td>{exam.subject}</td>
                    <td>{statusBadge(exam.status)}</td>
                    <td>{exam.questions?.length || 0}</td>
                    <td>{exam.submissions?.length || 0}</td>
                    <td>{exam.duration} min</td>
                    <td>
                      <div className="btn-group">
                        <Link
                          to={`/teacher/exam/${exam.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </Link>
                        <Link
                          to={`/teacher/exams/${exam.id}/monitor`}
                          className="btn btn-sm"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          Monitor
                        </Link>
                      </div>
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
