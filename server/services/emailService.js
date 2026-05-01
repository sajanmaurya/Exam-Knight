const nodemailer = require('nodemailer');

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  if (!process.env.SMTP_HOST) return null;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return _transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || '"ExamSystem" <noreply@examsystem.com>',
    to, subject, html, text,
  });
}

const APP_URL = () => process.env.CLIENT_URL || 'http://localhost:3000';

async function sendWelcomeEmail(user) {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to ExamSystem',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Welcome, ${user.name}!</h2>
        <p>Your <strong>${user.role}</strong> account has been created.</p>
        <a href="${APP_URL()}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none">
          Log In Now
        </a>
      </div>`,
    text: `Welcome, ${user.name}! Your ${user.role} account is ready. Log in at ${APP_URL()}`,
  });
}

async function sendExamResultEmail(user, exam, submission) {
  const pct = exam.totalMarks > 0
    ? ((submission.totalScore / exam.totalMarks) * 100).toFixed(1)
    : 0;
  const passed = submission.totalScore >= exam.passingMarks;

  await sendEmail({
    to: user.email,
    subject: `Results: ${exam.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Exam Results</h2>
        <p>Hi ${user.name}, your results for <strong>${exam.title}</strong> are ready.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd">Score</td>
              <td style="padding:8px;border:1px solid #ddd"><strong>${submission.totalScore} / ${exam.totalMarks}</strong></td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd">Percentage</td>
              <td style="padding:8px;border:1px solid #ddd">${pct}%</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd">Status</td>
              <td style="padding:8px;border:1px solid #ddd;color:${passed ? 'green' : 'red'}">${passed ? 'PASSED' : 'FAILED'}</td></tr>
        </table>
        <br/>
        <a href="${APP_URL()}/student/results" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none">
          View Detailed Results
        </a>
      </div>`,
    text: `Hi ${user.name}, score for "${exam.title}": ${submission.totalScore}/${exam.totalMarks} (${pct}%). ${passed ? 'PASSED' : 'FAILED'}.`,
  });
}

async function sendExamInviteEmail(user, exam) {
  const start = new Date(exam.startTime).toLocaleString();
  await sendEmail({
    to: user.email,
    subject: `Upcoming Exam: ${exam.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2>Exam Reminder</h2>
        <p>Hi ${user.name},</p>
        <p>You have an upcoming exam: <strong>${exam.title}</strong></p>
        <ul>
          <li>Starts: <strong>${start}</strong></li>
          <li>Duration: <strong>${exam.duration} minutes</strong></li>
        </ul>
        <a href="${APP_URL()}/student/exams" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none">
          View Exam
        </a>
      </div>`,
    text: `Hi ${user.name}, upcoming exam: "${exam.title}" starts at ${start}. Duration: ${exam.duration} min.`,
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendExamResultEmail, sendExamInviteEmail };
