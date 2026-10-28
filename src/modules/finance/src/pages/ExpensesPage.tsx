import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ExpenseCategory } from '../types/finance';

export const ExpensesPage: React.FC = () => {
  const { 
    scopedExpenses, 
    addExpense, 
    approveExpense, 
    rejectExpense, 
    markExpensePaid, 
    campuses, 
    vendors, 
    currentUser, 
    activeCampusId 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense form
  const [formData, setFormData] = useState<{
    campus_id: string;
    expense_category: ExpenseCategory;
    vendor_id: string;
    reference_number: string;
    expense_date: string;
    amount: number;
    description: string;
  }>({
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    expense_category: 'Hostel and Facility Maintenance',
    vendor_id: 'ven-002',
    reference_number: `EXP/2026/${Math.floor(1000 + Math.random() * 9000)}`,
    expense_date: new Date().toISOString().split('T')[0],
    amount: 85000,
    description: 'Hostel plumbing maintenance, sanitation chemicals & water tank sterilization',
  });

  const isReadOnly = currentUser.role === 'auditor';

  const getCampusCity = (campusId: string) => {
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const filteredExpenses = scopedExpenses.filter(e => {
    const matchesSearch = 
      e.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vendor_name && e.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || e.expense_category === selectedCategory;
    const matchesApproval = selectedApproval === 'all' || e.approval_status === selectedApproval;
    const matchesPayment = selectedPayment === 'all' || e.payment_status === selectedPayment;

    return matchesSearch && matchesCategory && matchesApproval && matchesPayment;
  });

  const handleExportCSV = () => {
    const rows = filteredExpenses.map(e => ({
      ID: e.id,
      Reference: e.reference_number,
      Date: e.expense_date,
      Campus: getCampusCity(e.campus_id),
      Category: e.expense_category,
      Vendor: e.vendor_name || 'N/A',
      Amount: e.amount,
      ApprovalStatus: e.approval_status,
      PaymentStatus: e.payment_status,
      SubmittedBy: e.submitted_by,
      ApprovedBy: e.approved_by || 'N/A',
    }));
    exportToCSV('Institutional_Expenses_Register', rows);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reference_number.trim() || formData.amount <= 0 || !formData.description.trim()) {
      alert('Please fill out expense reference, valid amount and description.');
      return;
    }

    const ven = vendors.find(v => v.id === formData.vendor_id);

    addExpense({
      ...formData,
      vendor_name: ven ? ven.name : undefined,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Expenses & Outflows</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational procurement, campus utilities, hostel maintenance and financial sanctions
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
              <span>Submit Expense Voucher</span>
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
              placeholder="Search invoice ref, vendor, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              <option value="Utilities">Utilities & Power</option>
              <option value="Hostel and Facility Maintenance">Hostel & Facility Maintenance</option>
              <option value="IT and Software">IT & Software</option>
              <option value="Laboratory Supplies">Laboratory Supplies</option>
              <option value="Academic Operations">Academic Operations</option>
              <option value="Administrative Expenses">Administrative Expenses</option>
              <option value="Repairs">Repairs</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Sanction:</span>
            <select
              value={selectedApproval}
              onChange={(e) => setSelectedApproval(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Sanctions</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Sanction</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Payment:</span>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Payment States</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredExpenses.length} expense records
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Voucher Ref</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Expense Category</th>
                <th className="py-3 px-3">Vendor / Beneficiary</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Sanction</th>
                <th className="py-3 px-3 text-center">Settlement</th>
                {!isReadOnly && <th className="py-3 px-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap font-mono">{exp.expense_date}</td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-mono font-bold text-slate-900">{exp.reference_number}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{exp.description}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusCity(exp.campus_id)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-indigo-950">
                    {exp.expense_category}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {exp.vendor_name || 'Direct Procurement'}
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatINR(exp.amount)}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={
                        exp.approval_status === 'approved' ? 'success' :
                        exp.approval_status === 'rejected' ? 'danger' : 'warning'
                      }
                      size="sm"
                      icon={
                        exp.approval_status === 'approved' ? <CheckCircle2 className="w-3 h-3" /> :
                        exp.approval_status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                        <Clock className="w-3 h-3" />
                      }
                    >
                      {exp.approval_status.toUpperCase()}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <Badge
                      variant={exp.payment_status === 'paid' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {exp.payment_status.toUpperCase()}
                    </Badge>
                  </td>

                  {!isReadOnly && (
                    <td className="py-3.5 px-3 text-center whitespace-nowrap space-x-1.5">
                      {exp.approval_status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveExpense(exp.id)}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const r = prompt('Reason for rejecting expense:');
                              if (r) rejectExpense(exp.id, r);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {exp.approval_status === 'approved' && exp.payment_status === 'unpaid' && (
                        <button
                          onClick={() => markExpensePaid(exp.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Mark Paid</span>
                        </button>
                      )}

                      {exp.payment_status === 'paid' && (
                        <span className="text-slate-400 text-[11px]">Settled</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Submit Operational Expense Voucher"
          subtitle="Expense vouchers require Dean or Trustee sanction before disbursement release"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus *</label>
                <select
                  value={formData.campus_id}
                  onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={formData.expense_category}
                  onChange={(e) => setFormData({ ...formData, expense_category: e.target.value as ExpenseCategory })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Hostel and Facility Maintenance">Hostel and Facility Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Academic Operations">Academic Operations</option>
                  <option value="Laboratory Supplies">Laboratory Supplies</option>
                  <option value="Administrative Expenses">Administrative Expenses</option>
                  <option value="IT and Software">IT and Software</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Events">Events</option>
                  <option value="Other Approved Expenses">Other Approved Expenses</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Voucher / Invoice Number *</label>
                <input
                  type="text"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Date *</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Vendor</label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount (₹ INR) *</label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-900"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Description & Work Order Summary *</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Submit for Sanction
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
