import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HostelProvider } from './context/HostelContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CampusesPage } from './pages/CampusesPage';
import { HostelsPage } from './pages/HostelsPage';
import { RoomsBedsPage } from './pages/RoomsBedsPage';
import { AllocationsPage } from './pages/AllocationsPage';
import { StudentsPage } from './pages/StudentsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { PageHeader } from './components/layout/PageHeader';

const PlaceholderPage: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="space-y-6">
    <PageHeader title={title} subtitle={subtitle} />
    <div className="p-8 bg-white border border-slate-200/80 rounded-2xl text-center space-y-3 shadow-xs">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto font-bold text-lg">
        ERP
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title} Module</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto">
        This section is integrated with the CampusStay institutional database. Core data and live tracking are fully active under the Overview and Hostel Operations tabs.
      </p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <HostelProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/campuses" element={<CampusesPage />} />
            <Route path="/hostels" element={<HostelsPage />} />
            <Route path="/rooms-beds" element={<RoomsBedsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/allocations" element={<AllocationsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route
              path="/reports"
              element={
                <PlaceholderPage
                  title="Institutional Reports & Occupancy Analytics"
                  subtitle="Download census reports, fee reconciliation, and semester allocation records"
                />
              }
            />
            <Route
              path="/audit-history"
              element={
                <PlaceholderPage
                  title="System Audit History"
                  subtitle="Comprehensive event logs of bed allocations, transfers, and administrative actions"
                />
              }
            />
            <Route
              path="/settings"
              element={
                <PlaceholderPage
                  title="Hostel ERP Configuration"
                  subtitle="Manage campus policies, allocation rules, room categories, and academic terms"
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HostelProvider>
  );
};

export default App;
