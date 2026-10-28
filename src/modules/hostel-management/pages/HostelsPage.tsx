import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Edit2,
  Eye,
  Home,
  Phone,
  Plus,
  Search,
  User,
  Layers,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Hostel, HostelType, HostelStatus } from '../types/hostel';

export const HostelsPage: React.FC = () => {
  const location = useLocation();
  const {
    hostels,
    campuses,
    rooms,
    beds,
    selectedCampusId,
    getHostelStats,
    addHostel,
    updateHostel,
  } = useHostel();

  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState<string>(selectedCampusId);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sync if header campus changed
  useEffect(() => {
    setCampusFilter(selectedCampusId);
  }, [selectedCampusId]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  // Form State — STRICT: NO ADDRESS FIELD
  const [formData, setFormData] = useState<{
    campus_id: string;
    hostel_code: string;
    name: string;
    hostel_type: HostelType;
    number_of_floors: number;
    warden_user_id: string;
    contact_number: string;
    status: HostelStatus;
  }>({
    campus_id: campuses[0]?.id || '',
    hostel_code: '',
    name: '',
    hostel_type: 'Boys',
    number_of_floors: 3,
    warden_user_id: '',
    contact_number: '',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');

  // Handle URL query parameter `?action=new` from Quick Actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      handleOpenAdd();
    }
  }, [location.search]);

  // Filter Hostels
  const filteredHostels = hostels.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.hostel_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.warden_user_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCampus = campusFilter === 'all' || h.campus_id === campusFilter;
    const matchesType = typeFilter === 'all' || h.hostel_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;

    return matchesSearch && matchesCampus && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      campus_id: campuses[0]?.id || '',
      hostel_code: '',
      name: '',
      hostel_type: 'Boys',
      number_of_floors: 3,
      warden_user_id: '',
      contact_number: '',
      status: 'Active',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setFormData({
      campus_id: hostel.campus_id,
      hostel_code: hostel.hostel_code,
      name: hostel.name,
      hostel_type: hostel.hostel_type,
      number_of_floors: hostel.number_of_floors,
      warden_user_id: hostel.warden_user_id,
      contact_number: hostel.contact_number,
      status: hostel.status,
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenView = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setIsViewModalOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hostel_code.trim() || !formData.warden_user_id.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const res = addHostel(formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostel) return;
    if (!formData.name.trim() || !formData.hostel_code.trim() || !formData.warden_user_id.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    const res = updateHostel(selectedHostel.id, formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostels Directory"
        subtitle="Manage student residential halls, warden contacts, floor inventory, and building occupancy"
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Hostel
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hostel name, code, warden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campus Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Campus:</span>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Types</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Co-ed">Co-ed</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hostels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredHostels.map((hostel) => {
          const stats = getHostelStats(hostel.id);
          const campus = campuses.find((c) => c.id === hostel.campus_id);

          return (
            <div
              key={hostel.id}
              className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {hostel.hostel_code}
                      </span>
                      <Badge
                        variant={
                          hostel.hostel_type === 'Boys'
                            ? 'info'
                            : hostel.hostel_type === 'Girls'
                              ? 'purple'
                              : 'neutral'
                        }
                        size="sm"
                      >
                        {hostel.hostel_type}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{hostel.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{campus?.name || 'Assigned Campus'}</p>
                  </div>

                  <Badge variant={hostel.status === 'Active' ? 'success' : 'neutral'} size="sm">
                    {hostel.status}
                  </Badge>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">Occupancy Rate</span>
                    <span className="font-bold text-indigo-600">{stats.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${stats.occupancyRate >= 85
                        ? 'bg-rose-500'
                        : stats.occupancyRate >= 50
                          ? 'bg-indigo-500'
                          : 'bg-emerald-500'
                        }`}
                      style={{ width: `${Math.min(100, stats.occupancyRate)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center border-t border-slate-200/60">
                    <div>
                      <div className="font-bold text-slate-800">{stats.physicalBeds}</div>
                      <div className="text-slate-400">Total Beds</div>
                    </div>
                    <div>
                      <div className="font-bold text-indigo-600">{stats.occupiedBeds}</div>
                      <div className="text-slate-400">Occupied</div>
                    </div>
                    <div>
                      <div className="font-bold text-emerald-600">{stats.availableBeds}</div>
                      <div className="text-slate-400">Available</div>
                    </div>
                  </div>
                </div>

                {/* Key Building Meta */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hostel.number_of_floors} Floors ({stats.totalRooms} Rooms)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Warden: {hostel.warden_user_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-500">{hostel.contact_number}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenView(hostel)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(hostel)}
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

      {filteredHostels.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <Home className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No hostels match the selected filters</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your filters or add a new hostel.</p>
        </div>
      )}

      {/* Add Hostel Modal — MANDATORY RESTRICTION: NO ADDRESS FIELD */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Hostel"
        subtitle="Register a residential hall within an institutional campus"
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
              Save Hostel
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.campus_id}
                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hostel Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. H-NC-B2"
                value={formData.hostel_code}
                onChange={(e) => setFormData({ ...formData, hostel_code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Must be unique within campus</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hostel Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramanujan Scholars Residence"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Type</label>
              <select
                value={formData.hostel_type}
                onChange={(e) => setFormData({ ...formData, hostel_type: e.target.value as HostelType })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Floors</label>
              <input
                type="number"
                min={1}
                max={15}
                required
                value={formData.number_of_floors}
                onChange={(e) => setFormData({ ...formData, number_of_floors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warden / Chief Caretaker <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ramesh Gupta"
                value={formData.warden_user_id}
                onChange={(e) => setFormData({ ...formData, warden_user_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 00000"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Building Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as HostelStatus })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Hostel Modal — MANDATORY RESTRICTION: NO ADDRESS FIELD */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Hostel Details"
        subtitle={selectedHostel?.name}
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
              Update Hostel
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus</label>
              <select
                value={formData.campus_id}
                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Code</label>
              <input
                type="text"
                required
                value={formData.hostel_code}
                onChange={(e) => setFormData({ ...formData, hostel_code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hostel Type</label>
              <select
                value={formData.hostel_type}
                onChange={(e) => setFormData({ ...formData, hostel_type: e.target.value as HostelType })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-ed">Co-ed</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floors</label>
              <input
                type="number"
                min={1}
                max={15}
                required
                value={formData.number_of_floors}
                onChange={(e) => setFormData({ ...formData, number_of_floors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Warden</label>
              <input
                type="text"
                required
                value={formData.warden_user_id}
                onChange={(e) => setFormData({ ...formData, warden_user_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as HostelStatus })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Hostel Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedHostel?.name || 'Hostel Details'}
        subtitle={`Code: ${selectedHostel?.hostel_code} • ${selectedHostel?.hostel_type} Hostel`}
        maxWidth="xl"
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
        {selectedHostel && (
          <div className="space-y-4">
            {/* Stats header */}
            {(() => {
              const stats = getHostelStats(selectedHostel.id);
              const campus = campuses.find((c) => c.id === selectedHostel.campus_id);
              const hostelRooms = rooms.filter((r) => r.hostel_id === selectedHostel.id);

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div className="text-xl font-extrabold text-slate-900">{stats.physicalBeds}</div>
                      <div className="text-[11px] text-slate-500">Physical Beds</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                      <div className="text-xl font-extrabold text-indigo-700">{stats.occupiedBeds}</div>
                      <div className="text-[11px] text-indigo-600">Occupied Beds</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xl font-extrabold text-emerald-700">{stats.availableBeds}</div>
                      <div className="text-[11px] text-emerald-600">Available Beds</div>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                      <div className="text-xl font-extrabold text-rose-700">{stats.maintenanceBeds}</div>
                      <div className="text-[11px] text-rose-600">In Maintenance</div>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400">Campus:</span>{' '}
                        <span className="font-semibold text-slate-800">{campus?.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Total Floors:</span>{' '}
                        <span className="font-semibold text-slate-800">{selectedHostel.number_of_floors}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Warden In-Charge:</span>{' '}
                        <span className="font-semibold text-slate-800">{selectedHostel.warden_user_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Contact Number:</span>{' '}
                        <span className="font-mono font-semibold text-slate-800">{selectedHostel.contact_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Inventory in this building */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Configured Rooms ({hostelRooms.length})
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {hostelRooms.map((r) => {
                        const rBeds = beds.filter((b) => b.room_id === r.id);
                        return (
                          <div
                            key={r.id}
                            className="p-3 rounded-lg border border-slate-200/80 bg-white flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">Room {r.room_number}</span>
                              <span className="text-slate-400 ml-2">
                                Floor {r.floor_number} • {r.room_type} ({r.bed_capacity} beds)
                              </span>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Beds: {rBeds.map((b) => `${b.bed_number} [${b.status}]`).join(', ')}
                              </div>
                            </div>
                            <Badge
                              variant={
                                r.status === 'Available'
                                  ? 'success'
                                  : r.status === 'Maintenance'
                                    ? 'danger'
                                    : 'neutral'
                              }
                              size="sm"
                            >
                              {r.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
