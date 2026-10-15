const { Exam, Question, Option, Submission, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Teacher: Create exam
exports.createExam = async (req, res) => {
  try {
    const editableFields = ['title', 'description', 'subject', 'duration', 'totalMarks', 'passingMarks', 'negativeMarking', 'randomizeQuestions', 'randomizeOptions', 'showResults', 'maxAttempts', 'startTime', 'endTime', 'instructions'];
    const fields = Object.fromEntries(editableFields.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
    if (!fields.title || !Number.isFinite(Number(fields.duration)) || Number(fields.duration) <= 0 || !Number.isFinite(Number(fields.totalMarks)) || Number(fields.totalMarks) <= 0 || !fields.startTime || !fields.endTime || new Date(fields.startTime) >= new Date(fields.endTime)) {
      return res.status(400).json({ message: 'Invalid exam details or schedule' });
    }
    const exam = await Exam.create({ ...fields, createdBy: req.user.id });
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
    if (exam.status !== 'draft') return res.status(409).json({ message: 'Published exams cannot be edited' });
    const editableFields = ['title', 'description', 'subject', 'duration', 'totalMarks', 'passingMarks', 'negativeMarking', 'randomizeQuestions', 'randomizeOptions', 'showResults', 'maxAttempts', 'startTime', 'endTime', 'instructions'];
    const fields = Object.fromEntries(editableFields.filter(k => req.body[k] !== undefined).map(k => [k, req.body[k]]));
    const next = { ...exam.toJSON(), ...fields };
    if (!next.title || Number(next.duration) <= 0 || Number(next.totalMarks) <= 0 || new Date(next.startTime) >= new Date(next.endTime)) return res.status(400).json({ message: 'Invalid exam details or schedule' });
    await exam.update(fields);
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
    if (exam.status !== 'draft') return res.status(409).json({ message: 'Only draft exams can be deleted' });
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

    if (exam.status !== 'draft') return res.status(409).json({ message: 'Only draft exams can be published' });
    if (new Date(exam.endTime) <= new Date()) return res.status(400).json({ message: 'Cannot publish an expired exam' });
    await exam.update({ status: 'published' });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish exam' });
  }
};

// Teacher: Get exam results / submissions
exports.getExamSubmissions = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam || (req.user.role !== 'admin' && exam.createdBy !== req.user.id)) return res.status(404).json({ message: 'Exam not found' });
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
