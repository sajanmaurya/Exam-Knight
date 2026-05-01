import React, { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import api from '../../utils/api';

export default function MyResults() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions/my-submissions')
      .then(r => setSubmissions(r.data.submissions.filter(s => s.status !== 'in_progress')))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getPercentage = (s) => {
    if (s.totalScore == null || !s.exam?.totalMarks) return null;
    return ((s.totalScore / s.exam.totalMarks) * 100).toFixed(1);
  };

  const getGrade = (pct) => {
    if (!pct) return '—';
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  return (
    <>
      <div className="page-header">
        <h1>My Results</h1>
        <p>Your exam history and scores</p>
      </div>

      {loading ? <div className="spinner" /> : submissions.length === 0 ? (
        <div className="empty-state card">
          <div className="icon"><FiAward /></div>
          <h3>No results yet</h3>
          <p>Complete an exam to see your results here.</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead><tr>
                <th>Exam</th><th>Subject</th><th>Score</th><th>Percentage</th><th>Grade</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {submissions.map(s => {
                  const pct = getPercentage(s);
                  const grade = getGrade(parseFloat(pct));
                  const passed = s.exam?.passingMarks != null && s.totalScore >= s.exam.passingMarks;
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text)' }}>{s.exam?.title}</td>
                      <td>{s.exam?.subject || '—'}</td>
                      <td>
                        {s.exam?.showResults && s.totalScore != null
                          ? `${s.totalScore} / ${s.exam.totalMarks}`
                          : '—'}
                      </td>
                      <td>
                        {pct && s.exam?.showResults ? (
                          <span style={{ color: parseFloat(pct) >= 50 ? 'var(--success)' : 'var(--danger)' }}>
                            {pct}%
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ fontWeight: 700 }}>{s.exam?.showResults ? grade : '—'}</td>
                      <td>
                        <span className={`badge badge-${passed ? 'success' : 'danger'}`}>
                          {s.exam?.showResults ? (passed ? 'Passed' : 'Failed') : s.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
