import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function Results() {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/submissions/my-submissions');
      setSubmissions(data.submissions || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scorePercent = (score, total) => {
    if (score == null || !total) return null;
    return Math.round((score / total) * 100);
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>My Results</h1>
        <p>View scores and statuses for all your submitted exams.</p>
      </div>

      <div className="card">
        {submissions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📄</div>
            <h3>No submissions yet</h3>
            <p>You haven't submitted any exams. Head to Available Exams to begin.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const pct = scorePercent(sub.totalScore, sub.exam?.totalMarks);
                  const showScore = sub.exam?.showResults;
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 500 }}>{sub.exam?.title || '—'}</td>
                      <td>{sub.exam?.subject || '—'}</td>
                      <td style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                        {formatDate(sub.submittedAt || sub.updatedAt)}
                      </td>
                      <td>
                        {showScore ? (
                          <span>
                            {sub.totalScore ?? '—'}{' '}
                            <span style={{ color: 'var(--text-lighter)' }}>
                              / {sub.exam?.totalMarks ?? '—'}
                            </span>
                          </span>
                        ) : (
                          <span className="badge badge-gray">Hidden</span>
                        )}
                      </td>
                      <td>
                        {showScore && pct !== null ? (
                          <span style={{ fontWeight: 600, color: pct >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                            {pct}%
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <StatusBadge status={sub.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary footer */}
      {submissions.length > 0 && (
        <div className="stats-grid" style={{ marginTop: '16px' }}>
          <SummaryCard
            icon="📝"
            iconClass="blue"
            value={submissions.length}
            label="Total Submitted"
          />
          <SummaryCard
            icon="✅"
            iconClass="green"
            value={submissions.filter((s) => s.status === 'passed').length}
            label="Passed"
          />
          <SummaryCard
            icon="❌"
            iconClass="red"
            value={submissions.filter((s) => s.status === 'failed').length}
            label="Failed"
          />
          <SummaryCard
            icon="⏳"
            iconClass="orange"
            value={submissions.filter((s) => !['passed', 'failed'].includes(s.status)).length}
            label="Pending / Grading"
          />
        </div>
      )}
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
  return (
    <span className={`badge ${cls}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}

function SummaryCard({ icon, iconClass, value, label }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
