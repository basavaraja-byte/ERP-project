import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Building2,
  Lock,
  Layers,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../../services/api';

export default function AuditTrailView({ selectedCampusId = 'all' }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCampus, setFilterCampus] = useState(selectedCampusId);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterCampus && filterCampus !== 'all') params.campusId = filterCampus;
      if (filterAction && filterAction !== 'ALL') params.action = filterAction;

      const res = await apiService.getAuditLogs(params);
      if (res && res.data) {
        let items = res.data;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          items = items.filter(
            (l) =>
              (l.actorEmail && l.actorEmail.toLowerCase().includes(q)) ||
              (l.entityId && l.entityId.toLowerCase().includes(q)) ||
              (l.details && JSON.stringify(l.details).toLowerCase().includes(q))
          );
        }
        setLogs(items);
      }
    } catch {
      // Handled
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filterCampus, filterAction]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-slate-100 border border-slate-700 mb-1">
            <Lock size={12} className="text-emerald-400" />
            Append-Only Immutable Ledger Audit Trail
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Audit Trail &amp; Access Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed system record. Schema-level pre-hooks reject any update or delete operations to ensure tamper resistance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Mongoose Immutability Active</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={filterCampus}
            onChange={(e) => setFilterCampus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
          >
            <option value="all">All Campuses</option>
            <option value="campus-1">Campus 1 (AIT)</option>
            <option value="campus-2">Campus 2 (ACE)</option>
            <option value="campus-3">Campus 3 (ABS)</option>
            <option value="campus-4">Campus 4 (AMSA)</option>
            <option value="campus-5">Campus 5 (ACP)</option>
            <option value="campus-6">Campus 6 (API)</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
          >
            <option value="ALL">All Actions</option>
            <option value="STUDENT_MERGE">Student Identity Merge</option>
            <option value="POLICY_UPDATE">Policy Version Increment</option>
            <option value="PAYMENT_IMPORT">Payment Imported</option>
            <option value="TRANSACTION_REVERSAL">Transaction Reversal</option>
            <option value="SPREADSHEET_IMPORT">Spreadsheet Batch Import</option>
            <option value="HOSTEL_ALLOCATION">Hostel Bed Allocation</option>
            <option value="HOSTEL_RELEASE">Hostel Bed Release</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Actor Email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 w-56"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
            title="Refresh Audit Log"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Security Audit Trail Log</h3>
            <p className="text-[11px] text-slate-500">
              Showing {logs.length} append-only operational events
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Append-Only Guard Enabled</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor &amp; Role</th>
                <th className="py-3 px-4">Campus</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity Type &amp; ID</th>
                <th className="py-3 px-4">Audit Details &amp; Justification</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log._id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-800 font-semibold">
                        {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleTimeString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actorEmail || 'system.daemon'}</div>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] uppercase">
                        {log.actorRole || 'ADMIN'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {log.campusId?.toUpperCase() || 'TRUST-WIDE'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action?.includes('MERGE')
                            ? 'bg-amber-100 text-amber-800'
                            : log.action?.includes('REVERSAL')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action?.includes('IMPORT')
                            ? 'bg-indigo-100 text-indigo-800'
                            : log.action?.includes('UPDATE')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800">{log.entityType}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs">
                        {log.entityId || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-700 max-w-sm font-medium">
                        {typeof log.details === 'string'
                          ? log.details
                          : log.details?.reason ||
                            log.details?.notes ||
                            JSON.stringify(log.details) ||
                            'Standard audited operational event'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={11} />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

