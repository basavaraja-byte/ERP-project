import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  UserCheck,
  Lock,
  Bell,
  Calendar,
  Menu,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    activeCampusId,
    setActiveCampusId,
    availableCampuses,
    academicYear,
    setAcademicYear,
    scopedConcessions,
    scopedExpenses,
    scopedRefunds
  } = useFinance();

  const location = useLocation();

  const isDean = currentUser.role === 'dean';

  // Format title from route
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
      case '/dashboard':
        return 'Executive Financial Overview';
      case '/campuses':
        return 'Campus Directory & Performance';
      case '/fee-structures':
        return 'Fee Structures & Rates';
      case '/installments':
        return 'Installment Plans & Schedules';
      case '/student-ledger':
        return 'Student Fee Ledger & Dues';
      case '/collections':
        return 'Collections & Payment Allocation';
      case '/receipts':
        return 'Receipt Register';
      case '/concessions':
        return 'Concessions & Scholarships';
      case '/refunds-deposits':
        return 'Refunds & Refundable Deposits';
      case '/expenses':
        return 'Expenses & Approvals';
      case '/budgets':
        return 'Institutional Budgets & Utilization';
      case '/vendors':
        return 'Vendor Management';
      case '/reconciliation':
        return 'Reconciliation Workbench';
      case '/reports':
        return 'Financial Reports & Analytics';
      case '/audit-history':
        return 'Financial Audit Trail';
      case '/settings':
        return 'System Preferences & Demo Settings';
      default:
        return 'Finance System';
    }
  };

  const pendingCount =
    scopedConcessions.filter(c => c.approval_status === 'pending').length +
    scopedExpenses.filter(e => e.approval_status === 'pending').length +
    scopedRefunds.filter(r => r.approval_status === 'pending').length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left side: Hamburger (mobile) + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Trust Finance</span>
              <span>/</span>
              <span className="text-indigo-600 font-semibold">{getPageTitle(location.pathname)}</span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        </div>

        {/* Right side controls: Campus Selector, Academic Year, Role Selector, Notifications */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Academic Year Selector */}
          <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="2026-27">AY 2026-27</option>
              <option value="2025-26">AY 2025-26</option>
              <option value="2027-28">AY 2027-28</option>
            </select>
          </div>

          {/* Campus Selector (With Dean Locking Enforcement) */}
          <div className="flex items-center">
            <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 border text-xs ${isDean
                ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-300 text-slate-800 focus-within:border-indigo-500'
              }`}>
              {isDean ? (
                <span title="Dean Campus Scope Locked" className="flex items-center">
                  <Lock className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                </span>
              ) : (
                <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              )}
              <select
                value={activeCampusId}
                disabled={isDean}
                onChange={(e) => setActiveCampusId(e.target.value)}
                className={`bg-transparent font-medium outline-none ${isDean ? 'cursor-not-allowed text-amber-950 font-semibold' : 'cursor-pointer'}`}
              >
                {!isDean && <option value="all">🏢 All 6 Campuses (Consolidated)</option>}
                {availableCampuses.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pending Notifications indicator */}
          <div className="relative">
            <div className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer" title={`${pendingCount} pending approvals`}>
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {pendingCount}
                </span>
              )}
            </div>
          </div>

          {/* Role Switcher Selector */}
          <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-200 rounded-lg p-1">
            <div className="hidden md:flex flex-col text-right pl-2">
              <span className="text-xs font-semibold text-slate-900 leading-none">{currentUser.name}</span>
              <span className="text-[11px] font-medium text-indigo-700 capitalize mt-0.5">
                {currentUser.role === 'trustee' ? 'Trustee / Board' : currentUser.role.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center">
              <UserCheck className="w-4 h-4 text-indigo-600 mx-1 hidden sm:block" />
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const sel = users.find(u => u.id === e.target.value);
                  if (sel) setCurrentUser(sel);
                }}
                className="bg-white border border-indigo-300 text-indigo-900 text-xs font-medium rounded px-2 py-1 outline-none cursor-pointer hover:bg-indigo-50 transition-colors"
                title="Switch Demo Role"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
