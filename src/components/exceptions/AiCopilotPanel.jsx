import React, { useState } from 'react';
import { Bot, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { exceptionService } from '../../services/exceptionService';

export default function AiCopilotPanel({ exception, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [hasRequested, setHasRequested] = useState(false);

  const handleRunCopilot = async () => {
    if (!exception) return;
    setLoading(true);
    setHasRequested(true);
    try {
      const res = await exceptionService.requestAiExplanation(exception.id);
      if (res.success) {
        setAnalysis(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-indigo-50/50 to-blue-50/30 rounded-2xl p-4 md:p-5 border border-indigo-100 flex flex-col gap-3">
      {/* Copilot Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-slate-900">
                AI Exception Copilot
              </h4>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                Offline Simulation
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Deterministic rule-based reasoning engine & discrepancy solver
            </p>
          </div>
        </div>

        {!hasRequested && (
          <button
            onClick={handleRunCopilot}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Bot size={14} />}
            <span>Analyze with Copilot</span>
          </button>
        )}
      </div>

      {/* Security Disclaimer Notice */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/80 border border-indigo-100 text-[11px] text-slate-600 leading-relaxed">
        <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Privacy & DPDP Compliance Note: </span>
          This copilot operates purely as a frontend architecture demonstration. Student PII is not sent to third-party LLMs. In production, institutional LLMs are self-hosted on private trust VPC with anonymized hashes.
        </div>
      </div>

      {/* Initial Prompt State */}
      {!hasRequested && !loading && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 text-center py-6">
          <Bot size={32} className="mx-auto text-indigo-400 mb-2" />
          <h5 className="font-bold text-slate-800 text-xs mb-1">
            Request Root-Cause & Evidence Synthesis
          </h5>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto mb-3">
            The Copilot will compare the ingested row against reference ledger batches, pinpoint the conflict, and generate reconciliation recommendations.
          </p>
          <button
            onClick={handleRunCopilot}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles size={14} />
            <span>Generate Analysis for {exception?.id}</span>
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-6 rounded-xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Synthesizing multi-spreadsheet evidence…</span>
          <span className="text-[11px] text-slate-400">Cross-referencing admission ledger with transaction receipts</span>
        </div>
      )}

      {/* Analysis Output */}
      {analysis && !loading && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
          {/* Root Cause */}
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
              <AlertTriangle size={13} className="text-amber-600" />
              <span>Why Was This Flagged?</span>
            </div>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
              {analysis.rootCauseAnalysis}
            </p>
          </div>

          {/* Evidence Dossier */}
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-xs">
              <FileText size={13} className="text-blue-600" />
              <span>Available Record Evidence</span>
            </div>
            <ul className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
              {analysis.primaryEvidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-1.5 text-slate-600">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-xs">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Recommended Resolution Steps</span>
            </div>
            <div className="space-y-1 text-[11px]">
              {analysis.recommendedNextSteps.map((step, i) => (
                <div key={i} className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-900">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Missing verification info */}
          <div>
            <div className="font-bold text-slate-900 text-xs mb-1">
              Required Human Verification Before Commit
            </div>
            <div className="text-[11px] text-slate-500 italic space-y-0.5">
              {analysis.missingHumanVerification.map((m, i) => (
                <div key={i}>⚠️ {m}</div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[10px] text-indigo-600 font-medium">
              {analysis.confidenceScore}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusUpdate && onStatusUpdate(exception.id, 'In Review')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Mark In Review
              </button>
              <button
                onClick={() => onStatusUpdate && onStatusUpdate(exception.id, 'Resolved')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Resolve Exception
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
