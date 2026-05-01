const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/importController');

router.use(authenticate);

// Templates (no file upload needed)
router.get('/template/users',     authorize('admin'),            ctrl.userTemplate);
router.get('/template/questions', authorize('admin', 'teacher'), ctrl.questionTemplate);

// Actual imports
router.post('/users',                authorize('admin'),            ctrl.uploadMiddleware, ctrl.importUsers);
router.post('/questions/:examId',    authorize('admin', 'teacher'), ctrl.uploadMiddleware, ctrl.importQuestions);

module.exports = router;
