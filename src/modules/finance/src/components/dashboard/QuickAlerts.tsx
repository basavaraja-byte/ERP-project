import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/currency';

export const QuickAlerts: React.FC = () => {
  const { 
    scopedAssessments, 
    scopedConcessions, 
    scopedExpenses, 
    scopedExceptions,
    scopedRefunds 
  } = useFinance();

  // 1. Overdue student assessments
  const overdueAssessments = scopedAssessments.filter(a => a.status === 'overdue' || (new Date(a.due_date) < new Date() && a.outstanding_balance > 0));

  // 2. Pending concession approvals
  const pendingConcessions = scopedConcessions.filter(c => c.approval_status === 'pending');

  // 3. Pending expense approvals
  const pendingExpenses = scopedExpenses.filter(e => e.approval_status === 'pending');

  // 4. Unresolved reconciliation exceptions
  const unresolvedExceptions = scopedExceptions.filter(e => e.status === 'unresolved' || e.status === 'under_review');

  // 5. Pending refunds
  const pendingRefunds = scopedRefunds.filter(r => r.approval_status === 'pending');

  const totalActionItems = overdueAssessments.length + pendingConcessions.length + pendingExpenses.length + unresolvedExceptions.length + pendingRefunds.length;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Critical Exceptions & Approval Alerts</span>
            {totalActionItems > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                {totalActionItems} Active
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Cleared
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time notifications for overdue balances, pending vouchers and reconciliation anomalies
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {/* Overdue Alert */}
        {overdueAssessments.length > 0 && (
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-950">
                  {overdueAssessments.length} Student Fee Assessment{overdueAssessments.length > 1 ? 's' : ''} Past Due Date
                </p>
                <p className="text-rose-700 text-[11px] mt-0.5">
                  Accumulated overdue balance: {formatINR(overdueAssessments.reduce((s, a) => s + a.outstanding_balance, 0))}
                </p>
              </div>
            </div>
            <Link
              to="/student-ledger"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 ml-2"
            >
              <span>View Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Pending Concessions */}
        {pendingConcessions.length > 0 && (
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">
                  {pendingConcessions.length} Scholarship & Concession Request{pendingConcessions.length > 1 ? 's' : ''} Awaiting Approval
                </p>
                <p className="text-amber-700 text-[11px] mt-0.5">
                  Requested concessions amount: {formatINR(pendingConcessions.reduce((s, c) => s + c.value, 0))}
                </p>
              </div>
            </div>
            <Link
              to="/concessions"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 ml-2"
            >
              <span>Review Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Pending Expenses */}
        {pendingExpenses.length > 0 && (
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs text-sky-900">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sky-950">
                  {pendingExpenses.length} Expense Entry{pendingExpenses.length > 1 ? 's' : ''} Pending Sanction
                </p>
                <p className="text-sky-700 text-[11px] mt-0.5">
                  Total pending expense sanction: {formatINR(pendingExpenses.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
            </div>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 ml-2"
            >
              <span>Sanction Outflows</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Reconciliation Exceptions */}
        {unresolvedExceptions.length > 0 && (
          <div className="flex items-start justify-between p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-950">
                  {unresolvedExceptions.length} Reconciliation Audit Exception{unresolvedExceptions.length > 1 ? 's' : ''}
                </p>
                <p className="text-purple-700 text-[11px] mt-0.5">
                  Includes unallocated deposits and payment reference discrepancies
                </p>
              </div>
            </div>
            <Link
              to="/reconciliation"
              className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 ml-2"
            >
              <span>Investigate</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
