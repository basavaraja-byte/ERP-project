import React, { useState } from 'react';
import { AuthProvider as StudentAuthProvider } from '../../../modules/student-parent/context/AuthContext';
import { FinanceProvider } from '../../../modules/finance/src/context/FinanceContext';
import { StudentLedgerPage } from '../../../modules/finance/src/pages/StudentLedgerPage';

import { StudentDashboard } from '../../../modules/student-parent/features/student/StudentDashboard';
import { StudentAcademics } from '../../../modules/student-parent/features/student/StudentAcademics';
import { StudentAttendance } from '../../../modules/student-parent/features/student/StudentAttendance';
import { StudentFees } from '../../../modules/student-parent/features/student/StudentFees';
import { StudentHostel } from '../../../modules/student-parent/features/student/StudentHostel';
import { StudentNotifications } from '../../../modules/student-parent/features/student/StudentNotifications';
import { StudentProfile } from '../../../modules/student-parent/features/student/StudentProfile';
import { StudentSupport } from '../../../modules/student-parent/features/student/StudentSupport';
import UserComplaintsList from '../../complaints/UserComplaintsList';
import ComplaintSubmissionModal from '../../complaints/ComplaintSubmissionModal';

import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Building,
  Bell,
  User,
  HelpCircle,
  ReceiptText,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'academics', label: 'Academics & Grades', icon: BookOpen },
  { id: 'attendance', label: 'Attendance Records', icon: CalendarCheck },
  { id: 'fees', label: 'Fee Payments', icon: CreditCard },
  { id: 'finance_ledger', label: 'Finance Fee Ledger', icon: ReceiptText },
  { id: 'hostel', label: 'Hostel Resident Desk', icon: Building },
  { id: 'notifications', label: 'Notices', icon: Bell },
  { id: 'profile', label: 'Student Dossier', icon: User },
  { id: 'support', label: 'Support & Helpdesk', icon: HelpCircle }
];

export default function StudentPortalView({ user: _user }) {
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                      ? 'bg-purple-600 text-white shadow-xs'
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
            title="Submit a formal grievance regarding fees, academics, attendance, or hostel"
          >
            <AlertCircle size={14} />
            <span>Raise Grievance</span>
          </button>
        </div>

        {/* Active Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && <StudentDashboard />}
          {activeTab === 'academics' && <StudentAcademics />}
          {activeTab === 'attendance' && <StudentAttendance />}
          {activeTab === 'fees' && <StudentFees />}
          {activeTab === 'finance_ledger' && (
            <FinanceProvider initialUser={_user} initialCampusId={_user?.assignedCampusId}>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-xs font-semibold">
                  <ShieldCheck size={16} className="text-purple-600 shrink-0" />
                  <span>Integrated Finance Management Suite — Authorized Student Ledger for {_user?.name || 'Enrolled Student'} ({_user?.studentId || 'AIT2023-CS-042'})</span>
                </div>
                <StudentLedgerPage />
              </div>
            </FinanceProvider>
          )}
          {activeTab === 'hostel' && <StudentHostel />}
          {activeTab === 'notifications' && <StudentNotifications />}
          {activeTab === 'profile' && <StudentProfile />}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <UserComplaintsList user={_user} title="Student Grievance & Service Request Desk" />
              <div className="pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2">Campus Service Desk FAQ & Reference:</div>
                <StudentSupport />
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
