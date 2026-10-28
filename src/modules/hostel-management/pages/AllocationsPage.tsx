import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  CheckCircle2,
  ArrowRightLeft,
  LogOut,
  XCircle,
  Eye,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { RoomAllocation } from '../types/hostel';

export const AllocationsPage: React.FC = () => {
  const location = useLocation();
  const {
    allocations,
    students,
    hostels,
    rooms,
    beds,
    campuses,
    selectedCampusId,
    requestAllocation,
    approveAllocation,
    transferAllocation,
    checkoutAllocation,
    cancelAllocation,
  } = useHostel();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Active' | 'Checked Out' | 'Cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('all');

  // Modal States
  const [isNewAllocModalOpen, setIsNewAllocModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<RoomAllocation | null>(null);

  // New Allocation Form State — STRICT: NO REMARKS FIELD
  const [newAllocForm, setNewAllocForm] = useState({
    student_id: '',
    campus_id: campuses[0]?.id || '',
    hostel_id: '',
    room_id: '',
    bed_id: '',
    expected_checkout_date: '2025-06-30',
  });
  const [newAllocError, setNewAllocError] = useState('');

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    hostel_id: '',
    room_id: '',
    new_bed_id: '',
    reason: '',
  });
  const [transferError, setTransferError] = useState('');

  // Checkout Form State
  const [checkoutReason, setCheckoutReason] = useState('End of academic semester clearance');

  // Handle URL query parameter `?action=new` from Quick Actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      handleOpenNewAllocation();
    }
  }, [location.search]);

  // Set default hostel and room for new allocation form when campus changes
  useEffect(() => {
    if (newAllocForm.campus_id) {
      const campusHostels = hostels.filter((h) => h.campus_id === newAllocForm.campus_id);
      const firstHostel = campusHostels[0];
      if (firstHostel) {
        setNewAllocForm((prev) => ({
          ...prev,
          hostel_id: firstHostel.id,
          room_id: '',
          bed_id: '',
        }));
      }
    }
  }, [newAllocForm.campus_id, hostels]);

  // Update room and bed options
  const availableRoomsForHostel = rooms.filter(
    (r) => r.hostel_id === newAllocForm.hostel_id && r.status === 'Available'
  );

  const availableBedsForRoom = beds.filter((b) => {
    if (b.room_id !== newAllocForm.room_id || b.status !== 'Available') return false;
    // Must not be occupied by active allocation
    return !allocations.some((a) => a.bed_id === b.id && a.status === 'Active');
  });

  // Filter Allocations
  const filteredAllocations = allocations.filter((alloc) => {
    const student = students.find((s) => s.id === alloc.student_id);
    const bed = beds.find((b) => b.id === alloc.bed_id);
    const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
    const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

    if (selectedCampusId !== 'all' && student?.campus_id !== selectedCampusId) {
      return false;
    }

    const matchesTab = activeTab === 'All' || alloc.status === activeTab;

    const matchesSearch =
      (student?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (student?.student_code.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (room?.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (hostel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesHostel = hostelFilter === 'all' || room?.hostel_id === hostelFilter;

    return matchesTab && matchesSearch && matchesHostel;
  });

  const handleOpenNewAllocation = () => {
    const firstCampus = campuses[0]?.id || '';
    const firstHostel = hostels.find((h) => h.campus_id === firstCampus)?.id || hostels[0]?.id || '';
    setNewAllocForm({
      student_id: students.filter((s) => s.status === 'Active')[0]?.id || '',
      campus_id: firstCampus,
      hostel_id: firstHostel,
      room_id: '',
      bed_id: '',
      expected_checkout_date: '2025-06-30',
    });
    setNewAllocError('');
    setIsNewAllocModalOpen(true);
  };

  const handleSaveNewAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllocForm.student_id || !newAllocForm.bed_id) {
      setNewAllocError('Please select both a student and an available bed.');
      return;
    }
    const res = requestAllocation(
      newAllocForm.student_id,
      newAllocForm.bed_id,
      newAllocForm.expected_checkout_date
    );
    if (!res.success) {
      setNewAllocError(res.message);
      return;
    }
    setIsNewAllocModalOpen(false);
  };

  const handleOpenTransfer = (alloc: RoomAllocation) => {
    setSelectedAllocation(alloc);
    const currentBed = beds.find((b) => b.id === alloc.bed_id);
    const currentRoom = currentBed ? rooms.find((r) => r.id === currentBed.room_id) : undefined;

    setTransferForm({
      hostel_id: currentRoom?.hostel_id || hostels[0]?.id || '',
      room_id: '',
      new_bed_id: '',
      reason: 'Administrative room reassignment request',
    });
    setTransferError('');
    setIsTransferModalOpen(true);
  };

  const handleSaveTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation || !transferForm.new_bed_id) {
      setTransferError('Please select a destination bed.');
      return;
    }
    const res = transferAllocation(
      selectedAllocation.id,
      transferForm.new_bed_id,
      transferForm.reason
    );
    if (!res.success) {
      setTransferError(res.message);
      return;
    }
    setIsTransferModalOpen(false);
  };

  const handleOpenCheckout = (alloc: RoomAllocation) => {
    setSelectedAllocation(alloc);
    setCheckoutReason('Standard graduation or end-of-semester checkout clearance');
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!selectedAllocation) return;
    checkoutAllocation(selectedAllocation.id, checkoutReason);
    setIsCheckoutModalOpen(false);
  };

  const handleOpenView = (alloc: RoomAllocation) => {
    setSelectedAllocation(alloc);
    setIsViewModalOpen(true);
  };

  // Candidates for transfer destination
  const transferRooms = rooms.filter(
    (r) => r.hostel_id === transferForm.hostel_id && r.status === 'Available'
  );
  const transferBeds = beds.filter((b) => {
    if (b.room_id !== transferForm.room_id || b.status !== 'Available') return false;
    return !allocations.some((a) => a.bed_id === b.id && a.status === 'Active');
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room & Bed Allocations"
        subtitle="Manage end-to-end student accommodation workflows: request review, approvals, room transfers, and checkout clearance"
        actions={
          <button
            type="button"
            onClick={handleOpenNewAllocation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Allocation Request
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {(['All', 'Pending', 'Active', 'Checked Out', 'Cancelled'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? allocations.length
              : allocations.filter((a) => a.status === tab).length;

          const isCurrent = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${isCurrent
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              {tab}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCurrent ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, room, hostel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
        >
          <option value="all">All Hostels</option>
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Allocations Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3">Student</th>
                <th className="px-4 py-3">Hostel & Room</th>
                <th className="px-4 py-3 text-center">Bed Number</th>
                <th className="px-4 py-3">Allocation Date</th>
                <th className="px-4 py-3">Checkout Date</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAllocations.map((alloc) => {
                const student = students.find((s) => s.id === alloc.student_id);
                const bed = beds.find((b) => b.id === alloc.bed_id);
                const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
                const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

                return (
                  <tr key={alloc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">{student?.full_name || 'Student'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{student?.student_code}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{hostel?.name || 'Hostel'}</div>
                      <div className="text-[11px] text-slate-500">
                        Room {room?.room_number || 'N/A'} ({room?.room_type})
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-800">
                        {bed?.bed_number || 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {new Date(alloc.allocation_date).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {alloc.actual_checkout_date ? (
                        <span className="font-medium text-slate-800">
                          {new Date(alloc.actual_checkout_date).toLocaleDateString()}
                        </span>
                      ) : alloc.expected_checkout_date ? (
                        <span>Exp: {new Date(alloc.expected_checkout_date).toLocaleDateString()}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          alloc.status === 'Active'
                            ? 'success'
                            : alloc.status === 'Pending'
                              ? 'warning'
                              : alloc.status === 'Checked Out'
                                ? 'info'
                                : 'neutral'
                        }
                        size="sm"
                      >
                        {alloc.status}
                      </Badge>
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Pending: Approve Action */}
                        {alloc.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => approveAllocation(alloc.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Approve student allocation"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelAllocation(alloc.id, 'Cancelled by administrator')}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                              title="Cancel request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Active: Transfer or Checkout */}
                        {alloc.status === 'Active' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenTransfer(alloc)}
                              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Transfer student to another room/bed"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              Transfer
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenCheckout(alloc)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Process student checkout and release bed"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              Checkout
                            </button>
                          </>
                        )}

                        {/* View Details */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(alloc)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="View record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No allocation records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Allocation Request Modal — STRICT: NO REMARKS FIELD */}
      <Modal
        isOpen={isNewAllocModalOpen}
        onClose={() => setIsNewAllocModalOpen(false)}
        title="New Room & Bed Allocation"
        subtitle="Assign a student to a verified vacant bed in an available room"
        maxWidth="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsNewAllocModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNewAllocation}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Submit Request
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveNewAllocation} className="space-y-4">
          {newAllocError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {newAllocError}
            </div>
          )}

          {/* Student selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={newAllocForm.student_id}
              onChange={(e) => {
                const stu = students.find((s) => s.id === e.target.value);
                setNewAllocForm({
                  ...newAllocForm,
                  student_id: e.target.value,
                  campus_id: stu?.campus_id || newAllocForm.campus_id,
                });
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="">-- Choose Student --</option>
              {students
                .filter((s) => s.status === 'Active')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.student_code}) — {s.course}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus <span className="text-rose-500">*</span>
              </label>
              <select
                value={newAllocForm.campus_id}
                onChange={(e) => setNewAllocForm({ ...newAllocForm, campus_id: e.target.value })}
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
                Hostel Building <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newAllocForm.hostel_id}
                onChange={(e) =>
                  setNewAllocForm({ ...newAllocForm, hostel_id: e.target.value, room_id: '', bed_id: '' })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Hostel --</option>
                {hostels
                  .filter((h) => h.campus_id === newAllocForm.campus_id)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.hostel_type})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Room <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newAllocForm.room_id}
                onChange={(e) => setNewAllocForm({ ...newAllocForm, room_id: e.target.value, bed_id: '' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Room --</option>
                {availableRoomsForHostel.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} (Floor {r.floor_number}, {r.room_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Bed <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={newAllocForm.bed_id}
                onChange={(e) => setNewAllocForm({ ...newAllocForm, bed_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Bed --</option>
                {availableBedsForRoom.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bed_number} [Available]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Checkout Date (Optional)
            </label>
            <input
              type="date"
              value={newAllocForm.expected_checkout_date}
              onChange={(e) => setNewAllocForm({ ...newAllocForm, expected_checkout_date: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </form>
      </Modal>

      {/* Transfer Allocation Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Student Bed"
        subtitle="Reassign student to a new vacant bed while preserving previous stay history"
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTransfer}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              Confirm Transfer
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveTransfer} className="space-y-4">
          {transferError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {transferError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Hostel</label>
            <select
              value={transferForm.hostel_id}
              onChange={(e) =>
                setTransferForm({ ...transferForm, hostel_id: e.target.value, room_id: '', new_bed_id: '' })
              }
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Room</label>
              <select
                required
                value={transferForm.room_id}
                onChange={(e) => setTransferForm({ ...transferForm, room_id: e.target.value, new_bed_id: '' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Room --</option>
                {transferRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} ({r.room_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Bed</label>
              <select
                required
                value={transferForm.new_bed_id}
                onChange={(e) => setTransferForm({ ...transferForm, new_bed_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Bed --</option>
                {transferBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bed_number} [Available]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Reason (Recorded in Audit Trail)
            </label>
            <input
              type="text"
              required
              value={transferForm.reason}
              onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </form>
      </Modal>

      {/* Checkout Confirmation Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Student Checkout"
        subtitle="Process official hostel clearance and release the bed"
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmCheckout}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Complete Checkout
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Completing checkout will record today&apos;s date as the actual checkout timestamp, mark this allocation as{' '}
            <strong>Checked Out</strong>, and release the bed back to Available status for future allocations.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Checkout Reason</label>
            <input
              type="text"
              value={checkoutReason}
              onChange={(e) => setCheckoutReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </div>
      </Modal>

      {/* View Allocation Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Allocation Record Details"
        subtitle={`Record ID: ${selectedAllocation?.id}`}
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
        {selectedAllocation && (
          <div className="space-y-4 text-xs">
            {(() => {
              const student = students.find((s) => s.id === selectedAllocation.student_id);
              const bed = beds.find((b) => b.id === selectedAllocation.bed_id);
              const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
              const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

              return (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900">Current Status</span>
                    <Badge variant={selectedAllocation.status === 'Active' ? 'success' : 'neutral'}>
                      {selectedAllocation.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400">Student:</span>{' '}
                      <span className="font-semibold text-slate-800">{student?.full_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Roll Code:</span>{' '}
                      <span className="font-mono text-slate-800">{student?.student_code}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Hostel:</span>{' '}
                      <span className="font-semibold text-slate-800">{hostel?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Room & Bed:</span>{' '}
                      <span className="font-semibold text-slate-800">
                        Room {room?.room_number} (Bed {bed?.bed_number})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Allocation Date:</span>{' '}
                      <span className="text-slate-800">
                        {new Date(selectedAllocation.allocation_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Approved By:</span>{' '}
                      <span className="text-slate-800">{selectedAllocation.approved_by || 'Pending Approval'}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};
