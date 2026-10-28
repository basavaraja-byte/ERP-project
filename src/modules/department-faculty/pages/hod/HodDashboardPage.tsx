import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Megaphone,
  MessageSquareWarning,
  UserCog,
  UserPlus,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { EnrichedOffering, erpService } from '../../services/erpService';
import { StatCard } from '../../components/ui/StatCard';
import {
  Badge,
  getComplaintStatusBadgeVariant,
  getPriorityBadgeVariant,
} from '../../components/ui/Badge';
import { AssignFacultyModal } from '../../components/shared/AssignFacultyModal';
import { StudentDetailModal } from '../../components/shared/StudentDetailModal';
import { ComplaintDetailModal } from '../../components/shared/ComplaintDetailModal';

export const HodDashboardPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const navigate = useNavigate();

  const [offeringToAssign, setOfferingToAssign] = useState<EnrichedOffering | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  if (!currentUser) return null;

  const data = erpService.getHodDashboard(currentUser.departmentId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Head of Department Overview • {data.campus.name}
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">
            Department of {data.department.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Office: {data.department.officeLocation} • Live metrics computed from shared
            department registers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/hod/announcements')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <Megaphone className="w-4 h-4 text-blue-600" />
            New Announcement
          </button>
          <button
            type="button"
            onClick={() => navigate('/hod/reports')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Department Reports
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Calculated Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Department Students"
          value={data.totalStudents}
          subtitle={`${data.activeStudentsCount} Active • ${data.probationOrLeaveCount} Probation / Leave`}
          icon={GraduationCap}
          tone="blue"
          onClick={() => navigate('/hod/students')}
        />
        <StatCard
          label="Total Faculty Members"
          value={data.totalFaculty}
          subtitle={`${data.activeFacultyCount} Active • ${data.sabbaticalFacultyCount} On Sabbatical`}
          icon={UserCog}
          tone="navy"
          onClick={() => navigate('/hod/faculty')}
        />
        <StatCard
          label="Courses & Subjects"
          value={`${data.totalCourses} Courses / ${data.totalSubjects} Subjects`}
          subtitle={`${data.totalSections} Active Sections • ${data.unassignedOfferings.length} Unassigned`}
          icon={BookOpen}
          tone={data.unassignedOfferings.length > 0 ? 'amber' : 'green'}
          onClick={() => navigate('/hod/courses')}
        />
        <StatCard
          label="Department Attendance"
          value={`${data.departmentAttendancePercent}%`}
          subtitle={`${data.completedSessionsCount} Completed / ${data.pendingSessionsCount} Pending Registers (${data.attendanceCompletionPercent}%)`}
          icon={ClipboardCheck}
          tone={data.departmentAttendancePercent >= 75 ? 'green' : 'amber'}
          onClick={() => navigate('/hod/attendance')}
        />
        <StatCard
          label={`Low-Attendance Students (<${data.lowAttendanceThreshold}%)`}
          value={data.lowAttendanceStudents.length}
          subtitle={
            data.lowAttendanceStudents.length > 0
              ? 'Requires advisor review & counseling'
              : 'All students meet attendance threshold'
          }
          icon={AlertTriangle}
          tone={data.lowAttendanceStudents.length > 0 ? 'red' : 'green'}
          onClick={() => navigate('/hod/students?lowAttendance=1')}
        />
        <StatCard
          label="Open & In-Review Complaints"
          value={data.openComplaintsCount + data.inReviewComplaintsCount}
          subtitle={`${data.openComplaintsCount} Open • ${data.inReviewComplaintsCount} In Review • ${data.resolvedComplaintsCount} Resolved`}
          icon={MessageSquareWarning}
          tone={data.openComplaintsCount > 0 ? 'amber' : 'green'}
          onClick={() => navigate('/hod/complaints')}
        />
      </div>

      {/* Pending Tasks + Unassigned Subjects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Actionable Tasks */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Pending HOD Tasks</h2>
              <p className="text-xs text-slate-500">
                Action items derived from live department state
              </p>
            </div>
            <Badge variant={data.pendingTasks.length > 0 ? 'amber' : 'green'}>
              {data.pendingTasks.length} Pending
            </Badge>
          </div>

          {data.pendingTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-navy-900">All Clear</p>
              <p className="text-xs text-slate-500 mt-0.5">
                No unassigned offerings or unrouted escalations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.pendingTasks.map((task) => {
                const borderStyle =
                  task.severity === 'critical'
                    ? 'border-l-4 border-l-red-500 border-slate-200 bg-red-50/30'
                    : task.severity === 'warning'
                    ? 'border-l-4 border-l-amber-500 border-slate-200 bg-amber-50/30'
                    : 'border-l-4 border-l-blue-500 border-slate-200 bg-blue-50/30';

                return (
                  <div
                    key={task.id}
                    className={`rounded-lg border p-3.5 flex items-start justify-between gap-3 ${borderStyle}`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-navy-900">{task.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                        {task.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(task.linkTo)}
                      className="shrink-0 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-navy-900 hover:bg-slate-50"
                    >
                      {task.actionLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unassigned Subjects Quick-Allocation Panel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">
                Unassigned Subject Offerings ({data.unassignedOfferings.length})
              </h2>
              <p className="text-xs text-slate-500">
                Subject-section classes currently awaiting faculty instructor allocation
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hod/courses')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage All Subjects →
            </button>
          </div>

          {data.unassignedOfferings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center rounded-lg bg-emerald-50/50 border border-emerald-200">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-emerald-900">
                100% Subject Offerings Assigned
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Every course section in {data.department.code} has an active instructor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase">
                  <tr>
                    <th className="px-3.5 py-2.5 text-left font-semibold">Subject</th>
                    <th className="px-3.5 py-2.5 text-left font-semibold">Section</th>
                    <th className="px-3.5 py-2.5 text-left font-semibold">Schedule</th>
                    <th className="px-3.5 py-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.unassignedOfferings.map((off) => (
                    <tr key={off.assignmentId}>
                      <td className="px-3.5 py-3">
                        <p className="font-semibold text-navy-900">
                          {off.subject.code} — {off.subject.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {off.course.shortName} • {off.subject.weeklyHours} hrs/wk
                        </p>
                      </td>
                      <td className="px-3.5 py-3">
                        <Badge variant="slate">{off.section.displayName}</Badge>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {off.enrolledStudentsCount} students
                        </p>
                      </td>
                      <td className="px-3.5 py-3 text-slate-600">
                        {off.timetableSlots.map((s) => (
                          <div key={s.id} className="text-[11px]">
                            {s.dayOfWeek.slice(0, 3)} {s.slotLabel}
                          </div>
                        ))}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setOfferingToAssign(off)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Workload Overview + Low Attendance Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Faculty Workload Overview */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Faculty Workload Overview</h2>
              <p className="text-xs text-slate-500">
                Weekly teaching hours vs. designation norm capacity
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hod/faculty')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Faculty Directory →
            </button>
          </div>

          <div className="space-y-3.5">
            {data.facultyWorkloads.map((fw) => {
              const barColor =
                fw.workloadStatus === 'Sabbatical'
                  ? 'bg-slate-400'
                  : fw.workloadStatus === 'Overloaded'
                  ? 'bg-red-500'
                  : fw.workloadStatus === 'Light'
                  ? 'bg-amber-500'
                  : 'bg-blue-600';

              return (
                <div key={fw.faculty.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-navy-900 truncate">
                        {fw.faculty.name}
                      </span>
                      <span className="text-slate-400 hidden sm:inline">
                        • {fw.faculty.designation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-medium text-slate-700">
                        {fw.assignedWeeklyHours} / {fw.maxWeeklyHours} hrs
                      </span>
                      <Badge
                        variant={
                          fw.workloadStatus === 'Overloaded'
                            ? 'red'
                            : fw.workloadStatus === 'Sabbatical'
                            ? 'slate'
                            : fw.workloadStatus === 'Light'
                            ? 'amber'
                            : 'green'
                        }
                      >
                        {fw.workloadStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(100, fw.utilizationPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Attendance Watchlist */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">
                Attendance Shortage Watchlist
              </h2>
              <p className="text-xs text-slate-500">
                Students below {data.lowAttendanceThreshold}% department threshold
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hod/students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Students →
            </button>
          </div>

          {data.lowAttendanceStudents.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              Zero students currently below {data.lowAttendanceThreshold}% attendance.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {data.lowAttendanceStudents.map((st) => (
                <div
                  key={st.student.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentId(st.student.id)}
                      className="text-xs font-semibold text-navy-900 hover:text-blue-600 text-left truncate block"
                    >
                      {st.student.name} ({st.student.rollNumber})
                    </button>
                    <p className="text-[11px] text-slate-500">
                      {st.course.shortName} • {st.section.displayName} • Attended{' '}
                      {st.attendedCount}/{st.totalSessions}
                    </p>
                  </div>
                  <Badge variant="red">{st.attendancePercentage}%</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Complaints & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Recent Department Complaints</h2>
              <p className="text-xs text-slate-500">
                Click any complaint to inspect history or assign faculty
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hod/complaints')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All →
            </button>
          </div>

          <div className="space-y-2.5">
            {data.recentComplaints.map((item) => (
              <div
                key={item.complaint.id}
                onClick={() => setSelectedComplaintId(item.complaint.id)}
                className="rounded-lg border border-slate-200 hover:border-blue-300 p-3 cursor-pointer transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-900">
                      {item.complaint.id}
                    </span>
                    <Badge variant={getPriorityBadgeVariant(item.complaint.priority)}>
                      {item.complaint.priority}
                    </Badge>
                  </div>
                  <Badge variant={getComplaintStatusBadgeVariant(item.complaint.status)} dot>
                    {item.complaint.status}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-800 mt-1.5">
                  {item.complaint.title}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>
                    {item.student.name} ({item.section.displayName})
                  </span>
                  <span>
                    Assignee:{' '}
                    <strong
                      className={
                        item.assignedFaculty ? 'text-slate-700' : 'text-red-600'
                      }
                    >
                      {item.assignedFaculty ? item.assignedFaculty.name : 'Unassigned'}
                    </strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-navy-900">Recent Announcements</h2>
              <p className="text-xs text-slate-500">
                Latest department circulars and draft notices
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hod/announcements')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage Notices →
            </button>
          </div>

          <div className="space-y-2.5">
            {data.recentAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-lg border border-slate-200 p-3 bg-slate-50/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={ann.status === 'Published' ? 'green' : 'amber'}>
                      {ann.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(ann.priority)}>
                      {ann.priority}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400">{ann.updatedAt}</span>
                </div>
                <h3 className="text-xs font-semibold text-navy-900 mt-1.5">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Audience: <strong>{ann.audienceLabel}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignFacultyModal
        open={offeringToAssign !== null}
        offering={offeringToAssign}
        onClose={() => setOfferingToAssign(null)}
      />
      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
      />
    </div>
  );
};

