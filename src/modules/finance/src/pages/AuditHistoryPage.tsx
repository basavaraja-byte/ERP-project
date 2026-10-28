import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye 
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { exportToCSV } from '../utils/csvExport';
import { Modal } from '../components/common/Modal';
import { AuditHistoryEntry } from '../types/finance';

export const AuditHistoryPage: React.FC = () => {
  const { auditLogs, campuses, activeCampusId } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditHistoryEntry | null>(null);

  const scopedLogs = activeCampusId === 'all'
    ? auditLogs
    : auditLogs.filter(l => !l.campus_id || l.campus_id === 'all' || l.campus_id === activeCampusId);

  const filteredLogs = scopedLogs.filter(l => {
    const matchesSearch = 
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.reason && l.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = selectedEntity === 'all' || l.entity_type === selectedEntity;

    return matchesSearch && matchesEntity;
  });

  const getCampusCity = (campusId?: string) => {
    if (!campusId || campusId === 'all') return 'Consolidated Scope';
    const c = campuses.find(item => item.id === campusId);
    return c ? c.city : campusId;
  };

  const handleExportCSV = () => {
    const rows = filteredLogs.map(l => ({
      ID: l.id,
      Timestamp: l.timestamp,
      ActorName: l.actor_name,
      Campus: getCampusCity(l.campus_id),
      Action: l.action,
      EntityType: l.entity_type,
      EntityID: l.entity_id,
      Reason: l.reason || 'N/A',
    }));
    exportToCSV('Financial_Audit_Trail_Log', rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable trace log of fee tariff revisions, student concessions, payments, disbursements and reconciliation reviews
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors self-start"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Audit Trail</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search action, actor, reason, entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Entity Type:</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">All Entities</option>
              <option value="FeeStructure">Fee Structures</option>
              <option value="StudentFeeAssessment">Student Fee Assessment</option>
              <option value="Payment">Payment</option>
              <option value="Receipt">Receipt</option>
              <option value="Concession">Concession</option>
              <option value="Refund">Refund</option>
              <option value="Expense">Expense</option>
              <option value="Budget">Budget</option>
              <option value="ReconciliationException">Reconciliation Exception</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredLogs.length} audit records
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor / Principal</th>
                <th className="py-3 px-3">Campus</th>
                <th className="py-3 px-3">Action Performed</th>
                <th className="py-3 px-3">Entity Type & ID</th>
                <th className="py-3 px-3">Audit Reason / Justification</th>
                <th className="py-3 px-3 text-center">Diff Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'medium',
                    })}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{log.actor_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.actor_user_id}</div>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium">
                    {getCampusCity(log.campus_id)}
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{log.entity_type}</span>
                    <span className="text-[11px] text-slate-400 font-mono block">{log.entity_id}</span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate" title={log.reason}>
                    {log.reason || 'Routine operational update'}
                  </td>

                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Audit Entry Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record: ${selectedLog.action}`}
          subtitle={`Entity: ${selectedLog.entity_type} [${selectedLog.entity_id}]`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="text-slate-600">Timestamp: <strong className="text-slate-900">{selectedLog.timestamp}</strong></p>
              <p className="text-slate-600">Actor: <strong className="text-slate-900">{selectedLog.actor_name}</strong></p>
              <p className="text-slate-600">Reason: <strong className="text-slate-900">{selectedLog.reason || 'N/A'}</strong></p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="font-semibold text-slate-700 mb-1">Before State:</h4>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                  {selectedLog.before_data ? JSON.stringify(selectedLog.before_data, null, 2) : '// Null (Initial creation)'}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 mb-1">After State / Payload:</h4>
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                  {selectedLog.after_data ? JSON.stringify(selectedLog.after_data, null, 2) : '// Empty state'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Close Audit Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
