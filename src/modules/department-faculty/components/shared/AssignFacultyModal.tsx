import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { EnrichedOffering, erpService } from '../../services/erpService';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useToast } from '../../context/ToastContext';

interface AssignFacultyModalProps {
  open: boolean;
  offering: EnrichedOffering | null;
  onClose: () => void;
  preselectedFacultyId?: string;
}

export const AssignFacultyModal: React.FC<AssignFacultyModalProps> = ({
  open,
  offering,
  onClose,
  preselectedFacultyId,
}) => {
  const { currentUser } = useDemoAuth();
  const { showToast } = useToast();
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [confirmStep, setConfirmStep] = useState(false);

  useEffect(() => {
    if (offering) {
      setSelectedFacultyId(
        preselectedFacultyId ?? offering.faculty?.id ?? ''
      );
      setConfirmStep(false);
    }
  }, [offering, preselectedFacultyId, open]);

  if (!open || !offering || !currentUser) return null;

  const deptFaculty = erpService.getDepartmentFaculty(offering.departmentId);
  const targetId = selectedFacultyId === 'UNASSIGN' ? null : selectedFacultyId || null;

  const hasSelectionChanged =
    (targetId ?? null) !== (offering.faculty?.id ?? null);

  const validation =
    selectedFacultyId !== ''
      ? erpService.validateFacultyAssignment(offering.assignmentId, targetId)
      : null;

  const selectedFacultyObj = deptFaculty.find(
    (f) => f.faculty.id === selectedFacultyId
  );

  const handleProceedToConfirm = () => {
    if (!selectedFacultyId) {
      showToast('Please select a faculty instructor or Unassign option.', 'error');
      return;
    }
    if (!validation || !validation.valid) {
      showToast(
        validation?.message ?? 'Cannot proceed: Resolve validation or timetable conflict first.',
        'error'
      );
      return;
    }
    setConfirmStep(true);
  };

  const handleFinalSubmit = () => {
    const res = erpService.assignFacultyToSubject({
      assignmentId: offering.assignmentId,
      facultyId: targetId,
      actorName: currentUser.name,
    });

    if (!res.ok) {
      showToast(res.error ?? 'Failed to update faculty assignment.', 'error');
      setConfirmStep(false);
      return;
    }

    const actionText = targetId
      ? `Assigned ${selectedFacultyObj?.faculty.name} to ${offering.subject.code} (${offering.section.displayName}).`
      : `Unassigned instructor from ${offering.subject.code} (${offering.section.displayName}).`;

    showToast(actionText, 'success', 'Subject Assignment Updated');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        confirmStep
          ? 'Confirm Subject Assignment Change'
          : 'Manage Subject-to-Faculty Assignment'
      }
      subtitle={`${offering.course.shortName} • Sem ${offering.subject.semester} • ${offering.section.displayName}`}
      maxWidthClass="max-w-xl"
      footer={
        confirmStep ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmStep(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm & Apply Assignment
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleProceedToConfirm}
              disabled={!hasSelectionChanged || (validation !== null && !validation.valid)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              Review & Confirm Change
            </button>
          </>
        )
      }
    >
      {!confirmStep ? (
        <div className="space-y-4">
          {/* Subject & Timetable Box */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-blue-700">
                  {offering.subject.code}
                </span>
                <h3 className="text-sm font-semibold text-navy-900">
                  {offering.subject.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="slate">{offering.subject.weeklyHours} hrs/wk</Badge>
                <Badge variant="blue">{offering.enrolledStudentsCount} Students</Badge>
              </div>
            </div>

            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80">
              <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">Scheduled Slots:</span>
              {offering.timetableSlots.length === 0 ? (
                <span className="text-slate-400">No timetable slots configured</span>
              ) : (
                offering.timetableSlots.map((slot) => (
                  <span
                    key={slot.id}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                  >
                    {slot.dayOfWeek.slice(0, 3)} {slot.slotLabel} ({slot.room})
                  </span>
                ))
              )}
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-700">Current Instructor: </span>
              {offering.faculty ? (
                <span className="text-navy-900 font-semibold">
                  {offering.faculty.name} ({offering.faculty.designation})
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Unassigned</span>
              )}
            </div>
          </div>

          {/* Faculty Selector */}
          <div>
            <label
              htmlFor="assign-faculty-select"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-700 mb-1.5"
            >
              Select Department Faculty Instructor
            </label>
            <select
              id="assign-faculty-select"
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Choose Faculty Member --</option>
              {deptFaculty.map((item) => (
                <option key={item.faculty.id} value={item.faculty.id}>
                  {item.faculty.name} — {item.faculty.designation} ({item.assignedWeeklyHours}/
                  {item.maxWeeklyHours} hrs/wk)
                  {item.faculty.status === 'On Sabbatical' ? ' [ON SABBATICAL]' : ''}
                </option>
              ))}
              {offering.faculty && (
                <option value="UNASSIGN">
                  -- Mark Offering as Unassigned (Remove Current Instructor) --
                </option>
              )}
            </select>
          </div>

          {/* Live Validation & Conflict Detection Feedback */}
          {selectedFacultyId !== '' && validation && (
            <div className="space-y-3">
              {!validation.valid ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-800">
                      <p className="font-semibold">
                        {validation.isDuplicate
                          ? 'Duplicate Assignment Blocked'
                          : validation.conflicts.length > 0
                          ? 'Timetable Schedule Conflict Detected'
                          : 'Assignment Not Permitted'}
                      </p>
                      <p className="mt-0.5 leading-relaxed">{validation.message}</p>
                    </div>
                  </div>

                  {validation.conflicts.length > 0 && (
                    <div className="pl-6 space-y-1.5 pt-1">
                      {validation.conflicts.map((conflict, idx) => (
                        <div
                          key={idx}
                          className="rounded bg-white/90 border border-red-200 px-2.5 py-1.5 text-[11px] text-red-900"
                        >
                          <strong>{conflict.dayOfWeek}</strong> • {conflict.slotLabel}: Clashes
                          with <strong>{conflict.conflictingSubjectCode}</strong> (
                          {conflict.conflictingSectionName}) in Room {conflict.conflictingRoom}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900">
                      <p className="font-semibold">
                        Schedule Verified — Zero Timetable Conflicts
                      </p>
                      {targetId ? (
                        <p className="mt-0.5">
                          Projected workload for{' '}
                          <strong>{selectedFacultyObj?.faculty.name}</strong>:{' '}
                          <strong>
                            {validation.projectedWeeklyHours} / {validation.maxWeeklyHours}{' '}
                            hrs/week
                          </strong>
                          .
                        </p>
                      ) : (
                        <p className="mt-0.5">
                          This subject-section will be marked as Unassigned pending replacement.
                        </p>
                      )}
                    </div>
                  </div>

                  {validation.overloadWarning && (
                    <div className="flex items-start gap-2 rounded bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        Workload Notice: This assignment exceeds the standard{' '}
                        {validation.maxWeeklyHours} hrs/week norm for this designation. HOD
                        confirmation is required.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-semibold text-sm">
                Please confirm this official teaching allocation update
              </p>
              <p className="leading-relaxed">
                Updating subject assignments immediately adjusts faculty portal access, course
                registers, and workload metrics across the department.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 divide-y divide-slate-200 text-sm">
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Subject & Code</span>
              <span className="font-semibold text-navy-900">
                {offering.subject.code} — {offering.subject.name}
              </span>
            </div>
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Class Section</span>
              <span className="font-medium text-slate-800">
                {offering.course.shortName} • {offering.section.displayName}
              </span>
            </div>
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Previous Instructor</span>
              <span className="text-slate-700">
                {offering.faculty ? offering.faculty.name : 'Unassigned'}
              </span>
            </div>
            <div className="px-4 py-2.5 flex justify-between bg-blue-50/50">
              <span className="text-slate-700 font-medium">New Instructor</span>
              <span className="font-semibold text-blue-700 inline-flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                {targetId ? selectedFacultyObj?.faculty.name : 'Unassigned'}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

