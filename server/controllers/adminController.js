const { User, Exam, Submission, ProctoringLog, sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalExams, totalSubmissions, activeExams] = await Promise.all([
      User.count(),
      Exam.count(),
      Submission.count(),
      Exam.count({ where: { status: 'active' } }),
    ]);

    const usersByRole = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role'],
    });

    const recentSubmissions = await Submission.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'student', attributes: ['name', 'email'] },
        { model: Exam, as: 'exam', attributes: ['title'] },
      ],
    });

    res.json({
      stats: { totalUsers, totalExams, totalSubmissions, activeExams },
      usersByRole,
      recentSubmissions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, role, isActive } = req.body;
    await user.update({ name, role, isActive });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role });
    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' });
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.getProctoringLogs = async (req, res) => {
  try {
    const where = {};
    if (req.query.examId) where.examId = req.query.examId;
    if (req.query.studentId) where.studentId = req.query.studentId;

    const logs = await ProctoringLog.findAll({
      where,
      include: [
        { model: Submission, attributes: ['id', 'examId', 'studentId'] },
      ],
      order: [['timestamp', 'DESC']],
      limit: 200,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch proctoring logs' });
  }
};
