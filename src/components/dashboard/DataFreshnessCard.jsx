import React from 'react';
import { Database, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { MOCK_CAMPUSES } from '../../data/mockData';

export default function DataFreshnessCard({
  onRefresh,
  isRefreshing,
  campuses = MOCK_CAMPUSES,
  selectedCampusId = 'all'
}) {
  const displayCampuses = (selectedCampusId && selectedCampusId !== 'all')
    ? campuses.filter(c => c.id === selectedCampusId)
    : campuses;

  const verifiedCount = displayCampuses.reduce((sum, c) => sum + c.spreadsheetsVerified, 0);
  const totalCount = displayCampuses.reduce((sum, c) => sum + c.spreadsheetsActive, 0);
  const unverifiedCount = Math.max(0, totalCount - verifiedCount);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Database size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Spreadsheet Ingestion & Health
            </h3>
            <span className="text-[11px] text-slate-500">
              Multi-Campus Data Pipeline Integrity
            </span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title="Check ingestion status"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
        </button>
      </div>

      {/* Main Metric Progress */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-3.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">Reconciled Spreadsheets</span>
          <span className="font-bold text-emerald-600">
            {verifiedCount} / {totalCount} verified ({((verifiedCount / totalCount) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(verifiedCount / totalCount) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
          <span>Active Ingestion Bridges: {displayCampuses.length} {displayCampuses.length === 1 ? 'Campus' : 'Campuses'}</span>
          <span>Pending: {unverifiedCount} Unverified</span>
        </div>
      </div>

      {/* Campus Timestamps / Stale Alert */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-48 scrollbar-thin text-xs">
        {displayCampuses.map((c) => {
          const isWarning = c.importHealth === 'warning';
          return (
            <div
              key={c.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                isWarning
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {isWarning ? (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                )}
                <div className="truncate">
                  <div className="font-semibold truncate text-[11px]">{c.shortName}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{c.lastSuccessfulImport}</div>
                </div>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                isWarning
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {c.spreadsheetsVerified}/{c.spreadsheetsActive} sheets
              </span>
            </div>
          );
        })}
      </div>

      {/* Freshness Disclaimer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
        <Clock size={11} className="shrink-0" />
        <span>Timestamps derived from ingestion payload metadata. Zero simulated delays.</span>
      </div>
    </div>
  );
}
