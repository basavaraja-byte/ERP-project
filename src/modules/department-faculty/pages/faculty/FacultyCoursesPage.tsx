import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  ClipboardCheck,
  Clock,
  Eye,
  GraduationCap,
  Lock,
  Megaphone,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { erpService } from '../../services/erpService';
import {
  Badge,
  getEnrollmentBadgeVariant,
  getPriorityBadgeVariant,
} from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StudentDetailModal } from '../../components/shared/StudentDetailModal';

export const FacultyCoursesPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const navigate = useNavigate();

  const offerings = currentUser
    ? erpService.getFacultyCourses(currentUser.facultyId)
    : [];

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    offerings[0]?.assignmentId ?? ''
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (
      offerings.length > 0 &&
      !offerings.some((o) => o.assignmentId === selectedAssignmentId)
    ) {
      setSelectedAssignmentId(offerings[0].assignmentId);
    }
  }, [offerings, selectedAssignmentId]);

  if (!currentUser) return null;

  const activeDetail = selectedAssignmentId
    ? erpService.getFacultyCourseOfferingDetail(
        currentUser.facultyId,
        selectedAssignmentId
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Faculty Portal • Primary Module B
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Assigned Courses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Switch between your assigned courses and sections to inspect class lists,
            timetable schedules, attendance summaries, and deadlines.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          Subject Allocations Controlled by HOD
        </span>
      </div>

      {offerings.length === 0 ? (
        <EmptyState
          title="No courses or subjects currently assigned"
          description="Your Head of Department has not yet assigned active subjects to your profile for this semester."
        />
      ) : (
        <>
          {/* Assigned Course & Section Switcher Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offerings.map((off) => {
              const isSelected = off.assignmentId === selectedAssignmentId;
              return (
                <button
                  key={off.assignmentId}
                  type="button"
                  onClick={() => setSelectedAssignmentId(off.assignmentId)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-blue-500/30'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-300' : 'text-blue-700'
                      }`}
                    >
                      {off.course.code} • {off.subject.code}
                    </span>
                    <Badge variant={isSelected ? 'blue' : 'slate'}>
                      AY {off.subject.academicYear}
                    </Badge>
                  </div>

                  <h2 className="text-sm font-bold mt-1.5">{off.subject.name}</h2>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-navy-200' : 'text-slate-500'
                    }`}
                  >
                    Semester {off.subject.semester} • {off.section.displayName} (Room{' '}
                    {off.section.roomNumber})
                  </p>

                  <div
                    className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${
                      isSelected
                        ? 'border-navy-700 text-slate-200'
                        : 'border-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <strong>{off.enrolledStudentsCount}</strong> Students
                    </span>
                    <span>
                      Avg Att:{' '}
                      <strong>
                        {off.averageAttendancePercent !== null
                          ? `${off.averageAttendancePercent}%`
                          : 'N/A'}
                      </strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Course & Section Detail Workspace */}
          {activeDetail && (
            <div className="space-y-6">
              {/* Course Summary Banner */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="navy">{activeDetail.offering.subject.code}</Badge>
                    <Badge variant="blue">
                      {activeDetail.offering.section.displayName}
                    </Badge>
                    <Badge variant="slate">
                      {activeDetail.offering.subject.credits} Credits •{' '}
                      {activeDetail.offering.subject.weeklyHours} hrs/week
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-navy-900">
                    {activeDetail.offering.subject.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeDetail.offering.subject.syllabusSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">Attendance Summary</p>
                    <p className="text-lg font-bold text-navy-900">
                      {activeDetail.offering.averageAttendancePercent !== null
                        ? `${activeDetail.offering.averageAttendancePercent}%`
                        : 'No Sessions'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {activeDetail.offering.completedSessionsCount} Completed •{' '}
                      {activeDetail.offering.pendingSessionsCount} Pending
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/faculty/attendance?assignmentId=${activeDetail.offering.assignmentId}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Open Class Attendance
                  </button>
                </div>
              </div>

              {/* Timetable + Deadlines + Announcements Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Timetable Entries */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-blue-600" />
                    Weekly Timetable Entries
                  </h4>
                  <div className="space-y-2">
                    {activeDetail.offering.timetableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-navy-900">{slot.dayOfWeek}</p>
                          <p className="text-slate-500">{slot.slotLabel}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="slate">{slot.room}</Badge>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {slot.sessionType}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Deadlines */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Upcoming Academic Deadlines
                  </h4>
                  {activeDetail.offering.subject.upcomingDeadlines.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No upcoming assessments or milestones scheduled.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {activeDetail.offering.subject.upcomingDeadlines.map((dl) => (
                        <div
                          key={dl.id}
                          className="rounded-lg border border-slate-200 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="amber">{dl.category}</Badge>
                            <span className="font-semibold text-slate-700">
                              Due {dl.dueDate}
                            </span>
                          </div>
                          <p className="font-semibold text-navy-900 mt-1.5">{dl.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relevant Announcements */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-emerald-600" />
                    Relevant Announcements
                  </h4>
                  {activeDetail.announcements.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No circulars for this class.
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {activeDetail.announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant={getPriorityBadgeVariant(ann.priority)}>
                              {ann.priority}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {ann.publishedAt}
                            </span>
                          </div>
                          <p className="font-semibold text-navy-900 mt-1">{ann.title}</p>
                          <p className="text-slate-600 mt-0.5 line-clamp-2">
                            {ann.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Enrolled Class Student List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-navy-900">
                    Enrolled Class Roster — {activeDetail.offering.section.displayName} (
                    {activeDetail.students.length} Students)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Attendance shown for {activeDetail.offering.subject.code}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-center font-semibold">
                          P / L / A ({activeDetail.offering.subject.code})
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Subject Attendance %
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">Profile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeDetail.students.map((st) => (
                        <tr key={st.student.id} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                            {st.student.rollNumber}
                          </td>
                          <td className="px-4 py-3 font-semibold text-navy-900">
                            {st.student.name}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={getEnrollmentBadgeVariant(
                                st.student.enrollmentStatus
                              )}
                            >
                              {st.student.enrollmentStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">
                            {st.presentCount}P / {st.lateCount}L / {st.absentCount}A
                          </td>
                          <td className="px-4 py-3 text-center">
                            {st.attendancePercentage !== null ? (
                              <Badge variant={st.isLowAttendance ? 'red' : 'green'}>
                                {st.attendancePercentage}%
                              </Badge>
                            ) : (
                              <span className="text-slate-400">No Sessions</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedStudentId(st.student.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

