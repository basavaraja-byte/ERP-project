import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Download,
  RotateCcw
} from 'lucide-react';
import { formatINR, formatNumber, calculateOccupancyPercentage, exportToCSV } from '../../utils/calculations';

export default function CampusPerformanceTable({
  campuses = [],
  onSelectCampus,
  selectedCampusId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortField, setSortField] = useState('studentCount');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAllOverride, setShowAllOverride] = useState(false);

  const isSingleScoped = selectedCampusId && selectedCampusId !== 'all' && !showAllOverride;

  // Filter & Search
  const filteredCampuses = useMemo(() => {
    return campuses.filter((campus) => {
      const matchesScope = !isSingleScoped || campus.id === selectedCampusId;

      const matchesSearch =
        campus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campus.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campus.principalName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'all' ||
        (filterType === 'engineering' && campus.code.includes('ENG')) ||
        (filterType === 'polytechnic' && campus.code.includes('POLY')) ||
        (filterType === 'school' && campus.code.includes('SCH')) ||
        (filterType === 'higher_ed' && (campus.code.includes('GEN') || campus.code.includes('PG')));

      return matchesScope && matchesSearch && matchesType;
    });
  }, [campuses, searchTerm, filterType, isSingleScoped, selectedCampusId]);

  // Sorting
  const sortedCampuses = useMemo(() => {
    const list = [...filteredCampuses];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'occupancy') {
        aVal = calculateOccupancyPercentage(a.hostelOccupied, a.hostelCapacity);
        bVal = calculateOccupancyPercentage(b.hostelOccupied, b.hostelCapacity);
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [filteredCampuses, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const filename = `TrustView_Campus_Performance_${new Date().toISOString().slice(0, 10)}.csv`;
    const columns = [
      { key: 'name', label: 'Campus Name' },
      { key: 'code', label: 'Campus Code' },
      { key: 'institutionType', label: 'Category' },
      { key: 'principalName', label: 'Principal' },
      { key: 'studentCount', label: 'Enrolled Students', formatter: v => formatNumber(v) },
      { key: 'outstandingFees', label: 'Outstanding Balance (₹)', formatter: v => formatINR(v) },
      { key: 'hostelOccupied', label: 'Occupied Beds', formatter: v => formatNumber(v) },
      { key: 'hostelCapacity', label: 'Sanctioned Beds', formatter: v => formatNumber(v) },
      { key: 'occupancy', label: 'Hostel Occupancy %', formatter: (_, r) => `${calculateOccupancyPercentage(r.hostelOccupied, r.hostelCapacity)}%` },
      { key: 'attendanceRiskCount', label: 'Attendance Risk (<75%)', formatter: v => formatNumber(v) },
      { key: 'openExceptionCount', label: 'Open Ingestion Exceptions', formatter: v => formatNumber(v) }
    ];
    exportToCSV(sortedCampuses, columns, filename);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-6">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Institutional Performance & Ledger Integrity
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated operational metrics across the 6 educational campuses
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search campus or principal…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Institution Types</option>
            <option value="engineering">Engineering</option>
            <option value="polytechnic">Polytechnic</option>
            <option value="higher_ed">Higher Ed & Arts/PG</option>
            <option value="school">K-12 School</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            title="Export filtered table to CSV"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Scope banner if filtered to single campus */}
      {isSingleScoped && (
        <div className="px-5 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Scope active: <strong>{campuses.find(c => c.id === selectedCampusId)?.shortName || 'Single Campus'}</strong> (showing 1 campus record)</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAllOverride(true)}
              className="text-xs text-blue-700 hover:text-blue-900 underline font-semibold"
            >
              Show all 6 campuses
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                setShowAllOverride(false);
                if (onSelectCampus) onSelectCampus('all');
              }}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <RotateCcw size={12} />
              <span>Reset filter</span>
            </button>
          </div>
        </div>
      )}

      {showAllOverride && selectedCampusId && selectedCampusId !== 'all' && (
        <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <span>Comparing all campuses with <strong>{campuses.find(c => c.id === selectedCampusId)?.shortName}</strong> highlighted</span>
          <button
            onClick={() => setShowAllOverride(false)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Re-scope to selected
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4">Campus / Code</th>
              <th className="py-3 px-4">Institution Category</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('studentCount')}
              >
                <div className="flex items-center gap-1">
                  <span>Students</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('outstandingFees')}
              >
                <div className="flex items-center gap-1">
                  <span>Outstanding Fees</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('occupancy')}
              >
                <div className="flex items-center gap-1">
                  <span>Hostel Beds (%)</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('attendanceRiskCount')}
              >
                <div className="flex items-center gap-1">
                  <span>Attendance Risk</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => handleSort('openExceptionCount')}
              >
                <div className="flex items-center gap-1">
                  <span>Open Exceptions</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Drilldown</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedCampuses.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No campus records found matching the filter criteria.
                </td>
              </tr>
            ) : (
              sortedCampuses.map((campus) => {
                const occRate = calculateOccupancyPercentage(
                  campus.hostelOccupied,
                  campus.hostelCapacity
                );
                const isSelected = selectedCampusId === campus.id;

                return (
                  <tr
                    key={campus.id}
                    onClick={() => onSelectCampus(campus.id)}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/60 font-medium' : ''
                    }`}
                  >
                    {/* Campus Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {campus.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {campus.code} • {campus.location}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {campus.institutionType}
                    </td>

                    {/* Students */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNumber(campus.studentCount)}
                    </td>

                    {/* Outstanding */}
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      {formatINR(campus.outstandingFees)}
                    </td>

                    {/* Hostel */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 min-w-[100px]">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-800">{occRate}%</span>
                          <span className="text-slate-400">
                            {campus.hostelOccupied}/{campus.hostelCapacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              occRate > 90 ? 'bg-amber-500' : 'bg-cyan-600'
                            }`}
                            style={{ width: `${occRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Attendance Risk */}
                    <td className="py-3.5 px-4">
                      {campus.attendanceRiskCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle size={12} />
                          {campus.attendanceRiskCount} students
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 size={13} /> 0 flagged
                        </span>
                      )}
                    </td>

                    {/* Exceptions */}
                    <td className="py-3.5 px-4">
                      {campus.openExceptionCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <FileSpreadsheet size={12} />
                          {campus.openExceptionCount} open
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-medium">Reconciled</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCampus(campus.id);
                        }}
                        className="p-1.5 text-slate-400 group-hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View campus detail"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Showing {sortedCampuses.length} of {campuses.length} institutional campuses</span>
        <span className="text-[11px] text-slate-400">Click any row to filter dashboard or view detailed campus operational summary</span>
      </div>
    </div>
  );
}
