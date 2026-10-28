import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Eye,
  GraduationCap,
  Search,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { EnrichedOffering, erpService } from '../../services/erpService';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { AssignFacultyModal } from '../../components/shared/AssignFacultyModal';

export const HodCoursesPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();

  const [courseFilter, setCourseFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [assignmentState, setAssignmentState] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>(
    'ALL'
  );
  const [search, setSearch] = useState('');

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [offeringToAssign, setOfferingToAssign] = useState<EnrichedOffering | null>(null);

  if (!currentUser) return null;

  const baseData = erpService.getDepartmentCoursesData(currentUser.departmentId);
  const filteredData = erpService.getDepartmentCoursesData(currentUser.departmentId, {
    courseId: courseFilter,
    semester: semesterFilter,
    subjectId: subjectFilter,
    sectionId: sectionFilter,
    assignmentState,
    search,
  });

  const semesters = Array.from(
    new Set(baseData.subjects.map((s) => s.semester))
  ).sort((a, b) => a - b);

  const selectedCourseSummary = selectedCourseId
    ? baseData.courses.find((c) => c.course.id === selectedCourseId) ?? null
    : null;

  const selectedCourseOfferings = selectedCourseId
    ? baseData.offerings.filter((o) => o.course.id === selectedCourseId)
    : [];

  const resetFilters = () => {
    setCourseFilter('ALL');
    setSemesterFilter('ALL');
    setSubjectFilter('ALL');
    setSectionFilter('ALL');
    setAssignmentState('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
          HOD Portal • Curriculum & Subject Allocations
        </p>
        <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Courses & Subjects</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage department degree courses, semester subjects, class sections, student
          enrollments, and faculty teaching assignments.
        </p>
      </div>

      {/* Department Courses Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {baseData.courses.map(({ course, subjectsCount, sectionsCount, enrolledStudentsCount }) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="navy">{course.code}</Badge>
                  <Badge variant="blue">{course.degreeType}</Badge>
                  <span className="text-xs text-slate-500">AY {course.academicYear}</span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {course.durationSemesters} Semesters
                </span>
              </div>
              <h2 className="text-base font-bold text-navy-900 mt-2">{course.name}</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {course.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <strong>{subjectsCount}</strong> Subjects
                </span>
                <span>•</span>
                <span>
                  <strong>{sectionsCount}</strong> Sections
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>{enrolledStudentsCount}</strong> Students
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-navy-900 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Course Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject code, name, or instructor..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Courses</option>
            {baseData.courses.map(({ course }) => (
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Semesters</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            {baseData.subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="ALL">All Sections</option>
            {baseData.sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.displayName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {(['ALL', 'ASSIGNED', 'UNASSIGNED'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setAssignmentState(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  assignmentState === tab
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL'
                  ? 'All Offerings'
                  : tab === 'ASSIGNED'
                  ? 'Assigned Only'
                  : 'Unassigned Only'}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500">
            Showing <strong>{filteredData.offerings.length}</strong> subject-section
            offerings
          </span>
        </div>
      </div>

      {/* Subject-Section Allocation Table */}
      {filteredData.offerings.length === 0 ? (
        <EmptyState
          title="No subject-section offerings match your filters"
          description="Clear one or more course, semester, subject, or section filters to view offerings."
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
                    Course / Sem / Section
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Academic Year</th>
                  <th className="px-4 py-3 text-center font-semibold">Enrolled</th>
                  <th className="px-4 py-3 text-left font-semibold">Assigned Faculty</th>
                  <th className="px-4 py-3 text-right font-semibold">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredData.offerings.map((off) => (
                  <tr key={off.assignmentId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">{off.subject.code}</span>
                        <Badge variant="slate">{off.subject.type}</Badge>
                        <span className="text-[11px] text-slate-400">
                          {off.subject.credits} Cr • {off.subject.weeklyHours}h/wk
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-navy-900 mt-0.5">
                        {off.subject.name}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800">{off.course.shortName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Semester {off.subject.semester} • {off.section.displayName} (Room{' '}
                        {off.section.roomNumber})
                      </p>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {off.subject.academicYear}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <Badge variant="blue">{off.enrolledStudentsCount} Students</Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      {off.faculty ? (
                        <div>
                          <p className="font-semibold text-navy-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            {off.faculty.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {off.faculty.designation}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="red" dot>
                          Unassigned
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setOfferingToAssign(off)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          off.faculty
                            ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        {off.faculty ? 'Reassign' : 'Assign Faculty'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourseSummary && (
        <Modal
          open={true}
          onClose={() => setSelectedCourseId(null)}
          title={`${selectedCourseSummary.course.name} (${selectedCourseSummary.course.code})`}
          subtitle={`${selectedCourseSummary.course.degreeType} • ${selectedCourseSummary.course.durationSemesters} Semesters • AY ${selectedCourseSummary.course.academicYear}`}
          maxWidthClass="max-w-3xl"
          footer={
            <button
              type="button"
              onClick={() => setSelectedCourseId(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800"
            >
              Close Course Details
            </button>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              {selectedCourseSummary.course.description}
            </p>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-lg font-bold text-navy-900">
                  {selectedCourseSummary.subjectsCount}
                </p>
                <p className="text-[11px] text-slate-500">Active Subjects</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-lg font-bold text-navy-900">
                  {selectedCourseSummary.sectionsCount}
                </p>
                <p className="text-[11px] text-slate-500">Class Sections</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-lg font-bold text-navy-900">
                  {selectedCourseSummary.enrolledStudentsCount}
                </p>
                <p className="text-[11px] text-slate-500">Enrolled Students</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Course Subject & Section Allocations
              </h4>
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                {selectedCourseOfferings.map((off) => (
                  <div
                    key={off.assignmentId}
                    className="p-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-navy-900">
                        Sem {off.subject.semester} • {off.subject.code} — {off.subject.name}{' '}
                        ({off.section.displayName})
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {off.subject.syllabusSummary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {off.faculty ? (
                        <Badge variant="green">{off.faculty.name}</Badge>
                      ) : (
                        <Badge variant="red">Unassigned</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => setOfferingToAssign(off)}
                        className="px-2.5 py-1 rounded border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <AssignFacultyModal
        open={offeringToAssign !== null}
        offering={offeringToAssign}
        onClose={() => setOfferingToAssign(null)}
      />
    </div>
  );
};

