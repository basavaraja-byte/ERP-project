import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import { apiService } from '../../services/api';

const CATEGORIES = [
  'ALL',
  'Academic',
  'Attendance Discrepancy',
  'Lab & Infrastructure',
  'Assessment & Grading',
  'Hostel',
  'Fee & Finance',
  'Administration',
  'Other'
];

const STATUSES = ['ALL', 'Pending', 'Under Review', 'Resolved', 'Rejected'];

export default function HodComplaintsManagement({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Selected complaint for modal review
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (user?.assignedCampusId) params.campusId = user.assignedCampusId;
      const res = await apiService.getComplaints(params);
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load department complaints.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenReview = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'Under Review');
    setResolutionNotes(complaint.resolutionNotes || '');
    setAssignedTo(complaint.assignedTo || (user?.name ? `${user.name} (HOD)` : ''));
    setUpdateSuccess(false);
    setUpdateError('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const payload = {
        status: newStatus,
        resolutionNotes: resolutionNotes.trim(),
        assignedTo: assignedTo.trim()
      };

      const res = await apiService.updateComplaintStatus(selectedComplaint.complaintId, payload);

      if (res && res.status === 'success' && res.data) {
        setUpdateSuccess(true);
        // Update local list
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaintId === selectedComplaint.complaintId ? { ...c, ...res.data } : c
          )
        );
        setSelectedComplaint(res.data);
        setTimeout(() => {
          setSelectedComplaint(null);
        }, 1200);
      } else {
        setUpdateError(res?.message || 'Failed to update status.');
      }
    } catch (err) {
      setUpdateError(err.message || 'Failed to update complaint status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  // Filter logic
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (search.trim()) {
      const query = search.toLowerCase();
      const matchId = (c.complaintId || '').toLowerCase().includes(query);
      const matchTitle = (c.title || '').toLowerCase().includes(query);
      const matchDesc = (c.description || '').toLowerCase().includes(query);
      const matchSubmitter = (c.submitterName || '').toLowerCase().includes(query);
      const matchStudentId = (c.studentId || '').toLowerCase().includes(query);
      return matchId || matchTitle || matchDesc || matchSubmitter || matchStudentId;
    }
    return true;
  });

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const reviewCount = complaints.filter((c) => c.status === 'Under Review' || c.status === 'In Review').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
      case 'Under Review':
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending Action
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Department Complaints &amp; Grievance Management Desk
              </h2>
              <p className="text-xs text-slate-500">
                Authorized HOD Review Desk • {user?.department || 'Computer Science & Engineering'} • {user?.assignedCampusId ? `Campus ${user.assignedCampusId.replace('campus-', '')}` : 'Campus 1'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchComplaints}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* 4 Primary Grievance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Grievances
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Department &amp; Campus scope</span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/20">
          <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">
            Pending Action
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Requires immediate HOD review</span>
        </div>

        <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs bg-blue-50/20">
          <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
            Under Investigation
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{reviewCount}</div>
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">Active faculty/lab coordination</span>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/20">
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
            Resolved / Closed
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
            {rejectedCount > 0 ? `(${rejectedCount} rejected)` : 'Official closure recorded'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint ID, student name, roll number, or keywords..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors w-full justify-center"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{filteredComplaints.length}</strong> of {totalCount} total grievances
          </span>
          <span className="font-medium text-slate-600">
            Scope: {user?.assignedCampusId || 'campus-1'} • MongoDB Atlas Verified
          </span>
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading && complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
            <p>Loading grievances from MongoDB Atlas database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 space-y-2">
            <AlertCircle size={24} className="mx-auto" />
            <p>{error}</p>
            <button
              onClick={fetchComplaints}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Retry
            </button>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No grievances match the active filters.</p>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">Complaint ID</th>
                  <th className="px-4 py-3 text-left">Subject / Title</th>
                  <th className="px-4 py-3 text-left">Submitted By</th>
                  <th className="px-4 py-3 text-left">Category &amp; Priority</th>
                  <th className="px-4 py-3 text-left">Date Submitted</th>
                  <th className="px-4 py-3 text-left">Current Status</th>
                  <th className="px-4 py-3 text-right">HOD Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredComplaints.map((item) => (
                  <tr key={item.complaintId} className="hover:bg-slate-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700">
                        {item.complaintId}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {item.description}
                      </div>
                    </td>

                    {/* Submitter */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {item.submitterName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-semibold text-slate-600">{item.submitterRole}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-600">{item.studentId}</span>
                      </div>
                    </td>

                    {/* Category & Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                        {item.priority && (
                          <span className={`text-[10px] font-semibold ${
                            item.priority === 'High' || item.priority === 'Urgent'
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}>
                            {item.priority} Priority
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Review &amp; Update</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* HOD Review & Status Update Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => !isUpdating && setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Review Grievance #{selectedComplaint.complaintId}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    HOD Resolution &amp; Escalation Authority
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isUpdating && setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Success Alert */}
              {updateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">
                    Status successfully updated to '{newStatus}' and persisted to MongoDB Atlas.
                  </span>
                </div>
              )}

              {/* Error Alert */}
              {updateError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{updateError}</span>
                </div>
              )}

              {/* Submitter Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Submitted By:</span>
                  <span className="font-bold text-slate-900">{selectedComplaint.submitterName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Role &amp; ID:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedComplaint.submitterRole} • {selectedComplaint.studentId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Category:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted Date:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Full Grievance Description */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">
                  {selectedComplaint.title}
                </h4>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedComplaint.description}
                </div>
              </div>

              {/* HOD Status Transition Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hod-status-select" className="block text-xs font-semibold text-slate-700 mb-1">
                      Transition Status <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="hod-status-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isUpdating}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending (Awaiting investigation)</option>
                      <option value="Under Review">Under Review (Active investigation)</option>
                      <option value="Resolved">Resolved (Satisfactorily closed)</option>
                      <option value="Rejected">Rejected (Inadmissible / Invalid)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="hod-assigned-to" className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Coordinator / Faculty
                    </label>
                    <input
                      id="hod-assigned-to"
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="e.g., Dr. K. Swaminathan (HOD) or Lab Coordinator"
                      disabled={isUpdating}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="hod-resolution-notes" className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Resolution Notes &amp; Action Taken
                  </label>
                  <textarea
                    id="hod-resolution-notes"
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document the exact corrective action, inspection outcome, or explanation for the student and parent..."
                    disabled={isUpdating}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    disabled={isUpdating}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Updating Status in Atlas...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck size={14} />
                        <span>Commit Status Update</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
