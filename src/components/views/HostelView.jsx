import React from 'react';
import { BedDouble, CheckCircle2, Download } from 'lucide-react';
import { MOCK_CAMPUSES } from '../../data/mockData';
import { formatNumber, calculateOccupancyPercentage, exportToCSV } from '../../utils/calculations';

export default function HostelView({ selectedCampusId = 'all', onSelectCampus }) {
  const filtered = selectedCampusId === 'all'
    ? MOCK_CAMPUSES
    : MOCK_CAMPUSES.filter(c => c.id === selectedCampusId);

  const totalCap = filtered.reduce((sum, c) => sum + c.hostelCapacity, 0);
  const totalOcc = filtered.reduce((sum, c) => sum + c.hostelOccupied, 0);
  const totalAvail = Math.max(0, totalCap - totalOcc);
  const avgRate = calculateOccupancyPercentage(totalOcc, totalCap);

  const handleExportHostel = () => {
    const dateStr = '2026-10-28';
    const filename = `TrustView_Hostel_Inventory_${dateStr}.csv`;
    const columns = [
      { key: 'name', label: 'Campus Name' },
      { key: 'hostelCapacity', label: 'Sanctioned Beds', formatter: v => formatNumber(v) },
      { key: 'hostelOccupied', label: 'Occupied Beds', formatter: v => formatNumber(v) },
      { key: 'available', label: 'Vacant Beds', formatter: (_, r) => formatNumber(r.hostelCapacity - r.hostelOccupied) },
      { key: 'rate', label: 'Occupancy %', formatter: (_, r) => `${calculateOccupancyPercentage(r.hostelOccupied, r.hostelCapacity)}%` }
    ];
    exportToCSV(filtered, columns, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 mb-1">
            <BedDouble size={13} />
            Institutional Hostel Inventory & Sanction Roster
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Hostel Occupancy & Bed Allocation
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated residential capacities, verified student keys, and safety compliance
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
            onClick={handleExportHostel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Hostel Roster</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sanctioned Capacity</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatNumber(totalCap)} Beds</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all hostel blocks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupied Beds</span>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1">{formatNumber(totalOcc)} Beds</div>
          <span className="text-[11px] text-cyan-700 font-semibold mt-1 block">Active resident students</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Beds</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{formatNumber(totalAvail)} Vacant</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Ready for allocation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{avgRate}%</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Formula: (Occupied ÷ Cap) × 100</span>
        </div>
      </div>

      {/* Campus Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const rate = calculateOccupancyPercentage(c.hostelOccupied, c.hostelCapacity);
          const vacant = Math.max(0, c.hostelCapacity - c.hostelOccupied);
          return (
            <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    rate > 90 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {rate}% Occupied
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1">{c.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{c.location}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Capacity:</span>
                    <span className="font-bold text-slate-900">{formatNumber(c.hostelCapacity)} beds</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Occupied:</span>
                    <span className="font-bold text-cyan-700">{formatNumber(c.hostelOccupied)} beds</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Vacant:</span>
                    <span className="font-bold text-emerald-700">{formatNumber(vacant)} beds</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-2 rounded-full ${rate > 90 ? 'bg-amber-500' : 'bg-cyan-600'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Spreadsheet: Hostel_Roster_Q2.xlsx</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Sync OK
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
