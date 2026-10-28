import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import AiCopilotPanel from './AiCopilotPanel';
import { formatINR } from '../../utils/calculations';

export default function ExceptionInspectorModal({
  exception,
  isOpen,
  onClose,
  onUpdateStatus
}) {
  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'copilot'

  if (!isOpen || !exception) return null;

  const isCritical = exception.priority === 'Critical';
  const isHigh = exception.priority === 'High';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/80">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isCritical
                  ? 'bg-rose-100 text-rose-700'
                  : isHigh
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isCritical ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {exception.id}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-100 text-rose-700 border-rose-200'
                      : isHigh
                      ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {exception.priority} Priority
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {exception.category}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {exception.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`py-3 border-b-2 transition-all ${
              activeTab === 'dossier'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Dossier & Ingestion Evidence
          </button>
          <button
            onClick={() => setActiveTab('copilot')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'copilot'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Copilot Analysis</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'dossier' ? (
            <>
              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                    <Building2 size={13} /> Campus Originator
                  </div>
                  <div className="font-bold text-slate-900 truncate">{exception.campusName}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                    <Clock size={13} /> Flagged Timestamp
                  </div>
                  <div className="font-bold text-slate-900">{exception.createdAt}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                    <CheckCircle2 size={13} /> Current Status
                  </div>
                  <div className="font-bold text-blue-600">{exception.status}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-1.5 text-xs">Operational Explanation</h4>
                <p className="text-slate-700 leading-relaxed text-xs">
                  {exception.description}
                </p>
              </div>

              {/* Source Spreadsheet Reference */}
              <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-2 font-bold text-blue-900 text-xs">
                  <FileSpreadsheet size={15} className="text-blue-600" />
                  <span>Ingested File Reference</span>
                </div>
                <div className="font-mono text-xs text-blue-800 bg-white p-2 rounded-lg border border-blue-200 break-all">
                  {exception.sourceReference}
                </div>
                {exception.studentRef && (
                  <div className="mt-2 text-[11px] text-blue-700">
                    <strong>Referenced Record:</strong> {exception.studentRef}
                  </div>
                )}
                {exception.amount && (
                  <div className="mt-1 text-[11px] text-blue-700">
                    <strong>Discrepancy Amount:</strong> {formatINR(exception.amount)}
                  </div>
                )}
              </div>

              {/* Primary Evidence Checklist */}
              {exception.evidence && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 text-xs">Reconciliation Evidence Log</h4>
                  <div className="space-y-1.5">
                    {exception.evidence.map((line, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[11px] flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Action */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h4 className="font-bold text-amber-900 mb-1 text-xs">Recommended Administrative Next Step</h4>
                <p className="text-amber-800 leading-relaxed text-xs">
                  {exception.suggestedAction}
                </p>
              </div>
            </>
          ) : (
            <AiCopilotPanel
              exception={exception}
              onStatusUpdate={(id, status) => {
                onUpdateStatus(id, status);
                onClose();
              }}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Update Status:</span>
            <select
              value={exception.status}
              onChange={(e) => onUpdateStatus(exception.id, e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Resolved">Resolved</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Close Dossier
            </button>
            <button
              onClick={() => {
                onUpdateStatus(exception.id, 'Resolved');
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
