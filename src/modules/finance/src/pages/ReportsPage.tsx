import React, { useState } from 'react';
import { 
  Download, 
  Building2, 
  PieChart, 
  Users, 
  Receipt, 
  Scale, 
  Award 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { calculateCampusComparison, calculateFeeGroupBreakdown, calculateHostelFeeBreakdown } from '../utils/calculations';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const { 
    scopedAssessments, 
    scopedPayments, 
    scopedExpenses, 
    scopedBudgets, 
    scopedConcessions, 
    campuses, 
    academicYear 
  } = useFinance();

  type ReportTab = 
    | 'campus_summary' 
    | 'fee_categories' 
    | 'hostel_deepdive' 
    | 'student_dues' 
    | 'expenses_outflow' 
    | 'budget_matrix' 
    | 'concessions_refunds';

  const [activeReport, setActiveReport] = useState<ReportTab>('campus_summary');

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  // 1. Campus Comparison Report Data
  const campusComparisonData = calculateCampusComparison(
    campuses,
    scopedAssessments,
    scopedPayments,
    scopedExpenses,
    scopedBudgets
  );

  // 2. Fee Categories Data
  const feeGroupData = calculateFeeGroupBreakdown(scopedAssessments);

  // 3. Hostel Deepdive Data
  const hostelBreakdownData = calculateHostelFeeBreakdown(scopedAssessments);

  // Export handlers
  const handleExportActiveReport = () => {
    switch (activeReport) {
      case 'campus_summary': {
        const rows = campusComparisonData.map(c => ({
          CampusName: c.campusName,
          City: c.city,
          Students: c.totalStudents,
          Demand: c.demand,
          Collections: c.collections,
          Outstanding: c.outstanding,
          RealizationRate: `${c.collectionRate}%`,
          Expenses: c.expenses,
          BudgetUtilization: `${c.budgetUtilization}%`,
        }));
        exportToCSV('Campus_Financial_Comparison_Report', rows);
        break;
      }
      case 'fee_categories': {
        const rows = feeGroupData.map(g => ({
          FeeGroup: g.name,
          Demand: g.demand,
          Collected: g.collected,
          Outstanding: g.outstanding,
          RealizationRate: `${g.rate}%`,
        }));
        exportToCSV('Fee_Portfolio_Category_Report', rows);
        break;
      }
      case 'hostel_deepdive': {
        const rows = hostelBreakdownData.map(h => ({
          HostelSubcategory: h.name,
          TotalBilledAmount: h.value,
        }));
        exportToCSV('Hostel_Detailed_Accounting_Report', rows);
        break;
      }
      case 'student_dues': {
        const rows = scopedAssessments.map(a => ({
          StudentCode: a.student_code,
          StudentName: a.student_name,
          Campus: getCampusCity(a.campus_id),
          Course: a.course_or_program,
          Category: a.fee_category,
          NetDue: a.net_amount_due,
          Paid: a.amount_paid,
          Outstanding: a.outstanding_balance,
          DueDate: a.due_date,
          Status: a.status,
        }));
        exportToCSV('Student_Receivables_Dues_Report', rows);
        break;
      }
      case 'expenses_outflow': {
        const rows = scopedExpenses.map(e => ({
          VoucherRef: e.reference_number,
          Date: e.expense_date,
          Campus: getCampusCity(e.campus_id),
          Category: e.expense_category,
          Vendor: e.vendor_name || 'N/A',
          Amount: e.amount,
          ApprovalStatus: e.approval_status,
          PaymentStatus: e.payment_status,
        }));
        exportToCSV('Institutional_Expenses_Outflow_Report', rows);
        break;
      }
      case 'budget_matrix': {
        const rows = scopedBudgets.map(b => {
          const util = b.allocated_amount > 0 ? Math.round(((b.actual_expense_amount + b.committed_amount) / b.allocated_amount) * 100) : 0;
          return {
            Campus: getCampusCity(b.campus_id),
            Period: b.budget_period,
            Category: b.expense_category,
            Allocated: b.allocated_amount,
            ActualDisbursed: b.actual_expense_amount,
            CommittedPO: b.committed_amount,
            Utilization: `${util}%`,
            Status: b.status,
          };
        });
        exportToCSV('Budgets_Utilization_Matrix_Report', rows);
        break;
      }
      case 'concessions_refunds': {
        const rows = scopedConcessions.map(c => ({
          Type: 'Concession / Scholarship',
          StudentName: c.student_name,
          Campus: getCampusCity(c.campus_id),
          Classification: c.concession_type,
          Amount: c.value,
          Status: c.approval_status,
        }));
        exportToCSV('Concessions_Scholarships_Report', rows);
        break;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Financial Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready financial statements, hostel operations schedules, aging dues and budget metrics
          </p>
        </div>

        <button
          onClick={handleExportActiveReport}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report to CSV</span>
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveReport('campus_summary')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'campus_summary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Campus Comparison</span>
        </button>

        <button
          onClick={() => setActiveReport('fee_categories')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'fee_categories'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Fee Categories</span>
        </button>

        <button
          onClick={() => setActiveReport('hostel_deepdive')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'hostel_deepdive'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hostel Deep-Dive</span>
        </button>

        <button
          onClick={() => setActiveReport('student_dues')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'student_dues'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Outstanding Dues</span>
        </button>

        <button
          onClick={() => setActiveReport('expenses_outflow')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'expenses_outflow'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Expenses & Outflows</span>
        </button>

        <button
          onClick={() => setActiveReport('budget_matrix')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'budget_matrix'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Budget Matrix</span>
        </button>

        <button
          onClick={() => setActiveReport('concessions_refunds')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeReport === 'concessions_refunds'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Waivers & Escrow</span>
        </button>
      </div>

      {/* Active Report Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Report 1: Campus Comparison */}
        {activeReport === 'campus_summary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Six-Campus Consolidated Performance Schedule</h3>
                <p className="text-xs text-slate-500">Consolidated receivables demand, collections, and budget discipline across all six campuses</p>
              </div>
              <Badge variant="purple" size="sm">Academic Year {academicYear}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Campus Name</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3 text-center">Enrolled</th>
                    <th className="py-2.5 px-3 text-right">Fee Demand</th>
                    <th className="py-2.5 px-3 text-right">Confirmed Collections</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-center">Collection Rate</th>
                    <th className="py-2.5 px-3 text-right">Approved Expenses</th>
                    <th className="py-2.5 px-3 text-center">Budget Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campusComparisonData.map(c => (
                    <tr key={c.campusId}>
                      <td className="py-3 px-3 font-bold text-slate-900">{c.campusName}</td>
                      <td className="py-3 px-3 text-slate-600">{c.city}</td>
                      <td className="py-3 px-3 text-center font-semibold">{c.totalStudents.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right text-slate-800 font-medium">{formatINR(c.demand)}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-bold">{formatINR(c.collections)}</td>
                      <td className="py-3 px-3 text-right text-rose-600 font-bold">{formatINR(c.outstanding)}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={c.collectionRate >= 70 ? 'success' : 'warning'} size="sm">
                          {c.collectionRate}%
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-800">{formatINR(c.expenses)}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">{c.budgetUtilization}%</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td colSpan={3} className="py-3 px-3 uppercase text-[11px] text-slate-700">Consolidated Trust Total</td>
                    <td className="py-3 px-3 text-right text-slate-900">{formatINR(campusComparisonData.reduce((s, c) => s + c.demand, 0))}</td>
                    <td className="py-3 px-3 text-right text-emerald-700">{formatINR(campusComparisonData.reduce((s, c) => s + c.collections, 0))}</td>
                    <td className="py-3 px-3 text-right text-rose-600">{formatINR(campusComparisonData.reduce((s, c) => s + c.outstanding, 0))}</td>
                    <td className="py-3 px-3 text-center">
                      {Math.round((campusComparisonData.reduce((s, c) => s + c.collections, 0) / Math.max(1, campusComparisonData.reduce((s, c) => s + c.demand, 0))) * 100)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900">{formatINR(campusComparisonData.reduce((s, c) => s + c.expenses, 0))}</td>
                    <td className="py-3 px-3 text-center">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 2: Fee Categories */}
        {activeReport === 'fee_categories' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Fee Category Realization Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Fee Classification Group</th>
                    <th className="py-2.5 px-3 text-right">Total Demand</th>
                    <th className="py-2.5 px-3 text-right">Realized Collections</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Balances</th>
                    <th className="py-2.5 px-3 text-center">Collection Efficiency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeGroupData.map((g, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-bold text-slate-900">{g.name}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">{formatINR(g.demand)}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatINR(g.collected)}</td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600">{formatINR(g.outstanding)}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={g.rate >= 70 ? 'success' : 'warning'} size="sm">
                          {g.rate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 3: Hostel Deep-Dive */}
        {activeReport === 'hostel_deepdive' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dedicated Hostel Fee Structure & Subcategory Accounting</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Itemized breakdown across room accommodation, food/mess, housekeeping sanitation, power, and laundry
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Hostel Subcategory</th>
                    <th className="py-2.5 px-3 text-right">Total Net Billed Demand</th>
                    <th className="py-2.5 px-3 text-right">Portfolio Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hostelBreakdownData.map((h, idx) => {
                    const totalHostel = hostelBreakdownData.reduce((s, item) => s + item.value, 0);
                    const pct = totalHostel > 0 ? Math.round((h.value / totalHostel) * 100) : 0;
                    return (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-semibold text-slate-900">{h.name}</td>
                        <td className="py-3 px-3 text-right font-bold text-indigo-900">{formatINR(h.value)}</td>
                        <td className="py-3 px-3 text-right text-slate-600 font-medium">{pct}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold border-t border-slate-300">
                    <td className="py-3 px-3 uppercase text-[11px]">Total Hostel Operations Fee Portfolio</td>
                    <td className="py-3 px-3 text-right text-indigo-950 font-bold">
                      {formatINR(hostelBreakdownData.reduce((s, h) => s + h.value, 0))}
                    </td>
                    <td className="py-3 px-3 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 4: Student Dues */}
        {activeReport === 'student_dues' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Student Receivables & Aging Dues Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Net Due</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedAssessments.filter(a => a.outstanding_balance > 0).map(a => (
                    <tr key={a.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{a.student_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{a.student_code}</td>
                      <td className="py-2.5 px-3 text-slate-700">{getCampusCity(a.campus_id)}</td>
                      <td className="py-2.5 px-3 text-slate-700">{a.fee_category}</td>
                      <td className="py-2.5 px-3 text-right">{formatINR(a.net_amount_due)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">{formatINR(a.amount_paid)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatINR(a.outstanding_balance)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{a.due_date}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={a.status === 'overdue' ? 'danger' : 'warning'} size="sm">
                          {a.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 5: Expenses Outflows */}
        {activeReport === 'expenses_outflow' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Institutional Expense Sanction Register</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Voucher Ref</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Vendor</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Sanction</th>
                    <th className="py-2.5 px-3 text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedExpenses.map(e => (
                    <tr key={e.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.reference_number}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{e.expense_date}</td>
                      <td className="py-2.5 px-3 text-slate-700">{getCampusCity(e.campus_id)}</td>
                      <td className="py-2.5 px-3 text-slate-800">{e.expense_category}</td>
                      <td className="py-2.5 px-3 text-slate-700">{e.vendor_name || 'Direct'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatINR(e.amount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={e.approval_status === 'approved' ? 'success' : 'warning'} size="sm">
                          {e.approval_status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={e.payment_status === 'paid' ? 'success' : 'neutral'} size="sm">
                          {e.payment_status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 6: Budget Matrix */}
        {activeReport === 'budget_matrix' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Fiscal Budget Allocation & Utilization Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Budget Category</th>
                    <th className="py-2.5 px-3 text-right">Allocated</th>
                    <th className="py-2.5 px-3 text-right">Actual Disbursed</th>
                    <th className="py-2.5 px-3 text-right">Committed PO</th>
                    <th className="py-2.5 px-3 text-center">Utilization</th>
                    <th className="py-2.5 px-3 text-center">Fiscal Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedBudgets.map(b => {
                    const util = b.allocated_amount > 0 ? Math.round(((b.actual_expense_amount + b.committed_amount) / b.allocated_amount) * 100) : 0;
                    return (
                      <tr key={b.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{getCampusCity(b.campus_id)}</td>
                        <td className="py-2.5 px-3 text-slate-800">{b.expense_category}</td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">{formatINR(b.allocated_amount)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">{formatINR(b.actual_expense_amount)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(b.committed_amount)}</td>
                        <td className="py-2.5 px-3 text-center font-bold">{util}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={b.status === 'healthy' ? 'success' : 'warning'} size="sm">
                            {b.status.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report 7: Concessions & Refunds */}
        {activeReport === 'concessions_refunds' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Scholarships, Fee Concessions & Refundable Deposits Escrow</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Student Name & Roll</th>
                    <th className="py-2.5 px-3">Campus</th>
                    <th className="py-2.5 px-3">Financial Assistance Type</th>
                    <th className="py-2.5 px-3 text-right">Value (₹)</th>
                    <th className="py-2.5 px-3 text-center">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedConcessions.map(c => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.student_name} ({c.student_code})</td>
                      <td className="py-2.5 px-3 text-slate-700">{getCampusCity(c.campus_id)}</td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-900">{c.concession_type}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700">{formatINR(c.value)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={c.approval_status === 'approved' ? 'success' : 'warning'} size="sm">
                          {c.approval_status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
