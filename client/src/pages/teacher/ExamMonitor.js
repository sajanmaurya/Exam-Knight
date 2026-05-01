import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';

const HEARTBEAT_TIMEOUT_MS = 30000; // consider offline after 30 s of no heartbeat

function StudentCard({ student }) {
  const isOnline = student.status === 'online';
  const isSuspicious = student.tabSwitches > 2 || student.alerts.length > 1;

  return (
    <div
      className={`student-monitor-card card ${isSuspicious ? 'suspicious' : ''}`}
      style={{
        marginBottom: 0,
        borderLeft: `4px solid ${isOnline ? 'var(--success)' : 'var(--text-lighter)'}`,
        ...(isSuspicious ? { borderColor: 'var(--danger)', background: '#fff5f5' } : {}),
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{student.name}</span>
          {student.email && (
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{student.email}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isSuspicious && <span className="badge badge-danger">Suspicious</span>}
          <span className={`badge ${isOnline ? 'badge-success' : 'badge-gray'}`}>
            {isOnline ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, fontSize: 13, marginBottom: student.alerts.length > 0 ? 10 : 0 }}>
        <span style={{ color: student.tabSwitches > 0 ? 'var(--warning)' : 'var(--text-light)' }}>
          Tab switches: <strong>{student.tabSwitches}</strong>
        </span>
        <span style={{ color: 'var(--text-light)' }}>
          Alerts: <strong style={{ color: student.alerts.length > 0 ? 'var(--danger)' : 'inherit' }}>{student.alerts.length}</strong>
        </span>
        {student.lastSeen && (
          <span style={{ color: 'var(--text-lighter)' }}>
            Last seen: {new Date(student.lastSeen).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Alert list */}
      {student.alerts.length > 0 && (
        <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
          {student.alerts.slice(-4).map((alert, i) => (
            <li
              key={i}
              style={{
                fontSize: 12, padding: '3px 8px', marginBottom: 3, borderRadius: 4,
                background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
              }}
            >
              {alert.type || alert}: {alert.message || ''}{' '}
              {alert.timestamp && (
                <span style={{ opacity: 0.7 }}>— {new Date(alert.timestamp).toLocaleTimeString()}</span>
              )}
            </li>
          ))}
          {student.alerts.length > 4 && (
            <li style={{ fontSize: 12, color: 'var(--text-light)', paddingLeft: 8 }}>
              +{student.alerts.length - 4} more alerts
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function ExamMonitor() {
  const { examId } = useParams();
  const socket = useSocket();
  const [students, setStudents] = useState({});   // keyed by studentId
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState('');
  const heartbeatTimers = useRef({});             // timerId per student

  // Mark a student offline after heartbeat timeout
  const scheduleOffline = useCallback((studentId) => {
    if (heartbeatTimers.current[studentId]) clearTimeout(heartbeatTimers.current[studentId]);
    heartbeatTimers.current[studentId] = setTimeout(() => {
      setStudents((prev) => {
        if (!prev[studentId]) return prev;
        return { ...prev, [studentId]: { ...prev[studentId], status: 'offline' } };
      });
    }, HEARTBEAT_TIMEOUT_MS);
  }, []);

  // Initialise from existing submissions
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const { data } = await api.get(`/exams/${examId}/submissions`);
        const subs = data.submissions || [];
        const map = {};
        subs.forEach((sub) => {
          const id = sub.studentId || sub.student?.id || sub.Student?.id;
          if (!id) return;
          map[id] = {
            id,
            name: sub.student?.name || sub.Student?.name || 'Unknown',
            email: sub.student?.email || sub.Student?.email || '',
            status: 'offline',
            tabSwitches: 0,
            alerts: [],
            lastSeen: null,
          };
        });

        // Try to fetch exam title
        try {
          const { data: examData } = await api.get(`/exams/${examId}`);
          setExamTitle(examData.exam?.title || '');
        } catch (_) {}

        setStudents(map);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [examId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_exam_monitor', examId);

    const handleStudentJoined = (payload) => {
      const { studentId, name, email } = payload;
      setStudents((prev) => ({
        ...prev,
        [studentId]: {
          id: studentId,
          name: name || prev[studentId]?.name || 'Unknown',
          email: email || prev[studentId]?.email || '',
          status: 'online',
          tabSwitches: prev[studentId]?.tabSwitches || 0,
          alerts: prev[studentId]?.alerts || [],
          lastSeen: new Date().toISOString(),
        },
      }));
      scheduleOffline(studentId);
      toast.info(`${name || 'A student'} joined the exam`);
    };

    const handleStudentLeft = (payload) => {
      const { studentId, name } = payload;
      setStudents((prev) => {
        if (!prev[studentId]) return prev;
        return { ...prev, [studentId]: { ...prev[studentId], status: 'offline' } };
      });
      if (heartbeatTimers.current[studentId]) clearTimeout(heartbeatTimers.current[studentId]);
    };

    const handleHeartbeat = (payload) => {
      const { studentId } = payload;
      setStudents((prev) => {
        if (!prev[studentId]) return prev;
        return {
          ...prev,
          [studentId]: { ...prev[studentId], status: 'online', lastSeen: new Date().toISOString() },
        };
      });
      scheduleOffline(studentId);
    };

    const handleProctoringAlert = (payload) => {
      const { studentId, type, message, tabSwitchCount } = payload;
      setStudents((prev) => {
        if (!prev[studentId]) return prev;
        const student = prev[studentId];
        const newAlerts = [...student.alerts, { type, message, timestamp: new Date().toISOString() }];
        return {
          ...prev,
          [studentId]: {
            ...student,
            alerts: newAlerts,
            tabSwitches: tabSwitchCount != null ? tabSwitchCount : (type === 'tab_switch' ? student.tabSwitches + 1 : student.tabSwitches),
          },
        };
      });
    };

    socket.on('student_joined', handleStudentJoined);
    socket.on('student_left', handleStudentLeft);
    socket.on('student_heartbeat', handleHeartbeat);
    socket.on('proctoring_alert', handleProctoringAlert);

    return () => {
      socket.off('student_joined', handleStudentJoined);
      socket.off('student_left', handleStudentLeft);
      socket.off('student_heartbeat', handleHeartbeat);
      socket.off('proctoring_alert', handleProctoringAlert);
    };
  }, [socket, examId, scheduleOffline]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(heartbeatTimers.current).forEach(clearTimeout);
    };
  }, []);

  if (loading) return <div className="spinner" />;

  const studentList = Object.values(students);
  const onlineCount = studentList.filter((s) => s.status === 'online').length;
  const suspiciousCount = studentList.filter((s) => s.tabSwitches > 2 || s.alerts.length > 1).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Exam Monitor</h1>
          {examTitle && <p>{examTitle}</p>}
        </div>
        <div className="btn-group">
          <Link to={`/teacher/exam/${examId}`} className="btn btn-outline btn-sm">
            Manage Exam
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-value">{studentList.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🟢</div>
          <div>
            <div className="stat-value">{onlineCount}</div>
            <div className="stat-label">Currently Online</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div>
            <div className="stat-value">{suspiciousCount}</div>
            <div className="stat-label">Suspicious Activity</div>
          </div>
        </div>
      </div>

      {/* Live panel */}
      <div className="live-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Live Student Activity</h3>
          <span
            style={{
              width: 10, height: 10, borderRadius: '50%', background: 'var(--success)',
              display: 'inline-block', animation: 'pulse 1.5s infinite',
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-light)' }}>Real-time</span>
        </div>

        {studentList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-light)' }}>
            No students have joined yet. Waiting for participants...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {studentList
              .sort((a, b) => {
                // Suspicious first, then online, then offline
                const score = (s) => (s.tabSwitches > 2 || s.alerts.length > 1 ? 2 : 0) + (s.status === 'online' ? 1 : 0);
                return score(b) - score(a);
              })
              .map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
