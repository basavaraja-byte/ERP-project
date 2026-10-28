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
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import type { PaymentRecord } from '../../types';

export const StudentFees: React.FC = () => {
  const { user } = useAuth();
  const studentId = user?.studentId || 'AAR-2026-0001';
  const student = erpService.getStudentProfile(studentId);
  const assessments = erpService.getStudentFees(studentId);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(
    assessments[0]?.id || ''
  );
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [generatedDate] = useState(() => new Date().toLocaleDateString('en-IN'));

  const assessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];

  if (!assessment) {
    return <div className="p-8 text-center text-slate-500">No fee records found for this student.</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" size="md">PAID IN FULL</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge variant="warning" size="md">PARTIALLY PAID</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger" size="md">OVERDUE</Badge>;
      case 'PENDING':
        return <Badge variant="warning" size="md">PENDING VERIFICATION</Badge>;
      default:
        return <Badge variant="neutral" size="md">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'Fees & Payment History' }]} />

      {/* Header and selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Student Fee Account</h2>
            {getStatusBadge(assessment.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Academic Assessment for <span className="font-semibold text-slate-700">{assessment.academicYear}</span> ({assessment.term})
          </p>
        </div>

        {assessments.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Academic Year:</label>
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.academicYear} - {a.term}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Assessed Amount"
          value={formatCurrency(assessment.totalAssessed)}
          subtitle="Annual tuition & campus charges"
          icon={<Receipt className="w-6 h-6" />}
          colorScheme="slate"
        />

        <StatCard
          title="Concessions & Scholarships"
          value={formatCurrency(assessment.totalConcessions)}
          subtitle={assessment.concessions.length > 0 ? assessment.concessions[0].name : 'No concession applied'}
          icon={<ShieldCheck className="w-6 h-6" />}
          colorScheme="emerald"
        />

        <StatCard
          title="Confirmed Amount Paid"
          value={formatCurrency(assessment.confirmedPaid)}
          subtitle={`${assessment.payments.filter((p) => p.status === 'CONFIRMED').length} confirmed receipts`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="blue"
        />

        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(assessment.outstandingBalance)}
          subtitle={assessment.outstandingBalance > 0 ? `Due Date: ${formatDate(assessment.dueDate)}` : 'Dues fully cleared'}
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme={assessment.outstandingBalance > 0 ? 'amber' : 'emerald'}
          trend={{
            label: assessment.status === 'OVERDUE' ? 'OVERDUE' : assessment.outstandingBalance > 0 ? 'Payment Due' : 'Cleared',
            positive: assessment.outstandingBalance === 0
          }}
        />
      </div>

      {/* Pending Payment Notice (if applicable) */}
      {assessment.pendingAmount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pending Payment In Process ({formatCurrency(assessment.pendingAmount)}):</span>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              A payment transaction of {formatCurrency(assessment.pendingAmount)} is currently pending bank gateway reconciliation. In compliance with Trust financial audit rules, pending payments do not reduce the confirmed outstanding balance until settlement confirmation is received.
            </p>
          </div>
        </div>
      )}

      {/* Fee Breakdown: Components & Concessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component breakdown */}
        <Card>
          <CardHeader
            title="Fee Assessment Components"
            subtitle="Official institutional schedule of charges"
            icon={<FileText className="w-5 h-5" />}
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
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-medium text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                      {formatCurrency(c.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50/80 font-bold text-slate-900">
                  <td className="py-3 px-4">Total Assessed Fee</td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-blue-700">
                    {formatCurrency(assessment.totalAssessed)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Concessions and Scholarships */}
        <Card>
          <CardHeader
            title="Concessions & Scholarships"
            subtitle="Approved Trust waivers and merit assistance"
            icon={<ShieldCheck className="w-5 h-5" />}
          />
          <CardContent className="p-0">
            {assessment.concessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No concessions or scholarship credits applied to this assessment.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Scholarship / Waiver Category</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessment.concessions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-medium text-emerald-800">
                        {c.name}
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{c.type}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        -{formatCurrency(c.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/50 font-bold text-emerald-900">
                    <td className="py-3 px-4">Total Concession Credit</td>
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
          title="Payment History & Official Receipts"
          subtitle="All confirmed and pending transactions credited to this student"
          icon={<Receipt className="w-5 h-5" />}
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt Ref #</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
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
                          View Receipt
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

      {/* Official Receipt Dialog */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="Official Fee Receipt"
          subtitle="Aarohan Education Trust Central Accounts Department"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400">Generated on: {generatedDate}</span>
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
                OFFICIAL RECEIPT: {selectedReceipt.paymentReference}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <p className="font-bold text-slate-900">{student?.firstName} {student?.lastName}</p>
              </div>
              <div>
                <span className="text-slate-500">Student Master ID:</span>
                <p className="font-bold font-mono text-slate-900">{student?.id}</p>
              </div>
              <div>
                <span className="text-slate-500">Campus Enrollment No:</span>
                <p className="font-mono text-slate-900">{student?.enrollmentNumber}</p>
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
                <span className="text-slate-500">Transaction Status:</span>
                <p className="font-bold text-emerald-700">CONFIRMED / CLEARED</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Amount Received & Credited</p>
                <p className="text-[11px] text-slate-500">{selectedReceipt.notes || 'Tuition and institutional fee payment'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-slate-900">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
              Computer generated transaction record. No physical signature required.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
