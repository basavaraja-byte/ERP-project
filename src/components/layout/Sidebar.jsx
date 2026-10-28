import React from 'react';
import {
  LayoutDashboard,
  Building2,
  IndianRupee,
  BedDouble,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  School,
  X,
  GraduationCap,
  Users,
  Scale,
  Receipt,
  UploadCloud,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  openExceptionsCount = 7,
  attendanceRiskCount = 488,
  userRole = 'trustee',
  setUserRole
}) {
  const coreNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'performance', label: 'Campus Performance', icon: Building2 },
    { id: 'financial', label: 'Financial Overview', icon: IndianRupee },
    { id: 'hostel', label: 'Hostel Occupancy', icon: BedDouble },
    {
      id: 'attendance',
      label: 'Attendance Risks',
      icon: AlertTriangle,
      badge: attendanceRiskCount,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      id: 'exceptions',
      label: 'Data Exceptions',
      icon: FileSpreadsheet,
      badge: openExceptionsCount,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    },
    { id: 'reports', label: 'Reports & Exports', icon: FileText }
  ];

  const financeNavItems = [
    {
      id: 'finance_management',
      label: 'Finance Management Suite',
      icon: IndianRupee,
      badge: '16 Pages',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  ];

  const masterWorkflowItems = [
    { id: 'student_registry', label: 'Student Master Registry', icon: Users },
    { id: 'campus_rules', label: 'Campus Rules Engine', icon: Scale },
    { id: 'fee_ledger', label: 'Fee Ledger & Reconciliation', icon: Receipt },
    { id: 'guided_import', label: 'Guided Data Import', icon: UploadCloud },
    { id: 'hostel_inventory', label: 'Hostel Bed Inventory', icon: BedDouble },
    { id: 'audit_trail', label: 'Security Audit Trail', icon: ShieldAlert }
  ];

  const portalItems = [
    { id: 'department', label: 'Department Management', icon: GraduationCap },
    { id: 'hostel_module', label: 'CampusStay Hostels', icon: BedDouble },
    { id: 'student_portal', label: 'Student / Parent Services', icon: Users },
    { id: 'settings', label: 'Settings & Policies', icon: Settings }
  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const renderNavGroup = (title, items) => (
    <div className="space-y-1">
      <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {!isCollapsed ? title : '•••'}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Icon
              size={18}
              className={`shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
              }`}
            />

            {!isCollapsed && (
              <span className="truncate flex-1 text-left">{item.label}</span>
            )}

            {!isCollapsed && item.badge !== undefined && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            )}

            {isCollapsed && isActive && (
              <span className="absolute right-1 w-1.5 h-6 bg-blue-400 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Main Navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 text-white font-black text-base tracking-tight">
              MET
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-white uppercase truncate">
                  MAHARAJA TRUST
                </span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase truncate">
                  Institutional ERP
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          {/* Authenticated Identity Pill */}
          {!isCollapsed && (
            <div className="px-3 pb-3 mb-2 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Session
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[9px] uppercase font-bold">
                    {userRole}
                  </span>
                </div>
                <div className="text-white font-semibold truncate">
                  {userRole === 'trustee'
                    ? 'Dr. Vikram Mehta (Trustee)'
                    : userRole === 'dean'
                    ? 'Prof. Rajesh Swaminathan (Dean)'
                    : 'Dr. K. S. Ramanathan (Principal)'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userRole === 'trustee' ? 'All 6 Campuses (Consolidated)' : 'Campus 1 Scope (Restricted)'}
                </div>
              </div>
            </div>
          )}

          {renderNavGroup('Core Dashboards', coreNavItems)}
          {renderNavGroup('Finance Management', financeNavItems)}
          {renderNavGroup('Master Workflows & Engines', masterWorkflowItems)}
          {renderNavGroup('Operational Portals', portalItems)}
        </div>

        {/* Institution Info Card */}
        {!isCollapsed ? (
          <div className="p-3.5 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-1">
              <School size={15} className="text-blue-400 shrink-0" />
              <span className="truncate">Maharaja Trust Syndicate</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Consolidating 6 campuses across 40 operational spreadsheets.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Sync Active
              </span>
              <span className="text-slate-400">AY 2025–26</span>
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center">
            <div
              className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400"
              title="Maharaja Educational Trust (6 Campuses)"
            >
              <ShieldCheck size={20} className="text-blue-400" />
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-end p-3 border-t border-slate-800/80">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-medium w-full justify-center"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
