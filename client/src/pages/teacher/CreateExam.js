import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const defaultForm = {
  title: '',
  description: '',
  subject: '',
  duration: 60,
  totalMarks: 100,
  passingMarks: 40,
  negativeMarking: 0,
  startTime: '',
  endTime: '',
  maxAttempts: 1,
  randomizeQuestions: false,
  randomizeOptions: false,
  showResults: true,
  instructions: '',
};

export default function CreateExam() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.subject.trim()) return toast.error('Subject is required');
    if (!form.startTime) return toast.error('Start time is required');
    if (!form.endTime) return toast.error('End time is required');
    if (new Date(form.endTime) <= new Date(form.startTime))
      return toast.error('End time must be after start time');

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        negativeMarking: Number(form.negativeMarking),
        maxAttempts: Number(form.maxAttempts),
      };
      const { data } = await api.post('/exams', payload);
      toast.success('Exam created successfully');
      navigate(`/teacher/exam/${data.exam?.id || data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Create New Exam</h1>
        <p>Fill in the details below to set up a new exam for your students.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: 'var(--text-light)' }}>
            BASIC INFORMATION
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Midterm Mathematics Exam"
                required
              />
            </div>
            <div className="form-group">
              <label>Subject *</label>
              <input
                className="form-control"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the exam"
            />
          </div>

          {/* Timing */}
          <h3 style={{ marginBottom: 16, marginTop: 8, fontSize: 16, fontWeight: 600, color: 'var(--text-light)' }}>
            TIMING
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input
                className="form-control"
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input
                className="form-control"
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                className="form-control"
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                min={1}
              />
            </div>
            <div className="form-group">
              <label>Max Attempts</label>
              <input
                className="form-control"
                type="number"
                name="maxAttempts"
                value={form.maxAttempts}
                onChange={handleChange}
                min={1}
              />
            </div>
          </div>

          {/* Marks */}
          <h3 style={{ marginBottom: 16, marginTop: 8, fontSize: 16, fontWeight: 600, color: 'var(--text-light)' }}>
            MARKS & GRADING
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label>Total Marks</label>
              <input
                className="form-control"
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                min={1}
              />
            </div>
            <div className="form-group">
              <label>Passing Marks</label>
              <input
                className="form-control"
                type="number"
                name="passingMarks"
                value={form.passingMarks}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Negative Marking (marks deducted per wrong answer)</label>
              <input
                className="form-control"
                type="number"
                name="negativeMarking"
                value={form.negativeMarking}
                onChange={handleChange}
                min={0}
                step={0.25}
              />
            </div>
          </div>

          {/* Settings */}
          <h3 style={{ marginBottom: 16, marginTop: 8, fontSize: 16, fontWeight: 600, color: 'var(--text-light)' }}>
            SETTINGS
          </h3>

          <div style={{ display: 'flex', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 400 }}>
              <input
                type="checkbox"
                name="randomizeQuestions"
                checked={form.randomizeQuestions}
                onChange={handleChange}
                style={{ width: 16, height: 16 }}
              />
              Randomize Questions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 400 }}>
              <input
                type="checkbox"
                name="randomizeOptions"
                checked={form.randomizeOptions}
                onChange={handleChange}
                style={{ width: 16, height: 16 }}
              />
              Randomize Options
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 400 }}>
              <input
                type="checkbox"
                name="showResults"
                checked={form.showResults}
                onChange={handleChange}
                style={{ width: 16, height: 16 }}
              />
              Show Results to Students
            </label>
          </div>

          {/* Instructions */}
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              className="form-control"
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              placeholder="Enter any specific instructions for students..."
              style={{ minHeight: 120 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.history.back()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
