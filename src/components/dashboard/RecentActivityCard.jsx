import React from 'react';
import { History, ArrowRight, AlertCircle } from 'lucide-react';
import { MOCK_AUDIT_ACTIVITIES } from '../../data/mockData';

export default function RecentActivityCard({ onOpenExceptions, selectedCampusId = 'all' }) {
  const filteredActivities = (selectedCampusId && selectedCampusId !== 'all')
    ? MOCK_AUDIT_ACTIVITIES.filter(a => a.campusId === selectedCampusId || a.campusId === 'all')
    : MOCK_AUDIT_ACTIVITIES;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <History size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Operational Audit Trail Preview
            </h3>
            <span className="text-[11px] text-slate-500">
              Cross-Campus Ledger & Policy Events
            </span>
          </div>
        </div>

        <button
          onClick={onOpenExceptions}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
        >
          <span>Exception Hub</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-72 scrollbar-thin text-xs">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            No audit events recorded for this campus.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    act.severity === 'critical' ? 'bg-rose-500' :
                    act.severity === 'warning' ? 'bg-amber-500' :
                    act.severity === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  {act.eventType}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">{act.timestamp}</span>
              </div>

              <p className="text-slate-600 leading-relaxed text-[11px] mb-1.5">
                {act.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200/50">
                <span className="font-medium text-slate-600">{act.campusShort}</span>
                <span className="italic">{act.actorLabel}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
        <AlertCircle size={11} className="shrink-0" />
        <span>Demonstration audit feed. Production audit trail is immutably signed in backend database.</span>
      </div>
    </div>
  );
}
