const { Question, Option, Exam } = require('../models');

// Add question to exam
exports.addQuestion = async (req, res) => {
  const t = await require('../config/database').transaction();
  try {
    const exam = await Exam.findOne({ where: { id: req.params.examId, createdBy: req.user.id } });
    if (!exam) {
      await t.rollback();
      return res.status(404).json({ message: 'Exam not found' });
    }

    const { type, text, marks, options, testCases, maxWords, tags, difficulty } = req.body;
    const questionCount = await Question.count({ where: { examId: exam.id } });

    const question = await Question.create({
      examId: exam.id,
      type,
      text,
      marks,
      order: questionCount + 1,
      testCases: type === 'coding' ? testCases : null,
      maxWords: type === 'subjective' ? maxWords : null,
      tags: tags || [],
      difficulty: difficulty || 'medium',
    }, { transaction: t });

    if (type === 'mcq' && options && options.length > 0) {
      const optionRecords = options.map((opt, idx) => ({
        questionId: question.id,
        text: opt.text,
        isCorrect: opt.isCorrect || false,
        order: idx + 1,
      }));
      await Option.bulkCreate(optionRecords, { transaction: t });
    }

    await t.commit();

    const created = await Question.findByPk(question.id, {
      include: [{ model: Option, as: 'options' }],
    });
    res.status(201).json({ question: created });
  } catch (err) {
    await t.rollback();
    console.error('Add question error:', err);
    res.status(500).json({ message: 'Failed to add question' });
  }
};

// Update question
exports.updateQuestion = async (req, res) => {
  const t = await require('../config/database').transaction();
  try {
    const question = await Question.findByPk(req.params.questionId, {
      include: [{ model: Exam, where: { createdBy: req.user.id } }],
    });
    if (!question) {
      await t.rollback();
      return res.status(404).json({ message: 'Question not found' });
    }

    const { text, marks, type, options, testCases, maxWords, tags, difficulty } = req.body;
    await question.update({ text, marks, type, testCases, maxWords, tags, difficulty }, { transaction: t });

    if (type === 'mcq' && options) {
      await Option.destroy({ where: { questionId: question.id }, transaction: t });
      const optionRecords = options.map((opt, idx) => ({
        questionId: question.id,
        text: opt.text,
        isCorrect: opt.isCorrect || false,
        order: idx + 1,
      }));
      await Option.bulkCreate(optionRecords, { transaction: t });
    }

    await t.commit();

    const updated = await Question.findByPk(question.id, {
      include: [{ model: Option, as: 'options' }],
    });
    res.json({ question: updated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to update question' });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.questionId, {
      include: [{ model: Exam, where: { createdBy: req.user.id } }],
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.destroy();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question' });
  }
};

// Get question bank (all questions by this teacher)
exports.getQuestionBank = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        { model: Exam, where: { createdBy: req.user.id }, attributes: ['id', 'title'] },
        { model: Option, as: 'options' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch question bank' });
  }
};
