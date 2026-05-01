import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_BADGE = {
  active:   'badge-success',
  draft:    'badge-secondary',
  ended:    'badge-danger',
  upcoming: 'badge-warning',
};

export default function AdminExams() {
  useAuth();
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/exams/all');
        setExams(res.data.exams || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load exams');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="admin-exams">
      <div className="page-header">
        <h1>All Exams</h1>
      </div>

      <div className="card">
        {exams.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>No exams found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Status</th>
                  <th>Submissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.id}</td>
                    <td>{exam.title}</td>
                    <td>{exam.subject || '—'}</td>
                    <td>
                      {exam.teacher ? (
                        <span title={exam.teacher.email}>{exam.teacher.name}</span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[exam.status] || 'badge-secondary'}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {Array.isArray(exam.submissions) ? exam.submissions.length : 0}
                    </td>
                    <td>{exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <Link
                        to={`/exams/${exam.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </Link>
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
