import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useAntiCheat from '../../hooks/useAntiCheat';
import FaceDetection from '../../components/exam/FaceDetection';
import CodeRunner from '../../components/exam/CodeRunner';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const socket = useSocket();

  // Core exam state
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submission, setSubmission] = useState(null);

  // UI state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedOptionId?, textAnswer? }
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(null); // seconds

  // Anti-cheat state
  const [proctorWarning, setProctorWarning] = useState(null);

  // Refs to avoid stale closures in event listeners / intervals
  const submissionRef = useRef(null);
  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const autoSubmitCalledRef = useRef(false);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const logProctoringEvent = useCallback(async (eventType) => {
    if (!submissionRef.current) return;
    try {
      await api.post(`/submissions/${submissionRef.current.id}/proctor-log`, { eventType });
    } catch {
      // silently ignore – proctoring logs should not block the student
    }
  }, []);

  const doSubmit = useCallback(async () => {
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;

    // Clear timer and heartbeat
    if (timerRef.current) clearInterval(timerRef.current);
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    if (!submissionRef.current) return;

    try {
      setSubmitting(true);
      await api.post(`/submissions/${submissionRef.current.id}/submit`);
      toast.success('Exam submitted successfully!');
      if (socket) socket.emit('leave_exam', { examId, submissionId: submissionRef.current.id });
      navigate('/student/results');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit exam.');
      autoSubmitCalledRef.current = false;
      setSubmitting(false);
    }
  }, [examId, navigate, socket]);

  // ─── Mount: start exam ───────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const startExam = async () => {
      try {
        const { data } = await api.post(`/submissions/start/${examId}`);
        if (cancelled) return;

        const { submission: sub, questions: qs, exam: ex } = data;
        submissionRef.current = sub;
        setSubmission(sub);
        setQuestions(qs || []);
        setExam(ex);

        // Restore previously saved answers if any are returned
        if (sub.answers) {
          const restored = {};
          sub.answers.forEach((a) => {
            restored[a.questionId] = {
              selectedOptionId: a.selectedOptionId || null,
              textAnswer: a.textAnswer || '',
            };
          });
          setAnswers(restored);
        }

        // Calculate remaining time
        const startedAt = new Date(sub.startedAt).getTime();
        const durationMs = (ex.duration || 60) * 60 * 1000;
        const endAt = startedAt + durationMs;
        const remaining = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
        setTimeLeft(remaining);
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.response?.data?.message || 'Could not start the exam.');
          navigate('/student/exams');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    startExam();
    return () => { cancelled = true; };
  }, [examId, navigate]);

  // ─── Timer ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.warn('Time is up! Auto-submitting your exam.');
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft === null, doSubmit]); // only re-run when timeLeft transitions from null

  // ─── Socket: join_exam + heartbeat ───────────────────────────────────────────

  useEffect(() => {
    if (!socket || !submission) return;

    socket.emit('join_exam', { examId, submissionId: submission.id });

    heartbeatRef.current = setInterval(() => {
      socket.emit('heartbeat', { examId, submissionId: submission.id });
    }, 30000);

    return () => {
      clearInterval(heartbeatRef.current);
      socket.emit('leave_exam', { examId, submissionId: submission.id });
    };
  }, [socket, submission, examId]);

  // ─── Anti-cheat hook (fullscreen, tab-switch, copy/paste, right-click,
  //     devtools, resize, inactivity, text-selection CSS) ──────────────────────
  useAntiCheat({
    submissionId: submission?.id || null,
    examId,
    enabled: !loading && !!submission,
    onWarning: setProctorWarning,
    socket,
  });

  // ─── Answer save ────────────────────────────────────────────────────────────

  const saveAnswer = useCallback(
    async (questionId, payload) => {
      if (!submissionRef.current) return;
      setSavingAnswer(true);
      try {
        await api.post(`/submissions/${submissionRef.current.id}/answer`, {
          questionId,
          ...payload,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to save answer. Please try again.');
      } finally {
        setSavingAnswer(false);
      }
    },
    []
  );

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { selectedOptionId: optionId } }));
    saveAnswer(questionId, { selectedOptionId: optionId });
  };

  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { textAnswer: text } }));
  };

  // Debounced save for text answers
  const textSaveTimer = useRef({});
  const handleTextBlur = (questionId) => {
    const answer = answers[questionId];
    if (answer?.textAnswer !== undefined) {
      saveAnswer(questionId, { textAnswer: answer.textAnswer });
    }
  };
  const handleTextChangeDebounced = (questionId, text) => {
    handleTextChange(questionId, text);
    if (textSaveTimer.current[questionId]) clearTimeout(textSaveTimer.current[questionId]);
    textSaveTimer.current[questionId] = setTimeout(() => {
      saveAnswer(questionId, { textAnswer: text });
    }, 1500);
  };

  // ── Code runner handler (saves code as textAnswer) ───────────────────────────
  const handleCodeChange = (questionId, code) => {
    handleTextChangeDebounced(questionId, code);
  };

  // ─── Timer display ───────────────────────────────────────────────────────────

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerClass = () => {
    if (timeLeft === null) return 'exam-timer';
    if (timeLeft < 60) return 'exam-timer danger';
    if (timeLeft < 300) return 'exam-timer warning';
    return 'exam-timer';
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <div className="spinner" />;
  if (!exam || questions.length === 0) {
    return (
      <div className="exam-container">
        <div className="card">
          <div className="empty-state">
            <div className="icon">⚠️</div>
            <h3>No questions found</h3>
            <p>This exam has no questions. Please contact your teacher.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id] || {};

  const answeredCount = Object.keys(answers).filter((qId) => {
    const a = answers[qId];
    return a.selectedOptionId || (a.textAnswer && a.textAnswer.trim());
  }).length;

  return (
    <div>
      {/* Proctoring warning bar */}
      {proctorWarning && (
        <div className="proctor-bar">
          ⚠️ {proctorWarning}
          <button
            onClick={() => setProctorWarning(null)}
            style={{ marginLeft: '16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: '#fff', padding: '2px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Fixed timer */}
      <div className={timerClass()} style={proctorWarning ? { top: '56px' } : {}}>
        <span>⏱</span>
        <span>{formatTime(timeLeft)}</span>
      </div>

      <div className="exam-container" style={{ paddingTop: proctorWarning ? '48px' : '0' }}>
        {/* Exam header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>{exam.title}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
            {answeredCount} of {questions.length} answered
            {savingAnswer && (
              <span style={{ marginLeft: '12px', color: 'var(--primary)', fontSize: '12px' }}>Saving…</span>
            )}
          </p>
        </div>

        {/* Instructions */}
        {exam.instructions && (
          <div className="alert alert-warning" style={{ marginBottom: '20px', fontSize: '13px' }}>
            <strong>Instructions: </strong>{exam.instructions}
            {exam.negativeMarking && (
              <span style={{ marginLeft: '8px', color: 'var(--danger)' }}>
                | Negative marking is enabled.
              </span>
            )}
          </div>
        )}

        {/* Question navigator */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Question Navigator
          </div>
          <div className="question-nav">
            {questions.map((q, idx) => {
              const a = answers[q.id];
              const isAnswered = a && (a.selectedOptionId || (a.textAnswer && a.textAnswer.trim()));
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  className={isCurrent ? 'current' : isAnswered ? 'answered' : ''}
                  onClick={() => setCurrentIndex(idx)}
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: 'var(--text-light)' }}>
            <LegendDot color="var(--primary)" label="Current" />
            <LegendDot color="var(--success)" label="Answered" />
            <LegendDot color="var(--border)" label="Unanswered" />
          </div>
        </div>

        {/* Current question */}
        {currentQuestion && (
          <div className="question-card">
            <div className="question-header">
              <span className="question-number">Question {currentIndex + 1} of {questions.length}</span>
              <span className="question-marks">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</span>
            </div>
            <div className="question-text">{currentQuestion.text}</div>

            {/* MCQ options */}
            {currentQuestion.type === 'mcq' && currentQuestion.options?.length > 0 && (
              <ul className="option-list">
                {currentQuestion.options.map((opt) => {
                  const selected = currentAnswer.selectedOptionId === opt.id;
                  return (
                    <li
                      key={opt.id}
                      className={`option-item${selected ? ' selected' : ''}`}
                      onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOptionSelect(currentQuestion.id, opt.id); }}
                    >
                      <span className="option-radio" />
                      <span>{opt.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Subjective */}
            {currentQuestion.type === 'subjective' && (
              <div className="form-group" style={{ margin: 0 }}>
                {currentQuestion.maxWords && (
                  <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginBottom: '6px' }}>
                    Max words: {currentQuestion.maxWords}
                    {currentAnswer.textAnswer && (
                      <span> | Current: {currentAnswer.textAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                    )}
                  </div>
                )}
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Write your answer here…"
                  value={currentAnswer.textAnswer || ''}
                  onChange={(e) => handleTextChangeDebounced(currentQuestion.id, e.target.value)}
                  onBlur={() => handleTextBlur(currentQuestion.id)}
                />
              </div>
            )}

            {/* Coding — full CodeRunner with language selector, run button, output */}
            {currentQuestion.type === 'coding' && submission && (
              <CodeRunner
                submissionId={submission.id}
                questionId={currentQuestion.id}
                code={currentAnswer.textAnswer || ''}
                onCodeChange={(code) => handleCodeChange(currentQuestion.id, code)}
                disabled={submitting}
              />
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '32px' }}>
          <button
            className="btn btn-outline"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            ← Previous
          </button>

          <button
            className="btn btn-danger"
            onClick={() => setShowSubmitModal(true)}
            disabled={submitting}
          >
            Submit Exam
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Face detection (bottom-right webcam widget) */}
      <FaceDetection
        submissionId={submission?.id || null}
        examId={examId}
        enabled={!loading && !!submission && !submitting}
        socket={socket}
      />

      {/* Submit confirmation modal */}
      {showSubmitModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowSubmitModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Submit Exam?</h2>
            <p>
              You have answered <strong>{answeredCount}</strong> out of{' '}
              <strong>{questions.length}</strong> questions.
            </p>
            {answeredCount < questions.length && (
              <div className="alert alert-warning" style={{ marginTop: '12px' }}>
                {questions.length - answeredCount} question(s) are unanswered. Are you sure you want to submit?
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Continue Exam
              </button>
              <button
                className="btn btn-danger"
                onClick={() => { setShowSubmitModal(false); doSubmit(); }}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: color, border: color === 'var(--border)' ? '1px solid #ccc' : 'none', display: 'inline-block' }} />
      {label}
    </span>
  );
}
