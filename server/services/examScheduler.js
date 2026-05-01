const cron = require('node-cron');
const { Op } = require('sequelize');
const { Exam, Submission } = require('../models');

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
