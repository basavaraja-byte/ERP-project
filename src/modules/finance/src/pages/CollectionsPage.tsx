import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileCheck,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PaymentMethod } from '../types/finance';

export const CollectionsPage: React.FC = () => {
  const { 
    scopedPayments, 
    recordPayment, 
    scopedAssessments, 
    campuses, 
    currentUser, 
    activeCampusId,
    receipts 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // New Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [studentCodeInput, setStudentCodeInput] = useState('STU-2026-001');
  const [paymentAmount, setPaymentAmount] = useState<number>(25000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [allocationSelections, setAllocationSelections] = useState<Record<string, number>>({});

  const isReadOnly = currentUser.role === 'auditor';

  // Filter payments
  const filteredPayments = scopedPayments.filter(pay => {
    const matchesSearch = 
      pay.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.payment_reference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = selectedMethod === 'all' || pay.payment_method === selectedMethod;
    const matchesStatus = selectedStatus === 'all' || pay.status === selectedStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const handleExportCSV = () => {
    const rows = filteredPayments.map(p => ({
      ID: p.id,
      Reference: p.payment_reference,
      Date: p.payment_date,
      StudentName: p.student_name,
      StudentCode: p.student_code,
      Campus: getCampusCity(p.campus_id),
      PaymentMethod: p.payment_method,
      Amount: p.amount,
      AllocatedAmount: p.allocated_amount,
      UnallocatedAmount: p.unallocated_amount,
      Status: p.status,
      ReceiptID: p.receipt_id || 'N/A',
    }));
    exportToCSV('Collections_and_Payments_Register', rows);
  };

  // Find unpaid assessments for chosen student in modal
  const unpaidAssessments = scopedAssessments.filter(
    a => a.student_code === studentCodeInput.trim() && a.outstanding_balance > 0
  );

  const handleOpenPaymentModal = () => {
    const defaultStudent = scopedAssessments.find(a => a.outstanding_balance > 0);
    const code = defaultStudent ? defaultStudent.student_code : 'STU-2026-001';
    setStudentCodeInput(code);
    setPaymentAmount(defaultStudent ? defaultStudent.outstanding_balance : 25000);
    setPaymentMethod('upi');
    setPaymentRef(`UPI/2026/${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentNotes('Student fee installment settlement');
    setAllocationSelections({});
    setIsPaymentModalOpen(true);
  };

  const handleAllocationChange = (asmId: string, val: number) => {
    setAllocationSelections(prev => ({
      ...prev,
      [asmId]: Math.max(0, val),
    }));
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCodeInput.trim() || paymentAmount <= 0 || !paymentRef.trim()) {
      alert('Please fill out student code, valid amount and unique payment reference.');
      return;
    }

    // Determine target campus
    const targetStudent = scopedAssessments.find(a => a.student_code === studentCodeInput.trim());
    const targetCampus = targetStudent ? targetStudent.campus_id : (activeCampusId !== 'all' ? activeCampusId : 'campus-1');

    // Build allocations
    const allocationsList: { assessment_id: string; allocated_amount: number; fee_category: string; fee_subcategory: string }[] = [];
    let allocatedSum = 0;

    // If user explicitly entered allocations:
    Object.entries(allocationSelections).forEach(([asmId, amt]) => {
      if (amt > 0) {
        const asm = scopedAssessments.find(a => a.id === asmId);
        if (asm) {
          allocationsList.push({
            assessment_id: asmId,
            allocated_amount: amt,
            fee_category: asm.fee_category,
            fee_subcategory: asm.fee_subcategory,
          });
          allocatedSum += amt;
        }
      }
    });

    // If user didn't manually pick, automatically distribute payment to student's outstanding assessments
    if (allocationsList.length === 0) {
      let remainingToAllocate = paymentAmount;
      unpaidAssessments.forEach(asm => {
        if (remainingToAllocate <= 0) return;
        const toAlloc = Math.min(remainingToAllocate, asm.outstanding_balance);
        allocationsList.push({
          assessment_id: asm.id,
          allocated_amount: toAlloc,
          fee_category: asm.fee_category,
          fee_subcategory: asm.fee_subcategory,
        });
        remainingToAllocate -= toAlloc;
        allocatedSum += toAlloc;
      });
    }

    const result = recordPayment({
      student_code: studentCodeInput.trim(),
      campus_id: targetCampus,
      amount: paymentAmount,
      payment_method: paymentMethod,
      payment_reference: paymentRef.trim(),
      notes: paymentNotes,
      allocations: allocationsList,
    });

    if (!result.success) {
      alert(result.error);
      return;
    }

    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Collections & Payment Allocation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record institutional student payments, allocate cashflow across dues, and issue official demo receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Register</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={handleOpenPaymentModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, student name, roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Payment Mode:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="card">Card (POS/Payment Gateway)</option>
              <option value="cheque">Cheque / Demand Draft</option>
              <option value="cash">Cash Desk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Settlement Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending Verification</option>
              <option value="failed">Failed / Bounced</option>
              <option value="reversed">Reversed</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredPayments.length} payment records
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Transaction Reference</th>
                <th className="py-3 px-3">Student Name & Roll</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-right">Allocated</th>
                <th className="py-3 px-3 text-right">Unallocated</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(payment => {
                const rec = receipts.find(r => r.payment_id === payment.id);
                return (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-mono">{payment.payment_date}</td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900">{payment.payment_reference}</div>
                      {payment.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{payment.notes}</div>}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{payment.student_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{payment.student_code}</div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {getCampusCity(payment.campus_id)}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap capitalize">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {payment.payment_method.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                      {formatINR(payment.amount)}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-semibold text-emerald-700">
                      {formatINR(payment.allocated_amount)}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-slate-600">
                      {payment.unallocated_amount > 0 ? (
                        <span className="text-amber-700 font-bold">{formatINR(payment.unallocated_amount)}</span>
                      ) : (
                        '₹0'
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          payment.status === 'confirmed' ? 'success' :
                          payment.status === 'failed' ? 'danger' :
                          payment.status === 'reversed' ? 'warning' : 'neutral'
                        }
                        size="sm"
                        icon={
                          payment.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> :
                          payment.status === 'failed' ? <XCircle className="w-3 h-3" /> :
                          <AlertTriangle className="w-3 h-3" />
                        }
                      >
                        {payment.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {rec ? (
                        <span className="font-mono text-indigo-700 text-[11px] font-semibold bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200">
                          {rec.receipt_number}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Entry Modal */}
      {isPaymentModalOpen && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Record Student Fee Payment & Allocate"
          subtitle="Validates reference uniqueness, updates assessment balances, and generates official demo receipt"
          maxWidth="2xl"
        >
          <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Roll / Code *</label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-001"
                  value={studentCodeInput}
                  onChange={(e) => setStudentCodeInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹ INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="upi">UPI (PhonePe, GPay, Paytm)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="card">Card (Debit / Credit POS)</option>
                  <option value="cheque">Cheque / Demand Draft</option>
                  <option value="cash">Cash Counter</option>
                  <option value="other">Other Bank Instrument</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Reference / UTR Number *</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/2026/894101"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Unpaid Assessments Allocation section */}
            <div className="pt-2">
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Allocate Payment to Outstanding Dues:</span>
                <span className="text-[11px] text-slate-500">
                  {unpaidAssessments.length} pending assessment(s) found for this student
                </span>
              </label>

              {unpaidAssessments.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px]">
                  No outstanding assessment found for {studentCodeInput}. Payment will be logged with unallocated balance for reconciliation.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {unpaidAssessments.map(asm => (
                    <div key={asm.id} className="p-2.5 bg-slate-50 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{asm.fee_category} - {asm.fee_subcategory}</div>
                        <div className="text-[11px] text-slate-500">
                          Due Date: {asm.due_date} | Outstanding: <strong className="text-rose-600">{formatINR(asm.outstanding_balance)}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Allocate:</span>
                        <input
                          type="number"
                          placeholder={String(asm.outstanding_balance)}
                          value={allocationSelections[asm.id] ?? ''}
                          onChange={(e) => handleAllocationChange(asm.id, parseFloat(e.target.value) || 0)}
                          max={asm.outstanding_balance}
                          min="0"
                          className="w-28 p-1.5 bg-white border border-slate-300 rounded-lg text-right font-semibold text-slate-900 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Narration / Internal Remarks</label>
              <textarea
                rows={2}
                placeholder="Reference verified against bank credit notification..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Confirm Payment & Issue Receipt</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
