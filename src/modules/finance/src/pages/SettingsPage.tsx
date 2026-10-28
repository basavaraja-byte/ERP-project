import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  ShieldCheck, 
  Calendar, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Users
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { 
    currentUser, 
    academicYear, 
    setAcademicYear, 
    campuses, 
    users, 
    resetDemoData 
  } = useFinance();

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600" />
          System Settings & Governance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure financial academic cycles, audit rules, trust currency formatting, and demo state.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Demo financial database was successfully restored to initial seed state.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Fiscal Year Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Fiscal Year</h2>
              <p className="text-xs text-slate-500">Active fee schedules and assessment period</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Financial Assessment Cycle
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2026-27">Academic Year 2026-27 (Current Active Cycle)</option>
                <option value="2025-26">Academic Year 2025-26 (Audited / Closed)</option>
                <option value="2027-28">Academic Year 2027-28 (Future Planning)</option>
              </select>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between py-1">
                <span className="font-medium text-slate-500">Fiscal Cycle Code:</span>
                <span className="font-mono font-bold text-slate-800">AY-{academicYear}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-slate-500">Accounting Standard:</span>
                <span className="font-semibold text-slate-800">Accrual-Based Indian GAAP</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-slate-500">Base Currency:</span>
                <span className="font-semibold text-slate-800">INR (₹) Indian Rupee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Session & Role */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Role Profile</h2>
              <p className="text-xs text-slate-500">Role-based financial permission matrix</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
              </div>
              <Badge variant="purple">{currentUser.role.toUpperCase()}</Badge>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Assigned Campus Scope:</span>
              <p>
                {currentUser.role === 'dean'
                  ? `Strictly restricted to ${campuses.find(c => c.id === currentUser.assignedCampusId)?.name || 'Assigned Campus'} (Campus isolation enabled).`
                  : 'Multi-campus trust consolidated visibility (All 6 campuses access enabled).'}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Campus Federation Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configured Campuses</h2>
              <p className="text-xs text-slate-500">6 educational trust units connected</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {campuses.map(camp => (
              <div key={camp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{camp.name}</span>
                  <span className="text-slate-400 ml-2 font-mono">({camp.code})</span>
                </div>
                <span className="text-slate-500">{camp.city}, {camp.state}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Database Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Database & Demo Reset</h2>
              <p className="text-xs text-slate-500">Restore default transactions and assessments</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            Need to reset sample data or discard edits made during testing? You can restore the comprehensive mock dataset at any time.
          </p>

          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Financial State
            </button>
          ) : (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>Are you sure? All mock records will be restored to their original seed defaults.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {users.length} Pre-configured System Users
            </span>
            <span className="font-mono text-[11px]">Storage: Local Browser Memory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
