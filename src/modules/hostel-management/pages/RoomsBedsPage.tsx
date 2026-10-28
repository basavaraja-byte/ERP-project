import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BedDouble,
  Plus,
  Search,
  Edit2,
  User,
  Info,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type { Room, RoomType, RoomStatus, BedStatus } from '../types/hostel';

export const RoomsBedsPage: React.FC = () => {
  const location = useLocation();
  const {
    rooms,
    hostels,
    beds,
    allocations,
    students,
    selectedCampusId,
    addRoom,
    updateRoom,
    updateBedStatus,
  } = useHostel();

  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBedManageModalOpen, setIsBedManageModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Form State — STRICT: NO REMARKS FIELD
  const [formData, setFormData] = useState<{
    hostel_id: string;
    floor_number: number;
    room_number: string;
    room_type: RoomType;
    bed_capacity: number;
    status: RoomStatus;
    facilities: string[];
  }>({
    hostel_id: hostels[0]?.id || '',
    floor_number: 1,
    room_number: '',
    room_type: 'Double',
    bed_capacity: 2,
    status: 'Available',
    facilities: ['Study Desk', 'Wi-Fi'],
  });
  const [formError, setFormError] = useState('');

  // Auto-set bed capacity based on room_type
  const handleRoomTypeChange = (type: RoomType) => {
    let cap = 2;
    if (type === 'Single') cap = 1;
    else if (type === 'Double') cap = 2;
    else if (type === 'Triple') cap = 3;
    else if (type === 'Other') cap = 4;
    setFormData((prev) => ({ ...prev, room_type: type, bed_capacity: cap }));
  };

  // Facilities options
  const AVAILABLE_FACILITIES = [
    'Attached Bath',
    'Study Desk',
    'Balcony',
    'AC',
    'Wi-Fi',
    'Wardrobe',
    'Ceiling Fan',
  ];

  // Handle URL query parameter `?action=new` from Quick Actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'new') {
      handleOpenAdd();
    }
  }, [location.search]);

  // Filtered Rooms
  const filteredRooms = rooms.filter((r) => {
    const hostel = hostels.find((h) => h.id === r.hostel_id);
    if (selectedCampusId !== 'all' && hostel?.campus_id !== selectedCampusId) {
      return false;
    }

    const matchesSearch =
      r.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hostel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesHostel = hostelFilter === 'all' || r.hostel_id === hostelFilter;
    const matchesFloor = floorFilter === 'all' || r.floor_number.toString() === floorFilter;
    const matchesType = typeFilter === 'all' || r.room_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesHostel && matchesFloor && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      hostel_id: hostels[0]?.id || '',
      floor_number: 1,
      room_number: '',
      room_type: 'Double',
      bed_capacity: 2,
      status: 'Available',
      facilities: ['Study Desk', 'Wi-Fi'],
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setSelectedRoom(room);
    setFormData({
      hostel_id: room.hostel_id,
      floor_number: room.floor_number,
      room_number: room.room_number,
      room_type: room.room_type,
      bed_capacity: room.bed_capacity,
      status: room.status,
      facilities: room.facilities || [],
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleOpenBedManage = (room: Room) => {
    setSelectedRoom(room);
    setIsBedManageModalOpen(true);
  };

  const handleToggleFacility = (facility: string) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists ? prev.facilities.filter((f) => f !== facility) : [...prev.facilities, facility],
      };
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number.trim() || !formData.hostel_id) {
      setFormError('Please fill in room number and select a hostel.');
      return;
    }
    const res = addRoom(formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const res = updateRoom(selectedRoom.id, formData);
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms & Beds Inventory"
        subtitle="Manage room configurations, bed capacity constraints, amenities, and real-time bed assignments"
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hostel Filter */}
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

          {/* Floor Filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </select>

          {/* Room Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="Triple">Triple</option>
            <option value="Other">Other</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3">Room / Hostel</th>
                <th className="px-4 py-3">Floor</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-center">Capacity</th>
                <th className="px-4 py-3 text-center">Configured Beds</th>
                <th className="px-4 py-3 text-center">Occupied Beds</th>
                <th className="px-4 py-3 text-center">Available Beds</th>
                <th className="px-4 py-3 text-center">Maintenance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 sm:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => {
                const hostel = hostels.find((h) => h.id === room.hostel_id);
                const roomBeds = beds.filter((b) => b.room_id === room.id);

                const occupiedCount = roomBeds.filter((b) =>
                  allocations.some((a) => a.bed_id === b.id && a.status === 'Active')
                ).length;

                const maintenanceCount = roomBeds.filter((b) => b.status === 'Maintenance').length;
                const availableCount = roomBeds.filter(
                  (b) =>
                    b.status === 'Available' &&
                    room.status === 'Available' &&
                    !allocations.some((a) => a.bed_id === b.id && a.status === 'Active')
                ).length;

                return (
                  <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                      <div className="font-bold text-slate-900">Room {room.room_number}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{hostel?.name}</div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      Floor {room.floor_number}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-800">{room.room_type}</span>
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {room.bed_capacity}
                    </td>

                    <td className="px-4 py-3.5 text-center font-semibold text-slate-700">
                      {roomBeds.length}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-indigo-600">
                      {occupiedCount}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                      {availableCount}
                    </td>

                    <td className="px-4 py-3.5 text-center font-bold text-rose-600">
                      {maintenanceCount}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          room.status === 'Available'
                            ? 'success'
                            : room.status === 'Maintenance'
                              ? 'danger'
                              : 'neutral'
                        }
                        size="sm"
                      >
                        {room.status}
                      </Badge>
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenBedManage(room)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1"
                          title="View and configure individual beds"
                        >
                          <BedDouble className="w-3.5 h-3.5" />
                          Beds ({roomBeds.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(room)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit room"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    No rooms found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal — STRICT: NO REMARKS FIELD */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Room"
        subtitle="Provision a room and auto-generate configured bed inventory"
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
              Create Room & Beds
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
              Hostel Building <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.hostel_id}
              onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.hostel_code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Floor Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={15}
                required
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101, 204"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={formData.room_type}
                onChange={(e) => handleRoomTypeChange(e.target.value as RoomType)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Single">Single (1 Bed)</option>
                <option value="Double">Double (2 Beds)</option>
                <option value="Triple">Triple (3 Beds)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bed Capacity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={formData.bed_capacity}
                onChange={(e) => setFormData({ ...formData, bed_capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Configured beds will automatically match capacity</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Facilities Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amenities & Facilities</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FACILITIES.map((f) => {
                const isSelected = formData.facilities.includes(f);
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => handleToggleFacility(f)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal — STRICT: NO REMARKS FIELD */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Room Configuration"
        subtitle={`Room ${selectedRoom?.room_number}`}
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
              Update Room
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
              <input
                type="number"
                min={0}
                required
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room Type</label>
              <select
                value={formData.room_type}
                onChange={(e) => setFormData({ ...formData, room_type: e.target.value as RoomType })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Triple">Triple</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_FACILITIES.map((f) => {
                const isSelected = formData.facilities.includes(f);
                return (
                  <button
                    type="button"
                    key={f}
                    onClick={() => handleToggleFacility(f)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {f}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </Modal>

      {/* Manage Beds in Room Modal */}
      <Modal
        isOpen={isBedManageModalOpen}
        onClose={() => setIsBedManageModalOpen(false)}
        title={`Bed Inventory — Room ${selectedRoom?.room_number}`}
        subtitle={`Total Configured Beds: ${selectedRoom ? beds.filter((b) => b.room_id === selectedRoom.id).length : 0
          }`}
        maxWidth="xl"
        footer={
          <button
            type="button"
            onClick={() => setIsBedManageModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Done
          </button>
        }
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Bed records strictly correspond to room capacity. You can change operational status between Available,
                Maintenance, and Inactive. Beds with active student residents cannot be set to maintenance.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {beds
                .filter((b) => b.room_id === selectedRoom.id)
                .map((bed) => {
                  const activeAlloc = allocations.find((a) => a.bed_id === bed.id && a.status === 'Active');
                  const student = activeAlloc ? students.find((s) => s.id === activeAlloc.student_id) : undefined;

                  return (
                    <div
                      key={bed.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm">
                              {bed.bed_number}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-800">Bed {bed.bed_number}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {bed.id}</div>
                            </div>
                          </div>

                          <Badge
                            variant={
                              activeAlloc
                                ? 'info'
                                : bed.status === 'Available'
                                  ? 'success'
                                  : bed.status === 'Maintenance'
                                    ? 'danger'
                                    : 'neutral'
                            }
                            size="sm"
                          >
                            {activeAlloc ? 'Occupied' : bed.status}
                          </Badge>
                        </div>

                        {/* Resident info if allocated */}
                        {activeAlloc && student ? (
                          <div className="mt-3 p-2.5 rounded-lg bg-white border border-indigo-100 text-xs">
                            <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                              <User className="w-3.5 h-3.5 text-indigo-600" />
                              {student.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {student.student_code} • {student.course}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              Allocated: {new Date(activeAlloc.allocation_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-slate-500 italic">No student allocated to this bed.</div>
                        )}
                      </div>

                      {/* Bed Status Selector */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Status:</span>
                        <select
                          disabled={!!activeAlloc}
                          value={bed.status}
                          onChange={(e) => updateBedStatus(bed.id, e.target.value as BedStatus)}
                          className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-hidden"
                          title={activeAlloc ? 'Cannot alter status while actively occupied' : 'Change bed status'}
                        >
                          <option value="Available">Available</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
