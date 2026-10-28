import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpDown,
  Eye,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { useToast } from '../../context/ToastContext';
import { erpService } from '../../services/erpService';
import { EnrollmentStatus } from '../../types/erp';
import { Badge, getEnrollmentBadgeVariant } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StudentDetailModal } from '../../components/shared/StudentDetailModal';

export const HodStudentsPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'ALL'>('ALL');
  const [lowAttendanceOnly, setLowAttendanceOnly] = useState(
    searchParams.get('lowAttendance') === '1'
  );
  const [sortBy, setSortBy] = useState<
    'rollNumber' | 'name' | 'attendanceAsc' | 'attendanceDesc' | 'cgpaDesc'
  >('rollNumber');

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const currentThreshold = erpService.getLowAttendanceThreshold();
  const [thresholdInput, setThresholdInput] = useState<string>(String(currentThreshold));

  if (!currentUser) return null;

  const coursesMeta = erpService.getDepartmentCoursesData(currentUser.departmentId);
  const students = erpService.getDepartmentStudents(currentUser.departmentId, {
    search,
    courseId: courseFilter,
    semester: semesterFilter,
    sectionId: sectionFilter,
    enrollmentStatus: statusFilter,
    lowAttendanceOnly,
    sortBy,
  });

  const semesters = Array.from(
    new Set(coursesMeta.sections.map((s) => s.semester))
  ).sort((a, b) => a - b);

  const handleThresholdApply = (e: React.FormEvent) => {
    e.preventDefault();
    const res = erpService.setLowAttendanceThreshold(Number(thresholdInput));
    if (!res.ok) {
      showToast(res.error ?? 'Invalid attendance threshold.', 'error');
      return;
    }
    showToast(
      `Low-attendance warning threshold updated to ${Math.round(Number(thresholdInput))}%.`,
      'success'
    );
  };

  const resetFilters = () => {
    setSearch('');
    setCourseFilter('ALL');
    setSemesterFilter('ALL');
    setSectionFilter('ALL');
    setStatusFilter('ALL');
    setLowAttendanceOnly(false);
    setSortBy('rollNumber');
  };

  return (
    <div className="space-y-6">
      {/* Header + Threshold Config */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            HOD Portal • Authorized Department Roster
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Student Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect enrollment records, cumulative attendance summaries, and shortage warnings
            for students in your department.
          </p>
        </div>

        <form
          onSubmit={handleThresholdApply}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <label htmlFor="hod-att-threshold" className="text-xs font-medium text-slate-600">
            Warning Threshold %:
          </label>
          <input
            id="hod-att-threshold"
            type="number"
            min={50}
            max={95}
            value={thresholdInput}
            onChange={(e) => setThresholdInput(e.target.value)}
            className="w-16 rounded border border-slate-300 px-2 py-1 text-xs font-semibold text-navy-900 text-center"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800"
          >
            Apply
          </button>
        </form>
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
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Courses</option>
            {coursesMeta.courses.map(({ course }) => (
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
            {coursesMeta.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.displayName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnrollmentStatus | 'ALL')}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
          >
            <option value="ALL">All Enrollment Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Medical Leave">Medical Leave</option>
            <option value="Detained">Detained</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowAttendanceOnly}
              onChange={(e) => setLowAttendanceOnly(e.target.checked)}
              className="rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
            <span>
              Show Only Low-Attendance Warnings (&lt;{currentThreshold}%)
            </span>
          </label>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800"
            >
              <option value="rollNumber">Student ID (A → Z)</option>
              <option value="name">Student Name (A → Z)</option>
              <option value="attendanceAsc">Attendance % (Lowest First)</option>
              <option value="attendanceDesc">Attendance % (Highest First)</option>
              <option value="cgpaDesc">CGPA (Highest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <EmptyState
          title="No student records match your current criteria"
          description="Try resetting search terms, section filters, or the low-attendance toggle."
          actionLabel="Clear All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Course / Sem / Section
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Enrollment Status</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Attendance Summary
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Detail</th>
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
                    <td className="px-4 py-3.5 font-mono font-semibold text-navy-900">
                      {item.student.rollNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(item.student.id)}
                        className="text-sm font-semibold text-navy-900 hover:text-blue-600 text-left"
                      >
                        {item.student.name}
                      </button>
                      <p className="text-[11px] text-slate-500">
                        CGPA: {item.student.cgpa.toFixed(2)} • {item.student.email}
                      </p>
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
                      {item.attendancePercentage !== null ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.isLowAttendance ? 'red' : 'green'}>
                              {item.attendancePercentage}%
                            </Badge>
                            {item.isLowAttendance && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Shortage Warning
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {item.presentCount}P • {item.lateCount}L • {item.absentCount}A (
                            {item.totalSessions} sessions)
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">No Marked Sessions</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(item.student.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-navy-900 hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        Open Profile
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

