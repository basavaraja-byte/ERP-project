import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { erpService } from '../../services/erpService';
import {
  LayoutDashboard,
  UserCheck,
  CreditCard,
  CalendarCheck,
  Building,
  BookOpen,
  Bell,
  LifeBuoy,
  GraduationCap,
  X
} from 'lucide-react';
import { cn } from '../../utils/formatters';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const AppSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const recipientId = user?.role === 'STUDENT' ? user.studentId || '' : user?.parentId || '';
  const unreadCount = recipientId ? erpService.getUnreadNotificationCount(recipientId) : 0;

  const studentNavigation: { section: string; items: NavItem[] }[] = [
    {
      section: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/student/profile', icon: UserCheck }
      ]
    },
    {
      section: 'ACADEMICS & FEES',
      items: [
        { name: 'My Fees & Receipts', href: '/student/fees', icon: CreditCard },
        { name: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
        { name: 'Timetable & Notices', href: '/student/academics', icon: BookOpen }
      ]
    },
    {
      section: 'CAMPUS & SERVICES',
      items: [
        { name: 'Hostel Allocation', href: '/student/hostel', icon: Building },
        {
          name: 'Notifications',
          href: '/student/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined
        },
        { name: 'Support Requests', href: '/student/support', icon: LifeBuoy }
      ]
    }
  ];

  const parentNavigation: { section: string; items: NavItem[] }[] = [
    {
      section: 'OVERVIEW',
      items: [
        { name: 'Parent Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
        { name: 'Child Profile', href: '/parent/child-profile', icon: UserCheck }
      ]
    },
    {
      section: 'MONITORING & PAYMENTS',
      items: [
        { name: 'Fee Overview & Pay', href: '/parent/fees', icon: CreditCard },
        { name: 'Attendance Record', href: '/parent/attendance', icon: CalendarCheck },
        { name: 'Hostel Details', href: '/parent/hostel', icon: Building }
      ]
    },
    {
      section: 'COMMUNICATION',
      items: [
        {
          name: 'Announcements',
          href: '/parent/notifications',
          icon: Bell,
          badge: unreadCount > 0 ? unreadCount : undefined
        },
        { name: 'Queries & Requests', href: '/parent/support', icon: LifeBuoy }
      ]
    }
  ];

  const navSections = user?.role === 'STUDENT' ? studentNavigation : parentNavigation;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-950 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-navy-800 shadow-xl lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-navy-800/80 bg-navy-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">AAROHAN</h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold">
                Education Trust ERP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-3 bg-navy-900/80 border-b border-navy-800 flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Portal Mode</p>
            <p className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {user?.role === 'STUDENT' ? 'Student Self-Service' : 'Parent & Guardian'}
            </p>
          </div>
          <span className="text-[10px] font-mono font-medium text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
            {user?.role === 'STUDENT' ? 'STUDENT' : 'PARENT'}
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                {section.section}
              </p>
              <div className="mt-2 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => onClose()}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors group',
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                            : 'text-slate-300 hover:text-white hover:bg-navy-800/80'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-navy-800/80 bg-navy-900/30 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Trust ERP Release</span>
          <span className="font-mono text-slate-400">v2.4.0</span>
        </div>
      </aside>
    </>
  );
};
