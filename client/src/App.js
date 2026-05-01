import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/common/Layout';

// Auth
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams   from './pages/student/AvailableExams';
import TakeExam         from './pages/student/TakeExam';
import MyResults        from './pages/student/MyResults';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateExam       from './pages/teacher/CreateExam';
import EditExam         from './pages/teacher/EditExam';
import ManageExam       from './pages/teacher/ManageExam';
import QuestionBank     from './pages/teacher/QuestionBank';
import MonitorExam      from './pages/teacher/MonitorExam';
import GradeSubmission  from './pages/teacher/GradeSubmission';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProctoringLogs from './pages/admin/ProctoringLogs';
import BulkImport     from './pages/admin/BulkImport';

/* ── Route Guards ────────────────────────────────────── */
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen" />;
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

/* ── App ─────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

            {/* Smart root redirect */}
            <Route path="/"         element={<DefaultRedirect />} />
            <Route path="/dashboard" element={<DefaultRedirect />} />

            {/* ── Student ── */}
            <Route element={<RequireAuth role="student"><Layout><Outlet /></Layout></RequireAuth>}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams" element={<AvailableExams />} />
              <Route path="/student/exam/:examId" element={<TakeExam />} />
              <Route path="/student/results" element={<MyResults />} />
            </Route>

            {/* ── Teacher ── */}
            <Route element={<RequireAuth role={['teacher','admin']}><Layout><Outlet /></Layout></RequireAuth>}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/exams/create" element={<CreateExam />} />
              <Route path="/teacher/exam/:examId" element={<ManageExam />} />
              <Route path="/teacher/exams/:id/edit" element={<EditExam />} />
              <Route path="/teacher/question-bank" element={<QuestionBank />} />
              <Route path="/teacher/exams/:id/monitor" element={<MonitorExam />} />
              <Route path="/teacher/submissions/:submissionId" element={<GradeSubmission />} />
            </Route>

            {/* ── Admin ── */}
            <Route element={<RequireAuth role="admin"><Layout><Outlet /></Layout></RequireAuth>}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/proctoring-logs" element={<ProctoringLogs />} />
              <Route path="/admin/bulk-import" element={<BulkImport />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="top-right"
          autoClose={3500}
          theme="dark"
          toastStyle={{ background: '#1e293b', border: '1px solid #334155' }}
        />
      </SocketProvider>
    </AuthProvider>
  );
}
