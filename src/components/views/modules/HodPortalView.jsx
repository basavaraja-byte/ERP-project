import React, { useState } from 'react';
import { DemoAuthProvider } from '../../../modules/department-faculty/context/DemoAuthContext';
import { ToastProvider } from '../../../modules/department-faculty/context/ToastContext';

import { HodDashboardPage } from '../../../modules/department-faculty/pages/hod/HodDashboardPage';
import { HodFacultyPage } from '../../../modules/department-faculty/pages/hod/HodFacultyPage';
import { HodCoursesPage } from '../../../modules/department-faculty/pages/hod/HodCoursesPage';
import { HodStudentsPage } from '../../../modules/department-faculty/pages/hod/HodStudentsPage';
import { HodAttendancePage } from '../../../modules/department-faculty/pages/hod/HodAttendancePage';
import { HodAnnouncementsPage } from '../../../modules/department-faculty/pages/hod/HodAnnouncementsPage';
import { HodReportsPage } from '../../../modules/department-faculty/pages/hod/HodReportsPage';
import HodComplaintsManagement from '../../complaints/HodComplaintsManagement';

import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
  Bell,
  FileText
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'faculty', label: 'Faculty Roster', icon: Users },
  { id: 'courses', label: 'Courses & Curriculum', icon: BookOpen },
  { id: 'students', label: 'Students Roster', icon: GraduationCap },
  { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck },
  { id: 'complaints', label: 'Grievance Desk', icon: AlertCircle },
  { id: 'announcements', label: 'Circulars', icon: Bell },
  { id: 'reports', label: 'NIRF / NBA Reports', icon: FileText }
];

export default function HodPortalView({ user: _user }) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <ToastProvider>
      <DemoAuthProvider>
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-xs'
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
            {activeTab === 'dashboard' && <HodDashboardPage />}
            {activeTab === 'faculty' && <HodFacultyPage />}
            {activeTab === 'courses' && <HodCoursesPage />}
            {activeTab === 'students' && <HodStudentsPage />}
            {activeTab === 'attendance' && <HodAttendancePage />}
            {activeTab === 'complaints' && <HodComplaintsManagement user={_user} />}
            {activeTab === 'announcements' && <HodAnnouncementsPage />}
            {activeTab === 'reports' && <HodReportsPage />}
          </div>
        </div>
      </DemoAuthProvider>
    </ToastProvider>
  );
}
