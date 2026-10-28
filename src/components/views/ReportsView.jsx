import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  CheckCircle2
} from 'lucide-react';
import { MOCK_CAMPUSES, MOCK_EXCEPTIONS } from '../../data/mockData';
import { formatINR, formatNumber, calculateOccupancyPercentage, exportToCSV } from '../../utils/calculations';

export default function ReportsView({ initialCampus = 'all', onSelectCampus }) {
  const [reportType, setReportType] = useState('financial');
  const [period, setPeriod] = useState('AY 2025–26');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCampus = initialCampus;

  const handleCampusChange = (id) => {
    if (onSelectCampus) onSelectCampus(id);
  };

  // Campuses filtered by selection
  const targetCampuses = useMemo(() => {
    return selectedCampus === 'all'
      ? MOCK_CAMPUSES
      : MOCK_CAMPUSES.filter(c => c.id === selectedCampus);
  }, [selectedCampus]);

  // Generate Report Data depending on selected reportType
  const reportData = useMemo(() => {
    if (reportType === 'financial') {
      return targetCampuses.map(c => ({
        id: c.id,
        campusName: c.name,
        code: c.code,
        category: c.institutionType,
        grossAssessed: c.assessedFees,
        concessions: c.concessions,
        netPayable: c.assessedFees - c.concessions,
        verifiedCollected: c.verifiedPayments,
        outstanding: c.outstandingFees,
        recoveryRate: `${((c.verifiedPayments / (c.assessedFees - c.concessions)) * 100).toFixed(1)}%`
      }));
    }

    if (reportType === 'hostel') {
      return targetCampuses.map(c => {
        const occRate = calculateOccupancyPercentage(c.hostelOccupied, c.hostelCapacity);
        const vacant = Math.max(0, c.hostelCapacity - c.hostelOccupied);
        return {
          id: c.id,
          campusName: c.name,
          code: c.code,
          capacity: c.hostelCapacity,
          occupied: c.hostelOccupied,
          vacant,
          occupancyRate: `${occRate}%`,
          complianceStatus: occRate > 95 ? 'Capacity Warning' : 'Optimal Compliance'
        };
      });
    }

    if (reportType === 'attendance') {
      return targetCampuses.map(c => ({
        id: c.id,
        campusName: c.name,
        code: c.code,
        totalStudents: c.studentCount,
        flaggedStudents: c.attendanceRiskCount,
        riskRate: `${((c.attendanceRiskCount / c.studentCount) * 100).toFixed(1)}%`,
        syncHealth: c.importHealth === 'warning' ? 'Stale (96h Delayed)' : 'Verified Daily Synced',
        actionRequired: c.attendanceRiskCount > 50 ? 'Immediate Hall Ticket Review' : 'Routine Monitoring'
      }));
    }

    if (reportType === 'exceptions') {
      let exList = MOCK_EXCEPTIONS;
      if (selectedCampus !== 'all') {
        exList = exList.filter(e => e.campusId === selectedCampus);
      }
      return exList.map(e => ({
        id: e.id,
        category: e.category,
        priority: e.priority,
        campusName: e.campusName,
        title: e.title,
        sourceReference: e.sourceReference,
        status: e.status,
        amount: e.amount ? formatINR(e.amount) : 'N/A',
        createdAt: e.createdAt,
        suggestedAction: e.suggestedAction
      }));
    }

    if (reportType === 'departmental') {
      const rows = [];
      targetCampuses.forEach(c => {
        c.departments.forEach(d => {
          rows.push({
            id: `${c.id}-${d.name}`,
            campusName: c.shortName,
            department: d.name,
            students: d.students,
            attendanceRate: `${d.attendanceRate}%`,
            feeCollectionRate: `${d.feeCollectionRate}%`,
            academicStanding: d.attendanceRate >= 80 ? 'Good Standing' : 'Attendance Caution'
          });
        });
      });
      return rows;
    }

    return [];
  }, [reportType, targetCampuses, selectedCampus]);

  // Filter with Search Term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return reportData;
    const q = searchTerm.toLowerCase();
    return reportData.filter(row => {
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(q)
      );
    });
  }, [reportData, searchTerm]);

  // Export to CSV with Dynamic Columns
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `TrustView_${reportType.toUpperCase()}_Report_${timestamp}.csv`;

    let columns = [];

    if (reportType === 'financial') {
      columns = [
        { key: 'campusName', label: 'Campus Name' },
        { key: 'code', label: 'Campus Code' },
        { key: 'category', label: 'Institution Type' },
        { key: 'grossAssessed', label: 'Gross Assessed (₹)', formatter: v => formatINR(v) },
        { key: 'concessions', label: 'Concessions (₹)', formatter: v => formatINR(v) },
        { key: 'netPayable', label: 'Net Payable (₹)', formatter: v => formatINR(v) },
        { key: 'verifiedCollected', label: 'Verified Collected (₹)', formatter: v => formatINR(v) },
        { key: 'outstanding', label: 'Outstanding Balance (₹)', formatter: v => formatINR(v) },
        { key: 'recoveryRate', label: 'Recovery Rate' }
      ];
    } else if (reportType === 'hostel') {
      columns = [
        { key: 'campusName', label: 'Campus Name' },
        { key: 'code', label: 'Campus Code' },
        { key: 'capacity', label: 'Sanctioned Beds', formatter: v => formatNumber(v) },
        { key: 'occupied', label: 'Occupied Beds', formatter: v => formatNumber(v) },
        { key: 'vacant', label: 'Vacant Beds', formatter: v => formatNumber(v) },
        { key: 'occupancyRate', label: 'Occupancy Rate' },
        { key: 'complianceStatus', label: 'Compliance Status' }
      ];
    } else if (reportType === 'attendance') {
      columns = [
        { key: 'campusName', label: 'Campus Name' },
        { key: 'code', label: 'Campus Code' },
        { key: 'totalStudents', label: 'Enrolled Students', formatter: v => formatNumber(v) },
        { key: 'flaggedStudents', label: 'Flagged (<75%)', formatter: v => formatNumber(v) },
        { key: 'riskRate', label: 'Risk Rate' },
        { key: 'syncHealth', label: 'Biometric Sync Health' },
        { key: 'actionRequired', label: 'Recommended Action' }
      ];
    } else if (reportType === 'exceptions') {
      columns = [
        { key: 'id', label: 'Exception ID' },
        { key: 'category', label: 'Anomaly Category' },
        { key: 'priority', label: 'Priority' },
        { key: 'campusName', label: 'Campus' },
        { key: 'title', label: 'Issue Summary' },
        { key: 'sourceReference', label: 'Source Spreadsheet Reference' },
        { key: 'status', label: 'Status' },
        { key: 'amount', label: 'Amount Involved' },
        { key: 'createdAt', label: 'Flagged Timestamp' },
        { key: 'suggestedAction', label: 'Action Protocol' }
      ];
    } else if (reportType === 'departmental') {
      columns = [
        { key: 'campusName', label: 'Campus' },
        { key: 'department', label: 'Department / Section' },
        { key: 'students', label: 'Enrolled Students', formatter: v => formatNumber(v) },
        { key: 'attendanceRate', label: 'Avg Attendance Rate' },
        { key: 'feeCollectionRate', label: 'Fee Collection Rate' },
        { key: 'academicStanding', label: 'Academic Standing' }
      ];
    }

    exportToCSV(filteredRows, columns, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <FileText size={13} />
            Executive Reports & Audit Export Center
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Reports & Data Exports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate verifiable tabular summaries for Board meetings, syndicate review, and statutory audits
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredRows.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <Download size={15} />
          <span>Export Displayed Data (CSV)</span>
        </button>
      </div>

      {/* Control Panel: Filters, Report Switcher, Search */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Report Type Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Report Subject
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="financial">Consolidated Financial Schedule</option>
              <option value="hostel">Hostel Inventory & Occupancy Roster</option>
              <option value="attendance">Attendance & Exam Eligibility Risk</option>
              <option value="exceptions">Operational Ingestion Exceptions Log</option>
              <option value="departmental">Departmental Student & Fee Breakdown</option>
            </select>
          </div>

          {/* Campus Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Campus Scope
            </label>
            <select
              value={selectedCampus}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All 6 Campuses (Consolidated)</option>
              {MOCK_CAMPUSES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Academic Period */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Reporting Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="AY 2025–26">Academic Year 2025–26</option>
              <option value="Odd Sem 2025">Odd Semester 2025</option>
              <option value="Q2 FY25">Quarter 2 (Jul–Sep 2025)</option>
              <option value="Oct 2025">Current Month (Oct 2025)</option>
            </select>
          </div>

          {/* Table Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Filter Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search rows…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Report Statistics Pill */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Total Rows Displayed:</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {filteredRows.length} records
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 size={13} className="text-emerald-500" />
            <span>UTF-8 BOM Encoded CSV format • Fully compatible with Microsoft Excel & Google Sheets</span>
          </div>
        </div>
      </div>

      {/* Rendered Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Report Data Preview
          </h3>
          <span className="text-[11px] text-slate-500">
            Scope: {selectedCampus === 'all' ? 'Trust-Wide' : targetCampuses[0]?.shortName} • {period}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-semibold z-10">
              {reportType === 'financial' && (
                <tr>
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Gross Assessed</th>
                  <th className="py-3 px-4">Concessions</th>
                  <th className="py-3 px-4">Net Payable</th>
                  <th className="py-3 px-4">Verified Collected</th>
                  <th className="py-3 px-4">Outstanding Balance</th>
                  <th className="py-3 px-4 text-right">Recovery Rate</th>
                </tr>
              )}

              {reportType === 'hostel' && (
                <tr>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Sanctioned Beds</th>
                  <th className="py-3 px-4">Occupied Beds</th>
                  <th className="py-3 px-4">Vacant Beds</th>
                  <th className="py-3 px-4">Occupancy Rate</th>
                  <th className="py-3 px-4 text-right">Compliance Status</th>
                </tr>
              )}

              {reportType === 'attendance' && (
                <tr>
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">Enrolled Students</th>
                  <th className="py-3 px-4">Flagged (&lt;75%)</th>
                  <th className="py-3 px-4">Risk Rate</th>
                  <th className="py-3 px-4">Biometric Sync Health</th>
                  <th className="py-3 px-4 text-right">Action Protocol</th>
                </tr>
              )}

              {reportType === 'exceptions' && (
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Spreadsheet Source</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              )}

              {reportType === 'departmental' && (
                <tr>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Academic Division / Department</th>
                  <th className="py-3 px-4">Students Enrolled</th>
                  <th className="py-3 px-4">Avg Attendance Rate</th>
                  <th className="py-3 px-4">Fee Collection Rate</th>
                  <th className="py-3 px-4 text-right">Academic Standing</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching records found for the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    {reportType === 'financial' && (
                      <>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.campusName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.category}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{formatINR(row.grossAssessed)}</td>
                        <td className="py-3.5 px-4 text-indigo-600">{formatINR(row.concessions)}</td>
                        <td className="py-3.5 px-4 text-slate-800">{formatINR(row.netPayable)}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">{formatINR(row.verifiedCollected)}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">{formatINR(row.outstanding)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-blue-600">{row.recoveryRate}</span>
                        </td>
                      </>
                    )}

                    {reportType === 'hostel' && (
                      <>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.campusName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{row.code}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{formatNumber(row.capacity)}</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-700">{formatNumber(row.occupied)}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{formatNumber(row.vacant)}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-600">{row.occupancyRate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.complianceStatus}
                          </span>
                        </td>
                      </>
                    )}

                    {reportType === 'attendance' && (
                      <>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.campusName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{formatNumber(row.totalStudents)}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">{formatNumber(row.flaggedStudents)}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{row.riskRate}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.syncHealth}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[10px] font-semibold text-slate-600">{row.actionRequired}</span>
                        </td>
                      </>
                    )}

                    {reportType === 'exceptions' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{row.id}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{row.category}</td>
                        <td className="py-3.5 px-4 text-slate-600">{row.campusName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">{row.title}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{row.sourceReference}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.amount}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-xs font-bold text-blue-600">{row.status}</span>
                        </td>
                      </>
                    )}

                    {reportType === 'departmental' && (
                      <>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.campusName}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">{row.department}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{formatNumber(row.students)}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.attendanceRate}</td>
                        <td className="py-3.5 px-4 font-semibold text-blue-600">{row.feeCollectionRate}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {row.academicStanding}
                          </span>
                        </td>
                      </>
                    )}
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