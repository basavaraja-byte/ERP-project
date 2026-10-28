import React, { useState } from 'react';
import { DemoAuthProvider } from '../../../modules/department-faculty/context/DemoAuthContext';
import { ToastProvider } from '../../../modules/department-faculty/context/ToastContext';

import { FacultyDashboardPage } from '../../../modules/department-faculty/pages/faculty/FacultyDashboardPage';
import { FacultyCoursesPage } from '../../../modules/department-faculty/pages/faculty/FacultyCoursesPage';
import { FacultyStudentsPage } from '../../../modules/department-faculty/pages/faculty/FacultyStudentsPage';
import { FacultyAttendancePage } from '../../../modules/department-faculty/pages/faculty/FacultyAttendancePage';

import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
  { id: 'courses', label: 'My Assigned Courses', icon: BookOpen },
  { id: 'students', label: 'Student Mentoring', icon: GraduationCap },
  { id: 'attendance', label: 'Daily Session Attendance', icon: CalendarCheck }
];

export default function FacultyPortalView({ user: _user }) {
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
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
            {activeTab === 'dashboard' && <FacultyDashboardPage />}
            {activeTab === 'courses' && <FacultyCoursesPage />}
            {activeTab === 'students' && <FacultyStudentsPage />}
            {activeTab === 'attendance' && <FacultyAttendancePage />}
          </div>
        </div>
      </DemoAuthProvider>
    </ToastProvider>
  );
}
