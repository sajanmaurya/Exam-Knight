const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { User, Question, Option, Exam } = require('../models');

// ── multer (memory storage, 5 MB limit) ──────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

exports.uploadMiddleware = upload.single('file');

// POST /api/import/users
// CSV columns: name, email, password, role
exports.importUsers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const records = parse(req.file.buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of records) {
      const { name, email, password, role = 'student' } = row;
      if (!name || !email || !password) {
        results.errors.push({ email: email || '?', error: 'Missing name, email, or password' });
        continue;
      }
      try {
        const exists = await User.findOne({ where: { email } });
        if (exists) { results.skipped++; continue; }

        const hashed = await bcrypt.hash(password, 12);
        await User.create({ name, email, password: hashed, role });
        results.created++;
      } catch (err) {
        results.errors.push({ email, error: err.message });
      }
    }

    res.json({ message: 'Import complete', ...results });
  } catch (err) {
    console.error('User import error:', err);
    res.status(500).json({ message: 'Import failed: ' + err.message });
  }
};

// POST /api/import/questions/:examId
// CSV columns: type, text, marks, difficulty, option1, option2, option3, option4, correctOption, maxWords
exports.importQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const exam = await Exam.findByPk(req.params.examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Only the exam owner or admin can import
    if (req.user.role !== 'admin' && exam.createdBy !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const records = parse(req.file.buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const results = { created: 0, errors: [] };
    let order = await Question.count({ where: { examId: exam.id } });

    for (const row of records) {
      const {
        type = 'mcq', text, marks = 1, difficulty = 'medium',
        option1, option2, option3, option4,
        correctOption = '1', maxWords,
      } = row;

      if (!text) {
        results.errors.push({ row, error: 'Missing question text' });
        continue;
      }

      try {
        const question = await Question.create({
          examId: exam.id,
          type,
          text,
          marks: parseFloat(marks) || 1,
          difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
          order: ++order,
          maxWords: maxWords ? parseInt(maxWords) : null,
        });

        if (type === 'mcq') {
          const opts = [option1, option2, option3, option4].filter(Boolean);
          if (opts.length < 2) {
            results.errors.push({ text, error: 'MCQ needs at least 2 options' });
            await question.destroy();
            order--;
            continue;
          }
          const correctIdx = Math.max(0, parseInt(correctOption) - 1);
          await Option.bulkCreate(
            opts.map((optText, i) => ({
              questionId: question.id,
              text: optText,
              isCorrect: i === correctIdx,
              order: i,
            }))
          );
        }

        results.created++;
      } catch (err) {
        results.errors.push({ text: text?.slice(0, 40), error: err.message });
      }
    }

    res.json({ message: 'Import complete', ...results });
  } catch (err) {
    console.error('Question import error:', err);
    res.status(500).json({ message: 'Import failed: ' + err.message });
  }
};

// GET /api/import/template/users  — download a sample CSV
exports.userTemplate = (_, res) => {
  const csv = 'name,email,password,role\nJohn Doe,john@example.com,password123,student\nJane Smith,jane@example.com,password123,teacher\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users-template.csv"');
  res.send(csv);
};

// GET /api/import/template/questions — download a sample CSV
exports.questionTemplate = (_, res) => {
  const csv = 'type,text,marks,difficulty,option1,option2,option3,option4,correctOption,maxWords\nmcq,What is 2+2?,1,easy,3,4,5,6,2,\nsubjective,Explain Newton\'s first law.,5,medium,,,,,,200\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="questions-template.csv"');
  res.send(csv);
};
