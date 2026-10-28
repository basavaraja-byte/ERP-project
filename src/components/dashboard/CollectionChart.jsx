import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { IndianRupee, Info } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
        <p className="font-bold text-slate-200 mb-1.5 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-semibold text-white">
              ₹{entry.value} Lakhs ({formatINR(entry.value * 100000)})
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CollectionChart({
  data = [],
  reportingPeriod = 'AY 2025–26',
  isLiveFromDb = false
}) {
  const highestItem = data.length > 0
    ? data.reduce((prev, curr) => (curr.collectionsLakhs > (prev?.collectionsLakhs || 0) ? curr : prev), data[0])
    : null;
  const currentItem = data.length > 0 ? data[data.length - 1] : null;

  const highestFormatted = highestItem
    ? `${highestItem.month} (${formatINR(highestItem.collections || highestItem.collectionsLakhs * 100000, true)})`
    : 'N/A';

  const outstandingFormatted = currentItem
    ? formatINR(currentItem.outstanding || currentItem.outstandingLakhs * 100000, true)
    : 'N/A';

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col items-center justify-center min-h-[340px] text-center">
        <IndianRupee className="text-slate-300 mb-2" size={36} />
        <p className="text-slate-600 font-medium text-sm">No collection trend records available.</p>
        <p className="text-slate-400 text-xs mt-1">Ingest bank reconciliation sheets to populate trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Monthly Fee Collection & Outstanding Trend
            </h3>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
              {reportingPeriod}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified monthly bank credits vs cumulative uncollected fee balances (in ₹ Lakhs)
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
          <Info size={13} className="shrink-0" />
          <span>{isLiveFromDb ? 'Reconciled monthly trends from bank ledger scrolls' : 'Synthetic trends from demo cache'}</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              name="Monthly Verified Collections"
              dataKey="collectionsLakhs"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              maxBarSize={38}
            />
            <Line
              type="monotone"
              name="Cumulative Outstanding Fees"
              dataKey="outstandingLakhs"
              stroke="#e11d48"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#e11d48', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Highest Collection: <strong>{highestFormatted}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            Current Outstanding: <strong>{outstandingFormatted}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Unit: ₹ in Lakhs (100 Lakhs = ₹1 Crore)</span>
      </div>
    </div>
  );
}
