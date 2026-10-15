const { Submission, Answer, Question, Option, Exam, ProctoringLog, User } = require('../models');
const { executeCode, runTestCases } = require('../services/codeRunner');

// Student: Start exam
exports.startExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const now = new Date();
    if (now < new Date(exam.startTime) || now > new Date(exam.endTime)) {
      return res.status(400).json({ message: 'Exam is not currently available' });
    }
    if (exam.status !== 'published' && exam.status !== 'active') {
      return res.status(400).json({ message: 'Exam is not available' });
    }

    // Resume existing in-progress attempts before checking maxAttempts.
    const existingAttempt = await Submission.findOne({ where: { examId: exam.id, studentId: req.user.id, status: 'in_progress' }, include: [{ model: Answer, as: 'answers' }] });
    if (existingAttempt) {
      const end = Math.min(new Date(exam.endTime).getTime(), new Date(existingAttempt.startedAt).getTime() + exam.duration * 60000);
      if (Date.now() >= end) return res.status(409).json({ message: 'Previous attempt expired' });
      return res.json({ submission: existingAttempt, questions: await getExamQuestions(exam, existingAttempt), exam: sanitizeExam(exam) });
    }
    // Check max attempts
    const attemptCount = await Submission.count({
      where: { examId: exam.id, studentId: req.user.id },
    });
    if (attemptCount >= exam.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    const submission = await Submission.create({
      examId: exam.id,
      studentId: req.user.id,
      startedAt: now,
    });

    const questions = await getExamQuestions(exam, submission);
    res.status(201).json({ submission, questions, exam: sanitizeExam(exam) });
  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({ message: 'Failed to start exam' });
  }
};

async function activeAttempt(id, studentId) {
  const s = await Submission.findOne({ where: { id, studentId, status: 'in_progress' }, include: [{ model: Exam, as: 'exam' }] });
  if (!s) return null;
  const end = Math.min(new Date(s.exam.endTime).getTime(), new Date(s.startedAt).getTime() + s.exam.duration * 60000);
  return Date.now() < end ? s : null;
}

// Student: Save answer
exports.saveAnswer = async (req,res) => {
  try {
    const submission = await activeAttempt(req.params.submissionId, req.user.id);
    if (!submission) return res.status(409).json({ message: 'Exam no longer active' });
    const { questionId, selectedOptionId, textAnswer } = req.body;
    const question = await Question.findOne({ where: { id: questionId, examId: submission.examId } });
    if (!question) return res.status(400).json({ message: 'Invalid question' });
    if (question.type === 'mcq') {
      if (selectedOptionId && !(await Option.findOne({ where: { id: selectedOptionId, questionId } }))) return res.status(400).json({ message: 'Invalid option' });
    } else if (typeof textAnswer !== 'string' || textAnswer.length > 200000) return res.status(400).json({ message: 'Invalid answer' });
    const fields = question.type === 'mcq' ? { selectedOptionId: selectedOptionId || null, textAnswer: null } : { selectedOptionId: null, textAnswer };
    let answer = await Answer.findOne({ where: { submissionId: submission.id, questionId } });
    if (answer) await answer.update(fields);
    else answer = await Answer.create({ submissionId: submission.id, questionId, ...fields });
    res.json({ answer });
  } catch(err) { console.error(err); res.status(500).json({ message: 'Failed to save answer' }); }
};

// Student: Submit exam
exports.submitExam = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      where: { id: req.params.submissionId, studentId: req.user.id, status: 'in_progress' },
      include: [{ model: Exam, as: 'exam' }],
    });
    if (!submission) return res.status(404).json({ message: 'Active submission not found' });

    const autoSubmit = req.body.autoSubmit || false;
    const totalScore = await gradeSubmission(submission);

    await submission.update({
      submittedAt: new Date(),
      status: autoSubmit ? 'auto_submitted' : 'submitted',
      totalScore,
    });

    res.json({
      message: 'Exam submitted successfully',
      submission: {
        id: submission.id,
        totalScore: submission.exam.showResults ? totalScore : null,
        status: submission.status,
      },
    });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ message: 'Failed to submit exam' });
  }
};

// Log proctoring event
exports.logProctoringEvent = async (req, res) => {
  try {
    const { eventType, details } = req.body;
    const submission = await activeAttempt(req.params.submissionId, req.user.id);
    if (!submission) return res.status(409).json({ message: 'Exam no longer active' });

    const log = await ProctoringLog.create({
      submissionId: submission.id,
      studentId: req.user.id,
      examId: submission.examId,
      eventType,
      details: details || {},
    });

    // Increment tab switch count
    if (eventType === 'tab_switch') {
      await submission.increment('tabSwitchCount');
      if (submission.tabSwitchCount + 1 >= 3) {
        await submission.update({ suspiciousActivity: true });
      }
    }

    // Emit to teacher via socket (handled in socket module)
    const io = req.app.get('io');
    if (io) {
      io.to(`exam:${submission.examId}`).emit('proctoring_alert', {
        studentId: req.user.id,
        studentName: req.user.name,
        submissionId: submission.id,
        eventType,
        details,
        timestamp: new Date(),
      });
    }

    res.json({ logged: true });
  } catch (err) {
    console.error('Proctoring log error:', err);
    res.status(500).json({ message: 'Failed to log event' });
  }
};

// Student: Get own submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { studentId: req.user.id },
      include: [{ model: Exam, as: 'exam', attributes: ['title', 'subject', 'totalMarks', 'showResults'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ submissions: submissions.map(s => { const v = s.toJSON(); if (!v.exam?.showResults) v.totalScore = null; return v; }) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

// Teacher: Get submission detail for grading
exports.getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.submissionId, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        {
          model: Answer,
          as: 'answers',
          include: [
            { model: Question, include: [{ model: Option, as: 'options' }] },
            { model: Option, as: 'selectedOption' },
          ],
        },
        { model: ProctoringLog, as: 'proctoringLogs' },
        { model: Exam, as: 'exam' },
      ],
    });
    if (!submission || (req.user.role !== 'admin' && submission.exam.createdBy !== req.user.id)) return res.status(404).json({ message: 'Submission not found' });
    res.json({ submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch submission' });
  }
};

// Teacher: Grade subjective answer
exports.gradeAnswer = async (req, res) => {
  try {
    const { marksAwarded } = req.body;
    const answer = await Answer.findByPk(req.params.answerId, { include: [{ model: Question, include: [{ model: Exam }] }] });
    if (!answer || (req.user.role !== 'admin' && answer.Question.Exam.createdBy !== req.user.id)) return res.status(404).json({ message: 'Answer not found' });
    if (answer.Question.type === 'mcq' || !Number.isFinite(Number(marksAwarded)) || Number(marksAwarded) < 0 || Number(marksAwarded) > answer.Question.marks) return res.status(400).json({ message: 'Invalid grading marks' });

    await answer.update({ marksAwarded, isCorrect: marksAwarded > 0, gradedBy: req.user.id });

    // Recalculate total score
    const submission = await Submission.findByPk(answer.submissionId, {
      include: [{ model: Answer, as: 'answers' }],
    });
    const total = submission.answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0);
    await submission.update({ totalScore: total, status: 'graded' });

    res.json({ answer, newTotal: total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to grade answer' });
  }
};

// Student: Run code against Piston API (for coding questions)
exports.runCode = async (req, res) => {
  try {
    const { questionId, language, code } = req.body;
    if (!language || !code) {
      return res.status(400).json({ message: 'language and code are required' });
    }

    const submission = await Submission.findOne({
      where: { id: req.params.submissionId, studentId: req.user.id, status: 'in_progress' },
    });
    if (!submission) return res.status(404).json({ message: 'Active submission not found' });

    const question = await Question.findOne({ where: { id: questionId, examId: submission.examId, type: 'coding' } });
    if (!question) return res.status(404).json({ message: 'Question not found' });

    if (typeof code !== 'string' || code.length > 50000) return res.status(400).json({ message: 'Invalid code length' });
    const result = await executeCode(language, code);

    let testResults = null;
    if (question.testCases && question.testCases.length > 0) {
      testResults = await runTestCases(language, code, question.testCases);
    }

    res.json({ ...result, testResults: testResults ? { passed: testResults.filter(t=>t.passed).length, total: testResults.length } : null });
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({ message: err.message || 'Code execution failed' });
  }
};

// ── Helpers ──────────────────────────────────────────────

async function getExamQuestions(exam, submission) {
  const questions = await Question.findAll({
    where: { examId: exam.id },
    include: [{ model: Option, as: 'options', attributes: ['id', 'text', 'order'] }],
    attributes: { exclude: ['testCases'] },
    order: [['order', 'ASC']],
  });

  function hash(str) { let n = 2166136261; for (let i=0; i<str.length; i++) { n ^= str.charCodeAt(i); n=Math.imul(n, 16777619); } return n>>>0; }
  if (exam.randomizeQuestions) questions.sort((a,b)=>hash(submission.id+a.id)-hash(submission.id+b.id));
  return questions.map((q) => {
    const plain = q.toJSON();
    if (exam.randomizeOptions && plain.options) {
      plain.options = plain.options.sort((a,b)=>hash(submission.id+a.id)-hash(submission.id+b.id));
    }
    return plain;
  });
}

async function gradeSubmission(submission) {
  const answers = await Answer.findAll({
    where: { submissionId: submission.id },
    include: [
      { model: Question, include: [{ model: Option, as: 'options' }] },
      { model: Option, as: 'selectedOption' },
    ],
  });

  const exam = await Exam.findByPk(submission.examId);
  let totalScore = 0;

  for (const answer of answers) {
    const question = answer.Question;

    if (question.type === 'mcq') {
      if (answer.selectedOptionId) {
        const correctOption = question.options.find((o) => o.isCorrect);
        if (correctOption && answer.selectedOptionId === correctOption.id) {
          await answer.update({ marksAwarded: question.marks, isCorrect: true });
          totalScore += question.marks;
        } else {
          const penalty = -(exam.negativeMarking || 0);
          await answer.update({ marksAwarded: penalty, isCorrect: false });
          totalScore += penalty;
        }
      } else {
        await answer.update({ marksAwarded: 0, isCorrect: false });
      }
    }
    // Subjective and coding require manual grading - leave null
  }

  return Math.max(0, totalScore);
}

function sanitizeExam(exam) {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    instructions: exam.instructions,
    negativeMarking: exam.negativeMarking,
  };
}
