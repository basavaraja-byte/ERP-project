import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Home,
  BedDouble,
  GraduationCap,
  KeyRound,
  Wrench,
  BarChart3,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useHostel } from '../../context/HostelContext';

interface AppSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const location = useLocation();
  const { totalPendingAllocations, maintenanceRecords } = useHostel();

  const openMaintenanceCount = maintenanceRecords.filter(
    (m) => m.status === 'Open' || m.status === 'In Progress'
  ).length;

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Hostel Operations',
      items: [
        { label: 'Campuses', path: '/campuses', icon: Building },
        { label: 'Hostels', path: '/hostels', icon: Home },
        { label: 'Rooms & Beds', path: '/rooms-beds', icon: BedDouble },
        { label: 'Students', path: '/students', icon: GraduationCap },
        {
          label: 'Allocations',
          path: '/allocations',
          icon: KeyRound,
          badge: totalPendingAllocations > 0 ? totalPendingAllocations : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          label: 'Maintenance',
          path: '/maintenance',
          icon: Wrench,
          badge: openMaintenanceCount > 0 ? openMaintenanceCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
      ],
    },
    {
      title: 'Insights',
      items: [
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Audit History', path: '/audit-history', icon: History },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/50 shrink-0">
            <Building className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white text-base tracking-tight truncate">CampusStay</span>
              <span className="text-[11px] text-slate-400 font-medium truncate">Hostel Management ERP</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 transition-transform ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Institutional Demo Tag */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-indigo-400 font-medium mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>College Admin Shell</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Local browser sandbox prototype. Changes persist locally.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 border-r border-slate-800 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 shadow-2xl lg:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
