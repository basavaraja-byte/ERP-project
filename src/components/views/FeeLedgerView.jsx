import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  Search,
  BellOff,
  Bell,
  Building2,
  Calendar,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  Filter
} from 'lucide-react';
import { apiService } from '../../services/api';

export default function FeeLedgerView({ selectedCampusId = 'all' }) {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCampus, setFilterCampus] = useState(selectedCampusId);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchStudent, setSearchStudent] = useState('');

  // Payment import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('AIT-2024-001');
  const [paymentCampus, setPaymentCampus] = useState('campus-1');
  const [paymentAmount, setPaymentAmount] = useState('25000');
  const [paymentUtr, setPaymentUtr] = useState(`UTR${Date.now().toString().slice(-8)}`);
  const [paymentMethod, setPaymentMethod] = useState('NEFT');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Reversal state
  const [reversingId, setReversingId] = useState(null);
  const [reversalReason, setReversalReason] = useState('Bank clawback chargeback adjustment');

  // Reminder workbench state
  const [reminderStudentId, setReminderStudentId] = useState('AIT-2024-001');
  const [reminderResult, setReminderResult] = useState(null);
  const [isCheckingReminder, setIsCheckingReminder] = useState(false);

  // Feedback notifications
  const [statusAlert, setStatusAlert] = useState(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterCampus && filterCampus !== 'all') params.campusId = filterCampus;
      if (filterStatus && filterStatus !== 'ALL') params.reconciliationStatus = filterStatus;
      if (searchStudent) params.studentId = searchStudent;

      const res = await apiService.getLedgerEntries(params);
      if (res && res.data) {
        setEntries(res.data);
      }
    } catch {
      // Handled
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [filterCampus, filterStatus]);

  const handleImportPayment = async (e) => {
    e.preventDefault();
    setIsSubmittingPayment(true);
    setStatusAlert(null);

    const payload = {
      studentId: studentIdInput,
      campusId: paymentCampus,
      creditAmount: Number(paymentAmount),
      bankUtrReference: paymentUtr.trim(),
      paymentMethod,
      description: `Student tuition installment via ${paymentMethod}`
    };

    const res = await apiService.importPayment(payload);
    if (res && res.success) {
      setStatusAlert({
        type: 'success',
        text: `Payment of ₹${Number(paymentAmount).toLocaleString('en-IN')} recorded successfully with UTR ${paymentUtr}. Status: MATCHED.`
      });
      setIsImportModalOpen(false);
      setPaymentUtr(`UTR${Date.now().toString().slice(-8)}`);
      await fetchEntries();
    } else {
      setStatusAlert({
        type: 'error',
        text: res?.message || 'Payment recording failed. Ensure UTR is unique and student ID is valid.'
      });
    }
    setIsSubmittingPayment(false);
  };

  const handleReverseTransaction = async (entry) => {
    if (!window.confirm(`Are you sure you want to reverse transaction ${entry.transactionId || entry._id}? This will create an offsetting entry without deleting historical data.`)) {
      return;
    }

    setReversingId(entry._id);
    setStatusAlert(null);

    const res = await apiService.reverseTransaction({
      transactionId: entry.transactionId || entry._id,
      reversalReason: reversalReason || 'Administrative error correction'
    });

    if (res && res.success) {
      setStatusAlert({
        type: 'success',
        text: `Transaction reversed. Compensatory offset entry created. Original entry preserved in audit log.`
      });
      await fetchEntries();
    } else {
      setStatusAlert({
        type: 'error',
        text: res?.message || 'Failed to reverse transaction.'
      });
    }
    setReversingId(null);
  };

  const handleCheckReminder = async () => {
    if (!reminderStudentId.trim()) return;
    setIsCheckingReminder(true);
    setReminderResult(null);

    const res = await apiService.evaluatePaymentReminder(reminderStudentId.trim());
    if (res && res.success) {
      setReminderResult(res.data);
    } else {
      setStatusAlert({
        type: 'error',
        text: res?.message || 'Student fee evaluation failed.'
      });
    }
    setIsCheckingReminder(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <Receipt size={13} />
            Double-Entry Financial Ledger &amp; Bank Reconciliation
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Fee Ledger &amp; Reconciliation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable financial book of record enforcing UTR idempotency, audited non-destructive reversals, and zero-balance reminder suppression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <PlusCircle size={15} />
            <span>Record Bank Payment / UTR</span>
          </button>
        </div>
      </div>

      {statusAlert && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            statusAlert.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusAlert.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{statusAlert.text}</span>
          </div>
          <button
            onClick={() => setStatusAlert(null)}
            className="text-slate-500 hover:text-slate-700 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AUTOMATED PAYMENT REMINDER SUPPRESSION WORKBENCH */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <BellOff size={16} className="text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Automated Payment Reminder Suppression Check
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enforces the critical business rule: automated fee notices must be immediately suppressed whenever a student has zero balance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter Student ID (e.g. AIT-2024-001)"
              value={reminderStudentId}
              onChange={(e) => setReminderStudentId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 w-56"
            />
            <button
              onClick={handleCheckReminder}
              disabled={isCheckingReminder}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isCheckingReminder ? <RefreshCw size={13} className="animate-spin" /> : <FileCheck2 size={13} />}
              <span>Verify Suppression</span>
            </button>
          </div>
        </div>

        {/* Live Reminder Result Banner */}
        {reminderResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              reminderResult.reminderSuppressed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                {reminderResult.reminderSuppressed ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <span>Automated Reminders: SUPPRESSED (Student in Good Standing)</span>
                  </>
                ) : (
                  <>
                    <Bell size={18} className="text-amber-600" />
                    <span>Automated Reminders: ACTIVE (Outstanding Dues Present)</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-4 pt-1">
                <span>Student: <strong>{reminderResult.studentId}</strong></span>
                <span>Assessed: ₹{Number(reminderResult.totalAssessed || 0).toLocaleString('en-IN')}</span>
                <span>Concessions: ₹{Number(reminderResult.totalConcessions || 0).toLocaleString('en-IN')}</span>
                <span>Paid: ₹{Number(reminderResult.totalPaid || 0).toLocaleString('en-IN')}</span>
                <span className="font-extrabold text-slate-900">
                  Net Balance: ₹{Number(reminderResult.outstandingBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-center ${
                reminderResult.reminderSuppressed
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-200 text-amber-900'
              }`}
            >
              {reminderResult.reminderSuppressed ? 'NO NOTICES DISPATCHED' : 'DISPATCH SCHEDULED'}
            </span>
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={filterCampus}
            onChange={(e) => setFilterCampus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
          >
            <option value="all">All Campuses</option>
            <option value="campus-1">Campus 1 (AIT)</option>
            <option value="campus-2">Campus 2 (ACE)</option>
            <option value="campus-3">Campus 3 (ABS)</option>
            <option value="campus-4">Campus 4 (AMSA)</option>
            <option value="campus-5">Campus 5 (ACP)</option>
            <option value="campus-6">Campus 6 (API)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
          >
            <option value="ALL">All Reconciliation States</option>
            <option value="MATCHED">Matched</option>
            <option value="PENDING">Pending</option>
            <option value="EXCEPTION">Exception</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Student Roll or ID..."
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEntries()}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>
          <button
            onClick={fetchEntries}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Ledger Journal Entries</h3>
            <p className="text-[11px] text-slate-500">
              Showing {entries.length} immutable transaction records
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Double-Entry Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Transaction / Date</th>
                <th className="py-3 px-4">Campus &amp; Student</th>
                <th className="py-3 px-4">Type &amp; Description</th>
                <th className="py-3 px-4 text-right">Debit (₹)</th>
                <th className="py-3 px-4 text-right">Credit (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Bank UTR Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    Loading ledger records...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-400">
                    No ledger entries match the selected filters.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isDebit = entry.debitAmount > 0;
                  const isCredit = entry.creditAmount > 0;
                  const isReversed = entry.reconciliationStatus === 'REVERSED';

                  return (
                    <tr
                      key={entry._id || entry.transactionId}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isReversed ? 'bg-slate-50/40 opacity-70 line-through-disabled' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {entry.transactionId || entry._id?.slice(-8)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(entry.createdAt || entry.transactionDate || Date.now()).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">
                          {entry.studentRollNumber || entry.canonicalStudentId || 'N/A'}
                        </div>
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] uppercase font-bold">
                          {entry.campusId || 'CAMPUS-1'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {entry.entryType?.replace(/_/g, ' ') || 'TRANSACTION'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">
                          {entry.description || 'Standard academic ledger entry'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600">
                        {isDebit ? `₹${Number(entry.debitAmount).toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-600">
                        {isCredit ? `₹${Number(entry.creditAmount).toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.reconciliationStatus === 'MATCHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.reconciliationStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : entry.reconciliationStatus === 'REVERSED'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {entry.reconciliationStatus || 'MATCHED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {entry.bankUtrReference || '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isReversed && entry.entryType !== 'PAYMENT_REVERSAL' && (
                          <button
                            onClick={() => handleReverseTransaction(entry)}
                            disabled={reversingId === entry._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            title="Reverse transaction (compensatory offset, never deletes history)"
                          >
                            <RotateCcw size={12} />
                            <span>Reverse</span>
                          </button>
                        )}
                        {isReversed && (
                          <span className="text-[10px] text-slate-400 font-medium">Reversed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Entry Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Bank Payment</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportPayment} className="space-y-3.5 text-xs">
              <div>
                <label htmlFor="student-roll-input" className="block font-semibold text-slate-700 mb-1">
                  Student Roll Number / Canonical ID
                </label>
                <input
                  id="student-roll-input"
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="campus-select-input" className="block font-semibold text-slate-700 mb-1">Campus</label>
                  <select
                    id="campus-select-input"
                    value={paymentCampus}
                    onChange={(e) => setPaymentCampus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="campus-1">Campus 1 (AIT)</option>
                    <option value="campus-2">Campus 2 (ACE)</option>
                    <option value="campus-3">Campus 3 (ABS)</option>
                    <option value="campus-4">Campus 4 (AMSA)</option>
                    <option value="campus-5">Campus 5 (ACP)</option>
                    <option value="campus-6">Campus 6 (API)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="amount-paid-input" className="block font-semibold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    id="amount-paid-input"
                    type="number"
                    min="1"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="payment-method-select" className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    id="payment-method-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="NEFT">NEFT Transfer</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI / QR Payment</option>
                    <option value="IMPS">IMPS Immediate</option>
                    <option value="BANK_CHALLAN">Bank Challan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bank-utr-input" className="block font-semibold text-slate-700 mb-1">
                    Bank UTR Reference (Idempotent)
                  </label>
                  <input
                    id="bank-utr-input"
                    type="text"
                    required
                    value={paymentUtr}
                    onChange={(e) => setPaymentUtr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic pt-1">
                Note: Bank UTR must be globally unique across all 6 institutions. Attempting to re-enter an existing UTR will trigger duplicate rejection.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingPayment ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Record Transaction</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

