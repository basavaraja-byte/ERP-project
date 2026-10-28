import React, { useState, useMemo } from 'react';
import { FinanceProvider, useFinance } from '../../../modules/finance/src/context/FinanceContext';

// Import all 16 integrated Finance Pages
import { DashboardPage } from '../../../modules/finance/src/pages/DashboardPage';
import { CampusesPage } from '../../../modules/finance/src/pages/CampusesPage';
import { FeeStructuresPage } from '../../../modules/finance/src/pages/FeeStructuresPage';
import { InstallmentsPage } from '../../../modules/finance/src/pages/InstallmentsPage';
import { StudentLedgerPage } from '../../../modules/finance/src/pages/StudentLedgerPage';
import { CollectionsPage } from '../../../modules/finance/src/pages/CollectionsPage';
import { ReceiptsPage } from '../../../modules/finance/src/pages/ReceiptsPage';
import { ConcessionsPage } from '../../../modules/finance/src/pages/ConcessionsPage';
import { RefundsDepositsPage } from '../../../modules/finance/src/pages/RefundsDepositsPage';
import { ExpensesPage } from '../../../modules/finance/src/pages/ExpensesPage';
import { BudgetsPage } from '../../../modules/finance/src/pages/BudgetsPage';
import { VendorsPage } from '../../../modules/finance/src/pages/VendorsPage';
import { ReconciliationPage } from '../../../modules/finance/src/pages/ReconciliationPage';
import { ReportsPage } from '../../../modules/finance/src/pages/ReportsPage';
import { AuditHistoryPage } from '../../../modules/finance/src/pages/AuditHistoryPage';
import { SettingsPage } from '../../../modules/finance/src/pages/SettingsPage';

import {
  LayoutDashboard,
  Building2,
  Sliders,
  CalendarClock,
  BookOpenCheck,
  CreditCard,
  ReceiptText,
  Award,
  RotateCcw,
  Receipt,
  PieChart,
  Truck,
  Scale,
  FileSpreadsheet,
  History,
  Settings,
  ArrowLeft,
  ShieldCheck,
  Database
} from 'lucide-react';

const FINANCE_TABS = [
  // 1. Executive Overview
  { id: 'dashboard', category: 'Overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'campuses', category: 'Overview', label: 'Campus Finance', icon: Building2 },

  // 2. Fee Structures & Installments
  { id: 'fee-structures', category: 'Structures', label: 'Fee Structures', icon: Sliders },
  { id: 'installments', category: 'Structures', label: 'Installment Schedules', icon: CalendarClock },

  // 3. Student Receivables & Ledgers
  { id: 'student-ledger', category: 'Receivables', label: 'Student Fee Ledger', icon: BookOpenCheck },
  { id: 'collections', category: 'Receivables', label: 'Collections & Payments', icon: CreditCard },
  { id: 'receipts', category: 'Receivables', label: 'Receipts Register', icon: ReceiptText },
  { id: 'concessions', category: 'Receivables', label: 'Concessions & Scholarships', icon: Award },
  { id: 'refunds-deposits', category: 'Receivables', label: 'Refunds & Deposits', icon: RotateCcw },

  // 4. Institutional Operations
  { id: 'expenses', category: 'Operations', label: 'Expenses & Approvals', icon: Receipt },
  { id: 'budgets', category: 'Operations', label: 'Budgets & Allocations', icon: PieChart },
  { id: 'vendors', category: 'Operations', label: 'Vendors Directory', icon: Truck },
  { id: 'reconciliation', category: 'Operations', label: 'Bank Reconciliation', icon: Scale },

  // 5. Governance & Auditing
  { id: 'reports', category: 'Governance', label: 'Financial Reports', icon: FileSpreadsheet },
  { id: 'audit-history', category: 'Governance', label: 'Audit Trail', icon: History },
  { id: 'settings', category: 'Governance', label: 'Finance Policies', icon: Settings },
];

const CATEGORIES = [
  { id: 'ALL', label: 'All 16 Tabs' },
  { id: 'Overview', label: 'Executive' },
  { id: 'Structures', label: 'Fee Structures' },
  { id: 'Receivables', label: 'Student Receivables' },
  { id: 'Operations', label: 'Operations & Budgets' },
  { id: 'Governance', label: 'Reports & Audit' },
];

function FinanceTabContent({ activeTab, onSelectTab: _onSelectTab }) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'campuses':
      return <CampusesPage />;
    case 'fee-structures':
      return <FeeStructuresPage />;
    case 'installments':
      return <InstallmentsPage />;
    case 'student-ledger':
      return <StudentLedgerPage />;
    case 'collections':
      return <CollectionsPage />;
    case 'receipts':
      return <ReceiptsPage />;
    case 'concessions':
      return <ConcessionsPage />;
    case 'refunds-deposits':
      return <RefundsDepositsPage />;
    case 'expenses':
      return <ExpensesPage />;
    case 'budgets':
      return <BudgetsPage />;
    case 'vendors':
      return <VendorsPage />;
    case 'reconciliation':
      return <ReconciliationPage />;
    case 'reports':
      return <ReportsPage />;
    case 'audit-history':
      return <AuditHistoryPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

function FinanceViewInner({
  user,
  selectedCampusId,
  onBackToAllCampuses,
  isLiveFromDb = true
}) {
  const { activeCampusId, campuses, currentUser } = useFinance();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const isTrustee = (user?.role || '').toLowerCase() === 'trustee';
  const isAllCampuses = activeCampusId === 'all';
  const activeCampusObj = campuses.find((c) => c.id === activeCampusId);

  const filteredTabs = useMemo(() => {
    if (selectedCategory === 'ALL') return FINANCE_TABS;
    return FINANCE_TABS.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <Building2 size={13} className="text-emerald-600" />
              <span>Trust Finance Management Suite</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              <ShieldCheck size={13} className="text-blue-600" />
              <span>Scope: {isAllCampuses ? 'All 6 Campuses (Consolidated)' : (activeCampusObj?.name || activeCampusId)}</span>
            </span>
            {isLiveFromDb ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Database size={12} className="text-emerald-600" />
                <span>Dataset: Live Database (MongoDB Atlas)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <Database size={12} className="text-amber-600" />
                <span>Dataset: Reconciled Institutional Models (AY 2025–26)</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Active User: {currentUser.name} ({currentUser.role.toUpperCase()})
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Finance &amp; Receivables Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            16-page integrated financial control suite covering tuition fee structures, installment collections, student fee ledgers, voucher expenses, multi-campus budgets, and statutory audit trails.
          </p>
        </div>

        {/* Back to All Campuses Button for Trustee when a campus is selected */}
        {isTrustee && !isAllCampuses && onBackToAllCampuses && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={onBackToAllCampuses}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
              title="Return to Trustee 6-Campus Selection Grid"
            >
              <ArrowLeft size={16} className="text-white group-hover:-translate-x-1 transition-transform" />
              <span>← Back to All Campuses</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Quick Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Filter:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 16 Tabs Sub-Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Page Content */}
      <div className="bg-slate-50/50 rounded-2xl min-h-[500px]">
        <FinanceTabContent activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>
    </div>
  );
}

export default function FinanceManagementView({
  user,
  selectedCampusId = 'all',
  onBackToAllCampuses,
  onSelectCampus,
  isLiveFromDb = true
}) {
  return (
    <FinanceProvider
      initialUser={user}
      initialCampusId={selectedCampusId}
      onSelectCampus={onSelectCampus}
    >
      <FinanceViewInner
        user={user}
        selectedCampusId={selectedCampusId}
        onBackToAllCampuses={onBackToAllCampuses}
        isLiveFromDb={isLiveFromDb}
      />
    </FinanceProvider>
  );
}

