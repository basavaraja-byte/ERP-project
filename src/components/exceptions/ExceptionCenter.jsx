import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Building2
} from 'lucide-react';
import { exportToCSV, formatINR } from '../../utils/calculations';
import { MOCK_CAMPUSES } from '../../data/mockData';

export default function ExceptionCenter({
  exceptions = [],
  onInspectException,
  onUpdateStatus,
  selectedCampusId,
  onSelectCampus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((e) => {
      const matchesSearch =
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.campusName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCampus =
        !selectedCampusId || selectedCampusId === 'all' || e.campusId === selectedCampusId;

      const matchesCat =
        categoryFilter === 'all' || e.category === categoryFilter;

      const matchesPriority =
        priorityFilter === 'all' || e.priority.toLowerCase() === priorityFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' || e.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCampus && matchesCat && matchesPriority && matchesStatus;
    });
  }, [exceptions, searchTerm, selectedCampusId, categoryFilter, priorityFilter, statusFilter]);

  const handleExportCSV = () => {
    const dateStr = '2026-10-28';
    const filename = `TrustView_Data_Exceptions_${dateStr}.csv`;
    const columns = [
      { key: 'id', label: 'Exception ID' },
      { key: 'category', label: 'Category' },
      { key: 'priority', label: 'Priority' },
      { key: 'campusName', label: 'Campus' },
      { key: 'title', label: 'Issue Summary' },
      { key: 'sourceReference', label: 'Source Spreadsheet File & Line' },
      { key: 'status', label: 'Current Status' },
      { key: 'createdAt', label: 'Flagged Timestamp' },
      { key: 'suggestedAction', label: 'Administrative Action Plan' }
    ];
    exportToCSV(filteredExceptions, columns, filename);
  };

  const criticalCount = exceptions.filter(e => e.priority === 'Critical' && e.status !== 'Resolved').length;
  const highCount = exceptions.filter(e => e.priority === 'High' && e.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Ingestion Anomaly Hub */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <ShieldAlert size={13} />
                {criticalCount} Critical Ingestion Conflicts
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <AlertTriangle size={13} />
                {highCount} High Priority
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
              Operational Exception & Reconciliation Centre
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated anomaly detection across 40 campus spreadsheets. Flagging duplicate bank transfers, conflicting student enrollments, and capacity breaches.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <Download size={14} />
              <span>Export CSV Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search exceptions by ID, description, or campus…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Campus Filter */}
          <select
            value={selectedCampusId || 'all'}
            onChange={(e) => onSelectCampus && onSelectCampus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Campuses</option>
            {MOCK_CAMPUSES.map(c => (
              <option key={c.id} value={c.id}>{c.shortName}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Duplicate Payment Import">Duplicate Payment</option>
            <option value="Cross-Campus Identity Conflict">Cross-Campus Conflict</option>
            <option value="Unmatched Payment Record">Unmatched Payment</option>
            <option value="Stale Attendance Data">Stale Attendance</option>
            <option value="Hostel Capacity Conflict">Hostel Capacity</option>
            <option value="Conflicting Student Information">Conflicting Master Data</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Exception Cards List */}
      <div className="space-y-3">
        {filteredExceptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-800 text-sm">No Exceptions Found</h4>
            <p className="text-slate-500 text-xs mt-1">
              All records for the selected filters are currently reconciled and validated.
            </p>
          </div>
        ) : (
          filteredExceptions.map((ex) => {
            const isCrit = ex.priority === 'Critical';
            const isHigh = ex.priority === 'High';
            const isResolved = ex.status === 'Resolved';

            return (
              <div
                key={ex.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                  isCrit && !isResolved
                    ? 'border-rose-200 bg-rose-50/10'
                    : isHigh && !isResolved
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCrit
                          ? 'bg-rose-100 text-rose-700'
                          : isHigh
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isCrit ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {ex.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCrit
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : isHigh
                              ? 'bg-amber-100 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {ex.priority}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {ex.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Building2 size={12} />
                          {ex.campusName}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {ex.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <select
                      value={ex.status}
                      onChange={(e) => onUpdateStatus && onUpdateStatus(ex.id, e.target.value)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ex.status === 'In Review'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                      aria-label="Change exception status"
                    >
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>

                    <button
                      onClick={() => onInspectException(ex)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Sparkles size={13} />
                      <span>Inspect & AI Copilot</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-12 mb-3">
                  {ex.description}
                </p>

                <div className="pl-12 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      📄 {ex.sourceReference}
                    </span>
                    {ex.amount && (
                      <span className="font-bold text-slate-900">
                        Discrepancy: {formatINR(ex.amount)}
                      </span>
                    )}
                  </div>

                  <span className="text-slate-400">Flagged: {ex.createdAt}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
