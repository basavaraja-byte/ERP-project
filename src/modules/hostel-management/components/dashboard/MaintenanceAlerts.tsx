import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, ArrowRight } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { Badge } from '../ui/Badge';

export const MaintenanceAlerts: React.FC = () => {
  const { maintenanceRecords, rooms, hostels, beds, updateMaintenanceStatus } = useHostel();

  // Show top open/in-progress maintenance issues, sorting Critical & High first
  const activeIssues = maintenanceRecords
    .filter((m) => m.status !== 'Resolved' && m.status !== 'Cancelled')
    .sort((a, b) => {
      const priorityWeights = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    })
    .slice(0, 4);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Maintenance Alerts</h3>
              <p className="text-[11px] text-slate-500">Unresolved facility and room repair tickets</p>
            </div>
          </div>
          <Link
            to="/maintenance"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {activeIssues.length > 0 ? (
            activeIssues.map((issue) => {
              const room = rooms.find((r) => r.id === issue.room_id);
              const hostel = room ? hostels.find((h) => h.id === room.hostel_id) : undefined;
              const bed = issue.bed_id ? beds.find((b) => b.id === issue.bed_id) : undefined;

              return (
                <div
                  key={issue.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    issue.priority === 'Critical'
                      ? 'bg-rose-50/50 border-rose-200/80 shadow-xs ring-1 ring-rose-500/10'
                      : issue.priority === 'High'
                      ? 'bg-amber-50/40 border-amber-200/80'
                      : 'bg-slate-50/80 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900">{issue.issue_title}</span>
                        <Badge
                          variant={
                            issue.priority === 'Critical'
                              ? 'danger'
                              : issue.priority === 'High'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {issue.priority}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{hostel?.name || 'Hostel'}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-700">Room {room?.room_number || 'N/A'}</span>
                        {bed && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-indigo-700">Bed {bed.bed_number}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Reported by {issue.reported_by}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateMaintenanceStatus(issue.id, 'Resolved')}
                      className="shrink-0 p-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 font-medium"
                      title="Mark ticket as resolved"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No active maintenance tickets reported.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Prompt resolution keeps usable bed capacity high.</span>
      </div>
    </div>
  );
};
