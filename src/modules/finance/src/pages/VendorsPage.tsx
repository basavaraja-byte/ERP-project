import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Receipt
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/currency';
import { exportToCSV } from '../utils/csvExport';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Vendor } from '../types/finance';

export const VendorsPage: React.FC = () => {
  const { vendors, addVendor, updateVendor, expenses, currentUser } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeVendorDetails, setActiveVendorDetails] = useState<Vendor | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Vendor, 'id'>>({
    vendor_code: '',
    name: '',
    category: 'Hostel Housekeeping & Maintenance',
    contact_person: '',
    phone_number: '',
    email: '',
    city: 'Bengaluru',
    status: 'active',
  });

  const isReadOnly = currentUser.role === 'auditor';

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendor_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      vendor_code: `VND-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Hostel Housekeeping & Maintenance',
      contact_person: '',
      phone_number: '+91 ',
      email: '',
      city: 'Bengaluru',
      status: 'active',
    });
    setEditingVendor(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setFormData({
      vendor_code: v.vendor_code,
      name: v.name,
      category: v.category,
      contact_person: v.contact_person || '',
      phone_number: v.phone_number || '',
      email: v.email || '',
      city: v.city,
      status: v.status,
    });
    setEditingVendor(v);
    setIsAddModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.vendor_code.trim()) {
      alert('Please fill out vendor name and code.');
      return;
    }

    if (editingVendor) {
      updateVendor(editingVendor.id, formData);
    } else {
      addVendor(formData);
    }

    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const rows = filteredVendors.map(v => {
      const vExpenses = expenses.filter(e => e.vendor_id === v.id);
      const totalPaid = vExpenses.filter(e => e.payment_status === 'paid').reduce((s, e) => s + e.amount, 0);
      return {
        VendorCode: v.vendor_code,
        Name: v.name,
        Category: v.category,
        City: v.city,
        ContactPerson: v.contact_person || 'N/A',
        Phone: v.phone_number || 'N/A',
        Email: v.email || 'N/A',
        TotalPaidAmount: totalPaid,
        Status: v.status,
      };
    });
    exportToCSV('Institutional_Vendors_Directory', rows);
  };

  // Vendor expenses for detail view
  const activeVendorExpenses = activeVendorDetails
    ? expenses.filter(e => e.vendor_id === activeVendorDetails.id)
    : [];
  const activeVendorTotalOutflow = activeVendorExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Vendor Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered campus facility contractors, utility boards, tech suppliers and hostel catering vendors
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
              <span>Register New Vendor</span>
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
              placeholder="Search vendor name, code, category..."
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredVendors.length} registered vendors
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          const vExpenses = expenses.filter(e => e.vendor_id === vendor.id);
          const totalOutflow = vExpenses.reduce((s, e) => s + e.amount, 0);

          return (
            <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                    <Truck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <Badge variant={vendor.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {vendor.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-[11px] font-bold text-indigo-600">{vendor.vendor_code}</div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">{vendor.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{vendor.category}</p>
                </div>

                {/* Details */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {vendor.contact_person && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-semibold">Contact:</span>
                      <span className="font-medium text-slate-800">{vendor.contact_person}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700 truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700">{vendor.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{vendor.city} Hub</span>
                  </div>
                </div>

                {/* Expense activity summary */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Invoiced</span>
                    <span className="font-bold text-slate-900">{formatINR(totalOutflow)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Vouchers</span>
                    <span className="font-semibold text-indigo-600">{vExpenses.length} orders</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveVendorDetails(vendor)}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 py-1.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  View Linked Orders
                </button>

                {!isReadOnly && (
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Vendor"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingVendor ? 'Edit Vendor Details' : 'Register New Institutional Vendor'}
          subtitle="Registered vendor directory for purchase orders, utilities and contracts"
          maxWidth="md"
        >
          <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor Code *</label>
              <input
                type="text"
                value={formData.vendor_code}
                onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor Enterprise Name *</label>
              <input
                type="text"
                placeholder="e.g. BESCOM, Aura Facility Services..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trade Category *</label>
              <input
                type="text"
                placeholder="e.g. Utilities, Hostel Housekeeping, IT Hardware..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Representative</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vendor Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
              >
                <option value="active">Active Vendor</option>
                <option value="inactive">Inactive / Blacklisted</option>
              </select>
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
                {editingVendor ? 'Save Changes' : 'Register Vendor'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Linked Expenses Modal */}
      {activeVendorDetails && (
        <Modal
          isOpen={!!activeVendorDetails}
          onClose={() => setActiveVendorDetails(null)}
          title={`Vendor Audit Profile: ${activeVendorDetails.name}`}
          subtitle={`Code: ${activeVendorDetails.vendor_code} | Total Invoiced: ${formatINR(activeVendorTotalOutflow)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Category</span>
                <span className="font-bold text-slate-900">{activeVendorDetails.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Operating Hub</span>
                <span className="font-bold text-slate-900">{activeVendorDetails.city}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Historical Invoiced Vouchers</span>
              </h4>

              {activeVendorExpenses.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No expense vouchers logged for this vendor yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Voucher Ref</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeVendorExpenses.map(exp => (
                        <tr key={exp.id}>
                          <td className="py-2 px-3 font-mono text-slate-600">{exp.expense_date}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{exp.reference_number}</td>
                          <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{exp.description}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(exp.amount)}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant={exp.payment_status === 'paid' ? 'success' : 'neutral'} size="sm">
                              {exp.payment_status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveVendorDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
