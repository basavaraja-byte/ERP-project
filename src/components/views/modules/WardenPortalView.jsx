import React, { useState } from 'react';
import { HostelProvider } from '../../../modules/hostel-management/context/HostelContext';
import { FinanceProvider } from '../../../modules/finance/src/context/FinanceContext';
import { RefundsDepositsPage } from '../../../modules/finance/src/pages/RefundsDepositsPage';

import { DashboardPage } from '../../../modules/hostel-management/pages/DashboardPage';
import { CampusesPage } from '../../../modules/hostel-management/pages/CampusesPage';
import { HostelsPage } from '../../../modules/hostel-management/pages/HostelsPage';
import { RoomsBedsPage } from '../../../modules/hostel-management/pages/RoomsBedsPage';
import { AllocationsPage } from '../../../modules/hostel-management/pages/AllocationsPage';
import { StudentsPage } from '../../../modules/hostel-management/pages/StudentsPage';
import { MaintenancePage } from '../../../modules/hostel-management/pages/MaintenancePage';

import {
  LayoutDashboard,
  Building2,
  Home,
  Bed,
  Users,
  CheckSquare,
  Wrench,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Hostel Overview', icon: LayoutDashboard },
  { id: 'campuses', label: 'Campus Hostels', icon: Building2 },
  { id: 'hostels', label: 'Hostel Blocks', icon: Home },
  { id: 'rooms-beds', label: 'Rooms & Bed Grid', icon: Bed },
  { id: 'allocations', label: 'Bed Allocations', icon: CheckSquare },
  { id: 'students', label: 'Resident Directory', icon: Users },
  { id: 'maintenance', label: 'Maintenance & Tickets', icon: Wrench },
  { id: 'hostel_deposits', label: 'Caution Deposits & Refunds', icon: RotateCcw }
];

export default function WardenPortalView({ user: _user }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <HostelProvider>
      <div className="space-y-6">
        {/* Sub-navigation bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'campuses' && <CampusesPage />}
          {activeTab === 'hostels' && <HostelsPage />}
          {activeTab === 'rooms-beds' && <RoomsBedsPage />}
          {activeTab === 'allocations' && <AllocationsPage />}
          {activeTab === 'students' && <StudentsPage />}
          {activeTab === 'maintenance' && <MaintenancePage />}
          {activeTab === 'hostel_deposits' && (
            <FinanceProvider initialUser={_user} initialCampusId={_user?.assignedCampusId}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold">
                  <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                  <span>Hostel Caution Deposits &amp; Vacating Refunds Desk — Scoped to {_user?.name || 'Warden'} ({_user?.hostelId || 'Hostel Block'})</span>
                </div>
                <RefundsDepositsPage />
              </div>
            </FinanceProvider>
          )}
        </div>
      </div>
    </HostelProvider>
  );
}
