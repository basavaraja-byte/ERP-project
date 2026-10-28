import React, { useState } from 'react';
import { 
  CalendarClock, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download, 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';

export const InstallmentsPage: React.FC = () => {
  const { installments, campuses, activeCampusId } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const scopedInstallments = activeCampusId === 'all'
    ? installments
    : installments.filter(i => i.campus_id === activeCampusId);

  const filteredInstallments = scopedInstallments.filter(inst => {
    const matchesSearch = 
      inst.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.student_code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || inst.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const handleExportCSV = () => {
    const rows = filteredInstallments.map(i => ({
      ID: i.id,
      StudentName: i.student_name,
      StudentCode: i.student_code,
      Campus: getCampusCity(i.campus_id),
      InstallmentNumber: `${i.installment_number} of ${i.total_installments}`,
      DueDate: i.due_date,
      AmountDue: i.amount_due,
      AmountPaid: i.amount_paid,
      Outstanding: i.outstanding_amount,
      Status: i.status,
    }));
    exportToCSV('Student_Installment_Schedules', rows);
  };

  const totalOutstandingInstallments = scopedInstallments.reduce((s, i) => s + i.outstanding_amount, 0);
  const overdueCount = scopedInstallments.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Installment Schedules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage scheduled fee tranches, partial settlement milestones and overdue obligations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors self-start"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Active Installments</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{scopedInstallments.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scheduled Outstandings</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{formatINR(totalOutstandingInstallments)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Overdue Tranches</span>
            <div className="text-xl font-bold text-rose-600 mt-0.5">{overdueCount} Alerts</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="upcoming">Upcoming</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredInstallments.length} installment schedules shown
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Student Name & Roll</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3 text-center">Tranche</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Tranche Amount</th>
                <th className="py-3 px-3 text-right">Settled Amount</th>
                <th className="py-3 px-3 text-right">Remaining Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstallments.map(inst => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{inst.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{inst.student_code}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusCity(inst.campus_id)}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      Installment {inst.installment_number} of {inst.total_installments}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-mono">
                    {inst.due_date}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-slate-900">
                    {formatINR(inst.amount_due)}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-semibold text-emerald-700">
                    {formatINR(inst.amount_paid)}
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatINR(inst.outstanding_amount)}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        inst.status === 'paid' ? 'success' :
                        inst.status === 'overdue' ? 'danger' :
                        inst.status === 'partially_paid' ? 'warning' : 'neutral'
                      }
                      size="sm"
                      icon={
                        inst.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> :
                        inst.status === 'overdue' ? <AlertCircle className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      }
                    >
                      {inst.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
