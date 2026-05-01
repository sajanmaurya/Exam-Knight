import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* Badge class for each event type */
const EVENT_BADGE = {
  tab_switch:          'badge-warning',
  fullscreen_exit:     'badge-warning',
  inactivity:          'badge-warning',
  copy_attempt:        'badge-danger',
  paste_attempt:       'badge-danger',
  face_not_detected:   'badge-danger',
  multiple_faces:      'badge-danger',
  devtools_open:       'badge-danger',
  right_click:         'badge-secondary',
  browser_resize:      'badge-secondary',
};

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleString();
}

function formatDetails(details) {
  if (!details) return '—';
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  }
  return JSON.stringify(details, null, 2);
}

export default function ProctoringLogs() {
  useAuth();
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [examId,     setExamId]     = useState('');
  const [studentId,  setStudentId]  = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (examId.trim())    params.examId    = examId.trim();
      if (studentId.trim()) params.studentId = studentId.trim();

      const res = await api.get('/admin/proctoring-logs', { params });
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load proctoring logs');
    } finally {
      setLoading(false);
    }
  }, [examId, studentId]);

  /* Load on mount with empty filters */
  useEffect(() => { fetchLogs(); }, []); // eslint-disable-line

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="admin-proctoring-logs">
      <div className="page-header">
        <h1>Proctoring Logs</h1>
      </div>

      {/* Filter form */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <label htmlFor="filterExamId">Exam ID</label>
            <input
              id="filterExamId"
              className="form-control"
              type="text"
              placeholder="Any exam"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1 1 160px' }}>
            <label htmlFor="filterStudentId">Student ID</label>
            <input
              id="filterStudentId"
              className="form-control"
              type="text"
              placeholder="Any student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading…' : 'Apply Filters'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setExamId(''); setStudentId(''); }}
          >
            Clear
          </button>
        </form>
      </div>

      {/* Logs table */}
      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : logs.length === 0 ? (
          <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>
            No proctoring logs found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Exam ID</th>
                  <th>Student ID</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(log.timestamp)}</td>
                    <td>
                      <span
                        className={`badge ${EVENT_BADGE[log.eventType] || 'badge-secondary'}`}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {log.eventType}
                      </span>
                    </td>
                    <td>{log.Submission?.examId ?? '—'}</td>
                    <td>{log.Submission?.studentId ?? '—'}</td>
                    <td>
                      {log.details ? (
                        <pre
                          style={{
                            margin: 0,
                            fontSize: '0.75rem',
                            background: '#f8f9fa',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            maxWidth: '300px',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {formatDetails(log.details)}
                        </pre>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0.5rem 0', color: '#6c757d', fontSize: '0.875rem' }}>
              Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
