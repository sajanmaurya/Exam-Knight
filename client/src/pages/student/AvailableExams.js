import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AvailableExams() {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/exams/student/available');
      setExams(data.exams || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load available exams.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAttemptInfo = (exam) => {
    if (!exam.submissions || exam.submissions.length === 0) return null;
    return exam.submissions[0];
  };

  const isExamActive = (exam) => {
    const now = new Date();
    const start = exam.startTime ? new Date(exam.startTime) : null;
    const end = exam.endTime ? new Date(exam.endTime) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>Available Exams</h1>
        <p>Browse and start exams assigned to you.</p>
      </div>

      {exams.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon">🗂️</div>
            <h3>No exams available right now</h3>
            <p>Check back later or contact your teacher.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {exams.map((exam) => {
            const attempt = getAttemptInfo(exam);
            const active = isExamActive(exam);

            return (
              <div className="card" key={exam.id} style={{ margin: 0 }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.3 }}>{exam.title}</h3>
                    {attempt ? (
                      <AttemptBadge status={attempt.status} />
                    ) : active ? (
                      <span className="badge badge-success">Open</span>
                    ) : (
                      <span className="badge badge-gray">Closed</span>
                    )}
                  </div>
                  {exam.description && (
                    <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {exam.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <InfoItem label="Subject" value={exam.subject || '—'} />
                  <InfoItem label="Duration" value={formatDuration(exam.duration)} />
                  <InfoItem label="Total Marks" value={exam.totalMarks ?? '—'} />
                  <InfoItem label="Teacher" value={exam.teacher?.name || '—'} />
                </div>

                {(exam.startTime || exam.endTime) && (
                  <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    {exam.startTime && <div>Starts: {formatDate(exam.startTime)}</div>}
                    {exam.endTime && <div>Ends: {formatDate(exam.endTime)}</div>}
                  </div>
                )}

                <div>
                  {attempt ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                        Already attempted
                      </span>
                      {attempt.totalScore != null && (
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          Score: {attempt.totalScore} / {exam.totalMarks ?? '—'}
                        </span>
                      )}
                    </div>
                  ) : active ? (
                    <Link
                      to={`/student/exam/${exam.id}`}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Start Exam
                    </Link>
                  ) : (
                    <button className="btn btn-outline" disabled style={{ width: '100%', justifyContent: 'center' }}>
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ fontSize: '13px' }}>
      <span style={{ color: 'var(--text-lighter)', display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function AttemptBadge({ status }) {
  const map = {
    passed: 'badge-success',
    failed: 'badge-danger',
    pending: 'badge-warning',
    submitted: 'badge-info',
    grading: 'badge-warning',
  };
  const cls = map[status] || 'badge-gray';
  return (
    <span className={`badge ${cls}`} style={{ whiteSpace: 'nowrap' }}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Attempted'}
    </span>
  );
}
