import React from 'react';
import { DoorOpen, CheckCircle, Clock, Wrench, Ban } from 'lucide-react';
import { useHostel } from '../../context/HostelContext';
import { Link } from 'react-router-dom';

export const RoomAvailabilityWidget: React.FC = () => {
  const { roomAvailabilityWidgetData, filteredRoomOccupancy } = useHostel();
  const totalRooms = filteredRoomOccupancy.length;

  const getPercentage = (count: number) => {
    if (totalRooms === 0) return 0;
    return Math.round((count / totalRooms) * 100);
  };

  const categories = [
    {
      label: 'Available Rooms',
      sublabel: 'All usable beds vacant',
      count: roomAvailabilityWidgetData.availableRooms,
      percentage: getPercentage(roomAvailabilityWidgetData.availableRooms),
      icon: DoorOpen,
      color: 'bg-emerald-500',
      text: 'text-emerald-700',
      bgLight: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Partially Occupied',
      sublabel: 'Has at least 1 vacant bed',
      count: roomAvailabilityWidgetData.partiallyOccupiedRooms,
      percentage: getPercentage(roomAvailabilityWidgetData.partiallyOccupiedRooms),
      icon: Clock,
      color: 'bg-blue-500',
      text: 'text-blue-700',
      bgLight: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Fully Occupied',
      sublabel: 'All beds assigned',
      count: roomAvailabilityWidgetData.fullyOccupiedRooms,
      percentage: getPercentage(roomAvailabilityWidgetData.fullyOccupiedRooms),
      icon: CheckCircle,
      color: 'bg-indigo-600',
      text: 'text-indigo-700',
      bgLight: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Under Maintenance',
      sublabel: 'Room or beds undergoing repair',
      count: roomAvailabilityWidgetData.maintenanceRooms,
      percentage: getPercentage(roomAvailabilityWidgetData.maintenanceRooms),
      icon: Wrench,
      color: 'bg-rose-500',
      text: 'text-rose-700',
      bgLight: 'bg-rose-50 border-rose-100',
    },
    {
      label: 'Inactive Rooms',
      sublabel: 'Decommissioned / reserved',
      count: roomAvailabilityWidgetData.inactiveRooms,
      percentage: getPercentage(roomAvailabilityWidgetData.inactiveRooms),
      icon: Ban,
      color: 'bg-slate-400',
      text: 'text-slate-700',
      bgLight: 'bg-slate-100 border-slate-200',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Room Availability Breakdown</h3>
          <p className="text-xs text-slate-500">Live operational status across {totalRooms} configured rooms</p>
        </div>
        <Link
          to="/rooms-beds"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          View Grid &rarr;
        </Link>
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`${cat.color} transition-all duration-300`}
            style={{ width: `${cat.percentage}%` }}
            title={`${cat.label}: ${cat.count} rooms (${cat.percentage}%)`}
          />
        ))}
      </div>

      {/* Grid of Room Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${cat.bgLight} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${cat.text}`} />
                <span className="text-[11px] font-bold text-slate-500">{cat.percentage}%</span>
              </div>
              <div className="mt-2">
                <div className="text-xl font-extrabold text-slate-900">{cat.count}</div>
                <div className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">{cat.label}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{cat.sublabel}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
