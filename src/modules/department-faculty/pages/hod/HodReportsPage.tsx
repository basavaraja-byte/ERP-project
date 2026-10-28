import React, { useState } from 'react';
import {
  ClipboardCheck,
  Download,
  GraduationCap,
  MessageSquareWarning,
  UserCog,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { useToast } from '../../context/ToastContext';
import { erpService } from '../../services/erpService';
import {
  Badge,
  getComplaintStatusBadgeVariant,
  getEnrollmentBadgeVariant,
} from '../../components/ui/Badge';

type ReportTab = 'workload' | 'enrollment' | 'attendance' | 'complaints';

export const HodReportsPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser, department } = useDemoAuth();
  const { showToast } = useToast();
  const [activeReport, setActiveReport] = useState<ReportTab>('workload');

  if (!currentUser || !department) return null;

  const workloads = erpService.getDepartmentFaculty(currentUser.departmentId);
  const students = erpService.getDepartmentStudents(currentUser.departmentId);
  const attendance = erpService.getDepartmentAttendanceSummary(currentUser.departmentId);
  const complaints = erpService.getDepartmentComplaints(currentUser.departmentId);

  const handleDownloadCsv = (type: ReportTab) => {
    const { filename, csv } = erpService.generateCsvContent(
      type,
      currentUser.departmentId
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filename} (${csv.split('\n').length - 1} rows).`, 'success');
  };

  const tabs: Array<{
    id: ReportTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    countLabel: string;
  }> = [
    {
      id: 'workload',
      label: 'Faculty Workload',
      icon: UserCog,
      countLabel: `${workloads.length} Faculty`,
    },
    {
      id: 'enrollment',
      label: 'Student Enrollment',
      icon: GraduationCap,
      countLabel: `${students.length} Students`,
    },
    {
      id: 'attendance',
      label: 'Attendance Summary',
      icon: ClipboardCheck,
      countLabel: `${attendance.overallPercent}% Avg`,
    },
    {
      id: 'complaints',
      label: 'Complaint Status',
      icon: MessageSquareWarning,
      countLabel: `${complaints.length} Records`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            HOD Portal • Institutional Analytics & Local CSV Export
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">
            Department Reports — {department.code}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Live department registers for workload, student enrollment, attendance, and
            complaint resolution with instant CSV export.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleDownloadCsv(activeReport)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Current Report (.CSV)
        </button>
      </div>

      {/* Report Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id)}
              className={`text-left rounded-xl border p-4 transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-navy-900 text-white border-navy-900 shadow'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <p
                  className={`text-xs font-semibold ${
                    isActive ? 'text-blue-300' : 'text-slate-500'
                  }`}
                >
                  {tab.countLabel}
                </p>
                <p className="text-sm font-bold mt-0.5">{tab.label}</p>
              </div>
              <Icon
                className={`w-5 h-5 ${isActive ? 'text-blue-300' : 'text-slate-400'}`}
              />
            </button>
          );
        })}
      </div>

      {/* Active Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeReport === 'workload' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Employee ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Faculty Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Designation</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Subjects / Sections
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">Weekly Hours</th>
                  <th className="px-4 py-3 text-right font-semibold">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workloads.map((w) => (
                  <tr key={w.faculty.id}>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {w.faculty.employeeCode}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-900">
                      {w.faculty.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{w.faculty.designation}</td>
                    <td className="px-4 py-3 text-center">
                      {w.assignedSubjectsCount} Subj / {w.assignedSectionsCount} Sec
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {w.assignedWeeklyHours} / {w.maxWeeklyHours} hrs
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant={
                          w.workloadStatus === 'Overloaded'
                            ? 'red'
                            : w.workloadStatus === 'Sabbatical'
                            ? 'slate'
                            : 'green'
                        }
                      >
                        {w.utilizationPercent}% ({w.workloadStatus})
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'enrollment' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Course / Sem / Section
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">CGPA</th>
                  <th className="px-4 py-3 text-center font-semibold">Attendance</th>
                  <th className="px-4 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {students.map((s) => (
                  <tr key={s.student.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-navy-900">
                      {s.student.rollNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {s.student.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.course.shortName} • Sem {s.student.semester} ({s.section.name})
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {s.student.cgpa.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.attendancePercentage !== null ? (
                        <Badge variant={s.isLowAttendance ? 'red' : 'green'}>
                          {s.attendancePercentage}%
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={getEnrollmentBadgeVariant(s.student.enrollmentStatus)}>
                        {s.student.enrollmentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'attendance' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold">Section</th>
                  <th className="px-4 py-3 text-left font-semibold">Instructor</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Completed / Pending
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.offeringSummaries.map((o) => (
                  <tr key={o.offering.assignmentId}>
                    <td className="px-4 py-3 font-semibold text-navy-900">
                      {o.offering.subject.code} — {o.offering.subject.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {o.offering.section.displayName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {o.offering.faculty?.name ?? 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {o.completedCount} Marked / {o.pendingCount} Pending
                    </td>
                    <td className="px-4 py-3 text-right">
                      {o.attendancePercent !== null ? (
                        <Badge
                          variant={
                            o.attendancePercent < attendance.lowAttendanceThreshold
                              ? 'red'
                              : 'green'
                          }
                        >
                          {o.attendancePercent}%
                        </Badge>
                      ) : (
                        <span className="text-slate-400">No Records</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'complaints' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Complaint ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Assignee</th>
                  <th className="px-4 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {complaints.map((c) => (
                  <tr key={c.complaint.id}>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                      {c.complaint.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.complaint.submittedAt}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {c.student.name} ({c.student.rollNumber})
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.complaint.category}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.assignedFaculty?.name ?? 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={getComplaintStatusBadgeVariant(c.complaint.status)}>
                        {c.complaint.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

