import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Clock,
  Megaphone,
  Users,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { erpService } from '../../services/erpService';
import { StatCard } from '../../components/ui/StatCard';
import {
  Badge,
  getPriorityBadgeVariant,
} from '../../components/ui/Badge';

export const FacultyDashboardPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const data = erpService.getFacultyDashboard(currentUser.facultyId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Faculty Portal • {data.department.name} ({data.campus.city})
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">
            Welcome, {data.faculty.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {data.faculty.designation} • Cabin {data.faculty.cabin} • Teaching Load:{' '}
            <strong>
              {data.workload.assignedWeeklyHours} / {data.workload.maxWeeklyHours} hrs/week
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/faculty/attendance')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <ClipboardCheck className="w-4 h-4" />
          Mark Class Attendance
        </button>
      </div>

      {/* Primary Faculty Modules Launcher + Live Academic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="1. Student Details & Mentoring"
          value={data.totalStudentsCount}
          subtitle={`${data.lowAttendanceStudentsCount} below ${data.lowAttendanceThreshold}% attendance`}
          icon={Users}
          tone={data.lowAttendanceStudentsCount > 0 ? 'amber' : 'blue'}
          onClick={() => navigate('/faculty/students')}
        />
        <StatCard
          label="2. Assigned Courses & Curriculum"
          value={data.workload.assignedOfferings.length}
          subtitle={`${data.workload.assignedSubjectsCount} Subjects • ${data.workload.assignedSectionsCount} Sections`}
          icon={BookOpen}
          tone="navy"
          onClick={() => navigate('/faculty/courses')}
        />
        <StatCard
          label="3. Class Attendance Registers"
          value={`${data.averageAttendancePercent}%`}
          subtitle={`${data.pendingSessions.length} pending register(s) to submit`}
          icon={ClipboardCheck}
          tone={data.pendingSessions.length > 0 ? 'amber' : 'green'}
          onClick={() => navigate('/faculty/attendance')}
        />
      </div>

      {/* Pending Registers + Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Attendance Sessions & Deadlines */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-navy-900">
                Pending Attendance Registers ({data.pendingSessions.length})
              </h2>
              <button
                type="button"
                onClick={() => navigate('/faculty/attendance')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Open Attendance →
              </button>
            </div>

            {data.pendingSessions.length === 0 ? (
              <div className="rounded-lg bg-emerald-50/60 border border-emerald-200 p-4 text-xs text-emerald-800">
                All scheduled attendance registers for your classes are up to date.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.pendingSessions.map(({ session, subject, section }) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 flex items-center justify-between gap-3"
                  >
                    <div className="text-xs">
                      <p className="font-semibold text-navy-900">
                        {subject.code} — {section.displayName}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        {session.date} • {session.slotLabel} •{' '}
                        {session.topicCovered ?? 'Scheduled Lecture'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/faculty/attendance?subjectId=${subject.id}&sectionId=${section.id}&date=${session.date}`
                        )
                      }
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mark Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Upcoming Academic Deadlines
            </h3>
            {data.upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming deadlines scheduled.</p>
            ) : (
              <div className="space-y-2">
                {data.upcomingDeadlines.slice(0, 4).map((dl) => (
                  <div
                    key={dl.id}
                    className="flex items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-blue-700">
                        {dl.subjectCode}:
                      </span>{' '}
                      <span className="text-slate-800 font-medium">{dl.title}</span>
                    </div>
                    <Badge variant="slate">{dl.dueDate}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Teaching Timetable */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                Your Weekly Teaching Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Assigned classes & rooms for AY 2026-27
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/faculty/courses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Course Details →
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {data.workload.timetableSlots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-navy-900">{slot.dayOfWeek}</span>{' '}
                  <span className="text-slate-500">• {slot.slotLabel}</span>
                  <p className="text-slate-700 font-medium mt-0.5">
                    {slot.subjectCode} — {slot.subjectName} ({slot.sectionDisplayName})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="blue">{slot.room}</Badge>
                  <p className="text-[11px] text-slate-400 mt-0.5">{slot.sessionType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Circulars & Official Announcements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-blue-600" />
            Department Announcements & Official Circulars
          </h2>
          <span className="text-xs text-slate-400">Published Circulars</span>
        </div>

        {data.relevantAnnouncements.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No active department announcements.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.relevantAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={getPriorityBadgeVariant(ann.priority)}>
                    {ann.priority}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{ann.publishedAt}</span>
                </div>
                <p className="font-semibold text-navy-900 mt-1.5">{ann.title}</p>
                <p className="text-slate-600 mt-0.5 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.lowAttendanceStudentsCount > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div className="text-xs text-red-900">
              <p className="font-semibold">
                {data.lowAttendanceStudentsCount} student(s) in your assigned classes are
                below the {data.lowAttendanceThreshold}% attendance warning threshold.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/faculty/students?lowAttendance=1')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
          >
            Inspect Shortage Students
          </button>
        </div>
      )}
    </div>
  );
};

