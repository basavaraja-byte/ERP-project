import React from 'react';
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
import { calculateCampusComparison } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

export const CampusComparisonChart: React.FC = () => {
  const { 
    campuses, 
    studentAssessments, 
    payments, 
    expenses, 
    budgets,
    activeCampusId,
    currentUser,
  } = useFinance();

  // If Trustee or Auditor, show all campuses. If Dean or single campus selected, filter appropriately
  const displayCampuses = (currentUser.role === 'dean' && currentUser.assignedCampusId)
    ? campuses.filter(c => c.id === currentUser.assignedCampusId)
    : (activeCampusId === 'all' ? campuses : campuses.filter(c => c.id === activeCampusId));

  const comparisonData = calculateCampusComparison(
    displayCampuses,
    studentAssessments,
    payments,
    expenses,
    budgets
  );

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
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-100 border-b border-slate-700 pb-1">{label}</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Six-Campus Comparative Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-campus receivables demand, realized collections and operational expenses
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg self-start">
          {displayCampuses.length === 1 ? displayCampuses[0].name : 'Consolidated 6-Campus Benchmarking'}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="city" 
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
            <Legend wrapperStyle={{ paddingTop: 15, fontSize: 12 }} iconType="circle" />
            <Bar dataKey="demand" name="Fee Demand" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="collections" name="Confirmed Collections" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Approved Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
