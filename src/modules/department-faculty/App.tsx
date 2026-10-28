import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DemoAuthProvider, useDemoAuth } from './context/DemoAuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErpShell } from './components/layout/ErpShell';
import { RoleRouteGuard } from './components/layout/RoleRouteGuard';
import { DemoLoginPage } from './pages/DemoLoginPage';

// HOD Portal Pages
import { HodDashboardPage } from './pages/hod/HodDashboardPage';
import { HodFacultyPage } from './pages/hod/HodFacultyPage';
import { HodCoursesPage } from './pages/hod/HodCoursesPage';
import { HodStudentsPage } from './pages/hod/HodStudentsPage';
import { HodAttendancePage } from './pages/hod/HodAttendancePage';
import { HodComplaintsPage } from './pages/hod/HodComplaintsPage';
import { HodAnnouncementsPage } from './pages/hod/HodAnnouncementsPage';
import { HodReportsPage } from './pages/hod/HodReportsPage';

// Faculty Portal Pages
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyStudentsPage } from './pages/faculty/FacultyStudentsPage';
import { FacultyCoursesPage } from './pages/faculty/FacultyCoursesPage';
import { FacultyComplaintsPage } from './pages/faculty/FacultyComplaintsPage';
import { FacultyAttendancePage } from './pages/faculty/FacultyAttendancePage';

const RootRedirect: React.FC = () => {
  const { currentUser } = useDemoAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Navigate
      to={currentUser.role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard'}
      replace
    />
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <DemoAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<DemoLoginPage />} />

            {/* HOD Portal Routes */}
            <Route
              path="/hod"
              element={
                <RoleRouteGuard requiredRole="HOD">
                  <ErpShell />
                </RoleRouteGuard>
              }
            >
              <Route index element={<Navigate to="/hod/dashboard" replace />} />
              <Route path="dashboard" element={<HodDashboardPage />} />
              <Route path="faculty" element={<HodFacultyPage />} />
              <Route path="courses" element={<HodCoursesPage />} />
              <Route path="students" element={<HodStudentsPage />} />
              <Route path="attendance" element={<HodAttendancePage />} />
              <Route path="complaints" element={<HodComplaintsPage />} />
              <Route path="announcements" element={<HodAnnouncementsPage />} />
              <Route path="reports" element={<HodReportsPage />} />
            </Route>

            {/* Faculty Portal Routes */}
            <Route
              path="/faculty"
              element={
                <RoleRouteGuard requiredRole="FACULTY">
                  <ErpShell />
                </RoleRouteGuard>
              }
            >
              <Route index element={<Navigate to="/faculty/dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboardPage />} />
              <Route path="students" element={<FacultyStudentsPage />} />
              <Route path="courses" element={<FacultyCoursesPage />} />
              <Route path="complaints" element={<FacultyComplaintsPage />} />
              <Route path="attendance" element={<FacultyAttendancePage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </DemoAuthProvider>
    </ToastProvider>
  );
};

export default App;

