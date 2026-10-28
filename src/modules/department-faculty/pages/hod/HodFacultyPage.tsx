import React, { useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  UserPlus,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import {
  EnrichedOffering,
  FacultyWorkloadSummary,
  erpService,
} from '../../services/erpService';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { AssignFacultyModal } from '../../components/shared/AssignFacultyModal';

export const HodFacultyPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser, department } = useDemoAuth();

  const [search, setSearch] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workloadFilter, setWorkloadFilter] = useState('ALL');

  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [assignModalOffering, setAssignModalOffering] =
    useState<EnrichedOffering | null>(null);
  const [preselectedFacultyId, setPreselectedFacultyId] = useState<string | undefined>(
    undefined
  );

  // Quick-assign selector inside Faculty Detail modal
  const [offeringIdToAssignToFaculty, setOfferingIdToAssignToFaculty] = useState('');

  if (!currentUser || !department) return null;

  const facultyList = erpService.getDepartmentFaculty(currentUser.departmentId, {
    search,
    designation: designationFilter,
    status: statusFilter,
    workloadStatus: workloadFilter,
  });

  const allDepartmentOfferings = erpService.getDepartmentCoursesData(
    currentUser.departmentId
  ).offerings;

  const selectedFacultySummary: FacultyWorkloadSummary | null = selectedFacultyId
    ? erpService
        .getDepartmentFaculty(currentUser.departmentId)
        .find((f) => f.faculty.id === selectedFacultyId) ?? null
    : null;

  const handleOpenAssignForFaculty = (facultyId: string, offering: EnrichedOffering) => {
    setPreselectedFacultyId(facultyId);
    setAssignModalOffering(offering);
  };

  const resetFilters = () => {
    setSearch('');
    setDesignationFilter('ALL');
    setStatusFilter('ALL');
    setWorkloadFilter('ALL');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            HOD Portal • Faculty Directory & Teaching Load
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Faculty Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect faculty profiles, weekly teaching schedules, class advisorships, and
            subject-section assignments with conflict checks.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name, ID, subject code, specialization..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
        >
          <option value="ALL">All Designations</option>
          <option value="Professor & HOD">Professor & HOD</option>
          <option value="Professor">Professor</option>
          <option value="Associate Professor">Associate Professor</option>
          <option value="Assistant Professor">Assistant Professor</option>
          <option value="Senior Lecturer">Senior Lecturer</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
        >
          <option value="ALL">All Active / Leave Statuses</option>
          <option value="Active">Active</option>
          <option value="On Sabbatical">On Sabbatical</option>
        </select>

        <select
          value={workloadFilter}
          onChange={(e) => setWorkloadFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
        >
          <option value="ALL">All Workload Bands</option>
          <option value="Optimal">Optimal Load</option>
          <option value="Light">Light Load</option>
          <option value="Overloaded">Overloaded</option>
          <option value="Sabbatical">Sabbatical</option>
        </select>
      </div>

      {/* Faculty Directory Table */}
      {facultyList.length === 0 ? (
        <EmptyState
          title="No matching faculty records"
          description="Try clearing search keywords or adjusting designation and workload filters."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Faculty ID & Name</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Designation & Dept
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Assigned Subjects & Classes
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Weekly Workload</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {facultyList.map((item) => {
                  const { faculty } = item;
                  return (
                    <tr key={faculty.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-500">
                            {faculty.employeeCode}
                          </span>
                          <Badge
                            variant={faculty.status === 'Active' ? 'green' : 'slate'}
                            dot
                          >
                            {faculty.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-navy-900 mt-0.5">
                          {faculty.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {faculty.specialization}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{faculty.designation}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Dept. of {item.department.code} • Cabin {faculty.cabin}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        {item.assignedOfferings.length === 0 ? (
                          <span className="text-slate-400 italic">
                            No active subject assignments
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {item.assignedOfferings.map((off) => (
                              <button
                                key={off.assignmentId}
                                type="button"
                                onClick={() => {
                                  setPreselectedFacultyId(undefined);
                                  setAssignModalOffering(off);
                                }}
                                className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-medium text-left transition-colors"
                                title="Click to reassign this subject-section"
                              >
                                {off.subject.code} • {off.section.displayName}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 w-48">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-navy-900">
                            {item.assignedWeeklyHours} / {item.maxWeeklyHours} hrs
                          </span>
                          <Badge
                            variant={
                              item.workloadStatus === 'Overloaded'
                                ? 'red'
                                : item.workloadStatus === 'Light'
                                ? 'amber'
                                : item.workloadStatus === 'Sabbatical'
                                ? 'slate'
                                : 'green'
                            }
                          >
                            {item.workloadStatus}
                          </Badge>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.workloadStatus === 'Overloaded'
                                ? 'bg-red-500'
                                : item.workloadStatus === 'Light'
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(100, item.utilizationPercent)}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFacultyId(faculty.id);
                            setOfferingIdToAssignToFaculty('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-navy-900 hover:bg-slate-50"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          Details & Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Faculty Detail & Assignment Modal */}
      {selectedFacultySummary && (
        <Modal
          open={true}
          onClose={() => setSelectedFacultyId(null)}
          title={`${selectedFacultySummary.faculty.name} (${selectedFacultySummary.faculty.employeeCode})`}
          subtitle={`${selectedFacultySummary.faculty.designation} • Department of ${selectedFacultySummary.department.name}`}
          maxWidthClass="max-w-3xl"
          footer={
            <button
              type="button"
              onClick={() => setSelectedFacultyId(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800"
            >
              Close Faculty Profile
            </button>
          }
        >
          <div className="space-y-5">
            {/* Bio & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700">
              <div className="space-y-1.5">
                <p>
                  <strong>Qualification:</strong>{' '}
                  {selectedFacultySummary.faculty.qualification}
                </p>
                <p>
                  <strong>Specialization:</strong>{' '}
                  {selectedFacultySummary.faculty.specialization}
                </p>
                <p>
                  <strong>Joined:</strong> {selectedFacultySummary.faculty.joiningDate}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedFacultySummary.faculty.email}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedFacultySummary.faculty.phone}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Cabin {selectedFacultySummary.faculty.cabin} • Class Advisor:{' '}
                  {selectedFacultySummary.advisedSections.length > 0
                    ? selectedFacultySummary.advisedSections
                        .map((s) => s.displayName)
                        .join(', ')
                    : 'None'}
                </p>
              </div>
            </div>

            {/* Assign Additional Subject / Section Box */}
            <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Assign Subject & Section to {selectedFacultySummary.faculty.name}
              </h3>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <select
                  value={offeringIdToAssignToFaculty}
                  onChange={(e) => setOfferingIdToAssignToFaculty(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  <option value="">
                    -- Select Unassigned or Existing Department Subject-Section --
                  </option>
                  {allDepartmentOfferings
                    .filter((o) => o.faculty?.id !== selectedFacultySummary.faculty.id)
                    .map((off) => (
                      <option key={off.assignmentId} value={off.assignmentId}>
                        {off.subject.code} ({off.section.displayName}) —{' '}
                        {off.faculty ? `Currently: ${off.faculty.name}` : 'UNASSIGNED'}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  disabled={!offeringIdToAssignToFaculty}
                  onClick={() => {
                    const targetOff = allDepartmentOfferings.find(
                      (o) => o.assignmentId === offeringIdToAssignToFaculty
                    );
                    if (targetOff) {
                      handleOpenAssignForFaculty(
                        selectedFacultySummary.faculty.id,
                        targetOff
                      );
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white shrink-0"
                >
                  Check Conflicts & Assign
                </button>
              </div>
            </div>

            {/* Current Subject Allocations */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Current Assigned Subjects ({selectedFacultySummary.assignedOfferings.length})
              </h3>
              {selectedFacultySummary.assignedOfferings.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
                  No subject allocations currently assigned.
                </p>
              ) : (
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
                  {selectedFacultySummary.assignedOfferings.map((off) => (
                    <div
                      key={off.assignmentId}
                      className="p-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-navy-900">
                          {off.subject.code} — {off.subject.name}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          {off.course.shortName} • {off.section.displayName} •{' '}
                          {off.enrolledStudentsCount} Students • {off.subject.weeklyHours}{' '}
                          hrs/wk
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreselectedFacultyId(undefined);
                          setAssignModalOffering(off);
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        Reassign / Unassign
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Timetable Slots */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                Weekly Timetable Schedule ({selectedFacultySummary.timetableSlots.length}{' '}
                Slots)
              </h3>
              {selectedFacultySummary.timetableSlots.length === 0 ? (
                <p className="text-xs text-slate-400">No weekly timetable slots.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedFacultySummary.timetableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-navy-900">
                          {slot.dayOfWeek}
                        </span>{' '}
                        <span className="text-slate-600">• {slot.slotLabel}</span>
                        <p className="text-[11px] text-slate-500">
                          {slot.subjectCode} ({slot.sectionDisplayName})
                        </p>
                      </div>
                      <Badge variant="slate">{slot.room}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <AssignFacultyModal
        open={assignModalOffering !== null}
        offering={assignModalOffering}
        preselectedFacultyId={preselectedFacultyId}
        onClose={() => {
          setAssignModalOffering(null);
          setPreselectedFacultyId(undefined);
        }}
      />
    </div>
  );
};

