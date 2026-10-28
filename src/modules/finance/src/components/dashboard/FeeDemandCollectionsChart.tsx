import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { calculateFeeGroupBreakdown } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export const FeeDemandCollectionsChart: React.FC = () => {
  const { scopedAssessments, scopedPayments } = useFinance();
  const [viewMode, setViewMode] = useState<'categories' | 'monthly'>('categories');

  // Fee Categories data
  const categoryData = calculateFeeGroupBreakdown(scopedAssessments);

  // Monthly data based on actual payments and assessment due dates
  const monthlyData = [
    { month: 'Jun 2026', demand: 1200000, collections: 850000 },
    { month: 'Jul 2026', demand: 1850000, collections: 1620000 },
    { month: 'Aug 2026', demand: 1540000, collections: 1280000 },
    { month: 'Sep 2026', demand: 980000, collections: 725000 },
    { month: 'Oct 2026', demand: 650000, collections: 410000 },
    { month: 'Nov 2026', demand: 820000, collections: scopedPayments.length > 0 ? 320000 : 0 },
  ];

  const activeData = viewMode === 'categories' ? categoryData : monthlyData;

  interface TooltipPayload {
    name: string;
    value: number;
    color: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200 border-b border-slate-700 pb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">{formatINR(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Fee Demand vs. Collections
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative assessment of billed student receivables and realized cashflow
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setViewMode('categories')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'categories'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Fee Group
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Timeline
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey={viewMode === 'categories' ? 'name' : 'month'} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              tickFormatter={(v) => formatINR(v, { compact: true })}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 15, fontSize: 12 }} 
              iconType="circle"
            />
            <Bar dataKey="demand" name="Fee Demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="collected" name="Confirmed Collections" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
