import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConcessionType } from '../types/finance';

export const ConcessionsPage: React.FC = () => {
  const { 
    scopedConcessions, 
    approveConcession, 
    rejectConcession, 
    addConcessionRequest, 
    campuses, 
    currentUser, 
    scopedAssessments 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Concession Request Form
  const [formData, setFormData] = useState({
    student_code: 'STU-2026-006',
    student_name: 'Tanvi Joshi',
    campus_id: 'campus-5',
    concession_type: 'Merit Scholarship' as ConcessionType,
    amount_or_percentage: 'Fixed' as 'Fixed' | 'Percentage',
    value: 20000,
    applicable_fee_categories: ['Tuition Fee'],
    reason_category: 'Top percentile merit ranking evaluation committee waiver',
  });

  const isReadOnly = currentUser.role === 'auditor';

  const filteredConcessions = scopedConcessions.filter(c => {
    const matchesSearch = 
      c.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.concession_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason_category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || c.approval_status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const handleExportCSV = () => {
    const rows = filteredConcessions.map(c => ({
      ID: c.id,
      StudentName: c.student_name,
      StudentCode: c.student_code,
      Campus: getCampusCity(c.campus_id),
      Type: c.concession_type,
      Value: c.value,
      AppliedAmount: c.applied_amount,
      Reason: c.reason_category,
      Status: c.approval_status,
      ApprovedBy: c.approved_by || 'N/A',
      ApprovedAt: c.approved_at || 'N/A',
    }));
    exportToCSV('Concessions_and_Scholarships', rows);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_code.trim() || formData.value <= 0 || !formData.reason_category.trim()) {
      alert('Please fill out student code, amount and reason category.');
      return;
    }

    const targetStudent = scopedAssessments.find(a => a.student_code === formData.student_code.trim());

    addConcessionRequest({
      ...formData,
      student_name: targetStudent ? targetStudent.student_name : formData.student_name,
      campus_id: targetStudent ? targetStudent.campus_id : formData.campus_id,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Concessions & Scholarships</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional waivers, merit scholarships and need-based assistance with dual-level approvals
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
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Concession / Scholarship</span>
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
              placeholder="Search student, roll, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Approval Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved & Applied</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredConcessions.length} records shown
        </div>
      </div>

      {/* Concessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Student Details</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Concession Classification</th>
                <th className="py-3 px-3">Scope / Categories</th>
                <th className="py-3 px-3 text-right">Sanction Amount</th>
                <th className="py-3 px-3">Sanction Justification</th>
                <th className="py-3 px-3 text-center">Approval Status</th>
                <th className="py-3 px-3">Approver</th>
                {!isReadOnly && <th className="py-3 px-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConcessions.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{c.student_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{c.student_code}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusCity(c.campus_id)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-indigo-900">{c.concession_type}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600">
                    {c.applicable_fee_categories.join(', ')}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-amber-700">
                    {formatINR(c.value)}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={c.reason_category}>
                    {c.reason_category}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        c.approval_status === 'approved' ? 'success' :
                        c.approval_status === 'rejected' ? 'danger' : 'warning'
                      }
                      size="sm"
                      icon={
                        c.approval_status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                        c.approval_status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      }
                    >
                      {c.approval_status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                    {c.approved_by ? (
                      <div>
                        <div className="font-medium text-slate-800">{c.approved_by}</div>
                        <div className="text-slate-400 text-[10px]">{c.approved_at?.split('T')[0]}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pending Sanction</span>
                    )}
                  </td>

                  {!isReadOnly && (
                    <td className="py-3.5 px-3 text-center whitespace-nowrap space-x-1.5">
                      {c.approval_status === 'pending' ? (
                        <>
                          <button
                            onClick={() => approveConcession(c.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please enter reason for rejection:');
                              if (reason) rejectConcession(c.id, reason);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Concession Request Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Submit Concession or Scholarship Request"
          subtitle="Requests require Dean or Trustee approval before applying to student assessments"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Roll / Code *</label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-006"
                  value={formData.student_code}
                  onChange={(e) => setFormData({ ...formData, student_code: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tanvi Joshi"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scholarship / Concession Type *</label>
                <select
                  value={formData.concession_type}
                  onChange={(e) => setFormData({ ...formData, concession_type: e.target.value as ConcessionType })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="Need-Based Scholarship">Need-Based Scholarship</option>
                  <option value="Government Scholarship">Government Scholarship</option>
                  <option value="Institutional Scholarship">Institutional Scholarship</option>
                  <option value="Fee Waiver">Fee Waiver</option>
                  <option value="Fixed-Amount Concession">Fixed-Amount Concession</option>
                  <option value="Percentage Concession">Percentage Concession</option>
                  <option value="Other Approved Support">Other Approved Support</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sanction Amount (₹ INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={formData.value || ''}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Eligibility Justification / Committee Notes *</label>
              <textarea
                rows={3}
                placeholder="Include verification certificate numbers, entrance examination percentiles or income bracket details..."
                value={formData.reason_category}
                onChange={(e) => setFormData({ ...formData, reason_category: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
