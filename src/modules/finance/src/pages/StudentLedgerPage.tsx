import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FeeGroup } from '../types/finance';

export const StudentLedgerPage: React.FC = () => {
  const { 
    scopedAssessments, 
    addStudentAssessment, 
    scopedPayments, 
    scopedConcessions, 
    receipts, 
    campuses, 
    currentUser, 
    activeCampusId,
    feeStructures 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  // Modals state
  const [activeProfileStudentCode, setActiveProfileStudentCode] = useState<string | null>(null);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);

  // New assessment form state
  const [assessmentForm, setAssessmentForm] = useState({
    student_code: '',
    student_name: '',
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    academic_year: '2026-27',
    course_or_program: 'B.Tech Computer Science & Engineering',
    semester_or_year: 'Sem 1',
    fee_structure_id: '',
    fee_group: 'Academic' as FeeGroup,
    fee_category: 'Tuition Fee',
    fee_subcategory: 'Engineering Regular Tuition',
    original_amount: 145000,
    due_date: '2026-09-30',
  });

  const isReadOnly = currentUser.role === 'auditor' || currentUser.role === 'accounts';

  // Filter list
  const filteredAssessments = scopedAssessments.filter(asm => {
    const matchesSearch = 
      asm.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asm.fee_category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGroup = selectedGroup === 'all' || asm.fee_group === selectedGroup;
    const matchesStatus = selectedStatus === 'all' || asm.status === selectedStatus;
    const matchesProgram = selectedProgram === 'all' || asm.course_or_program === selectedProgram;

    return matchesSearch && matchesGroup && matchesStatus && matchesProgram;
  });

  // Extract unique programs for filter dropdown
  const uniquePrograms = Array.from(new Set(scopedAssessments.map(a => a.course_or_program)));

  const handleExportCSV = () => {
    const rows = filteredAssessments.map(a => ({
      ID: a.id,
      StudentCode: a.student_code,
      StudentName: a.student_name,
      Campus: campuses.find(c => c.id === a.campus_id)?.name || a.campus_id,
      Course: a.course_or_program,
      Semester: a.semester_or_year,
      FeeGroup: a.fee_group,
      Category: a.fee_category,
      Subcategory: a.fee_subcategory,
      OriginalAmount: a.original_amount,
      ConcessionAmount: a.approved_concession_amount,
      NetAmountDue: a.net_amount_due,
      AmountPaid: a.amount_paid,
      OutstandingBalance: a.outstanding_balance,
      DueDate: a.due_date,
      Status: a.status,
    }));
    exportToCSV('Student_Fee_Ledger', rows);
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.student_code.trim() || !assessmentForm.student_name.trim() || assessmentForm.original_amount <= 0) {
      alert('Please fill out student details and valid fee amount.');
      return;
    }

    addStudentAssessment({
      ...assessmentForm,
      approved_concession_amount: 0,
      net_amount_due: assessmentForm.original_amount,
      amount_paid: 0,
      outstanding_balance: assessmentForm.original_amount,
      status: 'pending',
    });

    setIsNewAssessmentOpen(false);
  };

  // Profile data when modal is open
  const profileStudentCode = activeProfileStudentCode;
  const studentAssessmentsList = profileStudentCode 
    ? scopedAssessments.filter(a => a.student_code === profileStudentCode) 
    : [];
  const studentPaymentsList = profileStudentCode 
    ? scopedPayments.filter(p => p.student_code === profileStudentCode && p.status === 'confirmed')
    : [];
  const studentConcessionsList = profileStudentCode 
    ? scopedConcessions.filter(c => c.student_code === profileStudentCode)
    : [];
  const studentReceiptsList = profileStudentCode
    ? receipts.filter(r => r.student_code === profileStudentCode)
    : [];

  const profileTotalBilled = studentAssessmentsList.reduce((s, a) => s + a.original_amount, 0);
  const profileTotalConcession = studentAssessmentsList.reduce((s, a) => s + a.approved_concession_amount, 0);
  const profileNetDue = studentAssessmentsList.reduce((s, a) => s + a.net_amount_due, 0);
  const profileTotalPaid = studentAssessmentsList.reduce((s, a) => s + a.amount_paid, 0);
  const profileOutstanding = studentAssessmentsList.reduce((s, a) => s + a.outstanding_balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Fee Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student fee assessments, charge-by-charge ledgers, concessions applied and dues tracking
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
            <button
              onClick={() => setIsNewAssessmentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Assess New Fee to Student</span>
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
              placeholder="Search by student name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Group:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Fee Groups</option>
              <option value="Academic">Academic Fees</option>
              <option value="Hostel">Hostel Fees</option>
              <option value="Examination">Examination Fees</option>
              <option value="Transport">Transport Fees</option>
              <option value="Other">Other Approved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Program:</span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Programs</option>
              {uniquePrograms.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredAssessments.length} assessment records
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Student Name & Roll</th>
                <th className="py-3 px-3">Program & Sem</th>
                <th className="py-3 px-3">Fee Assessment</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Original Fee</th>
                <th className="py-3 px-3 text-right">Concession</th>
                <th className="py-3 px-3 text-right">Net Due</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3 text-right">Outstanding</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssessments.map(asm => (
                <tr key={asm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{asm.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{asm.student_code}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="text-slate-700 font-medium">{asm.course_or_program}</div>
                    <div className="text-[11px] text-slate-400">{asm.semester_or_year}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-900">{asm.fee_category}</div>
                    <div className="text-slate-500 text-[11px]">{asm.fee_subcategory}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-mono">
                    {asm.due_date}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap text-slate-600">
                    {formatINR(asm.original_amount)}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-medium text-amber-700">
                    {asm.approved_concession_amount > 0 ? `-${formatINR(asm.approved_concession_amount)}` : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-semibold text-slate-900">
                    {formatINR(asm.net_amount_due)}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-emerald-700">
                    {formatINR(asm.amount_paid)}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatINR(asm.outstanding_balance)}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        asm.status === 'paid' ? 'success' :
                        asm.status === 'overdue' ? 'danger' :
                        asm.status === 'partial' ? 'warning' : 'neutral'
                      }
                      size="sm"
                      icon={
                        asm.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> :
                        asm.status === 'overdue' ? <AlertCircle className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      }
                    >
                      {asm.status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setActiveProfileStudentCode(asm.student_code)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Financial Profile Modal */}
      {activeProfileStudentCode && (
        <Modal
          isOpen={!!activeProfileStudentCode}
          onClose={() => setActiveProfileStudentCode(null)}
          title={`Student Financial Ledger: ${studentAssessmentsList[0]?.student_name || ''}`}
          subtitle={`Student Identification Code: ${activeProfileStudentCode} | Campus: ${campuses.find(c => c.id === studentAssessmentsList[0]?.campus_id)?.city || ''}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs">
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Total Assessed</span>
                <span className="text-base font-bold text-slate-900">{formatINR(profileTotalBilled)}</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-amber-700 block">Concessions Applied</span>
                <span className="text-base font-bold text-amber-800">-{formatINR(profileTotalConcession)}</span>
              </div>
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-indigo-700 block">Net Fee Demand</span>
                <span className="text-base font-bold text-indigo-900">{formatINR(profileNetDue)}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Total Settled</span>
                <span className="text-base font-bold text-emerald-800">{formatINR(profileTotalPaid)}</span>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
                <span className="text-[10px] uppercase font-semibold text-rose-700 block">Outstanding Balance</span>
                <span className="text-base font-bold text-rose-800">{formatINR(profileOutstanding)}</span>
              </div>
            </div>

            {/* Charge-by-Charge Assessment breakdown */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Charge-by-Charge Assessment Ledger</span>
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Subcategory</th>
                      <th className="py-2 px-3 text-right">Assessed</th>
                      <th className="py-2 px-3 text-right">Concession</th>
                      <th className="py-2 px-3 text-right">Net Due</th>
                      <th className="py-2 px-3 text-right">Paid</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAssessmentsList.map(item => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.fee_category}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.fee_subcategory}</td>
                        <td className="py-2.5 px-3 text-right">{formatINR(item.original_amount)}</td>
                        <td className="py-2.5 px-3 text-right text-amber-700">
                          {item.approved_concession_amount > 0 ? `-${formatINR(item.approved_concession_amount)}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900">{formatINR(item.net_amount_due)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{formatINR(item.amount_paid)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatINR(item.outstanding_balance)}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment history & Receipt links */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Confirmed Payment & Receipt References</span>
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {studentPaymentsList.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No payment records found for this student.</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Payment Method</th>
                        <th className="py-2 px-3 text-right">Amount Paid</th>
                        <th className="py-2 px-3">Associated Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentPaymentsList.map(pay => {
                        const rec = studentReceiptsList.find(r => r.payment_id === pay.id);
                        return (
                          <tr key={pay.id}>
                            <td className="py-2 px-3 text-slate-600">{pay.payment_date}</td>
                            <td className="py-2 px-3 font-mono text-slate-800">{pay.payment_reference}</td>
                            <td className="py-2 px-3 capitalize">{pay.payment_method.replace('_', ' ')}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatINR(pay.amount)}</td>
                            <td className="py-2 px-3">
                              {rec ? (
                                <span className="font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {rec.receipt_number}
                                </span>
                              ) : (
                                <span className="text-slate-400">Issued</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Concession history */}
            {studentConcessionsList.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2">Concessions & Scholarships History</h4>
                <div className="space-y-1.5">
                  {studentConcessionsList.map(c => (
                    <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{c.concession_type}</span>
                        <span className="text-slate-500 ml-2">({c.reason_category})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-700">₹{c.value.toLocaleString('en-IN')}</span>
                        <Badge variant={c.approval_status === 'approved' ? 'success' : 'warning'} size="sm">
                          {c.approval_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveProfileStudentCode(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Close Ledger Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Assessment Modal */}
      {isNewAssessmentOpen && (
        <Modal
          isOpen={isNewAssessmentOpen}
          onClose={() => setIsNewAssessmentOpen(false)}
          title="Assess Eligible Fee to Student"
          subtitle="Charge-level assessment adheres to student program, year, hostel and transport rules"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateAssessment} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Roll / Code *</label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-050"
                  value={assessmentForm.student_code}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, student_code: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Aditya Verma"
                  value={assessmentForm.student_name}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, student_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus *</label>
                <select
                  value={assessmentForm.campus_id}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, campus_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course / Program</label>
                <input
                  type="text"
                  value={assessmentForm.course_or_program}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, course_or_program: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Group *</label>
                <select
                  value={assessmentForm.fee_group}
                  onChange={(e) => {
                    const grp = e.target.value as FeeGroup;
                    setAssessmentForm({ ...assessmentForm, fee_group: grp });
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Examination">Examination</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pre-configured Rate Template</label>
                <select
                  onChange={(e) => {
                    const f = feeStructures.find(item => item.id === e.target.value);
                    if (f) {
                      setAssessmentForm({
                        ...assessmentForm,
                        fee_structure_id: f.id,
                        fee_group: f.fee_group,
                        fee_category: f.fee_category,
                        fee_subcategory: f.fee_subcategory,
                        original_amount: f.amount,
                      });
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="">-- Choose Rate Template --</option>
                  {feeStructures
                    .filter(f => f.fee_group === assessmentForm.fee_group)
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.fee_category} - {f.fee_subcategory} (₹{f.amount.toLocaleString('en-IN')})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Category *</label>
                <input
                  type="text"
                  value={assessmentForm.fee_category}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, fee_category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Subcategory *</label>
                <input
                  type="text"
                  value={assessmentForm.fee_subcategory}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, fee_subcategory: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Due (₹ INR) *</label>
                <input
                  type="number"
                  value={assessmentForm.original_amount || ''}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, original_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={assessmentForm.due_date}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, due_date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewAssessmentOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Confirm Assessment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
