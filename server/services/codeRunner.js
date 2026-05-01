const PISTON_API = 'https://emkc.org/api/v2/piston';

const SUPPORTED_LANGUAGES = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  c:          { language: 'c',          version: '10.2.0' },
  go:         { language: 'go',         version: '1.16.2' },
  rust:       { language: 'rust',       version: '1.50.0' },
  ruby:       { language: 'ruby',       version: '3.0.1' },
};

async function executeCode(language, code, stdin = '') {
  const lang = SUPPORTED_LANGUAGES[language];
  if (!lang) throw new Error(`Unsupported language: ${language}`);

  const response = await fetch(`${PISTON_API}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: lang.language,
      version: lang.version,
      files: [{ content: code }],
      stdin,
      run_timeout: 5000,
      compile_timeout: 10000,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Piston API error ${response.status}: ${text}`);
  }

  const result = await response.json();
  return {
    stdout: result.run?.stdout || '',
    stderr: result.run?.stderr || result.compile?.stderr || '',
    exitCode: result.run?.code ?? -1,
    language,
  };
}

async function runTestCases(language, code, testCases) {
  const results = [];
  for (const tc of testCases) {
    try {
      const output = await executeCode(language, code, tc.input || '');
      const actual = output.stdout.trim();
      const expected = String(tc.expectedOutput).trim();
      results.push({
        input: tc.input,
        expectedOutput: expected,
        actualOutput: actual,
        passed: actual === expected,
        stderr: output.stderr,
      });
    } catch (err) {
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: '',
        passed: false,
        error: err.message,
      });
    }
  }
  return results;
}

module.exports = { executeCode, runTestCases, SUPPORTED_LANGUAGES };
