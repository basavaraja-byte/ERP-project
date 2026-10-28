import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Copy, 
  CheckCircle2, 
  XCircle, 
  Download, 
  Edit3,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FeeStructure, FeeGroup, BillingFrequency } from '../types/finance';

export const FeeStructuresPage: React.FC = () => {
  const { 
    scopedFeeStructures, 
    addFeeStructure, 
    updateFeeStructure, 
    toggleFeeStatus, 
    duplicateFeeStructure, 
    campuses, 
    academicYear,
    currentUser,
    activeCampusId 
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [duplicatingFee, setDuplicatingFee] = useState<FeeStructure | null>(null);
  const [duplicateYear, setDuplicateYear] = useState('2027-28');

  // Form state for add / edit
  const [formData, setFormData] = useState<{
    campus_id: string;
    academic_year: string;
    course_or_program: string;
    fee_group: FeeGroup;
    fee_category: string;
    fee_subcategory: string;
    description: string;
    amount: number;
    billing_frequency: BillingFrequency;
    applicable_student_group: string;
    mandatory_or_optional: 'Mandatory' | 'Optional';
    refundable_or_non_refundable: 'Non-Refundable' | 'Refundable';
    status: 'active' | 'inactive';
  }>({
    campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
    academic_year: academicYear,
    course_or_program: 'All Programs',
    fee_group: 'Academic',
    fee_category: '',
    fee_subcategory: '',
    description: '',
    amount: 0,
    billing_frequency: 'Annual',
    applicable_student_group: 'All Students',
    mandatory_or_optional: 'Mandatory',
    refundable_or_non_refundable: 'Non-Refundable',
    status: 'active',
  });

  const isReadOnly = currentUser.role === 'auditor';

  // Filter list
  const filteredFees = scopedFeeStructures.filter(fee => {
    const matchesSearch = 
      fee.fee_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.fee_subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fee.course_or_program && fee.course_or_program.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGroup = selectedGroup === 'all' || fee.fee_group === selectedGroup;
    const matchesFreq = selectedFrequency === 'all' || fee.billing_frequency === selectedFrequency;
    const matchesStatus = selectedStatus === 'all' || fee.status === selectedStatus;

    return matchesSearch && matchesGroup && matchesFreq && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      campus_id: activeCampusId !== 'all' ? activeCampusId : 'campus-1',
      academic_year: academicYear,
      course_or_program: 'All Programs',
      fee_group: 'Hostel',
      fee_category: 'Room or Accommodation Fee',
      fee_subcategory: 'Twin Sharing Standard Non-AC Room',
      description: 'Hostel residential accommodation charge',
      amount: 45000,
      billing_frequency: 'Annual',
      applicable_student_group: 'Hostel Boarders',
      mandatory_or_optional: 'Mandatory',
      refundable_or_non_refundable: 'Non-Refundable',
      status: 'active',
    });
    setEditingFee(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (fee: FeeStructure) => {
    setFormData({
      campus_id: fee.campus_id,
      academic_year: fee.academic_year,
      course_or_program: fee.course_or_program || 'All Programs',
      fee_group: fee.fee_group,
      fee_category: fee.fee_category,
      fee_subcategory: fee.fee_subcategory,
      description: fee.description || '',
      amount: fee.amount,
      billing_frequency: fee.billing_frequency,
      applicable_student_group: fee.applicable_student_group || 'All Students',
      mandatory_or_optional: fee.mandatory_or_optional,
      refundable_or_non_refundable: fee.refundable_or_non_refundable,
      status: fee.status,
    });
    setEditingFee(fee);
    setIsAddModalOpen(true);
  };

  const handleSaveFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fee_category.trim() || !formData.fee_subcategory.trim() || formData.amount <= 0) {
      alert('Please fill out fee category, subcategory and a valid amount.');
      return;
    }

    if (editingFee) {
      updateFeeStructure(editingFee.id, formData);
    } else {
      addFeeStructure({
        ...formData,
        effective_from: new Date().toISOString().split('T')[0],
      });
    }

    setIsAddModalOpen(false);
  };

  const handleExecuteDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicatingFee || !duplicateYear.trim()) return;
    duplicateFeeStructure(duplicatingFee.id, duplicateYear);
    setDuplicatingFee(null);
  };

  const handleExportCSV = () => {
    const rows = filteredFees.map(f => ({
      ID: f.id,
      Campus: campuses.find(c => c.id === f.campus_id)?.name || 'All Campuses',
      AcademicYear: f.academic_year,
      FeeGroup: f.fee_group,
      Category: f.fee_category,
      Subcategory: f.fee_subcategory,
      Course: f.course_or_program || 'All Programs',
      Amount: f.amount,
      Frequency: f.billing_frequency,
      ApplicableTo: f.applicable_student_group || 'All',
      Status: f.status,
    }));
    exportToCSV('Fee_Structures_Register', rows);
  };

  const getCampusName = (campusId: string) => {
    if (campusId === 'all') return 'All Campuses';
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configurable Fee Structures</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Academic, Hostel, Examination, Transport and Approved Institutional Tariffs
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
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Configure New Fee Rate</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category, subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Group Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
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
              <option value="Other">Other Approved Fees</option>
            </select>
          </div>

          {/* Frequency Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Billing:</span>
            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Frequencies</option>
              <option value="Annual">Annual</option>
              <option value="Semester">Semester</option>
              <option value="Monthly">Monthly</option>
              <option value="One-Time">One-Time</option>
              <option value="Per-Paper">Per-Paper</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing {filteredFees.length} of {scopedFeeStructures.length} configurations
        </div>
      </div>

      {/* Fee Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Group</th>
                <th className="py-3 px-3">Fee Category & Subcategory</th>
                <th className="py-3 px-3">Campus / Scope</th>
                <th className="py-3 px-3">Applicable Program</th>
                <th className="py-3 px-3">Frequency</th>
                <th className="py-3 px-3 text-right">Configured Rate</th>
                <th className="py-3 px-3 text-center">Status</th>
                {!isReadOnly && <th className="py-3 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map(fee => (
                <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge
                      variant={
                        fee.fee_group === 'Hostel' ? 'purple' :
                        fee.fee_group === 'Academic' ? 'info' :
                        fee.fee_group === 'Examination' ? 'warning' :
                        fee.fee_group === 'Transport' ? 'success' : 'neutral'
                      }
                      size="sm"
                    >
                      {fee.fee_group}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{fee.fee_category}</div>
                    <div className="text-slate-500 font-medium">{fee.fee_subcategory}</div>
                    {fee.description && (
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{fee.description}</div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusName(fee.campus_id)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                    <div>{fee.course_or_program || 'All Programs'}</div>
                    <div className="text-[11px] text-slate-400">{fee.applicable_student_group || 'All Students'}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-slate-600">{fee.billing_frequency}</span>
                  </td>

                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                    {formatINR(fee.amount)}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      disabled={isReadOnly}
                      onClick={() => toggleFeeStatus(fee.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        fee.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={isReadOnly ? 'Read only' : 'Click to toggle status'}
                    >
                      {fee.status === 'active' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>

                  {!isReadOnly && (
                    <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => handleOpenEdit(fee)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Structure"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          setDuplicatingFee(fee);
                          setDuplicateYear('2027-28');
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Duplicate for Next Year"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Fee Structure Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingFee ? 'Edit Fee Structure' : 'Configure New Fee Category / Rate'}
          subtitle="Configure institution-approved rate, frequency and applicability rules"
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveFee} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Group *</label>
                <select
                  value={formData.fee_group}
                  onChange={(e) => setFormData({ ...formData, fee_group: e.target.value as FeeGroup })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel & Accommodation</option>
                  <option value="Examination">Examination</option>
                  <option value="Transport">Transport</option>
                  <option value="Other">Other Approved</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Campus Applicability *</label>
                <select
                  value={formData.campus_id}
                  onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="all">All 6 Campuses (Uniform Rate)</option>
                  {campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Category *</label>
                <input
                  type="text"
                  placeholder="e.g. Room or Accommodation Fee, Tuition Fee..."
                  value={formData.fee_category}
                  onChange={(e) => setFormData({ ...formData, fee_category: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Subcategory *</label>
                <input
                  type="text"
                  placeholder="e.g. Twin Sharing Non-AC, Food/Mess Plan..."
                  value={formData.fee_subcategory}
                  onChange={(e) => setFormData({ ...formData, fee_subcategory: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tariff Amount (₹ INR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 65000"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Frequency *</label>
                <select
                  value={formData.billing_frequency}
                  onChange={(e) => setFormData({ ...formData, billing_frequency: e.target.value as BillingFrequency })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Annual">Annual</option>
                  <option value="Semester">Semester</option>
                  <option value="Monthly">Monthly</option>
                  <option value="One-Time">One-Time</option>
                  <option value="Per-Paper">Per-Paper</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Course / Program</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech CSE, MBA, or All Programs"
                  value={formData.course_or_program}
                  onChange={(e) => setFormData({ ...formData, course_or_program: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Student Group</label>
                <input
                  type="text"
                  placeholder="e.g. Hostel Residents, Day Scholars..."
                  value={formData.applicable_student_group}
                  onChange={(e) => setFormData({ ...formData, applicable_student_group: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description & Applicability Notes</label>
              <textarea
                rows={2}
                placeholder="Include eligibility criteria, meal inclusions, or special terms..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
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
                {editingFee ? 'Update Fee Rate' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Duplicate Fee Modal */}
      {duplicatingFee && (
        <Modal
          isOpen={!!duplicatingFee}
          onClose={() => setDuplicatingFee(null)}
          title="Duplicate Fee Structure for Next Academic Year"
          subtitle={`Cloning rate for ${duplicatingFee.fee_category} - ${duplicatingFee.fee_subcategory}`}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteDuplicate} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-slate-600">Current Year: <strong className="text-slate-900">{duplicatingFee.academic_year}</strong></p>
              <p className="text-slate-600">Current Rate: <strong className="text-slate-900">{formatINR(duplicatingFee.amount)}</strong></p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Academic Year *</label>
              <input
                type="text"
                value={duplicateYear}
                onChange={(e) => setDuplicateYear(e.target.value)}
                placeholder="e.g. 2027-28"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDuplicatingFee(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs"
              >
                Clone Rate
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
