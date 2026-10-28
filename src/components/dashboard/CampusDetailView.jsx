import React from 'react';
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Download
} from 'lucide-react';
import KpiCard from './KpiCard';
import CollectionChart from './CollectionChart';
import CampusComparisonChart from './CampusComparisonChart';
import { formatNumber, exportToCSV } from '../../utils/calculations';

export default function CampusDetailView({
  campus,
  onBackToTrust,
  collectionTrends = [],
  exceptions = [],
  onInspectException,
  isLiveFromDb = false
}) {
  if (!campus) return null;

  const campusSummary = {
    totalStudents: campus.studentCount,
    assessedFees: campus.assessedFees,
    concessions: campus.concessions,
    verifiedPayments: campus.verifiedPayments,
    outstandingFees: campus.outstandingFees,
    collectionRate: Number(
      ((campus.verifiedPayments / (campus.assessedFees - campus.concessions)) * 100).toFixed(1)
    ),
    hostelCapacity: campus.hostelCapacity,
    hostelOccupied: campus.hostelOccupied,
    hostelAvailable: Math.max(0, campus.hostelCapacity - campus.hostelOccupied),
    occupancyRate: Number(((campus.hostelOccupied / campus.hostelCapacity) * 100).toFixed(1)),
    attendanceRiskCount: campus.attendanceRiskCount,
    openExceptionsCount: campus.openExceptionCount,
    dataFreshnessWarning: campus.importHealth === 'warning'
  };

  const localExceptions = exceptions.filter(e => e.campusId === campus.id);

  const handleExportCampusData = () => {
    const filename = `TrustView_${campus.shortName.replace(/\s+/g, '_')}_Dossier.csv`;
    const rows = campus.departments.map(d => ({
      campusName: campus.name,
      department: d.name,
      students: d.students,
      attendanceRate: `${d.attendanceRate}%`,
      feeCollectionRate: `${d.feeCollectionRate}%`
    }));
    const columns = [
      { key: 'campusName', label: 'Campus' },
      { key: 'department', label: 'Department / Section' },
      { key: 'students', label: 'Enrolled Students' },
      { key: 'attendanceRate', label: 'Average Attendance Rate' },
      { key: 'feeCollectionRate', label: 'Fee Collection Rate' }
    ];
    exportToCSV(rows, columns, filename);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToTrust}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
          title="Return to Trustee 6-Campus Selection Grid"
        >
          <ArrowLeft size={16} className="text-white group-hover:-translate-x-1 transition-transform" />
          <span>← Back to All Campuses</span>
        </button>

        <button
          onClick={handleExportCampusData}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download size={14} />
          <span>Export Campus Dossier</span>
        </button>
      </div>

      {/* Campus Hero Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              {campus.code.split('-')[0]}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {campus.code}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {campus.institutionType}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {campus.spreadsheetsVerified}/{campus.spreadsheetsActive} Spreadsheets Verified
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {campus.name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  {campus.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  Established {campus.established}
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  Principal: {campus.principalName}
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-mono">
                  <Mail size={13} />
                  {campus.principalEmail}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Last Ingestion Inflow</span>
            <span className="font-mono font-bold text-slate-800">{campus.lastSuccessfulImport}</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> Master Registry Active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards for This Campus */}
      <KpiCard summary={campusSummary} isSingleCampus={true} campusName={campus.shortName} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CollectionChart data={collectionTrends} reportingPeriod={`Scope: ${campus.shortName}`} isLiveFromDb={isLiveFromDb} />
        <CampusComparisonChart isSingleCampus={true} singleCampusData={campus} />
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Student & Fee Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll counts, attendance health, and fee recovery performance by academic division
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {campus.departments.length} Divisions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Department / Program</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Avg. Attendance Rate</th>
                <th className="py-3 px-4">Fee Recovery Rate</th>
                <th className="py-3 px-4 text-right">Academic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campus.departments.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{formatNumber(dept.students)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${dept.attendanceRate < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {dept.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">{dept.feeCollectionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Accredited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Open Exceptions */}
      {localExceptions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-rose-600" size={18} />
              <h3 className="text-sm font-bold text-slate-900">
                Open Ingestion Exceptions for {campus.shortName} ({localExceptions.length})
              </h3>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full">
              Requires Campus Action
            </span>
          </div>

          <div className="space-y-2">
            {localExceptions.map((ex) => (
              <div
                key={ex.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-slate-800">{ex.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {ex.priority}
                    </span>
                    <span className="text-slate-700 font-semibold truncate">{ex.title}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate">{ex.description}</p>
                </div>

                <button
                  onClick={() => onInspectException(ex)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
