import React from 'react';
import { Download, RefreshCw, Calendar, ShieldCheck, AlertCircle, Building2, Database, ArrowLeft } from 'lucide-react';
import { exportToCSV, formatINR, formatNumber } from '../../utils/calculations';
import { MOCK_CAMPUSES } from '../../data/mockData';

export default function Header({
  userRole,
  selectedCampusId,
  reportingPeriod,
  setReportingPeriod,
  onRefresh,
  isRefreshing,
  campusesData = MOCK_CAMPUSES,
  isLiveFromDb = false,
  onBackToAllCampuses
}) {
  const isAll = selectedCampusId === 'all';
  const isTrustee = (userRole || '').toLowerCase() === 'trustee';
  const selectedCampus = campusesData.find(c => (c.id === selectedCampusId || c.campusId === selectedCampusId));

  const handleExportCSV = () => {
    const filename = `TrustView_${isAll ? 'Consolidated_Trust' : selectedCampus?.shortName.replace(/\s+/g, '_')}_Report_${reportingPeriod}.csv`;

    const exportRows = isAll ? campusesData : [selectedCampus];
    const columns = [
      { key: 'name', label: 'Campus Name' },
      { key: 'code', label: 'Institution Code' },
      { key: 'institutionType', label: 'Category' },
      { key: 'principalName', label: 'Principal / Head' },
      { key: 'studentCount', label: 'Active Students', formatter: v => formatNumber(v) },
      { key: 'assessedFees', label: 'Gross Assessed Fees', formatter: v => formatINR(v) },
      { key: 'concessions', label: 'Fee Concessions', formatter: v => formatINR(v) },
      { key: 'verifiedPayments', label: 'Verified Collections', formatter: v => formatINR(v) },
      { key: 'outstandingFees', label: 'Outstanding Balance', formatter: v => formatINR(v) },
      { key: 'hostelCapacity', label: 'Hostel Bed Capacity', formatter: v => formatNumber(v) },
      { key: 'hostelOccupied', label: 'Occupied Beds', formatter: v => formatNumber(v) },
      { key: 'attendanceRiskCount', label: 'Attendance Risk Count (<75%)', formatter: v => formatNumber(v) },
      { key: 'openExceptionCount', label: 'Open Data Exceptions', formatter: v => formatNumber(v) },
      { key: 'lastSuccessfulImport', label: 'Spreadsheet Ingestion Timestamp' }
    ];

    exportToCSV(exportRows, columns, filename);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Dean View Demonstration / Live Scoping Notice */}
      {userRole === 'dean' && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 text-indigo-900 text-xs">
          <AlertCircle size={18} className="text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Dean Academic Scope ({selectedCampus?.name || 'Campus 1'}): </span>
            <span>
              Showing academic &amp; faculty oversight scoped strictly to assigned campus (<strong>{selectedCampus?.shortName || selectedCampus?.name || 'Campus 1'}</strong>).
              {isLiveFromDb
                ? ' Metrics dynamically queried from MongoDB Atlas live database.'
                : ' Displaying synchronized institutional baseline records.'}
            </span>
          </div>
        </div>
      )}

      {/* Principal View Demonstration / Live Scoping Notice */}
      {userRole === 'principal' && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Principal Operational Scope ({selectedCampus?.name || 'Campus 1'}): </span>
            <span>
              Showing operational and administrative scope restricted to assigned campus (<strong>{selectedCampus?.shortName || selectedCampus?.name || 'Campus 1'}</strong>).
              {isLiveFromDb
                ? ' Metrics dynamically queried from MongoDB Atlas live database.'
                : ' Displaying synchronized institutional baseline records.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Prominent Back to All Campuses Navigation Button for Trustee */}
          {isTrustee && !isAll && onBackToAllCampuses && (
            <div className="mb-3">
              <button
                type="button"
                onClick={onBackToAllCampuses}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
                title="Return to Trustee 6-Campus Selection Grid"
              >
                <ArrowLeft size={16} className="text-white group-hover:-translate-x-1 transition-transform" />
                <span>← Back to All Campuses</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
              <Building2 size={13} />
              {isAll ? 'Trust-Wide Consolidated Scope' : selectedCampus?.shortName}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <ShieldCheck size={13} />
              40 Spreadsheets Reconciled
            </span>
            {isLiveFromDb ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                title="Metrics dynamically queried from MongoDB Atlas replica set"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Database size={12} className="text-emerald-600" />
                <span>Dataset: Live Database (MongoDB Atlas)</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs"
                title="Metrics served from synchronized demonstration cache"
              >
                <Database size={12} className="text-amber-600" />
                <span>Dataset: Synthetic Demo Records (AY 2025–26)</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Role: {userRole === 'trustee' ? 'Trustee' : userRole === 'dean' ? 'Dean' : 'Principal'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {userRole === 'trustee'
              ? (isAll ? 'Trust Consolidated Management Overview' : `Trustee Campus Audit: ${selectedCampus?.shortName}`)
              : userRole === 'dean'
              ? `Campus Academic Overview: ${selectedCampus?.shortName || 'Campus 1'}`
              : `Campus Operational Overview: ${selectedCampus?.shortName || 'Campus 1'}`}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {isAll
              ? 'Consolidated management metrics across all 6 institutions, ~14,280 students, and active spreadsheet ingestion batches.'
              : userRole === 'dean'
              ? `${selectedCampus?.institutionType} • Academic & Faculty Leadership`
              : `${selectedCampus?.institutionType} • Led by ${selectedCampus?.principalName}`}
          </p>
        </div>

        {/* Controls: Period Selector, Refresh, Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 shadow-2xs hover:border-slate-400 transition-colors">
            <Calendar size={14} className="text-slate-400" />
            <select
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              aria-label="Select reporting period"
            >
              <option value="AY 2025–26">Academic Year 2025–26</option>
              <option value="Odd Semester 2025">Odd Semester 2025</option>
              <option value="Q2 FY25">Quarter 2 (Jul–Sep 2025)</option>
              <option value="Current Month">Current Month (Oct 2025)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-60"
            title="Re-fetch spreadsheet ingestion state"
          >
            <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Report (CSV) */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all active:scale-95"
            title="Download verified data as CSV"
          >
            <Download size={14} />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
