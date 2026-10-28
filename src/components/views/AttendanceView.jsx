import React from 'react';
import { AlertTriangle, Clock, Download } from 'lucide-react';
import { MOCK_CAMPUSES } from '../../data/mockData';
import { formatNumber, exportToCSV } from '../../utils/calculations';

export default function AttendanceView({ selectedCampusId = 'all', onSelectCampus }) {
  const filtered = selectedCampusId === 'all'
    ? MOCK_CAMPUSES
    : MOCK_CAMPUSES.filter(c => c.id === selectedCampusId);

  const totalRiskCount = filtered.reduce((sum, c) => sum + c.attendanceRiskCount, 0);

  const handleExportAttendanceRisk = () => {
    const dateStr = '2026-10-28';
    const filename = `TrustView_Attendance_Risk_Roster_${dateStr}.csv`;
    const rows = filtered.map(c => ({
      campusName: c.name,
      code: c.code,
      totalStudents: c.studentCount,
      riskCount: c.attendanceRiskCount,
      riskPercentage: `${((c.attendanceRiskCount / c.studentCount) * 100).toFixed(1)}%`,
      status: c.importHealth === 'warning' ? 'Stale Sync (Action Required)' : 'Verified'
    }));
    const columns = [
      { key: 'campusName', label: 'Campus Name' },
      { key: 'code', label: 'Campus Code' },
      { key: 'totalStudents', label: 'Total Enrolled' },
      { key: 'riskCount', label: 'Flagged Students (<75%)' },
      { key: 'riskPercentage', label: 'Risk Rate %' },
      { key: 'status', label: 'Ingestion Status' }
    ];
    exportToCSV(rows, columns, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-1">
            <AlertTriangle size={13} />
            Mandatory Exam Eligibility Cutoff Monitor (75%)
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Risk Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of students below academic eligibility thresholds across 6 institutions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCampusId}
            onChange={(e) => onSelectCampus && onSelectCampus(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Campuses</option>
            {MOCK_CAMPUSES.map(c => (
              <option key={c.id} value={c.id}>{c.shortName}</option>
            ))}
          </select>

          <button
            onClick={handleExportAttendanceRisk}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Risk Roster</span>
          </button>
        </div>
      </div>

      {/* Warning Notice for Stale Attendance */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold">Data Freshness Alert: </span>
          <span>
            Campus 3 (Arts & Science) daily attendance bridge has not reported for 96 hours. 
            Do not disqualify examination hall tickets without physical biometric log verification.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students Flagged</span>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{formatNumber(totalRiskCount)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Below 75% attendance threshold</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Trust Risk Rate</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">3.4%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">96.6% eligible for examinations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sync Integrity</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">5 / 6</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Campus feeds currently active</span>
        </div>
      </div>

      {/* Campus Attendance Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Campus-by-Campus Risk Breakdown
          </h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
            Odd Semester 2025
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Campus</th>
                <th className="py-3 px-4">Total Students</th>
                <th className="py-3 px-4">Flagged (&lt;75%)</th>
                <th className="py-3 px-4">Risk Rate</th>
                <th className="py-3 px-4">Biometric Batch Status</th>
                <th className="py-3 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const rate = ((c.attendanceRiskCount / c.studentCount) * 100).toFixed(1);
                const isWarning = c.importHealth === 'warning';
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{formatNumber(c.studentCount)}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-600">{formatNumber(c.attendanceRiskCount)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{rate}%</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {isWarning ? (
                        <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {c.lastSuccessfulImport}
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {c.lastSuccessfulImport}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isWarning
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {isWarning ? 'Review Pending' : 'Current'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
