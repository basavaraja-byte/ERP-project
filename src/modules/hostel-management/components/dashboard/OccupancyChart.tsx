import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useHostel } from '../../context/HostelContext';

export const OccupancyChart: React.FC = () => {
  const { filteredHostelStats, totalOccupiedBeds, totalAvailableBeds, totalMaintenanceBeds, globalOccupancyRate } =
    useHostel();

  // Data for Hostel Comparison BarChart
  const barData = filteredHostelStats.map((h) => ({
    name: h.hostel.name.split(' ')[0], // Short name e.g. "Aryabhata", "Gargi"
    fullName: h.hostel.name,
    Occupied: h.occupiedBeds,
    Available: h.availableBeds,
    'In Maintenance': h.maintenanceBeds,
    rate: h.occupancyRate,
  }));

  // Data for Global Inventory Donut
  const pieData = [
    { name: 'Occupied Beds', value: totalOccupiedBeds, color: '#4f46e5' }, // Indigo-600
    { name: 'Available Beds', value: totalAvailableBeds, color: '#10b981' }, // Emerald-500
    { name: 'Under Maintenance', value: totalMaintenanceBeds, color: '#f43f5e' }, // Rose-500
  ].filter((item) => item.value > 0);

  const totalUsable = totalOccupiedBeds + totalAvailableBeds;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Hostel Bed Occupancy & Usable Capacity</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time ratio of occupied to usable beds. Maintenance inventory is excluded from available beds.
          </p>
        </div>

        {/* Global Occupancy Rate Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-xs font-semibold text-slate-500">Global Occupancy:</span>
          <span className="text-sm font-bold text-indigo-600">{globalOccupancyRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Bar Chart (2 columns on desktop) */}
        <div className="lg:col-span-2 h-72">
          <div className="text-xs font-semibold text-slate-500 mb-2">Hostel-Wise Bed Distribution</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs space-y-1">
                        <div className="font-bold text-slate-800">{data.fullName}</div>
                        <div className="text-indigo-600 font-medium">Occupied: {data.Occupied} beds</div>
                        <div className="text-emerald-600 font-medium">Available: {data.Available} beds</div>
                        <div className="text-rose-600 font-medium">Under Maintenance: {data['In Maintenance']} beds</div>
                        <div className="pt-1 border-t border-slate-100 font-bold text-slate-700">
                          Occupancy Rate: {data.rate}%
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Occupied" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="In Maintenance" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart & Usable Breakdown (1 column on desktop) */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Capacity Inventory Share
          </div>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} Beds`, name]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Rate in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{globalOccupancyRate}%</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase">Occupied</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="w-full mt-3 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                Occupied Beds:
              </span>
              <span className="font-bold text-slate-800">{totalOccupiedBeds}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available Beds:
              </span>
              <span className="font-bold text-slate-800">{totalAvailableBeds}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Under Maintenance:
              </span>
              <span className="font-bold text-slate-800">{totalMaintenanceBeds}</span>
            </div>

            <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              <span>Usable Capacity:</span>
              <span className="font-semibold text-slate-700">{totalUsable} beds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
