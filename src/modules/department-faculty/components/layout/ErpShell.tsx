import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareWarning,
  RefreshCw,
  ShieldAlert,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/Modal';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const hodNavItems: NavItem[] = [
  { to: '/hod/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/hod/faculty', label: 'Faculty Management', icon: UserCog },
  { to: '/hod/courses', label: 'Courses & Subjects', icon: BookOpen },
  { to: '/hod/students', label: 'Students', icon: GraduationCap },
  { to: '/hod/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/hod/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { to: '/hod/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/hod/reports', label: 'Reports', icon: FileBarChart },
];

const facultyNavItems: NavItem[] = [
  { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { to: '/faculty/students', label: 'Student Details', icon: Users, group: 'Primary Modules' },
  { to: '/faculty/courses', label: 'Courses', icon: BookOpen, group: 'Primary Modules' },
  { to: '/faculty/attendance', label: 'Attendance', icon: ClipboardCheck, group: 'Primary Modules' },
];

export const ErpShell: React.FC = () => {
  const {
    currentUser,
    department,
    campus,
    availableAccounts,
    loginAs,
    logout,
    resetAllDemoData,
  } = useDemoAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!currentUser || !department || !campus) {
    return null;
  }

  const navItems = currentUser.role === 'HOD' ? hodNavItems : facultyNavItems;

  const handleQuickAccountSwitch = (userId: string) => {
    const target = availableAccounts.find((a) => a.user.id === userId);
    if (!target) return;
    loginAs(userId);
    setMobileMenuOpen(false);
    const nextRoute =
      target.user.role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard';
    navigate(nextRoute);
    showToast(
      `Switched to ${target.user.name} (${target.user.role} — ${target.department.code}).`,
      'info',
      'Demo Role Switched'
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('Signed out of demo session. Choose any demo role to continue.', 'info');
  };

  const handleConfirmReset = () => {
    resetAllDemoData();
    setConfirmResetOpen(false);
    showToast(
      'All in-memory mock data restored to initial seeded state.',
      'success',
      'Demo Data Reset'
    );
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-navy-950 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-navy-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            AE
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white tracking-tight truncate">
              Aarohan ERP
            </p>
            <p className="text-[11px] text-navy-300 truncate">
              {currentUser.role === 'HOD' ? 'HOD Portal' : 'Faculty Portal'} • Dept. Mgmt
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1 text-slate-400 hover:text-white"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Department Pill */}
      <div className="px-4 py-3 bg-navy-900/70 border-b border-navy-800/80">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Dept. of {department.code}</span>
        </div>
        <p className="text-xs text-slate-300 truncate mt-0.5" title={department.name}>
          {department.name}
        </p>
        <p className="text-[11px] text-navy-400 truncate mt-0.5">{campus.name}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {currentUser.role === 'FACULTY' ? (
          <>
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
              Overview
            </p>
            {facultyNavItems
              .filter((i) => i.group === 'Overview')
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
              Primary Modules (4)
            </p>
            {facultyNavItems
              .filter((i) => i.group === 'Primary Modules')
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
          </>
        ) : (
          <>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-400">
              HOD Department Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom User Card */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-950 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-xs font-bold text-blue-200 shrink-0">
            {currentUser.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[11px] text-navy-300 truncate">{currentUser.designation}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-navy-900 hover:bg-navy-800 text-slate-200 border border-navy-800 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Switch Portal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-navy-900 hover:bg-red-950/60 hover:text-red-200 text-slate-300 border border-navy-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-50">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Institutional Header + Demo Mode Controls */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  DEMO MODE
                </span>
                <span className="hidden sm:inline text-xs font-medium text-slate-600 truncate">
                  Aarohan Education Trust ERP • AY 2026-27
                </span>
              </div>
            </div>

            {/* Active Role Info & Instant Demo Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <span className="font-semibold text-navy-900">{currentUser.role}</span>
                <span className="text-slate-300">|</span>
                <span>{department.code}</span>
                <span className="text-slate-300">|</span>
                <span>{campus.city} Campus</span>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="quick-role-switcher" className="sr-only">
                  Switch Demo Account
                </label>
                <select
                  id="quick-role-switcher"
                  value={currentUser.id}
                  onChange={(e) => handleQuickAccountSwitch(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:border-blue-400 focus:border-blue-600 focus:outline-none"
                  title="Switch active Demo Role / Account"
                >
                  {availableAccounts.map(({ user, department: dept }) => (
                    <option key={user.id} value={user.id}>
                      [{user.role}] {user.name} — {dept.code}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-navy-900 transition-colors"
                  title="Reset in-memory demo data to initial state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Data</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>

        {/* Subtle Institutional Footer */}
        <footer className="px-6 py-3 border-t border-slate-200 bg-white text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Aarohan Education Trust ERP — Department Management Module (HOD & Faculty Portals)
          </span>
          <span>
            Frontend Demonstration Mode • In-Memory Mock Service Layer (No Backend / Database)
          </span>
        </footer>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Demo Mock Data?"
        description="This will restore all faculty assignments, attendance records, complaint statuses, and department announcements back to their original seeded demo values."
        confirmLabel="Reset Demo State"
        variant="warning"
      />
    </div>
  );
};

