const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const examCtrl = require('../controllers/examController');
const questionCtrl = require('../controllers/questionController');

// Teacher routes
router.post('/', authenticate, authorize('teacher', 'admin'), examCtrl.createExam);
router.get('/my-exams', authenticate, authorize('teacher', 'admin'), examCtrl.getTeacherExams);
router.get('/all', authenticate, authorize('admin'), examCtrl.getAllExams);
router.get('/:id', authenticate, examCtrl.getExamDetail);
router.put('/:id', authenticate, authorize('teacher', 'admin'), examCtrl.updateExam);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), examCtrl.deleteExam);
router.post('/:id/publish', authenticate, authorize('teacher', 'admin'), examCtrl.publishExam);
router.get('/:id/submissions', authenticate, authorize('teacher', 'admin'), examCtrl.getExamSubmissions);

// Question management
router.post('/:examId/questions', authenticate, authorize('teacher', 'admin'), questionCtrl.addQuestion);
router.put('/questions/:questionId', authenticate, authorize('teacher', 'admin'), questionCtrl.updateQuestion);
router.delete('/questions/:questionId', authenticate, authorize('teacher', 'admin'), questionCtrl.deleteQuestion);

// Question bank
router.get('/teacher/question-bank', authenticate, authorize('teacher', 'admin'), questionCtrl.getQuestionBank);

// Student routes
router.get('/student/available', authenticate, authorize('student'), examCtrl.getAvailableExams);

module.exports = router;
