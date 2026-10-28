import React, { useState } from 'react';
import { AuthProvider as StudentAuthProvider } from '../../../modules/student-parent/context/AuthContext';
import { FinanceProvider } from '../../../modules/finance/src/context/FinanceContext';
import { StudentLedgerPage } from '../../../modules/finance/src/pages/StudentLedgerPage';

import { ParentDashboard } from '../../../modules/student-parent/features/parent/ParentDashboard';
import { ParentChildProfile } from '../../../modules/student-parent/features/parent/ParentChildProfile';
import { ParentFees } from '../../../modules/student-parent/features/parent/ParentFees';
import { ParentAttendance } from '../../../modules/student-parent/features/parent/ParentAttendance';
import { ParentHostel } from '../../../modules/student-parent/features/parent/ParentHostel';
import { ParentNotifications } from '../../../modules/student-parent/features/parent/ParentNotifications';
import { ParentSupport } from '../../../modules/student-parent/features/parent/ParentSupport';
import UserComplaintsList from '../../complaints/UserComplaintsList';
import ComplaintSubmissionModal from '../../complaints/ComplaintSubmissionModal';

import {
  LayoutDashboard,
  User,
  CreditCard,
  CalendarCheck,
  Building,
  Bell,
  HelpCircle,
  ReceiptText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Ward Overview', icon: LayoutDashboard },
  { id: 'child-profile', label: 'Ward Profile', icon: User },
  { id: 'attendance', label: 'Attendance Monitoring', icon: CalendarCheck },
  { id: 'fees', label: 'Fee Invoices & Receipts', icon: CreditCard },
  { id: 'finance_ledger', label: 'Finance Fee Ledger', icon: ReceiptText },
  { id: 'hostel', label: 'Hostel & Mess Status', icon: Building },
  { id: 'notifications', label: 'College Notices', icon: Bell },
  { id: 'support', label: 'Grievance / Support', icon: HelpCircle }
];

export default function ParentPortalView({ user: _user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  return (
    <StudentAuthProvider>
      <div className="space-y-6">
        {/* Sub-navigation bar with Quick Grievance Trigger */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Prompt Complaint / Grievance Submission Trigger */}
          <button
            type="button"
            onClick={() => setIsComplaintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-xs whitespace-nowrap transition-all cursor-pointer shrink-0"
            title="Submit a parent grievance regarding bus routes, fee schedules, or college facilities"
          >
            <AlertCircle size={14} />
            <span>Raise Grievance</span>
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && <ParentDashboard />}
          {activeTab === 'child-profile' && <ParentChildProfile />}
          {activeTab === 'attendance' && <ParentAttendance />}
          {activeTab === 'fees' && <ParentFees />}
          {activeTab === 'finance_ledger' && (
            <FinanceProvider initialUser={_user} initialCampusId={_user?.assignedCampusId}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 p-3 bg-pink-50 text-pink-900 border border-pink-200 rounded-xl text-xs font-semibold">
                  <ShieldCheck size={16} className="text-pink-600 shrink-0" />
                  <span>Integrated Finance Management Suite — Authorized Ward Ledger for {_user?.name || 'Parent'} (Linked Ward: {_user?.wardStudentId || _user?.studentId || 'Linked Ward'})</span>
                </div>
                <StudentLedgerPage />
              </div>
            </FinanceProvider>
          )}
          {activeTab === 'hostel' && <ParentHostel />}
          {activeTab === 'notifications' && <ParentNotifications />}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <UserComplaintsList user={_user} title="Parent & Guardian Grievance Desk" />
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">Campus Administration & Service FAQ:</div>
                <ParentSupport />
              </div>
            </div>
          )}
        </div>

        {/* Persistent Grievance Modal */}
        <ComplaintSubmissionModal
          isOpen={isComplaintModalOpen}
          onClose={() => setIsComplaintModalOpen(false)}
          user={_user}
          onSuccess={() => {
            setActiveTab('support');
          }}
        />
      </div>
    </StudentAuthProvider>
  );
}
