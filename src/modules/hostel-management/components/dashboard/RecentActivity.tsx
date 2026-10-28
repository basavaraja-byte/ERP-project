import React from 'react';
import { Activity, Info } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { Link } from 'react-router-dom';

export const RecentActivity: React.FC = () => {
  const { activityEvents } = useHostel();

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Administrative Activity</h3>
              <p className="text-[11px] text-slate-500">Live operational events stream (Demo Feed)</p>
            </div>
          </div>
          <Link
            to="/audit-history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Full Audit &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {activityEvents.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 leading-snug">{act.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${act.badgeColor}`}
                  >
                    Demo Event
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Generated automatically upon local UI allocations, registrations, and updates.</span>
      </div>
    </div>
  );
};
