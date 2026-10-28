import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  Eye,
  Lock,
  Search,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { erpService } from '../../services/erpService';
import { EnrollmentStatus } from '../../types/erp';
import { Badge, getEnrollmentBadgeVariant } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StudentDetailModal } from '../../components/shared/StudentDetailModal';

export const FacultyStudentsPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'ALL'>('ALL');
  const [lowAttendanceOnly, setLowAttendanceOnly] = useState(
    searchParams.get('lowAttendance') === '1'
  );
  const [sortBy, setSortBy] = useState<
    'rollNumber' | 'name' | 'attendanceAsc' | 'attendanceDesc' | 'cgpaDesc'
  >('rollNumber');

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (!currentUser) return null;

  const assignedOfferings = erpService.getFacultyCourses(currentUser.facultyId);
  const threshold = erpService.getLowAttendanceThreshold();

  const uniqueCourses = Array.from(
    new Map(assignedOfferings.map((o) => [o.course.id, o.course])).values()
  );
  const uniqueSections = Array.from(
    new Map(assignedOfferings.map((o) => [o.section.id, o.section])).values()
  );
  const uniqueSubjects = Array.from(
    new Map(assignedOfferings.map((o) => [o.subject.id, o.subject])).values()
  );
  const uniqueSemesters = Array.from(
    new Set(assignedOfferings.map((o) => o.subject.semester))
  ).sort((a, b) => a - b);

  const students = erpService.getFacultyStudents(currentUser.facultyId, {
    search,
    courseId: courseFilter,
    semester: semesterFilter,
    sectionId: sectionFilter,
    subjectId: subjectFilter,
    enrollmentStatus: statusFilter,
    lowAttendanceOnly,
    sortBy,
  });

  const resetFilters = () => {
    setSearch('');
    setCourseFilter('ALL');
    setSemesterFilter('ALL');
    setSectionFilter('ALL');
    setSubjectFilter('ALL');
    setStatusFilter('ALL');
    setLowAttendanceOnly(false);
    setSortBy('rollNumber');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Faculty Portal • Primary Module A
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Student Details</h1>
          <p className="text-xs text-slate-500 mt-1">
            Scoped strictly to students enrolled in your assigned courses, classes, and
            sections. Official student master records are read-only.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          Official Student Records: Read-Only
        </span>
      </div>

      {/* Filters & Sorting */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student ID, name, or email..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Assigned Subjects</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Assigned Sections</option>
            {uniqueSections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.displayName}
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
            {uniqueSemesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnrollmentStatus | 'ALL')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Medical Leave">Medical Leave</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={lowAttendanceOnly}
                onChange={(e) => setLowAttendanceOnly(e.target.checked)}
                className="rounded border-slate-300 text-red-600"
              />
              <span>Low-Attendance Warnings Only (&lt;{threshold}%)</span>
            </label>

            {uniqueCourses.length > 1 && (
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs"
              >
                <option value="ALL">All Courses</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="rollNumber">Student ID</option>
              <option value="name">Name (A → Z)</option>
              <option value="attendanceAsc">Attendance (Lowest First)</option>
              <option value="attendanceDesc">Attendance (Highest First)</option>
              <option value="cgpaDesc">CGPA (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      {students.length === 0 ? (
        <EmptyState
          title="No students found in your assigned classes for this filter"
          description="Clear search or filter options to view students enrolled in your assigned sections."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student ID & Name</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Campus & Department
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Course / Sem / Section
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Enrollment</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Subject-Wise Attendance
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {students.map((item) => (
                  <tr
                    key={item.student.id}
                    className={`hover:bg-slate-50/80 ${
                      item.isLowAttendance ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        {item.student.rollNumber}
                      </span>
                      <p className="text-sm font-semibold text-navy-900 mt-0.5">
                        {item.student.name}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{item.department.code}</p>
                      <p className="text-[11px] text-slate-500">{item.campus.city} Campus</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{item.course.shortName}</p>
                      <p className="text-[11px] text-slate-500">
                        Sem {item.student.semester} • {item.section.displayName}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={getEnrollmentBadgeVariant(item.student.enrollmentStatus)}
                        dot
                      >
                        {item.student.enrollmentStatus}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {item.subjectAttendance.map((sub) => (
                          <div
                            key={sub.subject.id}
                            className="flex items-center gap-2 text-[11px]"
                          >
                            <span className="font-semibold text-slate-700">
                              {sub.subject.code}:
                            </span>
                            {sub.percentage !== null ? (
                              <span
                                className={`font-semibold ${
                                  sub.isLowAttendance
                                    ? 'text-red-600'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {sub.percentage}% ({sub.attendedCount}/{sub.totalSessions})
                              </span>
                            ) : (
                              <span className="text-slate-400">No sessions</span>
                            )}
                          </div>
                        ))}
                        {item.isLowAttendance && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            Below {threshold}% Warning
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(item.student.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-navy-900 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Student Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StudentDetailModal
        studentId={selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
      />
    </div>
  );
};

