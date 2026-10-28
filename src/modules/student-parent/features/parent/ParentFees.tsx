import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import { Card, CardHeader, CardContent, StatCard } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  Receipt,
  Download,
  AlertTriangle,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';
import type { PaymentRecord } from '../../types';

export const ParentFees: React.FC = () => {
  const { user, activeChildId, setActiveChildId, linkedChildren, triggerRefresh } = useAuth();
  const currentChildId = activeChildId || (linkedChildren[0]?.id ?? 'AAR-2026-0001');
  const child = erpService.getStudentProfile(currentChildId);
  const assessments = erpService.getStudentFees(currentChildId);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [printedDate] = useState(() => new Date().toLocaleDateString('en-IN'));

  // Simulated Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNotes, setPayNotes] = useState('');
  const [paymentStep, setPaymentStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [simulatedReceipt, setSimulatedReceipt] = useState<PaymentRecord | null>(null);

  const assessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];

  if (!assessment || !child) {
    return <div className="p-8 text-center text-slate-500">Fee records not found for selected child.</div>;
  }

  const handleOpenPayment = () => {
    setPayAmount(assessment.outstandingBalance);
    setPaymentStep('INPUT');
    setPaymentError(null);
    setIsPaymentModalOpen(true);
  };

  const handleExecuteSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      setPaymentError('Payment amount must be greater than zero.');
      return;
    }
    if (payAmount > assessment.outstandingBalance) {
      setPaymentError(`Amount cannot exceed the current outstanding balance of ${formatCurrency(assessment.outstandingBalance)}.`);
      return;
    }

    setPaymentStep('PROCESSING');
    setPaymentError(null);

    // Simulate realistic network latency (1.2 seconds)
    setTimeout(() => {
      const result = erpService.processSimulatedPayment(assessment.id, payAmount, payNotes);
      if (result.success && result.payment) {
        setSimulatedReceipt(result.payment);
        setPaymentStep('SUCCESS');
        triggerRefresh();
      } else {
        setPaymentError(result.error || 'Payment execution failed.');
        setPaymentStep('INPUT');
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Parent Portal', href: '/parent/dashboard' }, { label: 'Child Fees & Payment' }]} />

      {/* Header with Child Switcher and Academic Year */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Fee Account for {child.firstName} {child.lastName}
            </h2>
            <Badge
              variant={
                assessment.status === 'PAID'
                  ? 'success'
                  : assessment.status === 'OVERDUE'
                  ? 'danger'
                  : 'warning'
              }
              size="md"
            >
              {assessment.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {assessment.term} • Student Master ID: <span className="font-mono font-bold">{child.id}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {linkedChildren.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
              <Users className="w-4 h-4 text-slate-500 ml-1" />
              <select
                value={currentChildId}
                onChange={(e) => {
                  setActiveChildId(e.target.value);
                  setSelectedAssessmentId('');
                }}
                className="bg-transparent font-semibold text-slate-800 border-none outline-hidden cursor-pointer"
              >
                {linkedChildren.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {assessment.outstandingBalance > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CreditCard className="w-4 h-4" />}
              onClick={handleOpenPayment}
            >
              Simulate Demo Payment
            </Button>
          )}
        </div>
      </div>

      {/* Overdue Notice */}
      {assessment.status === 'OVERDUE' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-rose-800">
                Payment Overdue Notice: {formatCurrency(assessment.outstandingBalance)}
              </h4>
              <p className="text-rose-700 mt-0.5">
                The fee installment due date ({formatDate(assessment.dueDate)}) has passed. Please settle outstanding dues to prevent withholding of exam admit cards.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={handleOpenPayment}>
              Pay Now
            </Button>
          </div>
        </div>
      )}

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assessed Fees"
          value={formatCurrency(assessment.totalAssessed)}
          subtitle="Program & Lab Charges"
          icon={<Receipt className="w-6 h-6" />}
          colorScheme="slate"
        />

        <StatCard
          title="Concessions & Scholarships"
          value={formatCurrency(assessment.totalConcessions)}
          subtitle={assessment.concessions[0]?.name || 'No concession applied'}
          icon={<ShieldCheck className="w-6 h-6" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Confirmed Amount Paid"
          value={formatCurrency(assessment.confirmedPaid)}
          subtitle={`${assessment.payments.filter((p) => p.status === 'CONFIRMED').length} cleared payments`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(assessment.outstandingBalance)}
          subtitle={assessment.outstandingBalance > 0 ? `Due Date: ${formatDate(assessment.dueDate)}` : 'Dues fully cleared'}
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme={assessment.status === 'OVERDUE' ? 'amber' : assessment.outstandingBalance > 0 ? 'blue' : 'emerald'}
        />
      </div>

      {/* Fee Breakdown Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Fee Assessment Components"
            subtitle="Schedule of assessed academic charges"
            icon={<Receipt className="w-5 h-5" />}
          />
          <CardContent className="p-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Component</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessment.components.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(c.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 font-bold text-slate-900">
                  <td className="py-3 px-4">Gross Assessment</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-blue-700">
                    {formatCurrency(assessment.totalAssessed)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Concessions & Waivers"
            subtitle="Institutional and sibling discounts"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <CardContent className="p-0">
            {assessment.concessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No concessions applied to this ward's assessment.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessment.concessions.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 px-4 font-medium text-emerald-800">
                        {c.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{c.type}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        -{formatCurrency(c.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 font-bold text-emerald-900">
                    <td className="py-3 px-4">Net Concession Credit</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">
                      -{formatCurrency(assessment.totalConcessions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader
          title="Confirmed Payment History & Electronic Receipts"
          subtitle="All transactions verified by Aarohan Education Trust Central Accounts"
          icon={<Receipt className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt Ref #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Transaction Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessment.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.paymentReference}
                      {p.isSimulated && (
                        <span className="block text-[10px] text-blue-600 font-sans font-medium">
                          Demo Simulated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{p.transactionDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={p.status === 'CONFIRMED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'CONFIRMED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                          onClick={() => setSelectedReceipt(p)}
                        >
                          Receipt
                        </Button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Pending Bank</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Simulated Demo Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Simulated Demo Fee Payment"
        subtitle={`Demo sandbox transaction for ${child.firstName} ${child.lastName}`}
        maxWidth="md"
      >
        {paymentStep === 'PROCESSING' ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Processing Simulated Payment...</h4>
            <p className="text-xs text-slate-500">Contacting demo payment gateway & ledger engine.</p>
          </div>
        ) : paymentStep === 'SUCCESS' && simulatedReceipt ? (
          <div className="py-4 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-slate-900">Simulated Payment Successful!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Transaction Reference: <span className="font-mono font-bold text-blue-700">{simulatedReceipt.paymentReference}</span>
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900">{formatCurrency(simulatedReceipt.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated Outstanding Due:</span>
                <span className="font-bold text-blue-700">{formatCurrency(assessment.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">{simulatedReceipt.transactionDate}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] text-left">
              <strong>Evaluation Notice:</strong> This is an in-memory simulated demonstration. No real currency or banking transfer has occurred.
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedReceipt(simulatedReceipt);
                }}
              >
                View Generated Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleExecuteSimulatedPayment} className="space-y-4 text-xs">
            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
              <div className="flex justify-between font-semibold">
                <span>Current Outstanding Dues:</span>
                <span className="font-bold font-mono text-sm">{formatCurrency(assessment.outstandingBalance)}</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Parent ID: <strong className="font-mono">{user?.parentId}</strong> authorized to pay for ward <strong className="font-mono">{child.id}</strong>.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                min="100"
                max={assessment.outstandingBalance}
                value={payAmount || ''}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPayAmount(assessment.outstandingBalance)}
                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  Full Balance ({formatCurrency(assessment.outstandingBalance)})
                </button>
                {assessment.outstandingBalance > 10000 && (
                  <button
                    type="button"
                    onClick={() => setPayAmount(10000)}
                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    Partial ₹10,000
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Term fee installment demo simulation"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px]">
              <p className="font-semibold text-slate-800">Demo Sandbox Verification:</p>
              <p className="mt-0.5">Clicking "Confirm Simulated Payment" will instantaneously record a confirmed transaction, decrement the student's outstanding balance, and generate an auditable demo receipt.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Simulated Payment ({formatCurrency(payAmount)})
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Receipt"
          subtitle="Aarohan Education Trust Central Accounts Department"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">Printed on: {printedDate}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => window.print()}
                >
                  Print Receipt
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-4 border border-slate-200 rounded-xl space-y-4 bg-slate-50/40 text-xs">
            <div className="text-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-navy-950 uppercase">Aarohan Education Trust</h3>
              <p className="text-[11px] text-slate-500 font-medium">Centralized Financial ERP Accounts Division</p>
              <div className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-800 font-mono font-bold text-xs rounded border border-emerald-200">
                RECEIPT REF: {selectedReceipt.paymentReference}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500">Ward Name:</span>
                <p className="font-bold text-slate-900">{child.firstName} {child.lastName}</p>
              </div>
              <div>
                <span className="text-slate-500">Student Master ID:</span>
                <p className="font-bold font-mono text-slate-900">{child.id}</p>
              </div>
              <div>
                <span className="text-slate-500">Paid by Parent/Guardian:</span>
                <p className="font-semibold text-slate-800">{user?.name} ({user?.parentId})</p>
              </div>
              <div>
                <span className="text-slate-500">Transaction Date:</span>
                <p className="text-slate-900">{selectedReceipt.transactionDate}</p>
              </div>
              <div>
                <span className="text-slate-500">Payment Channel:</span>
                <p className="font-semibold text-slate-900">{selectedReceipt.paymentMethod.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500">Status:</span>
                <p className="font-bold text-emerald-700">CONFIRMED</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Amount Paid & Credited</p>
                <p className="text-[11px] text-slate-500">{selectedReceipt.notes || 'Institutional fee installment'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-slate-900">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
              Computer-generated electronic receipt. No physical signature required.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
