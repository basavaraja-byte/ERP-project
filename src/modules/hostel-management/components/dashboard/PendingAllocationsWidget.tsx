import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { Badge } from '../ui/Badge';

export const PendingAllocationsWidget: React.FC = () => {
  const { allocations, students, campuses, beds, rooms, hostels, approveAllocation } = useHostel();
  const navigate = useNavigate();

  const pendingAllocations = allocations.filter((a) => a.status === 'Pending');

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pending Allocation Requests</h3>
              <p className="text-[11px] text-slate-500">Student applications awaiting warden review and approval</p>
            </div>
          </div>
          <Link
            to="/allocations"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Review All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {pendingAllocations.length > 0 ? (
            pendingAllocations.slice(0, 4).map((alloc) => {
              const student = students.find((s) => s.id === alloc.student_id);
              const campus = student ? campuses.find((c) => c.id === student.campus_id) : undefined;
              const bed = beds.find((b) => b.id === alloc.bed_id);
              const room = bed ? rooms.find((r) => r.id === bed.room_id) : undefined;
              const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;

              return (
                <div
                  key={alloc.id}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">
                          {student?.full_name || 'Student'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {student?.student_code}
                        </span>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                        <span>{campus?.name.split(' (')[0] || 'Campus'}</span>
                        <span>•</span>
                        <span>{hostel?.name || 'Hostel'}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">
                          Room {room?.room_number} (Bed {bed?.bed_number})
                        </span>
                        <span>•</span>
                        <span>Applied: {new Date(alloc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => approveAllocation(alloc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                        title="Approve and activate allocation"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/allocations')}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No pending room allocation requests at this time.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        Note: Pending requests do not count toward occupied capacity until warden approval.
      </div>
    </div>
  );
};
