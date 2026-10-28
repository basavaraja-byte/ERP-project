import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Eye,
  History,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { useToast } from '../../context/ToastContext';
import { erpService } from '../../services/erpService';
import {
  AttendanceRecordEntry,
  AttendanceSession,
  AttendanceStatus,
  SessionType,
} from '../../types/erp';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';

const STANDARD_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:15 - 12:15',
  '14:00 - 15:00',
  '14:00 - 16:00',
  '15:00 - 16:00',
];

export const FacultyAttendancePage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const workspaceData = currentUser
    ? erpService.getFacultyAttendanceSessions(currentUser.facultyId)
    : null;
  const offerings = workspaceData?.offerings ?? [];

  // Top mode switcher: Mark/Amend vs History & Filters
  const [activeTab, setActiveTab] = useState<'MARK' | 'HISTORY'>('MARK');

  // Session Selector State
  const initialAssignment = (() => {
    const paramAssg = searchParams.get('assignmentId');
    if (paramAssg && offerings.some((o) => o.assignmentId === paramAssg)) {
      return paramAssg;
    }
    const paramSub = searchParams.get('subjectId');
    const paramSec = searchParams.get('sectionId');
    if (paramSub && paramSec) {
      const match = offerings.find(
        (o) => o.subject.id === paramSub && o.section.id === paramSec
      );
      if (match) return match.assignmentId;
    }
    return offerings[0]?.assignmentId ?? '';
  })();

  const [selectedAssignmentId, setSelectedAssignmentId] =
    useState<string>(initialAssignment);
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get('date') || '2026-10-28'
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 - 10:00');
  const [sessionType, setSessionType] = useState<SessionType>('Lecture');
  const [topicCovered, setTopicCovered] = useState<string>('');

  // Draft attendance records keyed by studentId
  const [draftStatusMap, setDraftStatusMap] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  // Correction mode state when an already-completed session is selected
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [confirmCorrectionOpen, setConfirmCorrectionOpen] = useState(false);

  // Preview modal before saving new attendance
  const [previewOpen, setPreviewOpen] = useState(false);

  // History tab filters & audit modal
  const [histCourseFilter, setHistCourseFilter] = useState('ALL');
  const [histSemesterFilter, setHistSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [histSubjectFilter, setHistSubjectFilter] = useState('ALL');
  const [histSectionFilter, setHistSectionFilter] = useState('ALL');
  const [histDateFrom, setHistDateFrom] = useState('');
  const [histDateTo, setHistDateTo] = useState('');
  const [auditModalSession, setAuditModalSession] =
    useState<AttendanceSession | null>(null);

  // Configurable low-attendance threshold
  const threshold = erpService.getLowAttendanceThreshold();
  const [thresholdInput, setThresholdInput] = useState(String(threshold));

  useEffect(() => {
    if (
      offerings.length > 0 &&
      !offerings.some((o) => o.assignmentId === selectedAssignmentId)
    ) {
      setSelectedAssignmentId(offerings[0].assignmentId);
    }
  }, [offerings, selectedAssignmentId]);

  const inspection =
    currentUser && selectedAssignmentId
      ? erpService.inspectSessionForMarking({
          facultyId: currentUser.facultyId,
          assignmentId: selectedAssignmentId,
          date: selectedDate,
          slotLabel: selectedSlot,
        })
      : null;

  // Sync draft records whenever selected class/date/slot changes
  useEffect(() => {
    if (!inspection || !inspection.authorized) return;
    setCorrectionMode(false);
    setCorrectionReason('');

    const existing = inspection.existingSession;
    if (existing) {
      setSessionType(existing.sessionType);
      setTopicCovered(existing.topicCovered ?? '');
    } else if (inspection.offering) {
      const defaultSlot = inspection.offering.timetableSlots[0];
      if (defaultSlot) {
        setSessionType(defaultSlot.sessionType);
      }
      setTopicCovered('');
    }

    const nextMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    inspection.enrolledStudents.forEach((st) => {
      const found = existing?.records.find((r) => r.studentId === st.student.id);
      nextMap[st.student.id] = {
        status: found ? found.status : 'Present',
        remarks: found?.remarks ?? '',
      };
    });
    setDraftStatusMap(nextMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedAssignmentId,
    selectedDate,
    selectedSlot,
    inspection?.existingSession?.id,
    inspection?.existingSession?.status,
  ]);

  if (!currentUser) return null;

  const filteredHistory = erpService.getFacultyAttendanceSessions(
    currentUser.facultyId,
    {
      courseId: histCourseFilter,
      semester: histSemesterFilter,
      subjectId: histSubjectFilter,
      sectionId: histSectionFilter,
      dateFrom: histDateFrom || undefined,
      dateTo: histDateTo || undefined,
    }
  );

  const uniqueCourses = Array.from(
    new Map(offerings.map((o) => [o.course.id, o.course])).values()
  );
  const uniqueSubjects = Array.from(
    new Map(offerings.map((o) => [o.subject.id, o.subject])).values()
  );
  const uniqueSections = Array.from(
    new Map(offerings.map((o) => [o.section.id, o.section])).values()
  );
  const uniqueSemesters = Array.from(
    new Set(offerings.map((o) => o.subject.semester))
  ).sort((a, b) => a - b);

  const buildPayloadRecords = (): AttendanceRecordEntry[] => {
    if (!inspection) return [];
    return inspection.enrolledStudents.map((st) => ({
      studentId: st.student.id,
      status: draftStatusMap[st.student.id]?.status ?? 'Present',
      remarks: draftStatusMap[st.student.id]?.remarks?.trim() || undefined,
    }));
  };

  const payloadRecords = buildPayloadRecords();
  const presentPreviewCount = payloadRecords.filter(
    (r) => r.status === 'Present'
  ).length;
  const latePreviewCount = payloadRecords.filter((r) => r.status === 'Late').length;
  const absentPreviewCount = payloadRecords.filter(
    (r) => r.status === 'Absent'
  ).length;
  const previewPercentage =
    payloadRecords.length > 0
      ? Math.round(
          ((presentPreviewCount + latePreviewCount) / payloadRecords.length) * 1000
        ) / 10
      : 0;

  const isAlreadyCompleted = inspection?.existingSession?.status === 'Completed';

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!inspection) return;
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    inspection.enrolledStudents.forEach((st) => {
      updated[st.student.id] = {
        status,
        remarks: draftStatusMap[st.student.id]?.remarks ?? '',
      };
    });
    setDraftStatusMap(updated);
  };

  const handleOpenSavePreview = () => {
    if (isAlreadyCompleted && !correctionMode) {
      showToast(
        'Duplicate entry prevented: Attendance is already recorded for this session. Enable Correction Mode to amend.',
        'error',
        'Duplicate Attendance Blocked'
      );
      return;
    }
    if (!topicCovered.trim()) {
      showToast('Please enter the lecture/lab topic covered before previewing.', 'error');
      return;
    }
    if (isAlreadyCompleted && correctionMode) {
      if (!correctionReason.trim() || correctionReason.trim().length < 6) {
        showToast(
          'Enter an audit reason (at least 6 characters) before confirming attendance correction.',
          'error'
        );
        return;
      }
      setConfirmCorrectionOpen(true);
      return;
    }
    setPreviewOpen(true);
  };

  const handleConfirmNewSave = () => {
    const res = erpService.saveAttendanceSession({
      facultyId: currentUser.facultyId,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      assignmentId: selectedAssignmentId,
      date: selectedDate,
      slotLabel: selectedSlot,
      sessionType,
      topicCovered,
      records: payloadRecords,
    });

    if (!res.ok) {
      showToast(res.error ?? 'Failed to save attendance.', 'error');
      setPreviewOpen(false);
      return;
    }

    setPreviewOpen(false);
    showToast(
      `Saved attendance for ${inspection?.offering?.subject.code} (${inspection?.offering?.section.displayName}) on ${selectedDate}.`,
      'success',
      'Attendance Recorded'
    );
  };

  const handleConfirmCorrectionSave = () => {
    if (!inspection?.existingSession) return;
    const res = erpService.correctAttendanceSession({
      sessionId: inspection.existingSession.id,
      facultyId: currentUser.facultyId,
      actorUserId: currentUser.id,
      actorName: currentUser.name,
      reason: correctionReason,
      topicCovered,
      records: payloadRecords,
    });

    if (!res.ok) {
      showToast(res.error ?? 'Attendance correction failed.', 'error');
      setConfirmCorrectionOpen(false);
      return;
    }

    setConfirmCorrectionOpen(false);
    setCorrectionMode(false);
    setCorrectionReason('');
    showToast(
      `Amended ${res.changesCount} student record(s) and preserved audit log entry.`,
      'success',
      'Correction Saved'
    );
  };

  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    const res = erpService.setLowAttendanceThreshold(Number(thresholdInput));
    if (!res.ok) {
      showToast(res.error ?? 'Invalid threshold percentage.', 'error');
      return;
    }
    showToast(
      `Low-attendance warning threshold set to ${Math.round(Number(thresholdInput))}%.`,
      'success'
    );
  };

  const handleJumpToSession = (session: AttendanceSession) => {
    const matchingOff = offerings.find(
      (o) =>
        o.subject.id === session.subjectId && o.section.id === session.sectionId
    );
    if (!matchingOff) return;
    setSelectedAssignmentId(matchingOff.assignmentId);
    setSelectedDate(session.date);
    setSelectedSlot(session.slotLabel);
    setActiveTab('MARK');
  };

  return (
    <div className="space-y-6">
      {/* Header + Threshold Config */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Faculty Portal • Primary Module D
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">Class Attendance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mark Present, Absent, or Late for assigned classes, preview entries before
            saving, prevent duplicate sessions, and preserve correction history.
          </p>
        </div>

        <form
          onSubmit={handleUpdateThreshold}
          className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <label
            htmlFor="fac-att-threshold"
            className="text-xs font-medium text-slate-600"
          >
            Shortage Warning %:
          </label>
          <input
            id="fac-att-threshold"
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
            Set
          </button>
        </form>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('MARK')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'MARK'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Mark / Amend Attendance
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Session Register & Filters ({filteredHistory.sessions.length})
        </button>
      </div>

      {offerings.length === 0 ? (
        <EmptyState
          title="No assigned classes for attendance"
          description="You do not currently have any HOD-assigned courses or sections."
        />
      ) : activeTab === 'MARK' ? (
        <div className="space-y-5">
          {/* Class, Section, Date, and Session Selector Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Assigned Course, Subject & Section
                </label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {offerings.map((off) => (
                    <option key={off.assignmentId} value={off.assignmentId}>
                      {off.subject.code} — {off.subject.name} • {off.course.shortName} (
                      {off.section.displayName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Session Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Session Time Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                >
                  {STANDARD_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Type
                </label>
                <select
                  value={sessionType}
                  disabled={isAlreadyCompleted && !correctionMode}
                  onChange={(e) => setSessionType(e.target.value as SessionType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100"
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Lab">Lab</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lecture / Lab Topic Covered *
                </label>
                <input
                  type="text"
                  disabled={isAlreadyCompleted && !correctionMode}
                  value={topicCovered}
                  onChange={(e) => setTopicCovered(e.target.value)}
                  placeholder="Enter syllabus topic covered in this session..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Duplicate Prevention & Correction Mode Banner */}
          {isAlreadyCompleted && inspection?.existingSession && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950">
                    <p className="font-bold text-sm">
                      Attendance Already Recorded for {selectedDate} ({selectedSlot})
                    </p>
                    <p className="mt-0.5">
                      Duplicate session creation is blocked. To modify student entries for
                      this session, enable <strong>Correction Mode</strong>—all changes
                      are logged in the permanent audit history.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inspection.existingSession.changeHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAuditModalSession(inspection.existingSession)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100"
                    >
                      <History className="w-3.5 h-3.5" />
                      Audit Log ({inspection.existingSession.changeHistory.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setCorrectionMode((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      correctionMode
                        ? 'bg-slate-800 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {correctionMode ? 'Cancel Correction Mode' : 'Enter Correction Mode'}
                  </button>
                </div>
              </div>

              {correctionMode && (
                <div className="pt-2 border-t border-amber-200">
                  <label className="block text-xs font-semibold text-amber-950 mb-1">
                    Mandatory Audit Reason for Attendance Correction *
                  </label>
                  <input
                    type="text"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    placeholder="e.g., Approved On-Duty certificate verified for hackathon participant..."
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-amber-600 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Enrolled Student Marking Roster */}
          {inspection && inspection.authorized && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-navy-900">
                    Enrolled Student Roster ({inspection.enrolledStudents.length} Students)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live tally: <strong className="text-emerald-700">{presentPreviewCount} Present</strong> •{' '}
                    <strong className="text-amber-700">{latePreviewCount} Late</strong> •{' '}
                    <strong className="text-red-600">{absentPreviewCount} Absent</strong> (
                    {previewPercentage}% session attendance)
                  </p>
                </div>

                {(!isAlreadyCompleted || correctionMode) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkAll('Present')}
                      className="px-2.5 py-1 rounded border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAll('Absent')}
                      className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50"
                    >
                      Mark All Absent
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50/70 text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Student ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Current Subject %
                      </th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Mark Status (Present / Absent / Late)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {inspection.enrolledStudents.map((st) => {
                      const currentEntry = draftStatusMap[st.student.id] ?? {
                        status: 'Present',
                        remarks: '',
                      };
                      const rowLocked = isAlreadyCompleted && !correctionMode;

                      return (
                        <tr key={st.student.id} className="hover:bg-slate-50/60">
                          <td className="px-4 py-3 font-mono font-semibold text-navy-900">
                            {st.student.rollNumber}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold text-navy-900">
                              {st.student.name}
                            </p>
                            {st.isLowAttendance && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                Low Attendance (&lt;{threshold}%)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {st.attendancePercentage !== null ? (
                              <Badge variant={st.isLowAttendance ? 'red' : 'green'}>
                                {st.attendancePercentage}%
                              </Badge>
                            ) : (
                              <span className="text-slate-400">New</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                              {(['Present', 'Absent', 'Late'] as const).map((statusOpt) => {
                                const active = currentEntry.status === statusOpt;
                                const activeClasses =
                                  statusOpt === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : statusOpt === 'Late'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'bg-red-600 text-white shadow-sm';

                                return (
                                  <button
                                    key={statusOpt}
                                    type="button"
                                    disabled={rowLocked}
                                    onClick={() =>
                                      setDraftStatusMap((prev) => ({
                                        ...prev,
                                        [st.student.id]: {
                                          ...currentEntry,
                                          status: statusOpt,
                                        },
                                      }))
                                    }
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                      active
                                        ? activeClasses
                                        : 'text-slate-600 hover:text-slate-900'
                                    } ${rowLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  >
                                    {statusOpt}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              disabled={rowLocked}
                              value={currentEntry.remarks}
                              onChange={(e) =>
                                setDraftStatusMap((prev) => ({
                                  ...prev,
                                  [st.student.id]: {
                                    ...currentEntry,
                                    remarks: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Optional note..."
                              className="w-full rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-800 disabled:bg-slate-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Action Bar */}
              <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  All student memberships and session uniqueness rules are validated before
                  commit.
                </p>
                <button
                  type="button"
                  onClick={handleOpenSavePreview}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-colors ${
                    isAlreadyCompleted && !correctionMode
                      ? 'bg-slate-400 hover:bg-slate-500'
                      : correctionMode
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {isAlreadyCompleted
                    ? correctionMode
                      ? 'Review & Confirm Amendment'
                      : 'Session Locked (Already Submitted)'
                    : 'Preview Entries & Save Attendance'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* HISTORY & FILTERS TAB */
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <select
                value={histCourseFilter}
                onChange={(e) => setHistCourseFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
              >
                <option value="ALL">All Assigned Courses</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortName}
                  </option>
                ))}
              </select>

              <select
                value={histSemesterFilter}
                onChange={(e) =>
                  setHistSemesterFilter(
                    e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                  )
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
                value={histSubjectFilter}
                onChange={(e) => setHistSubjectFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
              >
                <option value="ALL">All Subjects</option>
                {uniqueSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} — {sub.name}
                  </option>
                ))}
              </select>

              <select
                value={histSectionFilter}
                onChange={(e) => setHistSectionFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
              >
                <option value="ALL">All Sections</option>
                {uniqueSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.displayName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={histDateFrom}
                onChange={(e) => setHistDateFrom(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                title="From Date"
              />

              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={histDateTo}
                  onChange={(e) => setHistDateTo(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                  title="To Date"
                />
                <button
                  type="button"
                  onClick={() => {
                    setHistCourseFilter('ALL');
                    setHistSemesterFilter('ALL');
                    setHistSubjectFilter('ALL');
                    setHistSectionFilter('ALL');
                    setHistDateFrom('');
                    setHistDateTo('');
                  }}
                  className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {filteredHistory.sessions.length === 0 ? (
            <EmptyState
              title="No attendance registers match your filters"
              description="Adjust date, subject, course, or section filters."
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
                      <th className="px-4 py-3 text-left font-semibold">Topic</th>
                      <th className="px-4 py-3 text-center font-semibold">Status</th>
                      <th className="px-4 py-3 text-center font-semibold">
                        Summary (P/L/A)
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredHistory.sessions.map((item) => (
                      <tr key={item.session.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-navy-900">
                            {item.session.date}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.session.slotLabel}
                          </p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">
                            {item.subject.code} — {item.subject.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {item.course.shortName} • Sem {item.session.semester} •{' '}
                            {item.section.displayName}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {item.session.topicCovered ?? 'Scheduled Session'}
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

                        <td className="px-4 py-3.5 text-center">
                          {item.percentage !== null ? (
                            <div>
                              <span className="font-bold text-navy-900">
                                {item.percentage}%
                              </span>
                              <p className="text-[11px] text-slate-500">
                                {item.presentCount}P / {item.lateCount}L /{' '}
                                {item.absentCount}A
                              </p>
                            </div>
                          ) : (
                            <span className="text-amber-700">Unmarked</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                          {item.session.changeHistory.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setAuditModalSession(item.session)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 font-medium"
                            >
                              <History className="w-3 h-3" />
                              History ({item.session.changeHistory.length})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleJumpToSession(item.session)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-slate-300 text-navy-900 font-semibold hover:bg-slate-50"
                          >
                            {item.session.status === 'Completed' ? 'Open / Amend' : 'Mark'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Entries Before Saving Modal */}
      {previewOpen && inspection?.offering && (
        <Modal
          open={true}
          onClose={() => setPreviewOpen(false)}
          title="Preview Attendance Entries Before Saving"
          subtitle={`${inspection.offering.subject.code} (${inspection.offering.section.displayName}) • ${selectedDate} • ${selectedSlot}`}
          maxWidthClass="max-w-xl"
          footer={
            <>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmNewSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Save Register
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                <p className="text-lg font-bold text-emerald-700">
                  {presentPreviewCount}
                </p>
                <p className="text-[11px] text-emerald-800">Present</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                <p className="text-lg font-bold text-amber-700">{latePreviewCount}</p>
                <p className="text-[11px] text-amber-800">Late</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5">
                <p className="text-lg font-bold text-red-700">{absentPreviewCount}</p>
                <p className="text-[11px] text-red-800">Absent</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-lg font-bold text-navy-900">{previewPercentage}%</p>
                <p className="text-[11px] text-slate-600">Session %</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <strong>Topic Covered:</strong> {topicCovered} ({sessionType})
            </div>

            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-200 text-xs">
              {inspection.enrolledStudents.map((st) => {
                const stStatus = draftStatusMap[st.student.id]?.status ?? 'Present';
                return (
                  <div
                    key={st.student.id}
                    className="px-3.5 py-2 flex items-center justify-between"
                  >
                    <span>
                      <strong className="font-mono">{st.student.rollNumber}</strong> —{' '}
                      {st.student.name}
                    </span>
                    <Badge
                      variant={
                        stStatus === 'Present'
                          ? 'green'
                          : stStatus === 'Late'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {stStatus}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Attendance Correction */}
      <ConfirmDialog
        open={confirmCorrectionOpen}
        onClose={() => setConfirmCorrectionOpen(false)}
        onConfirm={handleConfirmCorrectionSave}
        title="Confirm Official Attendance Amendment?"
        description="Saving this correction updates cumulative student attendance percentages across both Faculty and HOD portals and appends a permanent audit entry."
        confirmLabel="Confirm & Log Correction"
        variant="warning"
        details={
          <div>
            <p>
              <strong>Audit Reason:</strong> {correctionReason}
            </p>
            <p className="mt-1">
              <strong>Updated Tally:</strong> {presentPreviewCount} Present,{' '}
              {latePreviewCount} Late, {absentPreviewCount} Absent
            </p>
          </div>
        }
      />

      {/* Change History Audit Modal */}
      {auditModalSession && (
        <Modal
          open={true}
          onClose={() => setAuditModalSession(null)}
          title="Attendance Amendment Audit History"
          subtitle={`Session Date: ${auditModalSession.date} (${auditModalSession.slotLabel})`}
          maxWidthClass="max-w-xl"
          footer={
            <button
              type="button"
              onClick={() => setAuditModalSession(null)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white"
            >
              Close History
            </button>
          }
        >
          <div className="space-y-3">
            {auditModalSession.changeHistory.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-navy-900">
                    {entry.modifiedByName}
                  </span>
                  <span className="text-slate-400">{entry.timestamp}</span>
                </div>
                <p className="text-slate-700">
                  <strong>Reason:</strong> {entry.reason}
                </p>
                <div className="space-y-1 pt-1 border-t border-slate-200">
                  {entry.changes.map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>
                        {ch.rollNumber} — {ch.studentName}
                      </span>
                      <span>
                        <Badge variant="slate">{ch.previousStatus}</Badge> →{' '}
                        <Badge variant="blue">{ch.newStatus}</Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

