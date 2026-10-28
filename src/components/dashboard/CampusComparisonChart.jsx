import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatNumber, formatINR } from '../../utils/calculations';

const ComparisonTooltip = ({ active, payload, label }) => {
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
              {entry.dataKey === 'students' ? `${formatNumber(entry.value)} Students` : `₹${entry.value}L (${formatINR(entry.value * 100000)})`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function CampusComparisonChart({
  comparisonData = [],
  isSingleCampus = false,
  singleCampusData = null,
  onSelectCampus
}) {
  // If single campus is selected, show departmental breakdown
  if (isSingleCampus && singleCampusData?.departments) {
    const deptChartData = singleCampusData.departments.map(d => ({
      name: d.name.length > 16 ? d.name.substring(0, 14) + '…' : d.name,
      fullName: d.name,
      students: d.students,
      attendance: d.attendanceRate,
      collection: d.feeCollectionRate
    }));

    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Student Distribution — {singleCampusData.shortName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of {formatNumber(singleCampusData.studentCount)} enrolled students across academic departments
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-100">
            {singleCampusData.departments.length} Departments
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">{data.fullName}</p>
                        <p className="text-slate-300">Students: <span className="text-white font-bold">{formatNumber(data.students)}</span></p>
                        <p className="text-slate-300">Attendance: <span className="text-emerald-400 font-bold">{data.attendance}%</span></p>
                        <p className="text-slate-300">Fee Recovery: <span className="text-blue-400 font-bold">{data.collection}%</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Source: Academic Master Registry</span>
          <span className="text-[11px] text-slate-400">Total Enrolled: {formatNumber(singleCampusData.studentCount)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Cross-Campus Comparison (6 Institutions)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparative student enrollment counts and outstanding fee balance (in ₹ Lakhs)
          </p>
        </div>

        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-semibold border border-slate-200 self-start sm:self-auto">
          6 Campus Records
        </span>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<ComparisonTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              name="Student Count"
              dataKey="students"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              onClick={(e) => onSelectCampus && onSelectCampus(e.id)}
              className="cursor-pointer"
            />
            <Bar
              name="Outstanding Fees (₹ Lakhs)"
              dataKey="outstandingLakhs"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              onClick={(e) => onSelectCampus && onSelectCampus(e.id)}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Click on any campus bar to inspect campus details</span>
        <span className="text-[11px] text-slate-400">Total Trust Students: 14,280</span>
      </div>
    </div>
  );
}
