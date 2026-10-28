import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  BedDouble,
  Users,
  CheckCircle,
  Wrench,
  Clock,
  UserPlus,
  PlusCircle,
  KeyRound,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useHostel } from '../context/HostelContext';
import { StatCard } from '../components/dashboard/StatCard';
import { OccupancyChart } from '../components/dashboard/OccupancyChart';
import { HostelOccupancyTable } from '../components/dashboard/HostelOccupancyTable';
import { RoomAvailabilityWidget } from '../components/dashboard/RoomAvailabilityWidget';
import { PendingAllocationsWidget } from '../components/dashboard/PendingAllocationsWidget';
import { MaintenanceAlerts } from '../components/dashboard/MaintenanceAlerts';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedCampusId,
    campuses,
    activeHostelsCount,
    totalPhysicalBeds,
    totalOccupiedBeds,
    totalAvailableBeds,
    totalMaintenanceBeds,
    totalPendingAllocations,
  } = useHostel();

  const selectedCampus = campuses.find((c) => c.id === selectedCampusId);
  const campusLabel = selectedCampusId === 'all' ? 'All Campuses' : selectedCampus?.name || 'Selected Campus';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                <Sparkles className="w-3.5 h-3.5" />
                {campusLabel}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hostel Operations Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Institutional residence management console. Monitor building occupancy, physical bed inventory, student allocations, and facility maintenance tasks.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/students?action=register')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Register Student
            </button>

            <button
              type="button"
              onClick={() => navigate('/allocations?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              New Allocation
            </button>

            <button
              type="button"
              onClick={() => navigate('/hostels?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Add Hostel
            </button>

            <button
              type="button"
              onClick={() => navigate('/rooms-beds?action=new')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-colors"
            >
              <Layers className="w-4 h-4" />
              Add Room
            </button>

            <button
              type="button"
              onClick={() => navigate('/maintenance?action=report')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 rounded-xl transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Report Issue
            </button>
          </div>
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Active Hostels */}
        <StatCard
          label="Active Hostels"
          value={activeHostelsCount}
          icon={Home}
          subtitle="Buildings currently in service"
          linkTo="/hostels"
          linkLabel="Manage hostels"
          colorScheme="indigo"
        />

        {/* 2. Total Physical Beds */}
        <StatCard
          label="Total Physical Beds"
          value={totalPhysicalBeds}
          icon={BedDouble}
          subtitle="Inventory across all rooms"
          linkTo="/rooms-beds"
          linkLabel="View inventory"
          colorScheme="blue"
        />

        {/* 3. Occupied Beds */}
        <StatCard
          label="Occupied Beds"
          value={totalOccupiedBeds}
          icon={Users}
          subtitle="Active student residents"
          linkTo="/allocations"
          linkLabel="View allocations"
          colorScheme="indigo"
        />

        {/* 4. Available Beds */}
        <StatCard
          label="Available Beds"
          value={totalAvailableBeds}
          icon={CheckCircle}
          subtitle="Ready for student assignment"
          linkTo="/rooms-beds"
          linkLabel="Check availability"
          colorScheme="emerald"
        />

        {/* 5. Beds Under Maintenance */}
        <StatCard
          label="Beds in Maintenance"
          value={totalMaintenanceBeds}
          icon={Wrench}
          subtitle="Unavailable due to repairs"
          linkTo="/maintenance"
          linkLabel="Review issues"
          colorScheme="rose"
        />

        {/* 6. Pending Allocation Requests */}
        <StatCard
          label="Pending Allocations"
          value={totalPendingAllocations}
          icon={Clock}
          subtitle="Requests awaiting review"
          linkTo="/allocations"
          linkLabel="Review requests"
          colorScheme="amber"
        />
      </div>

      {/* Primary Visual Analytics: Recharts Occupancy Chart */}
      <OccupancyChart />

      {/* Room Availability Breakdown Widget */}
      <RoomAvailabilityWidget />

      {/* Hostel Occupancy Table */}
      <HostelOccupancyTable />

      {/* Operational Widgets Row: Pending Allocations & Maintenance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PendingAllocationsWidget />
        <MaintenanceAlerts />
        <RecentActivity />
      </div>
    </div>
  );
};
