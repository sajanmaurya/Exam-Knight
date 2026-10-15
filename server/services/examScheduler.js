const cron = require('node-cron');
const { Op } = require('sequelize');
const { Exam, Submission, Answer, Question, Option } = require('../models');

function startExamScheduler() {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    try {
      // Activate published exams whose window has opened
      const [activatedCount] = await Exam.update(
        { status: 'active' },
        {
          where: {
            status: 'published',
            startTime: { [Op.lte]: now },
            endTime:   { [Op.gt]:  now },
          },
        }
      );
      if (activatedCount > 0) {
        console.log(`[Scheduler] Activated ${activatedCount} exam(s)`);
      }

      // Find active exams whose window has closed
      const expiredExams = await Exam.findAll({
        where: { status: 'active', endTime: { [Op.lte]: now } },
        attributes: ['id'],
      });

      if (expiredExams.length > 0) {
        const ids = expiredExams.map((e) => e.id);

        // Auto-submit lingering in-progress submissions first
        const [autoSubCount] = await Submission.update(
          { status: 'auto_submitted', submittedAt: now },
          { where: { examId: { [Op.in]: ids }, status: 'in_progress' } }
        );
        // Calculate MCQ scores for attempts submitted by the scheduler.
        const expired = await Submission.findAll({ where: { examId: { [Op.in]: ids }, status: 'auto_submitted', totalScore: null } });
        for (const attempt of expired) {
          const exam = await Exam.findByPk(attempt.examId);
          const answers = await Answer.findAll({ where: { submissionId: attempt.id }, include: [{ model: Question, include: [{ model: Option, as: 'options' }] }] });
          let score = 0;
          for (const answer of answers) {
            if (answer.Question?.type !== 'mcq') continue;
            const correct = answer.Question.options.find(o => o.isCorrect);
            const marks = !answer.selectedOptionId ? 0 : correct?.id === answer.selectedOptionId ? answer.Question.marks : -(exam.negativeMarking || 0);
            await answer.update({ marksAwarded: marks, isCorrect: marks > 0 });
            score += marks;
          }
          await attempt.update({ totalScore: Math.max(0, score) });
        }
        if (autoSubCount > 0) {
          console.log(`[Scheduler] Auto-submitted ${autoSubCount} submission(s)`);
        }

        // Mark exams completed
        await Exam.update({ status: 'completed' }, { where: { id: { [Op.in]: ids } } });
        console.log(`[Scheduler] Completed ${ids.length} exam(s)`);
      }
    } catch (err) {
      console.error('[Scheduler] Error:', err.message);
    }
  });

  console.log('[Scheduler] Exam scheduler started (runs every minute)');
}

module.exports = { startExamScheduler };
