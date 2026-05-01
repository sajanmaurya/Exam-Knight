import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
const TABS = ['Users', 'Questions'];

export default function BulkImport() {
  const [activeTab, setActiveTab] = useState('Users');
  const [examId, setExamId]       = useState('');
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
  };

  const downloadTemplate = async (type) => {
    try {
      const res = await api.get(`/import/template/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warn('Please select a CSV file first');
    if (activeTab === 'Questions' && !examId.trim()) return toast.warn('Please enter an Exam ID');

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    setResult(null);

    try {
      const url = activeTab === 'Users'
        ? '/import/users'
        : `/import/questions/${examId.trim()}`;

      const { data } = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      toast.success(data.message);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px' }}>Bulk Import</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '14px' }}>
          Import users or exam questions from a CSV file.
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-light)',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Exam ID (only for Questions tab) */}
            {activeTab === 'Questions' && (
              <div className="form-group">
                <label className="form-label">Exam ID *</label>
                <input
                  className="form-control"
                  placeholder="Paste the exam UUID here"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                />
                <div style={{ fontSize: '12px', color: 'var(--text-lighter)', marginTop: '4px' }}>
                  Find the exam ID in the exam edit URL: /teacher/exams/<strong>[id]</strong>/edit
                </div>
              </div>
            )}

            {/* CSV format info */}
            <div className="alert alert-warning" style={{ fontSize: '13px' }}>
              <strong>CSV Format for {activeTab}:</strong>
              {activeTab === 'Users' ? (
                <code style={{ display: 'block', marginTop: '6px' }}>name, email, password, role</code>
              ) : (
                <code style={{ display: 'block', marginTop: '6px' }}>type, text, marks, difficulty, option1, option2, option3, option4, correctOption, maxWords</code>
              )}
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ fontSize: '12px', padding: '4px 12px' }}
                  onClick={() => downloadTemplate(activeTab === 'Users' ? 'users' : 'questions')}
                >
                  ↓ Download Template
                </button>
              </div>
            </div>

            {/* File input */}
            <div className="form-group">
              <label className="form-label">CSV File *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="form-control"
              />
              {file && (
                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? 'Importing…' : `Import ${activeTab}`}
            </button>
          </form>

          {/* Results */}
          {result && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Import Results</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <StatChip label="Created"  value={result.created}  color="var(--success)" />
                {result.skipped !== undefined && (
                  <StatChip label="Skipped"  value={result.skipped}  color="var(--warning)" />
                )}
                <StatChip label="Errors"   value={result.errors?.length ?? 0} color="var(--danger)" />
              </div>

              {result.errors?.length > 0 && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px' }}>
                    Errors ({result.errors.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                    {result.errors.map((e, i) => (
                      <div key={i} style={{ fontSize: '12px', padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', color: 'var(--text-light)' }}>
                        <strong>{e.email || e.text || `Row ${i + 1}`}:</strong> {e.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
}

function StatChip({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 16px', borderRadius: '8px',
      background: `${color}20`, border: `1px solid ${color}40`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{label}</div>
    </div>
  );
}
