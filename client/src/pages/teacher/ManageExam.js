import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// ── helpers ──────────────────────────────────────────────────────────────────

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

const defaultQuestion = {
  type: 'mcq',
  text: '',
  marks: 1,
  difficulty: 'medium',
  tags: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  maxWords: '',
  testCases: '',
};

// ── QuestionForm ──────────────────────────────────────────────────────────────

function QuestionForm({ initial, onSave, onCancel, saving }) {
  const [q, setQ] = useState(initial || defaultQuestion);

  const setField = (field, value) => setQ((prev) => ({ ...prev, [field]: value }));

  const addOption = () =>
    setQ((prev) => ({ ...prev, options: [...prev.options, { text: '', isCorrect: false }] }));

  const removeOption = (idx) =>
    setQ((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));

  const setOptionText = (idx, text) =>
    setQ((prev) => {
      const options = [...prev.options];
      options[idx] = { ...options[idx], text };
      return { ...prev, options };
    });

  const setCorrect = (idx) =>
    setQ((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.text.trim()) return toast.error('Question text is required');
    if (q.type === 'mcq') {
      if (q.options.length < 2) return toast.error('MCQ needs at least 2 options');
      if (!q.options.some((o) => o.isCorrect)) return toast.error('Mark at least one correct option');
      if (q.options.some((o) => !o.text.trim())) return toast.error('All option texts are required');
    }
    onSave(q);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f8fafc', borderRadius: 8, padding: 20, marginBottom: 16, border: '1px solid var(--border)' }}>
      <div className="form-row">
        <div className="form-group">
          <label>Question Type</label>
          <select className="form-control" value={q.type} onChange={(e) => setField('type', e.target.value)}>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="subjective">Subjective</option>
            <option value="coding">Coding</option>
          </select>
        </div>
        <div className="form-group">
          <label>Marks</label>
          <input className="form-control" type="number" value={q.marks} min={1} onChange={(e) => setField('marks', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Difficulty</label>
          <select className="form-control" value={q.difficulty} onChange={(e) => setField('difficulty', e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-control" value={q.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="e.g. algebra, calculus" />
        </div>
      </div>

      <div className="form-group">
        <label>Question Text *</label>
        <textarea className="form-control" value={q.text} onChange={(e) => setField('text', e.target.value)} placeholder="Enter your question here..." required />
      </div>

      {/* MCQ Options */}
      {q.type === 'mcq' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>
            Options <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(click circle to mark correct)</span>
          </label>
          {q.options.map((opt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => setCorrect(idx)}
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  border: `2px solid ${opt.isCorrect ? 'var(--success)' : 'var(--border)'}`,
                  background: opt.isCorrect ? 'var(--success)' : '#fff',
                }}
                title="Mark as correct"
              />
              <input
                className="form-control"
                value={opt.text}
                onChange={(e) => setOptionText(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                style={{ flex: 1 }}
              />
              {q.options.length > 2 && (
                <button type="button" onClick={() => removeOption(idx)} className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addOption}>
            + Add Option
          </button>
        </div>
      )}

      {/* Subjective */}
      {q.type === 'subjective' && (
        <div className="form-group">
          <label>Max Words</label>
          <input className="form-control" type="number" value={q.maxWords} min={0} onChange={(e) => setField('maxWords', e.target.value)} placeholder="e.g. 500" />
        </div>
      )}

      {/* Coding */}
      {q.type === 'coding' && (
        <div className="form-group">
          <label>Test Cases (JSON array)</label>
          <textarea
            className="form-control"
            value={q.testCases}
            onChange={(e) => setField('testCases', e.target.value)}
            placeholder={'[{"input": "1 2", "output": "3"}]'}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}

// ── ManageExam (main component) ───────────────────────────────────────────────

export default function ManageExam() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // question form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null); // { idx, question }
  const [savingQ, setSavingQ] = useState(false);

  // publish
  const [publishing, setPublishing] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const { data } = await api.get(`/exams/${examId}`);
      setExam(data.exam);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const fetchSubmissions = useCallback(async () => {
    setSubsLoading(true);
    try {
      const { data } = await api.get(`/exams/${examId}/submissions`);
      setSubmissions(data.submissions || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load submissions');
    } finally {
      setSubsLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, fetchSubmissions]);

  const handlePublish = async () => {
    if (!window.confirm('Publish this exam? Students will be able to see and take it.')) return;
    setPublishing(true);
    try {
      await api.post(`/exams/${exam.id}/publish`);
      toast.success('Exam published successfully');
      setExam((prev) => ({ ...prev, status: 'published' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish exam');
    } finally {
      setPublishing(false);
    }
  };

  const buildQuestionPayload = (q) => {
    const payload = {
      type: q.type,
      text: q.text,
      marks: Number(q.marks),
      difficulty: q.difficulty,
      tags: q.tags ? q.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (q.type === 'mcq') payload.options = q.options;
    if (q.type === 'subjective' && q.maxWords) payload.maxWords = Number(q.maxWords);
    if (q.type === 'coding' && q.testCases) {
      try {
        payload.testCases = JSON.parse(q.testCases);
      } catch {
        toast.error('Test cases JSON is invalid');
        return null;
      }
    }
    return payload;
  };

  const handleAddQuestion = async (q) => {
    const payload = buildQuestionPayload(q);
    if (!payload) return;
    setSavingQ(true);
    try {
      const { data } = await api.post(`/exams/${examId}/questions`, payload);
      setExam((prev) => ({
        ...prev,
        questions: [...(prev.questions || []), data.question || data],
      }));
      setShowAddForm(false);
      toast.success('Question added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add question');
    } finally {
      setSavingQ(false);
    }
  };

  const handleEditQuestion = async (q) => {
    const payload = buildQuestionPayload(q);
    if (!payload) return;
    setSavingQ(true);
    try {
      const { data } = await api.put(`/exams/questions/${editingQuestion.question.id}`, payload);
      setExam((prev) => ({
        ...prev,
        questions: prev.questions.map((existing) =>
          existing.id === editingQuestion.question.id ? (data.question || data) : existing
        ),
      }));
      setEditingQuestion(null);
      toast.success('Question updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update question');
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/exams/questions/${questionId}`);
      setExam((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
      toast.success('Question deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const questionInitialForEdit = (q) => ({
    type: q.type,
    text: q.text,
    marks: q.marks,
    difficulty: q.difficulty || 'medium',
    tags: Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || ''),
    options: q.options || [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
    maxWords: q.maxWords || '',
    testCases: q.testCases ? JSON.stringify(q.testCases, null, 2) : '',
  });

  if (loading) return <div className="spinner" />;
  if (!exam) return <div className="card"><p>Exam not found.</p></div>;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>{exam.title}</h1>
          <p>{exam.subject} &mdash; {exam.duration} min &mdash; {exam.totalMarks} marks</p>
        </div>
        <div className="btn-group">
          {(exam.status === 'draft') && (
            <button className="btn btn-success" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {statusBadge(exam.status)}
          <Link to={`/teacher/exams/${exam.id}/monitor`} className="btn btn-outline">
            Monitor
          </Link>
        </div>
      </div>

      {/* Exam Details Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Start Time</div>
            <div style={{ fontWeight: 500 }}>{exam.startTime ? new Date(exam.startTime).toLocaleString() : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>End Time</div>
            <div style={{ fontWeight: 500 }}>{exam.endTime ? new Date(exam.endTime).toLocaleString() : '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Passing Marks</div>
            <div style={{ fontWeight: 500 }}>{exam.passingMarks}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Negative Marking</div>
            <div style={{ fontWeight: 500 }}>{exam.negativeMarking || 0}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Max Attempts</div>
            <div style={{ fontWeight: 500 }}>{exam.maxAttempts || 1}</div>
          </div>
        </div>
        {exam.instructions && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Instructions</div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>{exam.instructions}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 24 }}>
        {['questions', 'submissions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, background: 'none',
              borderBottom: `3px solid ${activeTab === tab ? 'var(--primary)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-light)',
              textTransform: 'capitalize', marginBottom: -2,
            }}
          >
            {tab === 'questions' ? `Questions (${exam.questions?.length || 0})` : `Submissions (${submissions.length})`}
          </button>
        ))}
      </div>

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div>
          {(exam.questions || []).map((q, idx) => (
            <div key={q.id}>
              {editingQuestion?.question.id === q.id ? (
                <QuestionForm
                  initial={questionInitialForEdit(q)}
                  onSave={handleEditQuestion}
                  onCancel={() => setEditingQuestion(null)}
                  saving={savingQ}
                />
              ) : (
                <div className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Q{idx + 1}.</span>
                        <span className={`badge ${q.type === 'mcq' ? 'badge-info' : q.type === 'coding' ? 'badge-warning' : 'badge-gray'}`}>
                          {q.type}
                        </span>
                        <span className="badge badge-gray">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                        {q.difficulty && (
                          <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 15, marginBottom: 8 }}>{q.text}</p>
                      {q.type === 'mcq' && q.options?.length > 0 && (
                        <ul style={{ listStyle: 'none', paddingLeft: 16 }}>
                          {q.options.map((opt) => (
                            <li key={opt.id} style={{ fontSize: 13, marginBottom: 4, color: opt.isCorrect ? 'var(--success)' : 'var(--text)' }}>
                              {opt.isCorrect ? '✓ ' : '○ '}{opt.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="btn-group" style={{ flexShrink: 0 }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditingQuestion({ question: q })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {showAddForm ? (
            <QuestionForm
              initial={defaultQuestion}
              onSave={handleAddQuestion}
              onCancel={() => setShowAddForm(false)}
              saving={savingQ}
            />
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => { setShowAddForm(true); setEditingQuestion(null); }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              + Add Question
            </button>
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="card">
          {subsLoading ? (
            <div className="spinner" />
          ) : submissions.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '32px 0' }}>
              No submissions yet.
            </p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 500 }}>
                        {sub.student?.name || sub.Student?.name || 'N/A'}
                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                          {sub.student?.email || sub.Student?.email || ''}
                        </div>
                      </td>
                      <td>{sub.totalScore != null ? `${sub.totalScore} / ${exam.totalMarks}` : '—'}</td>
                      <td>
                        <span className={`badge ${sub.status === 'graded' ? 'badge-success' : sub.status === 'submitted' ? 'badge-info' : 'badge-gray'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</td>
                      <td>
                        <Link to={`/teacher/grade/${sub.id}`} className="btn btn-outline btn-sm">
                          Grade
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
