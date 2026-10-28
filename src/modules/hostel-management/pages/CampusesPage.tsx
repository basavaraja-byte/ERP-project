import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  Edit2,
  Eye,
  Home,
  Users,
  Calendar,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Campus, CampusStatus } from '../types/hostel';

export const CampusesPage: React.FC = () => {
  const { campuses, hostels, students, addCampus, updateCampus } = useHostel();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | CampusStatus>('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    campus_code: '',
    name: '',
    status: 'Active' as CampusStatus,
  });
  const [formError, setFormError] = useState('');

  // Filtered campuses
  const filteredCampuses = campuses.filter((campus) => {
    const matchesSearch =
      campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campus.campus_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || campus.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({ campus_code: '', name: '', status: 'Active' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setFormData({
      campus_code: campus.campus_code,
      name: campus.name,
      status: campus.status,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenView = (campus: Campus) => {
    setSelectedCampus(campus);
    setIsViewModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.campus_code.trim() || !formData.name.trim()) {
      setFormError('Please fill in both campus code and name.');
      return;
    }
    const res = addCampus(formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampus) return;
    if (!formData.campus_code.trim() || !formData.name.trim()) {
      setFormError('Please fill in both campus code and name.');
      return;
    }
    const res = updateCampus(selectedCampus.id, formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="College Campuses"
        subtitle="Manage academic campuses, location codes, and affiliated hostel facilities"
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Campus
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campus code or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Campuses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCampuses.map((campus) => {
          const campusHostels = hostels.filter((h) => h.campus_id === campus.id);
          const campusStudents = students.filter((s) => s.campus_id === campus.id);

          return (
            <div
              key={campus.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 mb-1.5">
                      {campus.campus_code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{campus.name}</h3>
                  </div>
                  <Badge variant={campus.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {campus.status}
                  </Badge>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-800">{campusHostels.length}</div>
                      <div className="text-[11px] text-slate-500">Hostel Buildings</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-lg font-extrabold text-slate-800">{campusStudents.length}</div>
                      <div className="text-[11px] text-slate-500">Enrolled Students</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Established: {new Date(campus.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenView(campus)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(campus)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCampuses.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No campuses found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new campus.</p>
        </div>
      )}

      {/* Add Campus Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Campus"
        subtitle="Register an institutional campus code and name"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Save Campus
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. NC-01, EC-03"
              value={formData.campus_code}
              onChange={(e) => setFormData({ ...formData, campus_code: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Unique alphanumeric campus identifier code</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. North Campus (Main Academic Center)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CampusStatus })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Campus Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Campus Details"
        subtitle={`Update details for ${selectedCampus?.name}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Update Campus
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.campus_code}
              onChange={(e) => setFormData({ ...formData, campus_code: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CampusStatus })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* View Campus Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Campus Overview"
        subtitle={selectedCampus?.name}
        footer={
          <button
            type="button"
            onClick={() => setIsViewModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        }
      >
        {selectedCampus && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Campus Code</span>
                <div className="text-base font-mono font-bold text-slate-900">{selectedCampus.campus_code}</div>
              </div>
              <Badge variant={selectedCampus.status === 'Active' ? 'success' : 'neutral'}>
                {selectedCampus.status}
              </Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Hostels on this Campus
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {hostels
                  .filter((h) => h.campus_id === selectedCampus.id)
                  .map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{h.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          Code: {h.hostel_code} • {h.hostel_type} • Warden: {h.warden_user_id}
                        </div>
                      </div>
                      <Badge variant={h.status === 'Active' ? 'success' : 'neutral'} size="sm">
                        {h.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
