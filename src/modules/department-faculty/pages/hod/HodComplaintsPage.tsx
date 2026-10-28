import React, { useState } from 'react';
import { Eye, RotateCcw, Search, UserCheck } from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { erpService } from '../../services/erpService';
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from '../../types/erp';
import {
  Badge,
  getComplaintStatusBadgeVariant,
  getPriorityBadgeVariant,
} from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ComplaintDetailModal } from '../../components/shared/ComplaintDetailModal';

export const HodComplaintsPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<ComplaintPriority | 'ALL'>('ALL');
  const [assignedFilter, setAssignedFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  if (!currentUser) return null;

  const deptFaculty = erpService.getDepartmentFaculty(currentUser.departmentId);
  const complaints = erpService.getDepartmentComplaints(currentUser.departmentId, {
    search,
    status: statusFilter,
    category: categoryFilter,
    priority: priorityFilter,
    assignedFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
    setAssignedFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          HOD Portal • Grievance Routing & Escalation Tracking
        </p>
        <h1 className="text-2xl font-bold text-navy-900 mt-0.5">
          Department Complaints
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review student grievances, filter by priority or status, assign or reassign
          faculty coordinators, and inspect audit timelines.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint ID, title, student name..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'ALL')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as ComplaintCategory | 'ALL')
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Attendance Discrepancy">Attendance Discrepancy</option>
            <option value="Lab & Infrastructure">Lab & Infrastructure</option>
            <option value="Assessment & Grading">Assessment & Grading</option>
            <option value="Timetable">Timetable</option>
            <option value="Mentorship">Mentorship</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as ComplaintPriority | 'ALL')
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Faculty Assignees</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {deptFaculty.map((f) => (
              <option key={f.faculty.id} value={f.faculty.id}>
                {f.faculty.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">Submitted Date:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded border border-slate-300 px-2.5 py-1 text-slate-800"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded border border-slate-300 px-2.5 py-1 text-slate-800"
            />
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <span className="text-slate-500">
            Showing <strong>{complaints.length}</strong> complaint record(s)
          </span>
        </div>
      </div>

      {/* Complaints Table */}
      {complaints.length === 0 ? (
        <EmptyState
          title="No department complaints match your filters"
          description="Try clearing status, priority, date, or assignee filters."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Complaint ID & Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Category & Priority
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Assigned Faculty</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {complaints.map((item) => (
                  <tr key={item.complaint.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="font-mono font-bold text-blue-700">
                        {item.complaint.id}
                      </span>
                      <p className="font-semibold text-navy-900 mt-0.5 line-clamp-2">
                        {item.complaint.title}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{item.student.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.student.rollNumber} • {item.section.displayName}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="slate">{item.complaint.category}</Badge>
                        <Badge variant={getPriorityBadgeVariant(item.complaint.priority)}>
                          {item.complaint.priority} Priority
                        </Badge>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {item.complaint.submittedAt}
                    </td>

                    <td className="px-4 py-3.5">
                      {item.assignedFaculty ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-navy-900">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {item.assignedFaculty.name}
                        </span>
                      ) : (
                        <Badge variant="red" dot>
                          Unassigned
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={getComplaintStatusBadgeVariant(item.complaint.status)}
                        dot
                      >
                        {item.complaint.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedComplaintId(item.complaint.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-navy-900 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        {item.assignedFaculty ? 'Manage / History' : 'Assign Faculty'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
      />
    </div>
  );
};

