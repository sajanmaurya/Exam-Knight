import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get('/exams/teacher/question-bank');
        setQuestions(data.questions || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load question bank');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Collect all unique tags from questions for the tag filter dropdown
  const allTags = useMemo(() => {
    const tagSet = new Set();
    questions.forEach((q) => {
      const tags = Array.isArray(q.tags) ? q.tags : (q.tags ? [q.tags] : []);
      tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterType && q.type !== filterType) return false;
      if (filterDifficulty && q.difficulty !== filterDifficulty) return false;
      if (filterTag) {
        const tags = Array.isArray(q.tags) ? q.tags : (q.tags ? [q.tags] : []);
        if (!tags.includes(filterTag)) return false;
      }
      return true;
    });
  }, [questions, filterType, filterDifficulty, filterTag]);

  const typeBadgeClass = (type) => {
    if (type === 'mcq') return 'badge-info';
    if (type === 'coding') return 'badge-warning';
    return 'badge-gray';
  };

  const difficultyBadgeClass = (diff) => {
    if (diff === 'easy') return 'badge-success';
    if (diff === 'hard') return 'badge-danger';
    return 'badge-warning';
  };

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header">
        <h1>Question Bank</h1>
        <p>Browse all questions you have created across your exams.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 150 }}>
            <label>Type</label>
            <select className="form-control" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="subjective">Subjective</option>
              <option value="coding">Coding</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: 150 }}>
            <label>Difficulty</label>
            <select className="form-control" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {allTags.length > 0 && (
            <div className="form-group" style={{ marginBottom: 0, minWidth: 150 }}>
              <label>Tag</label>
              <select className="form-control" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: 'var(--text-light)', fontSize: 14, paddingBottom: 2 }}>
            {filtered.length} of {questions.length} question{questions.length !== 1 ? 's' : ''}
          </div>

          {(filterType || filterDifficulty || filterTag) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => { setFilterType(''); setFilterDifficulty(''); setFilterTag(''); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
          {questions.length === 0
            ? 'Your question bank is empty. Add questions to your exams to see them here.'
            : 'No questions match the selected filters.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((q, idx) => {
            const tags = Array.isArray(q.tags) ? q.tags : (q.tags ? [q.tags] : []);
            return (
              <div className="card" key={q.id} style={{ marginBottom: 0 }}>
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className={`badge ${typeBadgeClass(q.type)}`}>{q.type}</span>
                  {q.difficulty && (
                    <span className={`badge ${difficultyBadgeClass(q.difficulty)}`}>{q.difficulty}</span>
                  )}
                  <span className="badge badge-gray">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                </div>

                {/* Question Text */}
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, lineHeight: 1.6 }}>
                  {q.text.length > 160 ? q.text.slice(0, 160) + '…' : q.text}
                </p>

                {/* MCQ Options preview */}
                {q.type === 'mcq' && q.options?.length > 0 && (
                  <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: 10 }}>
                    {q.options.slice(0, 4).map((opt) => (
                      <li
                        key={opt.id}
                        style={{
                          fontSize: 13, padding: '4px 8px', marginBottom: 4, borderRadius: 4,
                          background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
                          color: opt.isCorrect ? 'var(--success)' : 'var(--text)',
                          border: `1px solid ${opt.isCorrect ? '#bbf7d0' : 'var(--border)'}`,
                        }}
                      >
                        {opt.isCorrect ? '✓ ' : '○ '}{opt.text}
                      </li>
                    ))}
                    {q.options.length > 4 && (
                      <li style={{ fontSize: 12, color: 'var(--text-light)', paddingLeft: 8 }}>
                        +{q.options.length - 4} more options
                      </li>
                    )}
                  </ul>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 12,
                          background: '#eff6ff', color: 'var(--primary)', border: '1px solid #bfdbfe',
                          cursor: 'pointer',
                        }}
                        onClick={() => setFilterTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span style={{ fontSize: 11, color: 'var(--text-lighter)' }}>+{tags.length - 3}</span>
                    )}
                  </div>
                  {q.Exam?.title && (
                    <span style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'right', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.Exam.title}
                    </span>
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
