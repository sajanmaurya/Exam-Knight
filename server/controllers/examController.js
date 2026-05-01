const { Exam, Question, Option, Submission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Teacher: Create exam
exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ exam });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ message: 'Failed to create exam' });
  }
};

// Teacher: Update exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.update(req.body);
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update exam' });
  }
};

// Teacher: Delete exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.destroy();
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete exam' });
  }
};

// Teacher: Get own exams
exports.getTeacherExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { createdBy: req.user.id },
      include: [
        { model: Question, as: 'questions', attributes: ['id'] },
        { model: Submission, as: 'submissions', attributes: ['id', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// Teacher: Get exam detail with questions
exports.getExamDetail = async (req, res) => {
  try {
    const where = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, createdBy: req.user.id };

    const exam = await Exam.findOne({
      where,
      include: [{
        model: Question,
        as: 'questions',
        include: [{ model: Option, as: 'options' }],
        order: [['order', 'ASC']],
      }],
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch exam' });
  }
};

// Student: Get available exams
exports.getAvailableExams = async (req, res) => {
  try {
    const now = new Date();
    const exams = await Exam.findAll({
      where: {
        status: { [Op.in]: ['published', 'active'] },
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now },
      },
      include: [
        { model: User, as: 'teacher', attributes: ['name'] },
        {
          model: Submission,
          as: 'submissions',
          where: { studentId: req.user.id },
          required: false,
          attributes: ['id', 'status', 'totalScore'],
        },
      ],
      attributes: { exclude: ['createdBy'] },
      order: [['startTime', 'ASC']],
    });
    res.json({ exams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

// Teacher: Publish exam
exports.publishExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, createdBy: req.user.id } });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questionCount = await Question.count({ where: { examId: exam.id } });
    if (questionCount === 0) return res.status(400).json({ message: 'Add questions before publishing' });

    await exam.update({ status: 'published' });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish exam' });
  }
};

// Teacher: Get exam results / submissions
exports.getExamSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { examId: req.params.id },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
      ],
      order: [['submittedAt', 'DESC']],
    });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

// Admin: Get all exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['name', 'email'] },
        { model: Submission, as: 'submissions', attributes: ['id'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};
