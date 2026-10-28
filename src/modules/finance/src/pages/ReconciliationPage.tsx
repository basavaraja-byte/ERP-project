import React, { useState } from 'react';
import { 
  Scale, 
  Search, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ReconciliationException } from '../types/finance';

export const ReconciliationPage: React.FC = () => {
  const { scopedExceptions, resolveException, campuses, currentUser } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [reviewingException, setReviewingException] = useState<ReconciliationException | null>(null);

  // Review modal state
  const [reviewOutcome, setReviewOutcome] = useState('');
  const [newStatus, setNewStatus] = useState<'resolved' | 'escalated'>('resolved');

  const isReadOnly = currentUser.role === 'auditor';

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const filteredExceptions = scopedExceptions.filter(exc => {
    const matchesSearch = 
      exc.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exc.exception_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exc.notes && exc.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exc.review_outcome && exc.review_outcome.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || exc.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (exc: ReconciliationException) => {
    setReviewingException(exc);
    setReviewOutcome(exc.review_outcome || 'Verified with bank narration statement and adjusted ledger appropriately.');
    setNewStatus('resolved');
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingException || !reviewOutcome.trim()) return;

    resolveException(reviewingException.id, reviewOutcome.trim(), newStatus);
    setReviewingException(null);
  };

  const handleExportCSV = () => {
    const rows = filteredExceptions.map(e => ({
      ID: e.id,
      Campus: getCampusCity(e.campus_id),
      Reference: e.reference,
      Type: e.exception_type,
      ExpectedAmount: e.expected_amount ?? 'N/A',
      RecordedAmount: e.recorded_amount ?? 'N/A',
      Status: e.status,
      Reviewer: e.assigned_reviewer || 'Unassigned',
      Outcome: e.review_outcome || 'Pending',
      CreatedAt: e.created_at,
    }));
    exportToCSV('Reconciliation_Exceptions_Report', rows);
  };

  const unresolvedCount = scopedExceptions.filter(e => e.status === 'unresolved' || e.status === 'under_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reconciliation Workbench</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit workbench for resolving bank statement discrepancies, duplicate references and unallocated payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Exceptions</span>
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Audit Exceptions</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{scopedExceptions.length} Entries</div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Under Active Review</span>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{unresolvedCount} Pending</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolved Anomaly Rate</span>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">
              {scopedExceptions.length > 0 
                ? `${Math.round(((scopedExceptions.length - unresolvedCount) / scopedExceptions.length) * 100)}%` 
                : '100%'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, exception type, notes..."
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
              <option value="unresolved">Unresolved</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated to Board</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredExceptions.length} anomalies logged
        </div>
      </div>

      {/* Exceptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Transaction Reference</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Exception Category</th>
                <th className="py-3 px-3 text-right">Expected Amount</th>
                <th className="py-3 px-3 text-right">Recorded Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Assigned Auditor / Reviewer</th>
                <th className="py-3 px-3">Resolution Findings</th>
                {!isReadOnly && <th className="py-3 px-3 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExceptions.map(exc => (
                <tr key={exc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {exc.reference}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusCity(exc.campus_id)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-rose-900">{exc.exception_type}</span>
                    {exc.notes && <div className="text-[11px] text-slate-400 max-w-xs truncate">{exc.notes}</div>}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600 font-medium">
                    {exc.expected_amount ? formatINR(exc.expected_amount) : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {exc.recorded_amount ? formatINR(exc.recorded_amount) : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        exc.status === 'resolved' ? 'success' :
                        exc.status === 'escalated' ? 'danger' :
                        exc.status === 'under_review' ? 'warning' : 'neutral'
                      }
                      size="sm"
                      icon={
                        exc.status === 'resolved' ? <CheckCircle2 className="w-3 h-3" /> :
                        exc.status === 'escalated' ? <AlertCircle className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      }
                    >
                      {exc.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {exc.assigned_reviewer || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={exc.review_outcome}>
                    {exc.review_outcome || <span className="text-slate-400 italic">Investigation in progress</span>}
                  </td>

                  {!isReadOnly && (
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReview(exc)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Review</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Review Modal */}
      {reviewingException && (
        <Modal
          isOpen={!!reviewingException}
          onClose={() => setReviewingException(null)}
          title="Review Reconciliation Audit Exception"
          subtitle={`Reference: ${reviewingException.reference} | Type: ${reviewingException.exception_type}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-slate-600">Exception Category: <strong className="text-slate-900">{reviewingException.exception_type}</strong></p>
              <p className="text-slate-600">Recorded Amount: <strong className="text-slate-900">{reviewingException.recorded_amount ? formatINR(reviewingException.recorded_amount) : 'N/A'}</strong></p>
              {reviewingException.notes && (
                <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                  Audit Flag: {reviewingException.notes}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Audit Resolution Status *</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as 'resolved' | 'escalated')}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-900"
              >
                <option value="resolved">Mark as Resolved (Discrepancy reconciled)</option>
                <option value="escalated">Escalate to Trust Audit Committee</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Investigation Findings & Reconciliation Outcome *</label>
              <textarea
                rows={3}
                placeholder="Detail resolution steps, verified bank narration slips, or offset journal voucher entries..."
                value={reviewOutcome}
                onChange={(e) => setReviewOutcome(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingException(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Save Resolution Findings</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
