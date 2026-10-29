import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  CheckCircle2,
  ChevronDown,
  Building,
  ShieldCheck,
  GraduationCap,
  ShieldAlert,
  AlertTriangle,
  Info,
  Database,
  RefreshCw,
  LogOut,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { MOCK_CAMPUSES, MOCK_NOTIFICATIONS } from '../../data/mockData';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({
  isCollapsed,
  setIsMobileOpen,
  currentView,
  onNavigateView,
  selectedCampusId,
  setSelectedCampusId,
  userRole,
  setUserRole: _setUserRole,
  deanAssignedCampus: _deanAssignedCampus,
  setDeanAssignedCampus: _setDeanAssignedCampus,
  principalAssignedCampus: _principalAssignedCampus,
  setPrincipalAssignedCampus: _setPrincipalAssignedCampus,
  onBackToAllCampuses
}) {
  const { user: authUser, logout } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDbPopoverOpen, setIsDbPopoverOpen] = useState(false);
  const [apiHealth, setApiHealth] = useState({
    isOnline: false,
    serverOk: false,
    database: { connected: false }
  });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const dbRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const refreshHealth = () => {
    setIsCheckingHealth(true);
    apiService.getHealth().then((health) => {
      setApiHealth(health);
      setIsCheckingHealth(false);
    }).catch(() => {
      setIsCheckingHealth(false);
    });
  };

  useEffect(() => {
    // Initial fetch
    let isMounted = true;
    apiService.getHealth().then((health) => {
      if (isMounted) setApiHealth(health);
    }).catch(() => {});

    const interval = setInterval(() => {
      apiService.getHealth().then((health) => {
        if (isMounted) setApiHealth(health);
      }).catch(() => {});
    }, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (dbRef.current && !dbRef.current.contains(event.target)) {
        setIsDbPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const getBreadcrumbTitle = () => {
    if (currentView === 'overview' && userRole === 'trustee' && selectedCampusId === 'all') {
      return 'Six-Campus Selection Dashboard';
    }
    const titles = {
      overview: 'Executive Overview',
      performance: 'Campus Performance Analytics',
      financial: 'Consolidated Financial Overview',
      hostel: 'Hostel Inventory & Occupancy',
      attendance: 'Attendance Risk Monitoring',
      exceptions: 'Data Exceptions & Reconciliation',
      reports: 'Consolidated Reporting & Exports',
      settings: 'Campus Rules & System Configuration'
    };
    return titles[currentView] || 'Overview';
  };

  const selectedCampusObj = MOCK_CAMPUSES.find(c => c.id === selectedCampusId);

  return (
    <header
      className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 gap-3 max-w-full">
        {/* Left Side: Mobile Menu + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar menu"
          >
            <Menu size={22} />
          </button>

          {/* Prominent Back to All Campuses Navigation Button for Trustee in TopNav */}
          {(userRole || authUser?.role || '').toLowerCase() === 'trustee' && selectedCampusId !== 'all' && onBackToAllCampuses && (
            <button
              type="button"
              onClick={onBackToAllCampuses}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all active:scale-95 group cursor-pointer shrink-0"
              title="Return to Trustee 6-Campus Selection Grid"
            >
              <ArrowLeft size={14} className="text-white group-hover:-translate-x-1 transition-transform" />
              <span>← Back to All Campuses</span>
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate">
              <span>MAHARAJA EDUCATIONAL TRUST</span>
              <span>/</span>
              <span className="text-slate-700 font-semibold">
                {userRole === 'trustee'
                  ? 'Board of Trustees'
                  : userRole === 'dean'
                  ? 'Dean Portal'
                  : userRole === 'finance_manager'
                  ? 'Finance Management'
                  : 'Principal Portal'}
              </span>
              <span>/</span>
              <span className="text-blue-600 font-semibold truncate">
                {selectedCampusId === 'all' ? 'All Campuses (Consolidated)' : selectedCampusObj?.shortName}
              </span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
              {getBreadcrumbTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side: Role Scope Indicator + Campus Filter + Atlas Status + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pr-1 md:pr-2">
          {/* Active Authenticated Role Scope Badge */}
          <div className="hidden sm:flex items-center">
            {userRole === 'trustee' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs">
                <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                <span>Trustee (Consolidated)</span>
              </div>
            ) : userRole === 'dean' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold shadow-2xs">
                <GraduationCap size={14} className="text-indigo-600 shrink-0" />
                <span>Dean ({selectedCampusObj?.shortName || 'Assigned'} Scope)</span>
              </div>
            ) : userRole === 'finance_manager' ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span>Finance Manager ({selectedCampusObj?.shortName || 'Assigned'} Scope)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold shadow-2xs">
                <Building size={14} className="text-amber-600 shrink-0" />
                <span>Principal ({selectedCampusObj?.shortName || 'Assigned'} Scope)</span>
              </div>
            )}
          </div>

          {/* Campus Selector Dropdown */}
          <div className="relative">
            <label htmlFor="campus-select" className="sr-only">
              Filter by Campus
            </label>
            <div className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs text-slate-800 transition-colors ${
              userRole === 'trustee'
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 focus-within:ring-2 focus-within:ring-blue-500'
                : 'bg-amber-50/60 border-amber-300 text-amber-900 cursor-not-allowed'
            }`}>
              {userRole === 'trustee' ? (
                <Building size={14} className="text-slate-500 shrink-0" />
              ) : (
                <Lock size={13} className="text-amber-600 shrink-0" />
              )}
              <select
                id="campus-select"
                value={selectedCampusId}
                disabled={userRole !== 'trustee'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (userRole === 'trustee') {
                    setSelectedCampusId(val);
                  }
                }}
                className={`bg-transparent text-slate-800 font-semibold focus:outline-none pr-1 ${
                  userRole !== 'trustee' ? 'cursor-not-allowed text-amber-900' : 'cursor-pointer'
                }`}
              >
                {userRole === 'trustee' && (
                  <option value="all">All Campuses (Selection Grid)</option>
                )}
                {MOCK_CAMPUSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {userRole !== 'trustee' ? '(Locked to Assigned Scope)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Backend & MongoDB Atlas Connection Status Pill */}
          <div className="relative" ref={dbRef}>
            <button
              onClick={() => setIsDbPopoverOpen(!isDbPopoverOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                apiHealth.isOnline && apiHealth.database?.connected
                  ? (apiHealth.database?.hasRecords
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100')
                  : apiHealth.isOnline
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Click to inspect real-time Backend & MongoDB Atlas status"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth.isOnline && apiHealth.database?.connected
                    ? (apiHealth.database?.hasRecords ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500')
                    : apiHealth.isOnline
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <Database size={13} className="shrink-0" />
              <span className="hidden md:inline">
                {apiHealth.isOnline && apiHealth.database?.connected
                  ? (apiHealth.database?.hasRecords ? 'Atlas Live' : 'Atlas Connected (Demo Cache)')
                  : apiHealth.isOnline
                  ? 'API Live (Atlas Offline)'
                  : 'Backend Offline (Demo Cache)'}
              </span>
            </button>

            {/* Health / Atlas Status Popover */}
            {isDbPopoverOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">Database & Backend Diagnostics</span>
                  </div>
                  <button
                    onClick={refreshHealth}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                    title="Refresh status"
                    aria-label="Refresh status"
                  >
                    <RefreshCw size={14} className={isCheckingHealth ? 'animate-spin text-blue-600' : ''} />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Node.js Express API:</span>
                    <span className={`font-semibold flex items-center gap-1.5 ${apiHealth.isOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${apiHealth.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {apiHealth.isOnline ? 'Online (Connected)' : 'Standby (Synthetic Cache)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">MongoDB Atlas Replica Set:</span>
                    <span className={`font-semibold flex items-center gap-1.5 ${apiHealth.database?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${apiHealth.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {apiHealth.database?.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Data Provenance:</span>
                    <span className="font-semibold text-slate-800">
                      {apiHealth.database?.connected && apiHealth.database?.hasRecords
                        ? `Live Atlas Database (${apiHealth.database?.recordCount} Campuses)`
                        : 'Verified Synthetic Demo Cache'}
                    </span>
                  </div>

                  {apiHealth.database?.host && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-600 truncate">
                      Cluster: {apiHealth.database.host}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                    <p className="font-semibold mb-1">Connection Details:</p>
                    <p>{apiHealth.database?.message || 'Connecting to backend service...'}</p>
                    {apiHealth.database?.connected && !apiHealth.database?.hasRecords && (
                      <p className="mt-2 text-slate-700">
                        Notice: Collections in <code className="bg-white px-1 py-0.5 rounded border border-blue-200 font-mono text-[10px]">trustview_erp</code> have 0 records. The UI is safely rendering verified demo figures until you choose to run the safe upsert seeder.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notification Button & Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => {
                    const isCrit = n.type === 'critical';
                    const isWarn = n.type === 'warning';
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                          setIsNotifOpen(false);
                          if (onNavigateView) {
                            onNavigateView(n.type === 'critical' ? 'exceptions' : 'overview');
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 cursor-pointer ${
                          n.unread ? 'bg-blue-50/30' : ''
                        }`}
                        title="Click to view details"
                      >
                        <div className="mt-0.5 shrink-0">
                          {isCrit ? (
                            <ShieldAlert className="text-rose-600" size={18} />
                          ) : isWarn ? (
                            <AlertTriangle className="text-amber-600" size={18} />
                          ) : (
                            <Info className="text-blue-600" size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-600 shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                  <span className="text-[11px] text-slate-600">
                    Live ingestion triggers from 40 spreadsheets
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold text-xs flex items-center justify-center ring-2 ring-slate-200 shrink-0">
                {authUser?.role ? authUser.role.slice(0, 2) : (userRole === 'trustee' ? 'TR' : userRole === 'dean' ? 'DN' : 'PR')}
              </div>
              <div className="hidden sm:flex flex-col text-left max-w-[130px] md:max-w-[180px]">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate">
                  {authUser?.name || (userRole === 'trustee'
                    ? 'Shri V. K. Sundaram'
                    : userRole === 'dean'
                    ? 'Dr. A. Ramanathan'
                    : selectedCampusObj?.principalName || 'Dr. K. S. Ramanathan')}
                </span>
                <span className="text-[10px] text-slate-600 font-medium truncate">
                  {authUser?.role ? `${authUser.role} Scope` : (userRole === 'trustee'
                    ? 'Governing Trustee'
                    : userRole === 'dean'
                    ? `Dean (${selectedCampusObj?.shortName || 'Campus 1'})`
                    : `Principal (${selectedCampusObj?.shortName || 'Campus 1'})`)}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400 hidden sm:block shrink-0" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in duration-150 text-xs">
                <div className="pb-2.5 mb-2.5 border-b border-slate-100">
                  <div className="font-bold text-slate-900">
                    {authUser?.name || (userRole === 'trustee'
                      ? 'Dr. Vikram Mehta'
                      : userRole === 'dean'
                      ? 'Prof. Rajesh Swaminathan'
                      : selectedCampusObj?.principalName || 'Dr. K. S. Ramanathan')}
                  </div>
                  <div className="text-slate-600 text-[11px] truncate">
                    {authUser?.email || (userRole === 'trustee'
                      ? 'trustee@trustview.edu'
                      : userRole === 'dean'
                      ? 'dean.campus1@trustview.edu'
                      : 'principal.campus1@trustview.edu')}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                    <CheckCircle2 size={12} />
                    {authUser?.role || (userRole === 'trustee' ? 'TRUSTEE' : userRole === 'dean' ? 'DEAN' : 'PRINCIPAL')} (JWT Verified)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">
                    Operational Scope
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="font-medium text-slate-800">
                      {(authUser?.role || userRole) === 'TRUSTEE' ? 'Trust-Wide Consolidated' : 'Assigned Campus'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {(authUser?.role || userRole) === 'TRUSTEE'
                        ? 'All 6 Institutions (Full Trust Audit & Oversight)'
                        : `Restricted: ${selectedCampusObj?.name || 'Campus 1'} (${authUser?.department ? authUser.department : 'Institutional Scope'})`}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => logout()}
                    className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
