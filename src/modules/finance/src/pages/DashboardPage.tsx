import React from 'react';
import { KPICards } from '../components/dashboard/KPICards';
import { CampusComparisonChart } from '../components/dashboard/CampusComparisonChart';
import { FeeDemandCollectionsChart } from '../components/dashboard/FeeDemandCollectionsChart';
import { FeeCategoryBreakdownChart } from '../components/dashboard/FeeCategoryBreakdownChart';
import { QuickAlerts } from '../components/dashboard/QuickAlerts';
import { RecentCollectionsTable } from '../components/dashboard/RecentCollectionsTable';
import { useFinance } from '../context/FinanceContext';
import { calculateCampusComparison } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { Badge } from '../components/common/Badge';
import { Building2, Users } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    campuses, 
    studentAssessments, 
    payments, 
    expenses, 
    budgets, 
    currentUser, 
    activeCampusId,
    setActiveCampusId 
  } = useFinance();

  const isTrustee = currentUser.role === 'trustee' || currentUser.role === 'auditor';

  const campusPerformanceData = calculateCampusComparison(
    campuses,
    studentAssessments,
    payments,
    expenses,
    budgets
  );

  return (
    <div className="space-y-6">
      {/* Scope banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Educational Trust Institutional Board</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Six-Campus Integrated Financial Control System
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Consolidated receivables management, hostel operations accounting, multi-campus budgets, and cross-campus auditing.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[100px]">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold block">Campuses</span>
            <span className="text-xl font-bold text-white">6</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center min-w-[100px]">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold block">Students</span>
            <span className="text-xl font-bold text-white">14,470</span>
          </div>
        </div>
      </div>

      {/* 6 Key Financial Metrics KPI Row */}
      <KPICards />

      {/* Primary Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeDemandCollectionsChart />
        <CampusComparisonChart />
      </div>

      {/* Secondary Chart & Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeeCategoryBreakdownChart />
        <QuickAlerts />
      </div>

      {/* Recent Collections Table */}
      <RecentCollectionsTable />

      {/* Trustee Consolidated Campus Matrix */}
      {isTrustee && activeCampusId === 'all' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Consolidated Campus Financial Performance Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparative financial health, realization rate and budget discipline across all six trust centers
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Click any campus to filter dashboard</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Campus</th>
                  <th className="py-3 px-3">City</th>
                  <th className="py-3 px-3 text-center">Students</th>
                  <th className="py-3 px-3 text-right">Fee Demand</th>
                  <th className="py-3 px-3 text-right">Collections</th>
                  <th className="py-3 px-3 text-right">Outstanding</th>
                  <th className="py-3 px-3 text-center">Collection Rate</th>
                  <th className="py-3 px-3 text-right">Expenses</th>
                  <th className="py-3 px-3 text-center">Budget Used</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campusPerformanceData.map(c => (
                  <tr key={c.campusId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{c.campusName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.campusCode}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">{c.city}</td>
                    <td className="py-3.5 px-3 text-center text-slate-700 font-semibold">
                      <div className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.totalStudents.toLocaleString('en-IN')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-medium text-slate-800">{formatINR(c.demand)}</td>
                    <td className="py-3.5 px-3 text-right font-semibold text-emerald-700">{formatINR(c.collections)}</td>
                    <td className="py-3.5 px-3 text-right font-semibold text-rose-600">{formatINR(c.outstanding)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={c.collectionRate >= 70 ? 'success' : 'warning'} size="sm">
                        {c.collectionRate}%
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-700">{formatINR(c.expenses)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-medium text-slate-700">{c.budgetUtilization}%</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setActiveCampusId(c.campusId)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Select Scope
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
