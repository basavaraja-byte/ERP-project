import React from 'react';
import {
  Users,
  Building2,
  IndianRupee,
  BedDouble,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight
} from 'lucide-react';
import { formatINR, formatNumber } from '../../utils/calculations';

export default function KpiCard({ summary, isSingleCampus = false, campusName = '' }) {
  if (!summary) return null;

  const {
    totalStudents = 0,
    outstandingFees = 0,
    collectionRate = 0,
    hostelCapacity = 0,
    hostelOccupied = 0,
    hostelAvailable = 0,
    occupancyRate = 0,
    attendanceRiskCount = 0,
    openExceptionsCount = 0,
    spreadsheetsActive = 40,
    spreadsheetsVerified = 38,
    dataFreshnessWarning = false
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 mb-6">
      {/* 1. Total Students */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(totalStudents)}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight size={12} /> +4.2%
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Roll Status</span>
            <span className="text-emerald-700 font-semibold">Active Enrolled</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
            {isSingleCampus ? campusName : 'Across 6 campuses'}
          </span>
        </div>
      </div>

      {/* 2. Active Campuses / Scope */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              {isSingleCampus ? 'Institution Scope' : 'Active Campuses'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isSingleCampus ? '1 Campus' : '6 Campuses'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Spreadsheets</span>
            <span className="font-semibold text-slate-700">
              {spreadsheetsVerified}/{spreadsheetsActive} verified
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
            {isSingleCampus ? 'Autonomous Division' : 'Consolidated Trust'}
          </span>
        </div>
      </div>

      {/* 3. Fee Collection & Outstanding */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Outstanding Fees
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <IndianRupee size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {formatINR(outstandingFees, true)}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Recovery Rate</span>
            <span className="font-bold text-emerald-700">{collectionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, collectionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Hostel Occupancy */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Hostel Occupancy
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <BedDouble size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Occupied Beds</span>
            <span className="font-semibold text-slate-700">{formatNumber(hostelOccupied)}/{formatNumber(hostelCapacity)}</span>
          </div>
          <span className="text-[10px] text-cyan-600 font-medium block truncate mt-0.5">
            {formatNumber(hostelAvailable)} vacant beds
          </span>
        </div>
      </div>

      {/* 5. Attendance Risk */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Attendance Risk
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
              {formatNumber(attendanceRiskCount)}
            </span>
            <span className="text-[10px] text-slate-400">students</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Cutoff (&lt;75%)</span>
            {dataFreshnessWarning ? (
              <span className="text-amber-700 font-bold text-[9px] bg-amber-50 px-1.5 py-0.2 rounded">Stale Feed</span>
            ) : (
              <span className="text-emerald-700 font-semibold text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded">Verified</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
            Exam eligibility alert
          </span>
        </div>
      </div>

      {/* 6. Pending Ingestion Exceptions */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Open Exceptions
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={16} />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className={`text-2xl font-extrabold tracking-tight ${openExceptionsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {openExceptionsCount}
            </span>
            <span className="text-[10px] text-slate-400">conflicts</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span>Spreadsheet Audit</span>
            <span className={`font-semibold ${openExceptionsCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {openExceptionsCount > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
            Ingestion validator
          </span>
        </div>
      </div>
    </div>
  );
}
