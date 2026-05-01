const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// ── User ───────────────────────────────────────────────
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('student', 'teacher', 'admin'), allowNull: false, defaultValue: 'student' },
  avatar: { type: DataTypes.STRING(500), defaultValue: null },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', timestamps: true });

// ── Exam ───────────────────────────────────────────────
const Exam = sequelize.define('Exam', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT },
  subject: { type: DataTypes.STRING(100) },
  duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Duration in minutes' },
  totalMarks: { type: DataTypes.FLOAT, allowNull: false },
  passingMarks: { type: DataTypes.FLOAT, allowNull: false },
  negativeMarking: { type: DataTypes.FLOAT, defaultValue: 0, comment: 'Marks deducted per wrong answer' },
  randomizeQuestions: { type: DataTypes.BOOLEAN, defaultValue: true },
  randomizeOptions: { type: DataTypes.BOOLEAN, defaultValue: true },
  showResults: { type: DataTypes.BOOLEAN, defaultValue: true },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 1 },
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('draft', 'published', 'active', 'completed'), defaultValue: 'draft' },
  instructions: { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'exams', timestamps: true });

// ── Question ───────────────────────────────────────────
const Question = sequelize.define('Question', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  examId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('mcq', 'subjective', 'coding'), allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  marks: { type: DataTypes.FLOAT, allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  // For coding questions
  testCases: { type: DataTypes.JSONB, defaultValue: null, comment: 'Array of {input, expectedOutput}' },
  // For subjective
  maxWords: { type: DataTypes.INTEGER, defaultValue: null },
  // Tags for question bank
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
}, { tableName: 'questions', timestamps: true });

// ── Option (for MCQ) ──────────────────────────────────
const Option = sequelize.define('Option', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  questionId: { type: DataTypes.UUID, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false },
  isCorrect: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'options', timestamps: true });

// ── Submission (exam attempt) ─────────────────────────
const Submission = sequelize.define('Submission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  examId: { type: DataTypes.UUID, allowNull: false },
  studentId: { type: DataTypes.UUID, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  submittedAt: { type: DataTypes.DATE, defaultValue: null },
  totalScore: { type: DataTypes.FLOAT, defaultValue: null },
  status: { type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'auto_submitted'), defaultValue: 'in_progress' },
  tabSwitchCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  suspiciousActivity: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'submissions', timestamps: true });

// ── Answer ─────────────────────────────────────────────
const Answer = sequelize.define('Answer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  submissionId: { type: DataTypes.UUID, allowNull: false },
  questionId: { type: DataTypes.UUID, allowNull: false },
  selectedOptionId: { type: DataTypes.UUID, defaultValue: null, comment: 'For MCQ' },
  textAnswer: { type: DataTypes.TEXT, defaultValue: null, comment: 'For subjective/coding' },
  marksAwarded: { type: DataTypes.FLOAT, defaultValue: null },
  isCorrect: { type: DataTypes.BOOLEAN, defaultValue: null },
  gradedBy: { type: DataTypes.UUID, defaultValue: null },
}, { tableName: 'answers', timestamps: true });

// ── Proctoring Log ────────────────────────────────────
const ProctoringLog = sequelize.define('ProctoringLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  submissionId: { type: DataTypes.UUID, allowNull: false },
  studentId: { type: DataTypes.UUID, allowNull: false },
  examId: { type: DataTypes.UUID, allowNull: false },
  eventType: {
    type: DataTypes.ENUM(
      'tab_switch', 'fullscreen_exit', 'copy_attempt', 'paste_attempt',
      'right_click', 'inactivity', 'face_not_detected', 'multiple_faces',
      'browser_resize', 'devtools_open', 'screen_capture_attempt'
    ),
    allowNull: false,
  },
  details: { type: DataTypes.JSONB, defaultValue: {} },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'proctoring_logs', timestamps: false });

// ── Associations ──────────────────────────────────────
User.hasMany(Exam, { foreignKey: 'createdBy', as: 'exams' });
Exam.belongsTo(User, { foreignKey: 'createdBy', as: 'teacher' });

Exam.hasMany(Question, { foreignKey: 'examId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Exam, { foreignKey: 'examId' });

Question.hasMany(Option, { foreignKey: 'questionId', as: 'options', onDelete: 'CASCADE' });
Option.belongsTo(Question, { foreignKey: 'questionId' });

Exam.hasMany(Submission, { foreignKey: 'examId', as: 'submissions' });
Submission.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

User.hasMany(Submission, { foreignKey: 'studentId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Submission.hasMany(Answer, { foreignKey: 'submissionId', as: 'answers', onDelete: 'CASCADE' });
Answer.belongsTo(Submission, { foreignKey: 'submissionId' });

Answer.belongsTo(Question, { foreignKey: 'questionId' });
Answer.belongsTo(Option, { foreignKey: 'selectedOptionId', as: 'selectedOption' });

Submission.hasMany(ProctoringLog, { foreignKey: 'submissionId', as: 'proctoringLogs' });
ProctoringLog.belongsTo(Submission, { foreignKey: 'submissionId' });

module.exports = {
  sequelize,
  User,
  Exam,
  Question,
  Option,
  Submission,
  Answer,
  ProctoringLog,
};
