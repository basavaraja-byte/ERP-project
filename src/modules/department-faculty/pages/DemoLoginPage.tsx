import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldAlert,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { useDemoAuth } from '../context/DemoAuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/ui/Badge';

export const DemoLoginPage: React.FC = () => {
  const { currentUser, availableAccounts, loginAs } = useDemoAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const hodAccounts = availableAccounts.filter((a) => a.user.role === 'HOD');
  const facultyAccounts = availableAccounts.filter((a) => a.user.role === 'FACULTY');

  const handleSelectAccount = (userId: string) => {
    const found = availableAccounts.find((a) => a.user.id === userId);
    if (!found) return;
    loginAs(userId);
    showToast(
      `Signed in as ${found.user.name} (${found.user.role} Portal).`,
      'success',
      'Demo Session Active'
    );
    navigate(found.user.role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Institutional Banner */}
      <div className="bg-navy-950 text-white border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow">
              AE
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Aarohan Education Trust — Institutional ERP
              </h1>
              <p className="text-xs text-navy-300">
                Department Management Module • Academic Year 2026-27
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Demo Mode — Frontend Role Selector (Not Production Auth)</span>
          </div>
        </div>
      </div>

      {/* Main Selector Content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-base font-semibold text-navy-900">
              Select a Fictional Demo Role to Explore Department Management
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both portals operate against a unified in-memory TypeScript service layer. Any
              subject assignment, complaint update, or attendance submission performed in one
              portal is immediately reflected across the corresponding HOD and Faculty views.
            </p>
          </div>
          {currentUser && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  currentUser.role === 'HOD' ? '/hod/dashboard' : '/faculty/dashboard'
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Continue as {currentUser.name}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Two Portal Role Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HOD Portal Accounts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCog className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-sm font-bold">1. HOD Portal Accounts</h3>
                  <p className="text-[11px] text-navy-200">
                    Department oversight, faculty workload, subject allocation & reports
                  </p>
                </div>
              </div>
              <Badge variant="blue">HOD Role</Badge>
            </div>

            <div className="p-5 space-y-3 flex-1">
              {hodAccounts.map(({ user, department, campus }) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/40'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-900">{user.name}</h4>
                          {isCurrent && <Badge variant="blue">Active</Badge>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{user.designation}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {department.name} ({department.code})
                          </span>
                          <span>•</span>
                          <span>{campus.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAccount(user.id)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Enter HOD Portal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Faculty Portal Accounts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-bold">2. Faculty Portal Accounts</h3>
                  <p className="text-[11px] text-navy-200">
                    Student Details, Courses, Complaints & Class Attendance
                  </p>
                </div>
              </div>
              <Badge variant="green">Faculty Role</Badge>
            </div>

            <div className="p-5 space-y-3 flex-1">
              {facultyAccounts.map(({ user, department, campus }) => {
                const isCurrent = currentUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    className={`rounded-xl border p-4 transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/40'
                        : 'border-slate-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-navy-900">{user.name}</h4>
                          {isCurrent && <Badge variant="blue">Active</Badge>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{user.designation}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {department.name} ({department.code})
                          </span>
                          <span>•</span>
                          <span>{campus.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAccount(user.id)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-colors"
                      >
                        Enter Faculty Portal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ERP Ecosystem Reference Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-navy-800" />
            <span className="font-semibold text-navy-900">
              Aarohan ERP Suite Modules:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" dot>
              Department Management (HOD & Faculty — Active)
            </Badge>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
              <Users className="w-3 h-3" />
              Student Portal (External Module)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
              <Users className="w-3 h-3" />
              Parent Portal (External Module)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

