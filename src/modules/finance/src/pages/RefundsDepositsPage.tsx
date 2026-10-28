import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Send 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { RefundReason, DepositType } from '../types/finance';

export const RefundsDepositsPage: React.FC = () => {
  const { 
    scopedRefunds, 
    scopedDeposits, 
    approveRefund, 
    completeRefund, 
    requestRefund, 
    addDeposit, 
    campuses, 
    currentUser, 
    activeCampusId 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'refunds' | 'deposits'>('refunds');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Forms
  const [refundForm, setRefundForm] = useState({
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    student_code: 'STU-2026-001',
    student_name: 'Aarav Sharma',
    refund_reason_category: 'Hostel Vacating' as RefundReason,
    refund_amount: 15000,
    notes: 'Partial hostel room & mess security refund on semester vacating',
  });

  const [depositForm, setDepositForm] = useState({
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    student_code: 'STU-2026-008',
    student_name: 'Meera Sanyal',
    deposit_type: 'Hostel Security Deposit' as DepositType,
    collected_amount: 15000,
    status: 'active' as const,
    collection_date: new Date().toISOString().split('T')[0],
  });

  const isReadOnly = currentUser.role === 'auditor';

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const filteredRefunds = scopedRefunds.filter(r => {
    return (
      (r.student_name && r.student_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.student_code && r.student_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.refund_reason_category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredDeposits = scopedDeposits.filter(d => {
    return (
      d.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.deposit_type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalRefundableDeposits = scopedDeposits.reduce((s, d) => s + d.refundable_balance, 0);

  const handleExportCSV = () => {
    if (activeTab === 'refunds') {
      const rows = filteredRefunds.map(r => ({
        ID: r.id,
        StudentName: r.student_name || 'N/A',
        StudentCode: r.student_code || 'N/A',
        Campus: getCampusCity(r.campus_id),
        Reason: r.refund_reason_category,
        Amount: r.refund_amount,
        ApprovalStatus: r.approval_status,
        RefundStatus: r.refund_status,
        PaymentMode: r.payment_mode || 'Pending',
      }));
      exportToCSV('Student_Refunds_Register', rows);
    } else {
      const rows = filteredDeposits.map(d => ({
        ID: d.id,
        StudentName: d.student_name,
        StudentCode: d.student_code,
        Campus: getCampusCity(d.campus_id),
        Type: d.deposit_type,
        Collected: d.collected_amount,
        RefundableBalance: d.refundable_balance,
        AmountReturned: d.amount_returned,
        Status: d.status,
      }));
      exportToCSV('Refundable_Deposits_Ledger', rows);
    }
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundForm.refund_amount <= 0 || !refundForm.student_code.trim()) {
      alert('Please fill out student details and valid refund amount.');
      return;
    }
    requestRefund(refundForm);
    setIsRefundModalOpen(false);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositForm.collected_amount <= 0 || !depositForm.student_code.trim()) {
      alert('Please fill out student details and valid collected amount.');
      return;
    }
    addDeposit({
      ...depositForm,
      refundable_balance: depositForm.collected_amount,
      amount_returned: 0,
    });
    setIsDepositModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Refunds & Refundable Deposits</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage fee refund workflows and maintain distinct escrow tracking for refundable hostel & lab deposits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {!isReadOnly && (
            <>
              {activeTab === 'refunds' ? (
                <button
                  onClick={() => setIsRefundModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Request Fee Refund</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Collect Refundable Deposit</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'refunds'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Fee Refunds Workflow ({scopedRefunds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'deposits'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Refundable Deposits Escrow ({scopedDeposits.length})</span>
        </button>
      </div>

      {/* Refundable Deposits Notice when in Deposits tab */}
      {activeTab === 'deposits' && (
        <div className="bg-sky-50/80 border border-sky-200 rounded-xl p-4 flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sky-950">Statutory Accounting Rule Enforced</p>
              <p className="text-sky-700 text-[11px] mt-0.5">
                Refundable security deposits (hostel caution, lab & library escrow) are held in separate liability ledgers and excluded from operating fee income.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-sky-600 block">Total Refundable Escrow</span>
            <span className="text-base font-bold text-sky-950">{formatINR(totalRefundableDeposits)}</span>
          </div>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="relative min-w-[240px] flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={activeTab === 'refunds' ? "Search student, reason..." : "Search student, deposit type..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Refunds Table */}
      {activeTab === 'refunds' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Student Name & Roll</th>
                  <th className="py-3 px-3">Campus</th>
                  <th className="py-3 px-3">Refund Reason</th>
                  <th className="py-3 px-3 text-right">Refund Amount</th>
                  <th className="py-3 px-3 text-center">Sanction Status</th>
                  <th className="py-3 px-3 text-center">Execution Status</th>
                  <th className="py-3 px-3">Settlement Mode</th>
                  {!isReadOnly && <th className="py-3 px-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRefunds.map(ref => (
                  <tr key={ref.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{ref.student_name || 'Anonymous Student'}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ref.student_code || '—'}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {getCampusCity(ref.campus_id)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-900">{ref.refund_reason_category}</span>
                      {ref.notes && <div className="text-[11px] text-slate-400 max-w-xs truncate">{ref.notes}</div>}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-rose-600">
                      {formatINR(ref.refund_amount)}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <Badge
                        variant={ref.approval_status === 'approved' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {ref.approval_status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          ref.refund_status === 'completed' ? 'success' :
                          ref.refund_status === 'processing' ? 'info' : 'warning'
                        }
                        size="sm"
                      >
                        {ref.refund_status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                      {ref.payment_mode ? (
                        <span className="font-medium text-slate-800">{ref.payment_mode}</span>
                      ) : (
                        <span className="text-slate-400 italic">Awaiting Credit</span>
                      )}
                    </td>

                    {!isReadOnly && (
                      <td className="py-3.5 px-3 text-center whitespace-nowrap space-x-1.5">
                        {ref.approval_status === 'pending' && (
                          <button
                            onClick={() => approveRefund(ref.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {ref.approval_status === 'approved' && ref.refund_status !== 'completed' && (
                          <button
                            onClick={() => completeRefund(ref.id, 'NEFT Direct Transfer')}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Mark Completed</span>
                          </button>
                        )}
                        {ref.refund_status === 'completed' && (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Refundable Deposits Table */}
      {activeTab === 'deposits' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Student Name & Roll</th>
                  <th className="py-3 px-3">Campus</th>
                  <th className="py-3 px-3">Deposit Classification</th>
                  <th className="py-3 px-3">Collection Date</th>
                  <th className="py-3 px-3 text-right">Collected Amount</th>
                  <th className="py-3 px-3 text-right">Amount Refunded</th>
                  <th className="py-3 px-3 text-right">Refundable Balance</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeposits.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{dep.student_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{dep.student_code}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {getCampusCity(dep.campus_id)}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-indigo-900">
                      {dep.deposit_type}
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {dep.collection_date}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-slate-800">
                      {formatINR(dep.collected_amount)}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap text-rose-600 font-medium">
                      {dep.amount_returned > 0 ? formatINR(dep.amount_returned) : '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-emerald-700">
                      {formatINR(dep.refundable_balance)}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <Badge variant="success" size="sm">
                        {dep.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Refund Request Modal */}
      {isRefundModalOpen && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title="Initiate Fee Refund Request"
          subtitle="All refunds undergo institutional verification prior to electronic credit release"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitRefund} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Roll / Code *</label>
                <input
                  type="text"
                  value={refundForm.student_code}
                  onChange={(e) => setRefundForm({ ...refundForm, student_code: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={refundForm.student_name}
                  onChange={(e) => setRefundForm({ ...refundForm, student_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Refund *</label>
                <select
                  value={refundForm.refund_reason_category}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_reason_category: e.target.value as RefundReason })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Hostel Vacating">Hostel Vacating</option>
                  <option value="Excess Payment">Excess Payment</option>
                  <option value="Course Withdrawal">Course Withdrawal</option>
                  <option value="Duplicate Payment">Duplicate Payment</option>
                  <option value="Admission Cancellation">Admission Cancellation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Refund Claim (₹ INR) *</label>
                <input
                  type="number"
                  value={refundForm.refund_amount || ''}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-rose-600"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Justification & Payment References</label>
              <textarea
                rows={2}
                value={refundForm.notes}
                onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Submit Refund Claim
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* New Deposit Collection Modal */}
      {isDepositModalOpen && (
        <Modal
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          title="Collect Refundable Security Escrow Deposit"
          subtitle="Deposit remains separate from fee revenues until vacated or completed"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitDeposit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Roll / Code *</label>
                <input
                  type="text"
                  value={depositForm.student_code}
                  onChange={(e) => setDepositForm({ ...depositForm, student_code: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  value={depositForm.student_name}
                  onChange={(e) => setDepositForm({ ...depositForm, student_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deposit Type *</label>
                <select
                  value={depositForm.deposit_type}
                  onChange={(e) => setDepositForm({ ...depositForm, deposit_type: e.target.value as DepositType })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Hostel Security Deposit">Hostel Security Deposit</option>
                  <option value="Laboratory Deposit">Laboratory Deposit</option>
                  <option value="Library Deposit">Library Deposit</option>
                  <option value="Caution Deposit">Caution Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deposit Amount (₹ INR) *</label>
                <input
                  type="number"
                  value={depositForm.collected_amount || ''}
                  onChange={(e) => setDepositForm({ ...depositForm, collected_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Collect Deposit
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
