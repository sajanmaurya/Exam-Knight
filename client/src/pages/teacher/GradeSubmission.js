import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// ── AnswerCard ────────────────────────────────────────────────────────────────

function AnswerCard({ answer, examTotalMarks, onGrade }) {
  const { Question: question, selectedOption } = answer;
  const [marksInput, setMarksInput] = useState(
    answer.marksAwarded != null ? String(answer.marksAwarded) : ''
  );
  const [grading, setGrading] = useState(false);

  const isAutoGraded = question?.type === 'mcq';

  const handleGrade = async () => {
    const marks = parseFloat(marksInput);
    if (isNaN(marks) || marks < 0) return toast.error('Enter a valid non-negative number');
    if (marks > question?.marks) return toast.error(`Max marks for this question is ${question.marks}`);
    setGrading(true);
    try {
      await onGrade(answer.id, marks);
      toast.success('Marks awarded');
    } finally {
      setGrading(false);
    }
  };

  const correctOption = question?.options?.find((o) => o.isCorrect);

  return (
    <div className="question-card" style={{ marginBottom: 16 }}>
      {/* Question header */}
      <div className="question-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="question-number">Q</span>
          <span className={`badge ${question?.type === 'mcq' ? 'badge-info' : question?.type === 'coding' ? 'badge-warning' : 'badge-gray'}`}>
            {question?.type || 'unknown'}
          </span>
        </div>
        <span className="question-marks">{question?.marks} {question?.marks === 1 ? 'mark' : 'marks'}</span>
      </div>

      {/* Question text */}
      <p className="question-text">{question?.text}</p>

      {/* Student's Answer */}
      <div style={{ background: '#f8fafc', borderRadius: 6, padding: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Student's Answer
        </div>
        {question?.type === 'mcq' ? (
          selectedOption ? (
            <p style={{ fontSize: 14, fontWeight: 500 }}>{selectedOption.text}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-lighter)', fontStyle: 'italic' }}>Not answered</p>
          )
        ) : (
          answer.textAnswer ? (
            <p style={{ fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{answer.textAnswer}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-lighter)', fontStyle: 'italic' }}>Not answered</p>
          )
        )}
      </div>

      {/* Correct Answer for MCQ */}
      {question?.type === 'mcq' && correctOption && (
        <div style={{ background: '#f0fdf4', borderRadius: 6, padding: 12, marginBottom: 12, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 12, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Correct Answer
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#166534' }}>{correctOption.text}</p>
        </div>
      )}

      {/* Marks awarded / grading row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAutoGraded ? (
            <span style={{ fontSize: 14 }}>
              Marks:{' '}
              <strong style={{ color: answer.marksAwarded > 0 ? 'var(--success)' : answer.marksAwarded === 0 ? 'var(--danger)' : 'var(--text-light)' }}>
                {answer.marksAwarded != null ? `${answer.marksAwarded} / ${question.marks}` : 'Pending'}
              </strong>
            </span>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ margin: 0, whiteSpace: 'nowrap', fontSize: 14 }}>Award marks:</label>
                <input
                  className="form-control"
                  type="number"
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  min={0}
                  max={question?.marks}
                  step={0.5}
                  style={{ width: 80 }}
                  placeholder={`0 – ${question?.marks}`}
                />
                <span style={{ fontSize: 13, color: 'var(--text-light)' }}>/ {question?.marks}</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleGrade} disabled={grading}>
                {grading ? 'Saving...' : 'Grade'}
              </button>
            </>
          )}
        </div>

        {answer.marksAwarded != null && (
          <span className={`badge ${answer.marksAwarded >= question?.marks ? 'badge-success' : answer.marksAwarded > 0 ? 'badge-warning' : 'badge-danger'}`}>
            {answer.marksAwarded >= question?.marks ? 'Full marks' : answer.marksAwarded > 0 ? 'Partial' : 'No marks'}
          </span>
        )}
      </div>
    </div>
  );
}

// ── GradeSubmission (main) ───────────────────────────────────────────────────

export default function GradeSubmission() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);

  const fetchSubmission = useCallback(async () => {
    try {
      const { data } = await api.get(`/submissions/${submissionId}/detail`);
      setSubmission(data.submission);
      setAnswers(data.submission?.answers || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleGrade = useCallback(async (answerId, marksAwarded) => {
    await api.put(`/submissions/answers/${answerId}/grade`, { marksAwarded });
    setAnswers((prev) =>
      prev.map((a) => (a.id === answerId ? { ...a, marksAwarded } : a))
    );
  }, []);

  if (loading) return <div className="spinner" />;
  if (!submission) return <div className="card"><p>Submission not found.</p></div>;

  const { student, exam, status, totalScore, proctoringLogs = [] } = submission;

  const awarded = answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
  const gradedCount = answers.filter((a) => a.marksAwarded != null).length;

  // Proctoring log summary
  const logTypeCounts = proctoringLogs.reduce((acc, log) => {
    const key = log.eventType || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Grade Submission</h1>
          <p>{exam?.title}</p>
        </div>
        <Link to={`/teacher/exams/${submission.examId}/monitor`} className="btn btn-outline btn-sm">
          Back to Exam
        </Link>
      </div>

      {/* Student & Score summary */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Student</div>
            <div style={{ fontWeight: 600 }}>{student?.name || 'Unknown'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>{student?.email}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Status</div>
            <span className={`badge ${status === 'graded' ? 'badge-success' : status === 'submitted' ? 'badge-info' : 'badge-gray'}`}>
              {status}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Score</div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>
              {totalScore != null ? totalScore : awarded} / {exam?.totalMarks}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Graded</div>
            <div style={{ fontWeight: 500 }}>{gradedCount} / {answers.length} questions</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Proctoring Events</div>
            <div style={{ fontWeight: 500, color: proctoringLogs.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {proctoringLogs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Logs */}
      {proctoringLogs.length > 0 && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--danger)' }}>
            Proctoring Log Summary
          </h3>

          {/* Summary table */}
          <div className="table-container" style={{ marginBottom: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(logTypeCounts).map(([type, count]) => (
                  <tr key={type}>
                    <td>{type.replace(/_/g, ' ')}</td>
                    <td>
                      <span className={`badge ${count > 2 ? 'badge-danger' : 'badge-warning'}`}>{count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed log (last 10) */}
          <details style={{ fontSize: 13 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--text-light)', marginBottom: 8 }}>
              Show detailed log ({proctoringLogs.length} events)
            </summary>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {proctoringLogs.map((log, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—'}
                      </td>
                      <td>{log.type || log.event || '—'}</td>
                      <td>{log.message || log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      {/* Answers */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          Answers ({answers.length})
        </h3>
        {answers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-light)' }}>
            No answers recorded for this submission.
          </div>
        ) : (
          answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              examTotalMarks={exam?.totalMarks}
              onGrade={handleGrade}
            />
          ))
        )}
      </div>
    </div>
  );
}
