import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { MainLayout } from './components/layout/MainLayout';

import { DashboardPage } from './pages/DashboardPage';
import { CampusesPage } from './pages/CampusesPage';
import { FeeStructuresPage } from './pages/FeeStructuresPage';
import { InstallmentsPage } from './pages/InstallmentsPage';
import { StudentLedgerPage } from './pages/StudentLedgerPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { ConcessionsPage } from './pages/ConcessionsPage';
import { RefundsDepositsPage } from './pages/RefundsDepositsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { VendorsPage } from './pages/VendorsPage';
import { ReconciliationPage } from './pages/ReconciliationPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="campuses" element={<CampusesPage />} />
            <Route path="fee-structures" element={<FeeStructuresPage />} />
            <Route path="installments" element={<InstallmentsPage />} />
            <Route path="student-ledger" element={<StudentLedgerPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="receipts" element={<ReceiptsPage />} />
            <Route path="concessions" element={<ConcessionsPage />} />
            <Route path="refunds-deposits" element={<RefundsDepositsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="reconciliation" element={<ReconciliationPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="audit-history" element={<AuditHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinanceProvider>
  );
};

export default App;
