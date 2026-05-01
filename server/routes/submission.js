const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/submissionController');

// Student
router.post('/start/:examId', authenticate, authorize('student'), ctrl.startExam);
router.post('/:submissionId/answer', authenticate, authorize('student'), ctrl.saveAnswer);
router.post('/:submissionId/submit', authenticate, authorize('student'), ctrl.submitExam);
router.post('/:submissionId/proctor-log', authenticate, authorize('student'), ctrl.logProctoringEvent);
router.get('/my-submissions', authenticate, authorize('student'), ctrl.getMySubmissions);

// Code execution (student during exam)
router.post('/:submissionId/run-code', authenticate, authorize('student'), ctrl.runCode);

// Teacher
router.get('/:submissionId/detail', authenticate, authorize('teacher', 'admin'), ctrl.getSubmissionDetail);
router.put('/answers/:answerId/grade', authenticate, authorize('teacher', 'admin'), ctrl.gradeAnswer);

module.exports = router;
