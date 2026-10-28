import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Sliders,
  CalendarClock,
  BookOpenCheck,
  CreditCard,
  ReceiptText,
  Award,
  RotateCcw,
  Receipt,
  PieChart,
  Truck,
  Scale,
  FileSpreadsheet,
  History,
  Settings,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, activeCampusId, campuses } = useFinance();

  const activeCampusObj = campuses.find(c => c.id === activeCampusId);

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { label: 'Campuses', path: '/campuses', icon: Building2 },
        { label: 'Fee Structures', path: '/fee-structures', icon: Sliders },
        { label: 'Installment Plans', path: '/installments', icon: CalendarClock },
      ],
    },
    {
      title: 'STUDENT FINANCE',
      items: [
        { label: 'Student Fee Ledger', path: '/student-ledger', icon: BookOpenCheck },
        { label: 'Collections & Payments', path: '/collections', icon: CreditCard },
        { label: 'Receipts Register', path: '/receipts', icon: ReceiptText },
        { label: 'Concessions & Scholarships', path: '/concessions', icon: Award },
        { label: 'Refunds & Deposits', path: '/refunds-deposits', icon: RotateCcw },
      ],
    },
    {
      title: 'INSTITUTIONAL FINANCE',
      items: [
        { label: 'Expenses', path: '/expenses', icon: Receipt },
        { label: 'Budgets', path: '/budgets', icon: PieChart },
        { label: 'Vendors', path: '/vendors', icon: Truck },
        { label: 'Reconciliation', path: '/reconciliation', icon: Scale },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Financial Reports', path: '/reports', icon: FileSpreadsheet },
        { label: 'Audit History', path: '/audit-history', icon: History },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-lg">
              ₹
            </div>
            <div>
              <h2 className="text-white font-bold text-base tracking-tight leading-tight">Trust Finance</h2>
              <p className="text-slate-400 text-[11px] font-medium tracking-wide">Six-Campus Financial OS</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Campus Scope Indicator */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Scope</div>
          <div className="text-xs text-white font-medium truncate mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {activeCampusId === 'all' ? 'All 6 Campuses (Consolidated)' : activeCampusObj?.name || 'Assigned Campus'}
          </div>
          {currentUser.role === 'dean' && (
            <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Dean Role: Scoped to {activeCampusObj?.city}</span>
            </div>
          )}
        </div>

        {/* Navigation Links Scrollable Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AY 2026-27 Active</span>
          </div>
          <span className="text-slate-400 font-mono">v1.0 Demo</span>
        </div>
      </aside>
    </>
  );
};
