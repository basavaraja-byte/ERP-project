import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { Badge } from '../ui/Badge';

export const HostelOccupancyTable: React.FC = () => {
  const { filteredHostelStats } = useHostel();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredData = filteredHostelStats.filter((item) => {
    const matchesSearch =
      item.hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.hostel.hostel_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.campus?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = typeFilter === 'all' || item.hostel.hostel_type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Hostel Occupancy Register</h3>
          <p className="text-xs text-slate-500 mt-0.5">Physical bed inventory vs usable occupancy across active buildings</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hostel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
              <option value="Co-ed">Co-ed</option>
            </select>
          </div>

          {/* View All Action */}
          <Link
            to="/hostels"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors ml-auto sm:ml-0"
          >
            View All Hostels
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 sm:px-6 py-3">Hostel Name</th>
              <th className="px-4 py-3">Campus</th>
              <th className="px-4 py-3">Hostel Type</th>
              <th className="px-4 py-3 text-right">Physical Beds</th>
              <th className="px-4 py-3 text-right">Occupied Beds</th>
              <th className="px-4 py-3 text-right">Available Beds</th>
              <th className="px-4 py-3">Occupancy Rate</th>
              <th className="px-4 sm:px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isHighOccupancy = item.occupancyRate >= 85;
                const isMediumOccupancy = item.occupancyRate >= 50 && item.occupancyRate < 85;

                return (
                  <tr key={item.hostel.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-medium text-slate-900">
                      <div className="font-semibold">{item.hostel.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.hostel.hostel_code}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700">{item.campus?.name.split(' (')[0] || 'Main'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          item.hostel.hostel_type === 'Boys'
                            ? 'info'
                            : item.hostel.hostel_type === 'Girls'
                            ? 'purple'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {item.hostel.hostel_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-800">
                      {item.physicalBeds}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-indigo-600">
                      {item.occupiedBeds}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-emerald-600">
                      {item.availableBeds}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              isHighOccupancy
                                ? 'bg-rose-500'
                                : isMediumOccupancy
                                ? 'bg-indigo-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.occupancyRate)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {item.occupancyRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-center">
                      <Badge
                        variant={item.hostel.status === 'Active' ? 'success' : 'neutral'}
                        size="sm"
                      >
                        {item.hostel.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  No hostels found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
