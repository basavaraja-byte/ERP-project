import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Student Portal Features
import { StudentDashboard } from './features/student/StudentDashboard';
import { StudentProfile } from './features/student/StudentProfile';
import { StudentFees } from './features/student/StudentFees';
import { StudentAttendance } from './features/student/StudentAttendance';
import { StudentHostel } from './features/student/StudentHostel';
import { StudentAcademics } from './features/student/StudentAcademics';
import { StudentNotifications } from './features/student/StudentNotifications';
import { StudentSupport } from './features/student/StudentSupport';

// Parent Portal Features
import { ParentDashboard } from './features/parent/ParentDashboard';
import { ParentChildProfile } from './features/parent/ParentChildProfile';
import { ParentFees } from './features/parent/ParentFees';
import { ParentAttendance } from './features/parent/ParentAttendance';
import { ParentHostel } from './features/parent/ParentHostel';
import { ParentNotifications } from './features/parent/ParentNotifications';
import { ParentSupport } from './features/parent/ParentSupport';

// Route Guard Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'STUDENT' | 'PARENT';
}> = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If student attempts to view parent page, or vice versa, redirect to their own dashboard
    return <Navigate to={role === 'STUDENT' ? '/student/dashboard' : '/parent/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Root index redirect based on role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/parent/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Student Portal Protected Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="STUDENT">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="hostel" element={<StudentHostel />} />
            <Route path="academics" element={<StudentAcademics />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="support" element={<StudentSupport />} />
          </Route>

          {/* Parent Portal Protected Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRole="PARENT">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/parent/dashboard" replace />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="child-profile" element={<ParentChildProfile />} />
            <Route path="fees" element={<ParentFees />} />
            <Route path="attendance" element={<ParentAttendance />} />
            <Route path="hostel" element={<ParentHostel />} />
            <Route path="notifications" element={<ParentNotifications />} />
            <Route path="support" element={<ParentSupport />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
