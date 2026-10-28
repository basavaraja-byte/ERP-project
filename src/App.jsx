import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import Header from './components/dashboard/Header';
import KpiCard from './components/dashboard/KpiCard';
import CollectionChart from './components/dashboard/CollectionChart';
import CampusComparisonChart from './components/dashboard/CampusComparisonChart';
import CampusPerformanceTable from './components/dashboard/CampusPerformanceTable';
import CampusDetailView from './components/dashboard/CampusDetailView';
import DataFreshnessCard from './components/dashboard/DataFreshnessCard';
import RecentActivityCard from './components/dashboard/RecentActivityCard';
import TrusteeCampusSelectionView from './components/dashboard/TrusteeCampusSelectionView';
import FinancialView from './components/views/FinancialView';
import HostelView from './components/views/HostelView';
import AttendanceView from './components/views/AttendanceView';
import ExceptionCenter from './components/exceptions/ExceptionCenter';
import ExceptionInspectorModal from './components/exceptions/ExceptionInspectorModal';
import ReportsView from './components/views/ReportsView';
import SettingsView from './components/views/SettingsView';

// Critical Master Workflows & Engines
import StudentRegistryView from './components/views/StudentRegistryView';
import CampusRulesView from './components/views/CampusRulesView';
import FeeLedgerView from './components/views/FeeLedgerView';
import SpreadsheetImportView from './components/views/SpreadsheetImportView';
import HostelInventoryView from './components/views/HostelInventoryView';
import AuditTrailView from './components/views/AuditTrailView';

// Teammate Module Portal Views
import HodPortalView from './components/views/modules/HodPortalView';
import FacultyPortalView from './components/views/modules/FacultyPortalView';
import StudentPortalView from './components/views/modules/StudentPortalView';
import ParentPortalView from './components/views/modules/ParentPortalView';
import WardenPortalView from './components/views/modules/WardenPortalView';
import FinanceManagementView from './components/views/modules/FinanceManagementView';

// Authentication & Public Flow Components
import { useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import PublicCampusSelectionHome from './components/home/PublicCampusSelectionHome';
import { apiService } from './services/api';
import { MOCK_CAMPUSES, MOCK_EXCEPTIONS, MOCK_COLLECTION_TRENDS, MOCK_INSTITUTION_INFO } from './data/mockData';
import { aggregateCampusMetrics, calculateOccupancyPercentage, calculateCollectionRate } from './utils/calculations';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Public Campus Selection Flow State (before authentication)
  const [loginCampus, setLoginCampus] = useState(null);

  // Reset campus selection when logged out to ensure Screen 1 is the landing page
  useEffect(() => {
    if (!isAuthenticated) {
      setLoginCampus(null);
    }
  }, [isAuthenticated]);

  // Navigation & Layout State
  const [currentView, setCurrentView] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Role & Scope State
  const [userRole, setUserRole] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('trustview_auth_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.role) return (u.role || '').toLowerCase();
      }
      return 'trustee';
    } catch {
      return 'trustee';
    }
  });

  const [selectedCampusId, setSelectedCampusId] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('trustview_auth_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && (u.role || '').toLowerCase() === 'trustee') {
          return 'all';
        }
        if (u && u.assignedCampusId) {
          return u.assignedCampusId;
        }
      }
      return 'all';
    } catch {
      return 'all';
    }
  });

  const [deanAssignedCampus, setDeanAssignedCampus] = useState('campus-1');
  const [principalAssignedCampus, setPrincipalAssignedCampus] = useState('campus-1');
  const [reportingPeriod, setReportingPeriod] = useState('AY 2025–26');

  // Drilldown & Detail View State
  const [drilldownCampusId, setDrilldownCampusId] = useState(null);

  // Campuses & Exceptions State (Synchronized with MongoDB Atlas when available)
  const [rawCampuses, setRawCampuses] = useState(MOCK_CAMPUSES);
  const [exceptionsList, setExceptionsList] = useState(MOCK_EXCEPTIONS);
  const [selectedException, setSelectedException] = useState(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isLiveFromDb, setIsLiveFromDb] = useState(false);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Synchronize authenticated user role and campus boundaries
  useEffect(() => {
    if (user && user.role) {
      const r = (user.role || '').toLowerCase();
      setUserRole(r);

      if (r === 'trustee') {
        setSelectedCampusId('all');
        setCurrentView('overview');
        setDrilldownCampusId(null);
        try {
          localStorage.setItem('trustview_selected_campus', 'all');
        } catch {}
      } else if (r === 'finance_manager') {
        const finCampus = user.assignedCampusId || 'campus-1';
        setSelectedCampusId(finCampus);
        setCurrentView('finance_management');
        setDrilldownCampusId(null);
        try {
          localStorage.setItem('trustview_selected_campus', finCampus);
        } catch {}
      } else if (user.assignedCampusId) {
        setSelectedCampusId(user.assignedCampusId);
        setDeanAssignedCampus(user.assignedCampusId);
        setPrincipalAssignedCampus(user.assignedCampusId);
        setCurrentView('overview');
        try {
          localStorage.setItem('trustview_selected_campus', user.assignedCampusId);
        } catch {}
        setDrilldownCampusId(null);
      }
    }
  }, [user]);

  // Initial fetch from live MongoDB Atlas backend
  const fetchLiveData = useCallback(async () => {
    try {
      const [campusRes, excRes] = await Promise.all([
        apiService.getCampuses(),
        apiService.getExceptions()
      ]);

      if (campusRes && campusRes.success && campusRes.data && campusRes.data.length > 0) {
        setRawCampuses(campusRes.data);
        setIsLiveFromDb(campusRes.source === 'mongodb');
      } else {
        setIsLiveFromDb(false);
      }

      if (excRes && excRes.success && excRes.data && excRes.data.length > 0) {
        setExceptionsList(excRes.data);
      }
    } catch {
      // Gracefully retained local cache
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Role switching enforcing strict campus boundaries
  const handleRoleChange = (role) => {
    const r = (role || '').toLowerCase();
    setUserRole(r);
    if (r === 'trustee') {
      setSelectedCampusId('all');
      try {
        localStorage.setItem('trustview_selected_campus', 'all');
      } catch {}
    } else if (r === 'dean') {
      setSelectedCampusId(deanAssignedCampus);
      try {
        localStorage.setItem('trustview_selected_campus', deanAssignedCampus);
      } catch {}
    } else if (r === 'principal') {
      setSelectedCampusId(principalAssignedCampus);
      try {
        localStorage.setItem('trustview_selected_campus', principalAssignedCampus);
      } catch {}
    }
    setDrilldownCampusId(null);
  };

  const handleCampusChange = useCallback((campusId) => {
    setSelectedCampusId(campusId);
    setDrilldownCampusId(null);
    if (campusId === 'all') {
      setCurrentView('overview');
    }
    try {
      if ((userRole || user?.role || '').toLowerCase() === 'trustee') {
        localStorage.setItem('trustview_selected_campus', campusId);
      }
    } catch {}
  }, [userRole, user]);

  const handleBackToAllCampuses = useCallback(() => {
    setSelectedCampusId('all');
    setDrilldownCampusId(null);
    setCurrentView('overview');
    try {
      localStorage.setItem('trustview_selected_campus', 'all');
    } catch {}
  }, []);

  // Sync campus list with live open exception counts
  const liveCampuses = useMemo(() => {
    return rawCampuses.map((c) => {
      const openCount = exceptionsList.filter(
        (e) => (e.campusId === c.id || e.campusId === c.campusId) && e.status !== 'Resolved' && e.status !== 'Dismissed'
      ).length;
      return {
        ...c,
        openExceptionCount: openCount
      };
    });
  }, [rawCampuses, exceptionsList]);

  // Active campuses based on selectedCampusId
  const scopedCampuses = useMemo(() => {
    if (selectedCampusId && selectedCampusId !== 'all') {
      return liveCampuses.filter((c) => (c.id === selectedCampusId || c.campusId === selectedCampusId));
    }
    return liveCampuses;
  }, [liveCampuses, selectedCampusId]);

  // Aggregate summary metrics calculated live from scoped campuses
  const summaryMetrics = useMemo(() => {
    const agg = aggregateCampusMetrics(scopedCampuses);
    const occRate = calculateOccupancyPercentage(agg.totalHostelOccupied, agg.totalHostelCapacity);
    const collRate = calculateCollectionRate(
      agg.totalVerifiedPayments,
      agg.totalAssessedFees,
      agg.totalConcessions
    );

    return {
      totalStudents: agg.totalStudents,
      assessedFees: agg.totalAssessedFees,
      concessions: agg.totalConcessions,
      verifiedPayments: agg.totalVerifiedPayments,
      outstandingFees: agg.totalOutstandingFees,
      collectionRate: collRate,
      hostelCapacity: agg.totalHostelCapacity,
      hostelOccupied: agg.totalHostelOccupied,
      hostelAvailable: Math.max(0, agg.totalHostelCapacity - agg.totalHostelOccupied),
      occupancyRate: occRate,
      attendanceRiskCount: agg.totalAttendanceRisks,
      openExceptionsCount: agg.totalOpenExceptions,
      spreadsheetsActive: agg.totalSpreadsheetsActive,
      spreadsheetsVerified: agg.totalSpreadsheetsVerified,
      dataFreshnessWarning: scopedCampuses.some((c) => c.importHealth === 'warning')
    };
  }, [scopedCampuses]);

  // Campus comparison chart data formatted for Recharts
  const comparisonChartData = useMemo(() => {
    return liveCampuses.map((c) => ({
      id: c.id || c.campusId,
      name: c.shortName,
      fullName: c.name,
      students: c.studentCount,
      outstandingLakhs: Number((c.outstandingFees / 100000).toFixed(1)),
      occupiedBeds: c.hostelOccupied,
      hostelCapacity: c.hostelCapacity,
      occupancyRate: Number(((c.hostelOccupied / c.hostelCapacity) * 100).toFixed(1)),
      attendanceRisk: c.attendanceRiskCount,
      openExceptions: c.openExceptionCount
    }));
  }, [liveCampuses]);

  // Collection trends (adjusted proportionally when a single campus is selected)
  const collectionTrendsData = useMemo(() => {
    if (!selectedCampusId || selectedCampusId === 'all') {
      return MOCK_COLLECTION_TRENDS;
    }
    const currentCampus = liveCampuses.find((c) => c.id === selectedCampusId || c.campusId === selectedCampusId) || liveCampuses[0];
    const ratio = (currentCampus?.assessedFees || 974600000) / 974600000;

    return MOCK_COLLECTION_TRENDS.map((item) => ({
      month: item.month,
      collections: Math.round(item.collections * ratio),
      outstanding: Math.round(item.outstanding * ratio),
      collectionsLakhs: Number((item.collectionsLakhs * ratio).toFixed(1)),
      outstandingLakhs: Number((item.outstandingLakhs * ratio).toFixed(1))
    }));
  }, [selectedCampusId, liveCampuses]);

  // Global counts for sidebar badges
  const totalOpenExceptions = useMemo(() => {
    return exceptionsList.filter(
      (e) => e.status !== 'Resolved' && e.status !== 'Dismissed'
    ).length;
  }, [exceptionsList]);

  const totalAttendanceRisks = useMemo(() => {
    return liveCampuses.reduce((sum, c) => sum + (c.attendanceRiskCount || 0), 0);
  }, [liveCampuses]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Inspect Exception Modal handler
  const handleInspectException = (exception) => {
    setSelectedException(exception);
    setIsInspectorOpen(true);
  };

  // Live status update for exceptions (propagates to backend API and local state)
  const handleUpdateExceptionStatus = async (exceptionId, newStatus, note = '') => {
    await apiService.updateExceptionStatus(exceptionId, { status: newStatus, note });
    setExceptionsList((prev) =>
      prev.map((e) =>
        (e.id === exceptionId || e.exceptionId === exceptionId)
          ? { ...e, status: newStatus, lastUpdated: 'Just now' }
          : e
      )
    );
    if (selectedException && (selectedException.id === exceptionId || selectedException.exceptionId === exceptionId)) {
      setSelectedException((prev) => ({ ...prev, status: newStatus }));
    }
  };

  // Select Campus / Drilldown
  const handleSelectCampus = (campusId) => {
    setSelectedCampusId(campusId);
    setDrilldownCampusId(null);
    try {
      if ((userRole || user?.role || '').toLowerCase() === 'trustee') {
        localStorage.setItem('trustview_selected_campus', campusId);
      }
    } catch {}
  };

  const activeDrilldownCampus = useMemo(() => {
    if (!drilldownCampusId) return null;
    return liveCampuses.find((c) => c.id === drilldownCampusId || c.campusId === drilldownCampusId);
  }, [drilldownCampusId, liveCampuses]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30 animate-pulse mb-4">
          TV
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
          Verifying TrustView ERP Session...
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Screen 1 (Home) or Screen 2 (Campus Login)
  if (!isAuthenticated) {
    if (!loginCampus) {
      return (
        <PublicCampusSelectionHome
          onSelectCampus={(campus) => setLoginCampus(campus)}
          onSelectTrusteeLogin={() => setLoginCampus({ isTrustee: true, id: 'all', name: 'Board of Trustees' })}
        />
      );
    }

    return (
      <LoginPage
        selectedCampus={loginCampus.isTrustee ? null : loginCampus}
        isTrusteeMode={Boolean(loginCampus.isTrustee)}
        onBackToAllCampuses={() => setLoginCampus(null)}
      />
    );
  }

  // 3. Authenticated Role Specific Portals (Finance Manager, HOD, Faculty, Student, Parent, Warden)
  const normalizedRole = (user?.role || '').toUpperCase();
  const userCampus = liveCampuses.find((c) => c.id === user?.assignedCampusId || c.campusId === user?.assignedCampusId);
  const userCampusName = userCampus ? (userCampus.shortName || userCampus.name) : (user?.assignedCampusId ? `Campus ${user.assignedCampusId.replace('campus-', '')}` : 'Assigned Campus');
  const userCampusFullName = userCampus ? userCampus.name : userCampusName;

  if (normalizedRole === 'FINANCE_MANAGER') {
    const finCampusId = user?.assignedCampusId || selectedCampusId || 'campus-1';
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="finance_management"
          selectedCampusId={finCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="finance_manager"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                <ShieldCheck size={13} />
                Finance Controller Portal ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Finance Management Suite — {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                Authorized Financial Controller • Scoped strictly to {userCampusFullName} Financial Operations &amp; Ledgers
              </p>
            </div>
          </div>
          <FinanceManagementView
            user={user}
            selectedCampusId={finCampusId}
            isLiveFromDb={isLiveFromDb}
          />
        </main>
      </div>
    );
  }

  if (normalizedRole === 'HOD') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="hod"
          selectedCampusId={user?.assignedCampusId || selectedCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="hod"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 mb-1">
                <ShieldCheck size={13} />
                Department Head Portal ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Department Management — {user?.department || 'Computer Science & Engineering'}
              </h1>
              <p className="text-xs text-slate-500">
                Authorized for {user?.name} • Scoped strictly to {userCampusFullName} Department Operations
              </p>
            </div>
          </div>
          <HodPortalView user={user} />
        </main>
      </div>
    );
  }

  if (normalizedRole === 'FACULTY') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="faculty"
          selectedCampusId={user?.assignedCampusId || selectedCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="faculty"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 mb-1">
                <ShieldCheck size={13} />
                Faculty Academic Portal ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Faculty Dashboard — {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                {user?.department || 'Academic Department'} • {userCampusFullName} • Authorized Course Sessions & Student Evaluations
              </p>
            </div>
          </div>
          <FacultyPortalView user={user} />
        </main>
      </div>
    );
  }

  if (normalizedRole === 'STUDENT') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="student"
          selectedCampusId={user?.assignedCampusId || selectedCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="student"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-1">
                <ShieldCheck size={13} />
                Student ERP Services ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Student Portal — {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                Enrollment ID: {user?.studentId || 'AIT2023-CS-042'} • {userCampusFullName} Resident Student
              </p>
            </div>
          </div>
          <StudentPortalView user={user} />
        </main>
      </div>
    );
  }

  if (normalizedRole === 'PARENT') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="parent"
          selectedCampusId={user?.assignedCampusId || selectedCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="parent"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-100 text-pink-800 border border-pink-200 mb-1">
                <ShieldCheck size={13} />
                Parent & Guardian Portal ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Parent Overview — {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                Linked Ward: {user?.wardStudentId || user?.studentId || 'Rahul Sharma (AIT2023-CS-042)'} • {userCampusFullName} • Live Academic & Fee Progress
              </p>
            </div>
          </div>
          <ParentPortalView user={user} />
        </main>
      </div>
    );
  }

  if (normalizedRole === 'WARDEN') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <TopNav
          isCollapsed={false}
          setIsMobileOpen={setIsMobileOpen}
          currentView="warden"
          selectedCampusId={user?.assignedCampusId || selectedCampusId}
          setSelectedCampusId={setSelectedCampusId}
          userRole="warden"
        />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                <ShieldCheck size={13} />
                CampusStay Hostel Administration ({userCampusName})
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Hostel Warden Portal — {user?.name}
              </h1>
              <p className="text-xs text-slate-500">
                Assigned Facility: {user?.hostelId || 'Block A (Boys)'} • {userCampusFullName}
              </p>
            </div>
          </div>
          <WardenPortalView user={user} />
        </main>
      </div>
    );
  }

  // 4. Main Management Dashboard (TRUSTEE, DEAN, PRINCIPAL)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        openExceptionsCount={totalOpenExceptions}
        attendanceRiskCount={totalAttendanceRisks}
        userRole={userRole}
        setUserRole={handleRoleChange}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header / Navigation Bar */}
        <TopNav
          isCollapsed={isCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          currentView={currentView}
          onNavigateView={setCurrentView}
          selectedCampusId={selectedCampusId}
          setSelectedCampusId={handleCampusChange}
          userRole={userRole}
          setUserRole={handleRoleChange}
          deanAssignedCampus={deanAssignedCampus}
          setDeanAssignedCampus={setDeanAssignedCampus}
          principalAssignedCampus={principalAssignedCampus}
          setPrincipalAssignedCampus={setPrincipalAssignedCampus}
          onBackToAllCampuses={handleBackToAllCampuses}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Module Views for Leadership Inspection */}
          {currentView === 'department' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Department Management Inspection</h2>
                  <p className="text-xs text-slate-500">Live integration with Department HOD & Faculty Module</p>
                </div>
              </div>
              <HodPortalView user={user} />
            </div>
          )}

          {currentView === 'hostel_module' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">CampusStay Hostel Operations</h2>
                  <p className="text-xs text-slate-500">Live integration with Hostel Management Module</p>
                </div>
              </div>
              <WardenPortalView user={user} />
            </div>
          )}

          {currentView === 'student_portal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Student & Parent Services Desk</h2>
                  <p className="text-xs text-slate-500">Live integration with Student/Parent Portal Module</p>
                </div>
              </div>
              <StudentPortalView user={user} />
            </div>
          )}

          {/* Standard Management Dashboard Views */}
          {currentView !== 'department' && currentView !== 'hostel_module' && currentView !== 'student_portal' && (
            drilldownCampusId ? (
              <CampusDetailView
                campus={activeDrilldownCampus}
                onBackToTrust={handleBackToAllCampuses}
                collectionTrends={collectionTrendsData}
                exceptions={exceptionsList}
                onInspectException={handleInspectException}
                isLiveFromDb={isLiveFromDb}
              />
            ) : (
              <>
                {/* 2. OVERVIEW VIEW */}
                {currentView === 'overview' && (
                  ((user?.role || userRole || '').toLowerCase() === 'trustee' && selectedCampusId === 'all') ? (
                    <TrusteeCampusSelectionView
                      campuses={liveCampuses}
                      onSelectCampus={handleSelectCampus}
                      trustName={MOCK_INSTITUTION_INFO.trustName}
                    />
                  ) : (
                    <div className="space-y-6">
                      <Header
                        userRole={userRole}
                        selectedCampusId={selectedCampusId}
                        reportingPeriod={reportingPeriod}
                        setReportingPeriod={setReportingPeriod}
                        onRefresh={handleRefresh}
                        isRefreshing={isRefreshing}
                        campusesData={scopedCampuses}
                        isLiveFromDb={isLiveFromDb}
                        onBackToAllCampuses={handleBackToAllCampuses}
                      />

                      {/* Trust-wide KPI Cards */}
                      <KpiCard
                        summary={summaryMetrics}
                        isSingleCampus={selectedCampusId !== 'all'}
                        campusName={scopedCampuses[0]?.shortName}
                      />

                      {/* Analytics & Visualization Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CollectionChart
                          data={collectionTrendsData}
                          reportingPeriod={reportingPeriod}
                          isLiveFromDb={isLiveFromDb}
                        />
                        <CampusComparisonChart
                          comparisonData={comparisonChartData}
                          isSingleCampus={selectedCampusId !== 'all'}
                          singleCampusData={scopedCampuses[0]}
                          onSelectCampus={handleSelectCampus}
                        />
                      </div>

                      {/* Campus Performance Table */}
                      <CampusPerformanceTable
                        campuses={liveCampuses}
                        onSelectCampus={handleSelectCampus}
                        selectedCampusId={selectedCampusId}
                      />

                      {/* Operational Health & Audit Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DataFreshnessCard
                          onRefresh={handleRefresh}
                          isRefreshing={isRefreshing}
                          campuses={liveCampuses}
                          selectedCampusId={selectedCampusId}
                        />
                        <RecentActivityCard
                          onOpenExceptions={() => setCurrentView('exceptions')}
                          selectedCampusId={selectedCampusId}
                        />
                      </div>
                    </div>
                  )
                )}

                {/* 3. CAMPUS PERFORMANCE VIEW */}
                {currentView === 'performance' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                          <Building2 size={13} />
                          Campus Analytics & Ledger Audit
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          Institutional Performance Comparisons
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          In-depth comparative analysis across enrollment sizes, outstanding fees, hostel bed occupancy, and exception statuses
                        </p>
                      </div>
                    </div>

                    <CampusComparisonChart
                      comparisonData={comparisonChartData}
                      onSelectCampus={handleSelectCampus}
                    />

                    <CampusPerformanceTable
                      campuses={liveCampuses}
                      onSelectCampus={handleSelectCampus}
                      selectedCampusId={selectedCampusId}
                    />
                  </div>
                )}

                {/* 4. FINANCIAL VIEW */}
                {currentView === 'financial' && (
                  <FinancialView
                    collectionTrends={collectionTrendsData}
                    selectedCampusId={selectedCampusId}
                    onSelectCampus={setSelectedCampusId}
                    onNavigateView={setCurrentView}
                  />
                )}

                {/* 4b. 16-PAGE INTEGRATED FINANCE MANAGEMENT SYSTEM */}
                {currentView === 'finance_management' && (
                  <FinanceManagementView
                    user={user}
                    selectedCampusId={selectedCampusId}
                    onBackToAllCampuses={handleBackToAllCampuses}
                    onSelectCampus={handleSelectCampus}
                    isLiveFromDb={isLiveFromDb}
                  />
                )}

                {/* 5. HOSTEL VIEW */}
                {currentView === 'hostel' && (
                  <HostelView
                    selectedCampusId={selectedCampusId}
                    onSelectCampus={setSelectedCampusId}
                  />
                )}

                {/* 6. ATTENDANCE VIEW */}
                {currentView === 'attendance' && (
                  <AttendanceView
                    selectedCampusId={selectedCampusId}
                    onSelectCampus={setSelectedCampusId}
                  />
                )}

                {/* 7. EXCEPTIONS VIEW */}
                {currentView === 'exceptions' && (
                  <ExceptionCenter
                    exceptions={exceptionsList}
                    onInspectException={handleInspectException}
                    onUpdateStatus={handleUpdateExceptionStatus}
                    selectedCampusId={selectedCampusId}
                    onSelectCampus={setSelectedCampusId}
                  />
                )}

                {/* 8. REPORTS & EXPORTS VIEW */}
                {currentView === 'reports' && (
                  <ReportsView
                    initialCampus={selectedCampusId}
                    onSelectCampus={setSelectedCampusId}
                  />
                )}

                {/* 9. SETTINGS & POLICIES VIEW */}
                {currentView === 'settings' && <SettingsView />}

                {/* 10. UNIFIED STUDENT MASTER REGISTRY (PART 1) */}
                {currentView === 'student_registry' && (
                  <StudentRegistryView selectedCampusId={selectedCampusId} />
                )}

                {/* 11. CAMPUS-SPECIFIC RULES ENGINE (PART 2) */}
                {currentView === 'campus_rules' && (
                  <CampusRulesView selectedCampusId={selectedCampusId} />
                )}

                {/* 12. FEE LEDGER & RECONCILIATION (PART 3) */}
                {currentView === 'fee_ledger' && (
                  <FeeLedgerView selectedCampusId={selectedCampusId} />
                )}

                {/* 13. GUIDED SPREADSHEET IMPORT (PART 4) */}
                {currentView === 'guided_import' && (
                  <SpreadsheetImportView selectedCampusId={selectedCampusId} />
                )}

                {/* 14. REAL HOSTEL BED INVENTORY (PART 5) */}
                {currentView === 'hostel_inventory' && (
                  <HostelInventoryView selectedCampusId={selectedCampusId} />
                )}

                {/* 15. APPEND-ONLY AUDIT TRAIL (PART 6) */}
                {currentView === 'audit_trail' && (
                  <AuditTrailView selectedCampusId={selectedCampusId} />
                )}
              </>
            )
          )}
        </main>

        {/* Global Institutional Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white/70 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{MOCK_INSTITUTION_INFO.systemName}</span>
            <span>•</span>
            <span>{MOCK_INSTITUTION_INFO.trustName}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">AY {MOCK_INSTITUTION_INFO.academicYear}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 size={12} />
              {isLiveFromDb ? 'MongoDB Atlas Live Synced' : '40 Spreadsheets Linked (Demo Cache)'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">
              Active Session: <strong>
                {user?.name ? `${user.name} (${user.role})` : userRole}
              </strong>
            </span>
          </div>
        </footer>
      </div>

      {/* Exception Inspector & AI Copilot Modal */}
      <ExceptionInspectorModal
        exception={selectedException}
        isOpen={isInspectorOpen}
        onClose={() => {
          setIsInspectorOpen(false);
          setSelectedException(null);
        }}
        onUpdateStatus={handleUpdateExceptionStatus}
      />
    </div>
  );
}
