import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/currency';

export const FeeCategoryBreakdownChart: React.FC = () => {
  const { scopedAssessments } = useFinance();
  const [activeTab, setActiveTab] = useState<'overall' | 'hostel' | 'exam' | 'transport'>('hostel');

  // Colors palette
  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  // Overall Group
  const overallMap: Record<string, number> = {};
  scopedAssessments.forEach(a => {
    const grp = a.fee_group || 'Other';
    overallMap[grp] = (overallMap[grp] || 0) + a.net_amount_due;
  });
  const overallData = Object.entries(overallMap).map(([name, value]) => ({ name, value }));

  // Hostel Breakdown
  const hostelMap: Record<string, number> = {};
  scopedAssessments
    .filter(a => a.fee_group === 'Hostel')
    .forEach(a => {
      const sub = a.fee_subcategory || a.fee_category;
      hostelMap[sub] = (hostelMap[sub] || 0) + a.net_amount_due;
    });
  const hostelData = Object.entries(hostelMap).map(([name, value]) => ({ name, value }));

  // Examination Breakdown
  const examMap: Record<string, number> = {};
  scopedAssessments
    .filter(a => a.fee_group === 'Examination')
    .forEach(a => {
      const sub = a.fee_subcategory || a.fee_category;
      examMap[sub] = (examMap[sub] || 0) + a.net_amount_due;
    });
  const examData = Object.entries(examMap).map(([name, value]) => ({ name, value }));

  // Transport Breakdown
  const transportMap: Record<string, number> = {};
  scopedAssessments
    .filter(a => a.fee_group === 'Transport')
    .forEach(a => {
      const sub = a.fee_subcategory || a.fee_category;
      transportMap[sub] = (transportMap[sub] || 0) + a.net_amount_due;
    });
  const transportData = Object.entries(transportMap).map(([name, value]) => ({ name, value }));

  const currentData = 
    activeTab === 'hostel' ? hostelData :
    activeTab === 'exam' ? examData :
    activeTab === 'transport' ? transportData : overallData;

  const totalCurrentValue = currentData.reduce((sum, item) => sum + item.value, 0);

  interface TooltipPayload {
    name: string;
    value: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
  }

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = totalCurrentValue > 0 ? Math.round((item.value / totalCurrentValue) * 100) : 0;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200">{item.name}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Total Billed:</span>
            <span className="font-bold text-white">{formatINR(item.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Share:</span>
            <span className="text-indigo-300 font-semibold">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Fee Portfolio Composition
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Component distribution for hostel, exams, transport and academic categories
          </p>
        </div>

        {/* Category switcher */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-lg gap-1">
          <button
            onClick={() => setActiveTab('hostel')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'hostel' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hostel Fees
          </button>
          <button
            onClick={() => setActiveTab('overall')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'overall' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'exam' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Examinations
          </button>
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'transport' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transport
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        {currentData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No active fee records found for this category in current scope
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {currentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }} 
                iconType="circle"
                layout="horizontal"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
