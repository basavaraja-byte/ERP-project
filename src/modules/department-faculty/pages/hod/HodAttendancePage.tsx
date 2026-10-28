import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { erpService } from '../../services/erpService';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StudentDetailModal } from '../../components/shared/StudentDetailModal';

export const HodAttendancePage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();

  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'SESSIONS' | 'SHORTAGE'>(
    'SUMMARY'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!currentUser) return null;

  const meta = erpService.getDepartmentCoursesData(currentUser.departmentId);
  const summary = erpService.getDepartmentAttendanceSummary(currentUser.departmentId, {
    courseId: courseFilter,
    semester: semesterFilter,
    sectionId: sectionFilter,
    subjectId: subjectFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const semesters = Array.from(new Set(meta.sections.map((s) => s.semester))).sort(
    (a, b) => a - b
  );

  const resetFilters = () => {
    setCourseFilter('ALL');
    setSemesterFilter('ALL');
    setSectionFilter('ALL');
    setSubjectFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          HOD Portal • Register Completion & Shortage Analytics
        </p>
        <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Department Attendance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor course, subject, and section attendance percentages, register completion
          rates, and low-attendance student cohorts.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cumulative Attendance"
          value={`${summary.overallPercent}%`}
          subtitle="Calculated from Present + Late records"
          icon={ClipboardCheck}
          tone={summary.overallPercent >= summary.lowAttendanceThreshold ? 'green' : 'amber'}
        />
        <StatCard
          label="Register Completion Rate"
          value={`${summary.completionRatePercent}%`}
          subtitle={`${summary.completedSessionsCount} marked / ${
            summary.completedSessionsCount + summary.pendingSessionsCount
          } scheduled`}
          icon={CheckCircle2}
          tone={summary.pendingSessionsCount === 0 ? 'green' : 'blue'}
        />
        <StatCard
          label="Pending Attendance Sessions"
          value={summary.pendingSessionsCount}
          subtitle="Scheduled classes awaiting submission"
          icon={Clock}
          tone={summary.pendingSessionsCount > 0 ? 'amber' : 'green'}
        />
        <StatCard
          label={`Low-Attendance Students (<${summary.lowAttendanceThreshold}%)`}
          value={summary.lowAttendanceStudents.length}
          subtitle="In filtered course / section scope"
          icon={AlertTriangle}
          tone={summary.lowAttendanceStudents.length > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Courses</option>
            {meta.courses.map(({ course }) => (
              <option key={course.id} value={course.id}>
                {course.shortName}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) =>
              setSemesterFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Sections</option>
            {meta.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.displayName}
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Subjects</option>
            {meta.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
              title="From Date"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
              title="To Date"
            />
            <button
              type="button"
              onClick={resetFilters}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              title="Clear filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'SUMMARY'
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            By Course, Subject & Section ({summary.offeringSummaries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SESSIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'SESSIONS'
                ? 'bg-navy-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Session Completion Status ({summary.sessions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SHORTAGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'SHORTAGE'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Low-Attendance Students ({summary.lowAttendanceStudents.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Course, Subject & Section Summary */}
      {activeTab === 'SUMMARY' &&
        (summary.offeringSummaries.length === 0 ? (
          <EmptyState
            title="No course/section summaries match filters"
            description="Reset filters to view all department subject-section attendance summaries."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Course & Section
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Instructor</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Register Completion
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      P / L / A Entries
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Attendance %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {summary.offeringSummaries.map((row) => (
                    <tr key={row.offering.assignmentId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-blue-700">
                          {row.offering.subject.code}
                        </span>
                        <p className="font-semibold text-navy-900 mt-0.5">
                          {row.offering.subject.name}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">
                          {row.offering.course.shortName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Sem {row.offering.subject.semester} •{' '}
                          {row.offering.section.displayName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {row.offering.faculty ? (
                          <span className="text-slate-800 font-medium">
                            {row.offering.faculty.name}
                          </span>
                        ) : (
                          <Badge variant="red">Unassigned</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Badge variant="green">{row.completedCount} Marked</Badge>
                          {row.pendingCount > 0 && (
                            <Badge variant="amber">{row.pendingCount} Pending</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-600">
                        <span className="text-emerald-700 font-semibold">
                          {row.presentCount}P
                        </span>{' '}
                        /{' '}
                        <span className="text-amber-700 font-semibold">
                          {row.lateCount}L
                        </span>{' '}
                        /{' '}
                        <span className="text-red-600 font-semibold">
                          {row.absentCount}A
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {row.attendancePercent !== null ? (
                          <Badge
                            variant={
                              row.attendancePercent < summary.lowAttendanceThreshold
                                ? 'red'
                                : 'green'
                            }
                          >
                            {row.attendancePercent}%
                          </Badge>
                        ) : (
                          <span className="text-slate-400">No Sessions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Tab 2: Session Completion Log */}
      {activeTab === 'SESSIONS' &&
        (summary.sessions.length === 0 ? (
          <EmptyState
            title="No attendance sessions in selected date/filter range"
            description="Adjust date range or course/section filters to inspect class registers."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Date & Slot</th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Subject & Section
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Topic & Faculty</th>
                    <th className="px-4 py-3 text-center font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Session %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {summary.sessions.map((item) => (
                    <tr key={item.session.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-navy-900">{item.session.date}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.session.slotLabel} ({item.session.sessionType})
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800">
                          {item.subject.code} — {item.subject.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.course.shortName} • {item.section.displayName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-700">
                          {item.session.topicCovered ?? 'Scheduled Topic'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.session.markedByName
                            ? `Marked by ${item.session.markedByName}`
                            : 'Awaiting instructor submission'}
                          {item.session.changeHistory.length > 0 &&
                            ` • ${item.session.changeHistory.length} audit amendment(s)`}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant={
                            item.session.status === 'Completed' ? 'green' : 'amber'
                          }
                          dot
                        >
                          {item.session.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {item.percentage !== null ? (
                          <div>
                            <span className="font-bold text-navy-900">
                              {item.percentage}%
                            </span>
                            <p className="text-[11px] text-slate-500">
                              {item.presentCount}P / {item.lateCount}L / {item.absentCount}A
                            </p>
                          </div>
                        ) : (
                          <span className="text-amber-700 font-medium">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Tab 3: Low Attendance Shortage List */}
      {activeTab === 'SHORTAGE' &&
        (summary.lowAttendanceStudents.length === 0 ? (
          <EmptyState
            title="Zero Low-Attendance Students"
            description={`All students in the selected filter scope currently meet the ${summary.lowAttendanceThreshold}% threshold.`}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-red-50/70 text-red-900 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Section</th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Attended / Total
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {summary.lowAttendanceStudents.map((st) => (
                    <tr key={st.student.id} className="hover:bg-red-50/30">
                      <td className="px-4 py-3.5 font-mono font-semibold text-navy-900">
                        {st.student.rollNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentId(st.student.id)}
                          className="font-semibold text-navy-900 hover:text-blue-600"
                        >
                          {st.student.name}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {st.course.shortName} • {st.section.displayName}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-700">
                        {st.attendedCount} / {st.totalSessions}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge variant="red">{st.attendancePercentage}%</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

