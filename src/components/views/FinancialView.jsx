import React from 'react';
import {
  IndianRupee,
  Download
} from 'lucide-react';
import { MOCK_CAMPUSES } from '../../data/mockData';
import { formatINR, exportToCSV } from '../../utils/calculations';
import CollectionChart from '../dashboard/CollectionChart';

export default function FinancialView({
  collectionTrends = [],
  selectedCampusId = 'all',
  onSelectCampus,
  onNavigateView
}) {
  const filteredCampuses = selectedCampusId === 'all'
    ? MOCK_CAMPUSES
    : MOCK_CAMPUSES.filter(c => c.id === selectedCampusId);

  const totalAssessed = filteredCampuses.reduce((acc, c) => acc + c.assessedFees, 0);
  const totalConcessions = filteredCampuses.reduce((acc, c) => acc + c.concessions, 0);
  const totalVerified = filteredCampuses.reduce((acc, c) => acc + c.verifiedPayments, 0);
  const totalOutstanding = filteredCampuses.reduce((acc, c) => acc + c.outstandingFees, 0);
  const collectionRate = Number(((totalVerified / (totalAssessed - totalConcessions)) * 100).toFixed(1));

  const handleExportFinancials = () => {
    const dateStr = '2026-10-28';
    const filename = `TrustView_Financial_Ledger_${dateStr}.csv`;
    const columns = [
      { key: 'name', label: 'Campus Name' },
      { key: 'code', label: 'Code' },
      { key: 'assessedFees', label: 'Gross Assessed (₹)', formatter: v => formatINR(v) },
      { key: 'concessions', label: 'Concessions (₹)', formatter: v => formatINR(v) },
      { key: 'netAssessed', label: 'Net Payable (₹)', formatter: (_, r) => formatINR(r.assessedFees - r.concessions) },
      { key: 'verifiedPayments', label: 'Verified Collections (₹)', formatter: v => formatINR(v) },
      { key: 'outstandingFees', label: 'Outstanding Balance (₹)', formatter: v => formatINR(v) },
      { key: 'recoveryRate', label: 'Recovery Rate %', formatter: (_, r) => `${((r.verifiedPayments / (r.assessedFees - r.concessions)) * 100).toFixed(1)}%` }
    ];
    exportToCSV(filteredCampuses, columns, filename);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <IndianRupee size={13} />
            Central Fee Ingestion & Reconciliation
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Financial & Fee Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified fee collections, concessions, and outstanding balances from campus bank feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCampusId}
            onChange={(e) => onSelectCampus && onSelectCampus(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All 6 Campuses</option>
            {MOCK_CAMPUSES.map(c => (
              <option key={c.id} value={c.id}>{c.shortName}</option>
            ))}
          </select>

          <button
            onClick={handleExportFinancials}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download size={14} />
            <span>Export Financial Schedule</span>
          </button>
        </div>
      </div>

      {/* Finance Management Suite Launcher Banner */}
      {onNavigateView && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-md border border-emerald-800/50 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300">
              <IndianRupee size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Full 16-Module Finance Management Suite</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  16 Pages Integrated
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Executive overview, fee structures, installment schedules, receipts, concessions, refund workflows, vendor expenses, budgets, and audit history.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateView('finance_management')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Open Finance Suite →</span>
          </button>
        </div>
      )}

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Assessed Fees</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{formatINR(totalAssessed)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tuition & campus fees billed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Concessions</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{formatINR(totalConcessions)}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Merit & trust scholarships</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified Collections</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{formatINR(totalVerified)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Recovery: {collectionRate}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{formatINR(totalOutstanding)}</div>
          <span className="text-[11px] text-rose-500 font-medium mt-1 block">Due across academic ledgers</span>
        </div>
      </div>

      {/* Collection Chart */}
      <CollectionChart data={collectionTrends} reportingPeriod="Verified Collections vs Target" />

      {/* Campus Financial Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Campus-by-Campus Fee Schedule & Recovery Status
          </h3>
          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold">
            AY 2025–26
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Campus Name</th>
                <th className="py-3 px-4">Institution Category</th>
                <th className="py-3 px-4">Gross Assessed</th>
                <th className="py-3 px-4">Concessions</th>
                <th className="py-3 px-4">Verified Bank Credits</th>
                <th className="py-3 px-4">Outstanding Fees</th>
                <th className="py-3 px-4">Recovery %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampuses.map(campus => {
                const recRate = ((campus.verifiedPayments / (campus.assessedFees - campus.concessions)) * 100).toFixed(1);
                return (
                  <tr key={campus.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{campus.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{campus.institutionType}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{formatINR(campus.assessedFees)}</td>
                    <td className="py-3.5 px-4 text-indigo-600">{formatINR(campus.concessions)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{formatINR(campus.verifiedPayments)}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">{formatINR(campus.outstandingFees)}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {recRate}%
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
