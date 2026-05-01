import React, { useState } from 'react';
import api from '../../utils/api';

const LANGUAGES = [
  { value: 'python',     label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript (Node)' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
  { value: 'c',          label: 'C' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'ruby',       label: 'Ruby' },
];

export default function CodeRunner({ submissionId, questionId, code, onCodeChange, disabled }) {
  const [language, setLanguage]     = useState('python');
  const [running, setRunning]       = useState(false);
  const [output, setOutput]         = useState(null);   // { stdout, stderr, exitCode, testResults }
  const [activeTab, setActiveTab]   = useState('output');

  const run = async (runTests = false) => {
    if (!code?.trim()) return;
    setRunning(true);
    setOutput(null);

    try {
      const { data } = await api.post(`/submissions/${submissionId}/run-code`, {
        questionId,
        language,
        code,
      });
      setOutput(data);
      setActiveTab(runTests && data.testResults ? 'tests' : 'output');
    } catch (err) {
      setOutput({
        stdout: '',
        stderr: err?.response?.data?.message || 'Execution failed. Try again.',
        exitCode: -1,
        testResults: null,
      });
    } finally {
      setRunning(false);
    }
  };

  const passCount  = output?.testResults?.filter((t) => t.passed).length ?? 0;
  const totalTests = output?.testResults?.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Language selector + run buttons */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={running || disabled}
          className="form-control"
          style={{ width: 'auto', minWidth: '160px', fontSize: '13px', padding: '6px 10px' }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <button
          className="btn btn-outline"
          style={{ fontSize: '13px', padding: '6px 16px' }}
          onClick={() => run(false)}
          disabled={running || disabled || !code?.trim()}
        >
          {running ? '⏳ Running…' : '▶ Run Code'}
        </button>

        <button
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '6px 16px' }}
          onClick={() => run(true)}
          disabled={running || disabled || !code?.trim()}
        >
          ✓ Run Tests
        </button>
      </div>

      {/* Code textarea */}
      <textarea
        className="form-control"
        rows={12}
        placeholder={`Write your ${language} code here…`}
        value={code || ''}
        onChange={(e) => onCodeChange(e.target.value)}
        disabled={disabled}
        style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5', resize: 'vertical' }}
        spellCheck={false}
      />

      {/* Output panel */}
      {output && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            {['output', 'tests'].map((tab) => {
              if (tab === 'tests' && !output.testResults) return null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px 16px', fontSize: '12px', border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--text-light)',
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab === 'output' ? 'Output' : `Tests (${passCount}/${totalTests})`}
                </button>
              );
            })}
            <div style={{ marginLeft: 'auto', padding: '8px 12px', fontSize: '11px', color: 'var(--text-lighter)' }}>
              Exit: {output.exitCode}
            </div>
          </div>

          {/* Output tab */}
          {activeTab === 'output' && (
            <div style={{ padding: '12px', background: '#0f172a' }}>
              {output.stdout && (
                <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre style={{ margin: output.stdout ? '8px 0 0' : 0, color: '#f87171', fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {output.stderr}
                </pre>
              )}
              {!output.stdout && !output.stderr && (
                <span style={{ color: 'var(--text-lighter)', fontSize: '13px' }}>No output</span>
              )}
            </div>
          )}

          {/* Test results tab */}
          {activeTab === 'tests' && output.testResults && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {output.testResults.map((tc, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${tc.passed ? '#166534' : '#7f1d1d'}`,
                    background: tc.passed ? '#052e16' : '#2d0a0a',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: tc.passed ? '#4ade80' : '#f87171' }}>
                      {tc.passed ? '✓' : '✗'} Test Case {i + 1}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {tc.input !== undefined && tc.input !== '' && (
                      <div><div style={{ color: '#64748b', marginBottom: '2px' }}>Input</div>
                        <pre style={{ margin: 0, fontFamily: 'monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                      </div>
                    )}
                    <div><div style={{ color: '#64748b', marginBottom: '2px' }}>Expected</div>
                      <pre style={{ margin: 0, fontFamily: 'monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{tc.expectedOutput}</pre>
                    </div>
                    <div><div style={{ color: '#64748b', marginBottom: '2px' }}>Got</div>
                      <pre style={{ margin: 0, fontFamily: 'monospace', color: tc.passed ? '#4ade80' : '#f87171', whiteSpace: 'pre-wrap' }}>
                        {tc.actualOutput || tc.error || '(empty)'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
