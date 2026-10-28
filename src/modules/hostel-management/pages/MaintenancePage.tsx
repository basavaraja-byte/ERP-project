import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Search,

  CheckCircle,

} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import type {
  MaintenanceRecord,
  MaintenancePriority,
} from '../types/hostel';

export const MaintenancePage: React.FC = () => {
  const location = useLocation();
  const {
    maintenanceRecords,
    rooms,
    hostels,
    beds,
    selectedCampusId,
    reportMaintenance,
    updateMaintenanceStatus,
  } = useHostel();

  const [activeTab, setActiveTab] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [hostelFilter, setHostelFilter] = useState<string>('all');

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  // Form State — STRICT: NO DESCRIPTION, NO RESOLUTION_NOTES
  const [formData, setFormData] = useState<{
    hostel_id: string;
    room_id: string;
    bed_id: string;
    issue_title: string;
    priority: MaintenancePriority;
    reported_by: string;
  }>({
    hostel_id: hostels[0]?.id || '',
    room_id: '',
    bed_id: '',
    issue_title: '',
    priority: 'Medium',
    reported_by: 'Hostel Resident',
  });
  const [formError, setFormError] = useState('');

  // Handle URL query parameter `?action=report` from Quick Actions
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'report') {
      handleOpenReport();
    }
  }, [location.search]);

  // Set default room when hostel changes in form
  useEffect(() => {
    if (formData.hostel_id) {
      const hostelRooms = rooms.filter((r) => r.hostel_id === formData.hostel_id);
      if (hostelRooms[0]) {
        setFormData((prev) => ({ ...prev, room_id: hostelRooms[0].id, bed_id: '' }));
      }
    }
  }, [formData.hostel_id, rooms]);

  const availableRooms = rooms.filter((r) => r.hostel_id === formData.hostel_id);
  const availableBeds = beds.filter((b) => b.room_id === formData.room_id);

  // Filter Records
  const filteredRecords = maintenanceRecords.filter((rec) => {
    const room = rooms.find((r) => r.id === rec.room_id);
    const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

    if (selectedCampusId !== 'all' && hostel?.campus_id !== selectedCampusId) {
      return false;
    }

    const matchesTab = activeTab === 'All' || rec.status === activeTab;
    const matchesSearch =
      rec.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.reported_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room?.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (hostel?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesPriority = priorityFilter === 'all' || rec.priority === priorityFilter;
    const matchesHostel = hostelFilter === 'all' || hostel?.id === hostelFilter;

    return matchesTab && matchesSearch && matchesPriority && matchesHostel;
  });

  const handleOpenReport = () => {
    const firstHostel = hostels[0]?.id || '';
    const firstRoom = rooms.find((r) => r.hostel_id === firstHostel)?.id || '';
    setFormData({
      hostel_id: firstHostel,
      room_id: firstRoom,
      bed_id: '',
      issue_title: '',
      priority: 'Medium',
      reported_by: 'Hostel Resident',
    });
    setFormError('');
    setIsReportModalOpen(true);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_id || !formData.issue_title.trim() || !formData.reported_by.trim()) {
      setFormError('Please fill in room, issue title, and reporter name.');
      return;
    }
    const res = reportMaintenance({
      room_id: formData.room_id,
      bed_id: formData.bed_id || undefined,
      issue_title: formData.issue_title,
      priority: formData.priority,
      reported_by: formData.reported_by,
    });
    if (!res.success) {
      setFormError(res.message);
      return;
    }
    setIsReportModalOpen(false);
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Operations"
        subtitle="Track institutional repair requests, room infrastructure issues, and priority facility tickets"
        actions={
          <button
            type="button"
            onClick={handleOpenReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Report Issue
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((tab) => {
          const count =
            tab === 'All'
              ? maintenanceRecords.length
              : maintenanceRecords.filter((m) => m.status === tab).length;

          const isCurrent = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${isCurrent
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
            >
              {tab}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCurrent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
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
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issue title, reporter, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Hostel */}
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
      </div>

      {/* Maintenance Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-3">Issue Title</th>
                <th className="px-4 py-3">Hostel & Location</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Reported By & Date</th>
                <th className="px-4 py-3">Resolved Date</th>
                <th className="px-4 sm:px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const room = rooms.find((r) => r.id === record.room_id);
                const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;
                const bed = record.bed_id ? beds.find((b) => b.id === record.bed_id) : undefined;

                return (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {record.priority === 'Critical' && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                        )}
                        {record.issue_title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {record.id}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{hostel?.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Room {room?.room_number || 'N/A'} {bed && `• Bed ${bed.bed_number}`}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          record.priority === 'Critical'
                            ? 'danger'
                            : record.priority === 'High'
                              ? 'warning'
                              : record.priority === 'Medium'
                                ? 'info'
                                : 'neutral'
                        }
                        size="sm"
                      >
                        {record.priority}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          record.status === 'Resolved'
                            ? 'success'
                            : record.status === 'In Progress'
                              ? 'info'
                              : record.status === 'Open'
                                ? 'warning'
                                : 'neutral'
                        }
                        size="sm"
                      >
                        {record.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      <div>{record.reported_by}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(record.reported_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-500">
                      {record.resolved_at ? (
                        <span className="font-medium text-emerald-700">
                          {new Date(record.resolved_at).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.status !== 'Resolved' && (
                          <>
                            {record.status === 'Open' && (
                              <button
                                type="button"
                                onClick={() => updateMaintenanceStatus(record.id, 'In Progress')}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                              >
                                In Progress
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => updateMaintenanceStatus(record.id, 'Resolved')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Resolve
                            </button>
                          </>
                        )}
                        {record.status === 'Resolved' && (
                          <span className="text-[11px] text-emerald-600 font-semibold px-2 py-1">
                            Completed ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No maintenance tickets found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Maintenance Issue Modal — STRICT: NO DESCRIPTION, NO RESOLUTION_NOTES */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Facility Maintenance Issue"
        subtitle="Log a repair ticket for room or bed equipment"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Submit Ticket
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveReport} className="space-y-4">
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
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value, bed_id: '' })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">-- Choose Room --</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} (Floor {r.floor_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bed (Optional)
              </label>
              <select
                value={formData.bed_id}
                onChange={(e) => setFormData({ ...formData, bed_id: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="">General Room Issue</option>
                {availableBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bed_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Electrical Short in Fan Switch, Broken Door Hinge"
              value={formData.issue_title}
              onChange={(e) => setFormData({ ...formData, issue_title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenancePriority })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reported By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Warden Dr. Anita Roy, Student Name"
                value={formData.reported_by}
                onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
