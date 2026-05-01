const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = function setupSocket(io) {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);

    // Teacher joins exam monitoring room
    socket.on('join_exam_monitor', (examId) => {
      if (socket.user.role === 'teacher' || socket.user.role === 'admin') {
        socket.join(`exam:${examId}`);
        console.log(`${socket.user.name} monitoring exam ${examId}`);
      }
    });

    socket.on('leave_exam_monitor', (examId) => {
      socket.leave(`exam:${examId}`);
    });

    // Student joins exam room
    socket.on('join_exam', (data) => {
      if (socket.user.role === 'student') {
        const { examId, submissionId } = data;
        socket.join(`exam:${examId}`);
        socket.join(`submission:${submissionId}`);

        // Notify teachers
        io.to(`exam:${examId}`).emit('student_joined', {
          studentId: socket.user.id,
          studentName: socket.user.name,
          submissionId,
          timestamp: new Date(),
        });
      }
    });

    // Student sends heartbeat
    socket.on('heartbeat', (data) => {
      io.to(`exam:${data.examId}`).emit('student_heartbeat', {
        studentId: socket.user.id,
        studentName: socket.user.name,
        submissionId: data.submissionId,
        timestamp: new Date(),
      });
    });

    // Real-time proctoring events forwarded via socket
    socket.on('proctor_event', (data) => {
      io.to(`exam:${data.examId}`).emit('proctoring_alert', {
        studentId: socket.user.id,
        studentName: socket.user.name,
        ...data,
        timestamp: new Date(),
      });
    });

    // Student left exam
    socket.on('leave_exam', (data) => {
      const { examId, submissionId } = data;
      socket.leave(`exam:${examId}`);
      socket.leave(`submission:${submissionId}`);

      io.to(`exam:${examId}`).emit('student_left', {
        studentId: socket.user.id,
        studentName: socket.user.name,
        submissionId,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};
