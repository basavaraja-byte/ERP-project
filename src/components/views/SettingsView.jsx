import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  Save,
  RotateCcw,
  Sliders,
  Server
} from 'lucide-react';
import { MOCK_INSTITUTION_INFO as _MOCK_INSTITUTION_INFO } from '../../data/mockData';

export default function SettingsView() {
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [staleWarningHours, setStaleWarningHours] = useState(48);
  const [ingestionCadence, setIngestionCadence] = useState('hourly');
  const [requireTrusteeSanctionAbove, setRequireTrusteeSanctionAbove] = useState(50000);
  const [autoFlagDuplicateUtr, setAutoFlagDuplicateUtr] = useState(true);
  const [strictHostelSanctionCheck, setStrictHostelSanctionCheck] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    setAttendanceThreshold(75);
    setStaleWarningHours(48);
    setIngestionCadence('hourly');
    setRequireTrusteeSanctionAbove(50000);
    setAutoFlagDuplicateUtr(true);
    setStrictHostelSanctionCheck(true);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 mb-1">
            <Settings size={13} />
            Institutional Governance & Policy Engine
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Settings & System Policies
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure trust-wide thresholds, spreadsheet ingestion pipeline rules, and audit parameters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Save size={14} />
            <span>Save Policies</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Institutional governance parameters updated successfully. Rules applied to all 6 campuses.
          </span>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Academic & Exam Cutoff Policies */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic & Examination Rules</h3>
              <p className="text-[11px] text-slate-500">Hall ticket eligibility and risk monitoring thresholds</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Attendance Risk Cutoff: <span className="text-amber-600 font-extrabold">{attendanceThreshold}%</span>
              </label>
              <input
                type="range"
                min="65"
                max="85"
                step="1"
                value={attendanceThreshold}
                onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Students below {attendanceThreshold}% attendance are flagged as exam eligibility risks across all campuses.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mandatory Trustee Sanction Threshold (₹)
              </label>
              <input
                type="number"
                value={requireTrusteeSanctionAbove}
                onChange={(e) => setRequireTrusteeSanctionAbove(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Any tuition concession exceeding this threshold requires physical Trustee Board memo verification.
              </span>
            </div>
          </div>
        </div>

        {/* 2. Ingestion Pipeline & Spreadsheet Integrity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spreadsheet Ingestion Rules</h3>
              <p className="text-[11px] text-slate-500">Automated ingestion frequency and stale data detection</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Spreadsheet Poll Cadence
              </label>
              <select
                value={ingestionCadence}
                onChange={(e) => setIngestionCadence(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="15m">Every 15 Minutes (Near Real-Time)</option>
                <option value="hourly">Hourly Automated Scan (Recommended)</option>
                <option value="daily">Daily Midnight Batch Reconciliation</option>
              </select>
              <span className="text-[11px] text-slate-400 block mt-1">
                Poll frequency for the 40 campus departmental spreadsheets.
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Stale Sync Warning Threshold
              </label>
              <select
                value={staleWarningHours}
                onChange={(e) => setStaleWarningHours(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={24}>24 Hours Delay</option>
                <option value={48}>48 Hours Delay (Standard)</option>
                <option value={72}>72 Hours Delay</option>
                <option value={96}>96 Hours Delay (Campus 3 Current)</option>
              </select>
              <span className="text-[11px] text-slate-400 block mt-1">
                Trigger high-priority alert if a campus attendance or fee feed halts.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Reconciliation & Anomaly Engine */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automated Audit & Anomaly Engine</h3>
              <p className="text-[11px] text-slate-500">Duplicate detection and capacity enforcement</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoFlagDuplicateUtr}
                onChange={(e) => setAutoFlagDuplicateUtr(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-800">Auto-Flag Duplicate Bank UTR Entries</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automatically raises critical exception if identical bank reference appears across multiple spreadsheets.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                checked={strictHostelSanctionCheck}
                onChange={(e) => setStrictHostelSanctionCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-bold text-slate-800">Strict Hostel Sanction Enforcement</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Flag hostel room occupancy that exceeds sanctioned architectural bed counts (e.g. 4 beds in 3-bed room).
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 4. Future Backend & Database Connection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Server size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API & Database Integration Hook</h3>
              <p className="text-[11px] text-slate-500">Prepared for Node.js/Express backend integration</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Backend API Gateway URL (Target)
              </label>
              <input
                type="text"
                readOnly
                value="https://api.trustview.edu.in/v1 (Mock Prototype Active)"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Frontend consumes <code>src/services/*</code> abstraction. Zero code refactoring needed for backend handover.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px]">
              <div className="font-bold mb-1">Hackathon Architecture Notice</div>
              During this frontend phase, synthetic demonstration data is stored in memory. Real secrets or production MongoDB connection strings are excluded for security.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}