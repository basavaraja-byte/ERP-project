import React from 'react';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge, getComplaintStatusBadgeVariant, getEnrollmentBadgeVariant } from '../ui/Badge';
import { erpService } from '../../services/erpService';
import { useDemoAuth } from '../../context/DemoAuthContext';

interface StudentDetailModalProps {
  studentId: string | null;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentId,
  onClose,
}) => {
  const { currentUser } = useDemoAuth();

  if (!studentId || !currentUser) return null;

  const detail = erpService.getStudentDetail(studentId, {
    role: currentUser.role,
    departmentId: currentUser.departmentId,
    facultyId: currentUser.facultyId,
  });

  if (!detail) {
    return (
      <Modal open={true} onClose={onClose} title="Student Record Restricted">
        <p className="text-sm text-slate-600">
          This student record is outside your authorized department or assigned classes.
        </p>
      </Modal>
    );
  }

  const { enrichedStudent, classAdvisor, recentAttendanceLogs, studentComplaints } = detail;
  const { student, campus, department, course, section } = enrichedStudent;
  const threshold = erpService.getLowAttendanceThreshold();

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`${student.name} (${student.rollNumber})`}
      subtitle={`${course.name} • Semester ${student.semester} • ${section.displayName}`}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Official Registrar Student Master Record — Read-Only View
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-navy-900 text-white hover:bg-navy-800"
          >
            Close Profile
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Low Attendance Warning Banner */}
        {enrichedStudent.isLowAttendance && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900">
              <p className="font-semibold text-sm">
                Attendance Shortage Alert — {enrichedStudent.attendancePercentage}% (Threshold:{' '}
                {threshold}%)
              </p>
              <p className="mt-0.5">
                Student is currently below the minimum institutional attendance requirement across{' '}
                {currentUser.role === 'FACULTY' ? 'your assigned classes' : 'department courses'}.
              </p>
            </div>
          </div>
        )}

        {/* Official Read-Only Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Academic Identity
              </span>
              <Badge variant={getEnrollmentBadgeVariant(student.enrollmentStatus)} dot>
                {student.enrollmentStatus}
              </Badge>
            </div>
            <div className="text-xs space-y-1.5 text-slate-700">
              <p className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  <strong>Roll ID:</strong> {student.rollNumber}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  <strong>Batch / AY:</strong> {student.admissionYear} ({student.academicYear})
                </span>
              </p>
              <p>
                <strong>Cumulative GPA:</strong>{' '}
                <span className="font-semibold text-navy-900">{student.cgpa.toFixed(2)}</span> / 10.0
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Campus & Department
            </span>
            <div className="text-xs space-y-1.5 text-slate-700">
              <p className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate" title={campus.name}>
                  {campus.name}
                </span>
              </p>
              <p>
                <strong>Department:</strong> {department.code} ({department.name})
              </p>
              <p>
                <strong>Class Advisor:</strong> {classAdvisor ? classAdvisor.name : 'Unassigned'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Contact & Guardian (Read-Only)
            </span>
            <div className="text-xs space-y-1.5 text-slate-700">
              <p className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {student.guardianName} ({student.guardianPhone})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Subject-wise Attendance Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-navy-900">
              {currentUser.role === 'FACULTY'
                ? 'Subject-Wise Attendance (Your Assigned Subjects)'
                : 'Department Subject-Wise Attendance Breakdown'}
            </h3>
            <span className="text-xs text-slate-500">
              Overall:{' '}
              <strong
                className={
                  enrichedStudent.isLowAttendance ? 'text-red-600' : 'text-emerald-700'
                }
              >
                {enrichedStudent.attendancePercentage !== null
                  ? `${enrichedStudent.attendancePercentage}%`
                  : 'No Sessions'}
              </strong>{' '}
              ({enrichedStudent.attendedCount}/{enrichedStudent.totalSessions} attended)
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-3.5 py-2.5 text-left font-semibold">Subject</th>
                  <th className="px-3.5 py-2.5 text-left font-semibold">Instructor</th>
                  <th className="px-3.5 py-2.5 text-center font-semibold">Present</th>
                  <th className="px-3.5 py-2.5 text-center font-semibold">Late</th>
                  <th className="px-3.5 py-2.5 text-center font-semibold">Absent</th>
                  <th className="px-3.5 py-2.5 text-right font-semibold">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {enrichedStudent.subjectAttendance.map((subAtt) => (
                  <tr key={subAtt.subject.id}>
                    <td className="px-3.5 py-2.5">
                      <span className="font-semibold text-navy-900">
                        {subAtt.subject.code}
                      </span>{' '}
                      <span className="text-slate-600">— {subAtt.subject.name}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600">{subAtt.facultyName}</td>
                    <td className="px-3.5 py-2.5 text-center text-emerald-700 font-medium">
                      {subAtt.presentCount}
                    </td>
                    <td className="px-3.5 py-2.5 text-center text-amber-700 font-medium">
                      {subAtt.lateCount}
                    </td>
                    <td className="px-3.5 py-2.5 text-center text-red-600 font-medium">
                      {subAtt.absentCount}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      {subAtt.percentage !== null ? (
                        <Badge variant={subAtt.isLowAttendance ? 'red' : 'green'}>
                          {subAtt.percentage}%
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

        {/* Recent Session Attendance Logs & Student-Facing Complaints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Recent Attendance Entries
            </h4>
            {recentAttendanceLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No completed attendance logs recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {recentAttendanceLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.sessionId}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{log.subjectCode}</span>{' '}
                      <span className="text-slate-500">
                        • {log.date} ({log.slotLabel})
                      </span>
                      {log.remarks && (
                        <p className="text-[11px] text-slate-400">{log.remarks}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        log.status === 'Present'
                          ? 'green'
                          : log.status === 'Late'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Student Grievance Summary
              </h4>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Student-Safe View
              </span>
            </div>
            {studentComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No department complaints submitted by this student.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {studentComplaints.map((c) => (
                  <div
                    key={c.complaint.id}
                    className="rounded border border-slate-200 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-navy-900">{c.complaint.id}</span>
                      <Badge variant={getComplaintStatusBadgeVariant(c.complaint.status)}>
                        {c.complaint.status}
                      </Badge>
                    </div>
                    <p className="text-slate-700 font-medium mt-1">{c.complaint.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {c.complaint.category} • {c.complaint.history.length} public timeline
                      update(s)
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

