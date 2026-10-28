import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Lock,
  MessageSquarePlus,
  Send,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import {
  Badge,
  getComplaintStatusBadgeVariant,
  getPriorityBadgeVariant,
} from '../ui/Badge';
import { erpService } from '../../services/erpService';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useToast } from '../../context/ToastContext';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
}) => {
  const { currentUser } = useDemoAuth();
  const { showToast } = useToast();

  const [studentFacingPreview, setStudentFacingPreview] = useState(false);
  const [responseTab, setResponseTab] = useState<'PUBLIC' | 'INTERNAL' | 'RESOLVE'>('PUBLIC');
  const [messageText, setMessageText] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [assignNote, setAssignNote] = useState('');

  if (!complaintId || !currentUser) return null;

  const detail = erpService.getComplaintDetail(
    complaintId,
    studentFacingPreview,
    currentUser.facultyId
  );

  if (!detail) return null;

  const { complaint, student, course, section, subject, assignedFaculty } = detail;
  const deptFaculty = erpService
    .getDepartmentFaculty(complaint.departmentId)
    .filter((f) => f.faculty.status === 'Active');

  const handleAssignFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId) {
      showToast('Select a faculty member before assigning.', 'error');
      return;
    }
    const res = erpService.assignComplaintToFaculty({
      complaintId: complaint.id,
      targetFacultyId: selectedAssigneeId,
      actorId: currentUser.facultyId,
      actorName: `${currentUser.name} (${currentUser.role})`,
      note: assignNote,
    });
    if (!res.ok) {
      showToast(res.error ?? 'Failed to assign complaint.', 'error');
      return;
    }
    showToast('Complaint assignment updated and recorded in audit trail.', 'success');
    setAssignNote('');
    setSelectedAssigneeId('');
  };

  const handleMarkInReview = () => {
    const res = erpService.updateComplaintStatus({
      complaintId: complaint.id,
      actorId: currentUser.facultyId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      status: 'In Review',
      remarks: 'Complaint taken up for active investigation (Marked In Review).',
    });
    if (!res.ok) {
      showToast(res.error ?? 'Could not update status.', 'error');
      return;
    }
    showToast('Complaint marked as In Review.', 'success');
  };

  const handleReopen = () => {
    const res = erpService.updateComplaintStatus({
      complaintId: complaint.id,
      actorId: currentUser.facultyId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      status: 'In Review',
      remarks: 'Reopened for follow-up review.',
    });
    if (!res.ok) {
      showToast(res.error ?? 'Could not reopen complaint.', 'error');
      return;
    }
    showToast('Complaint moved back to In Review.', 'info');
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (responseTab === 'RESOLVE') {
      const res = erpService.updateComplaintStatus({
        complaintId: complaint.id,
        actorId: currentUser.facultyId,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        status: 'Resolved',
        resolutionSummary: resolutionText,
      });
      if (!res.ok) {
        showToast(res.error ?? 'Resolution summary validation failed.', 'error');
        return;
      }
      showToast('Complaint marked Resolved with official summary.', 'success');
      setResolutionText('');
      return;
    }

    const isInternal = responseTab === 'INTERNAL';
    const res = erpService.addComplaintNoteOrResponse({
      complaintId: complaint.id,
      actorId: currentUser.facultyId,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      message: messageText,
      isInternalNote: isInternal,
    });
    if (!res.ok) {
      showToast(res.error ?? 'Message validation failed.', 'error');
      return;
    }
    showToast(
      isInternal
        ? 'Private internal faculty note saved (hidden from student views).'
        : 'Public response posted to complaint timeline.',
      'success'
    );
    setMessageText('');
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`${complaint.id} — ${complaint.title}`}
      subtitle={`Submitted ${complaint.submittedAt} • ${student.name} (${student.rollNumber}) • ${course.shortName} ${section.displayName}`}
      maxWidthClass="max-w-3xl"
      footer={
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setStudentFacingPreview((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              studentFacingPreview
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {studentFacingPreview ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                Viewing Student-Facing Preview (Internal Notes Stripped)
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Preview Student-Facing View
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {!studentFacingPreview && complaint.status === 'Open' && (
              <button
                type="button"
                onClick={handleMarkInReview}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
              >
                Mark In Review
              </button>
            )}
            {!studentFacingPreview && complaint.status === 'Resolved' && (
              <button
                type="button"
                onClick={handleReopen}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Move to In Review
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800"
            >
              Close
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status & Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getComplaintStatusBadgeVariant(complaint.status)} dot>
              {complaint.status}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
              {complaint.priority} Priority
            </Badge>
            <Badge variant="blue">{complaint.category}</Badge>
            {subject && (
              <Badge variant="slate">
                {subject.code}: {subject.name}
              </Badge>
            )}
          </div>
          <div className="text-xs text-slate-600">
            <span className="text-slate-500">Assigned Faculty: </span>
            {assignedFaculty ? (
              <strong className="text-navy-900">{assignedFaculty.name}</strong>
            ) : (
              <strong className="text-red-600">Unassigned</strong>
            )}
          </div>
        </div>

        {/* Description & Resolution */}
        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Grievance Description
            </h4>
            <p className="text-sm text-slate-800 mt-1 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {complaint.resolutionSummary && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
              <p className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Resolution Summary
              </p>
              <p className="mt-1 leading-relaxed">{complaint.resolutionSummary}</p>
            </div>
          )}
        </div>

        {/* HOD Assignment / Reassignment Box */}
        {currentUser.role === 'HOD' && !studentFacingPreview && (
          <form
            onSubmit={handleAssignFaculty}
            className="rounded-lg border border-blue-200 bg-blue-50/40 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-900">
              <UserCheck className="w-4 h-4 text-blue-600" />
              HOD Action — Assign or Reassign Faculty Coordinator
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">-- Select Active Department Faculty --</option>
                {deptFaculty.map((f) => (
                  <option key={f.faculty.id} value={f.faculty.id}>
                    {f.faculty.name} ({f.faculty.designation})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={assignNote}
                onChange={(e) => setAssignNote(e.target.value)}
                placeholder="Optional routing instruction..."
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {assignedFaculty ? 'Reassign Faculty' : 'Assign Faculty'}
              </button>
            </div>
          </form>
        )}

        {/* Audit History & Timeline */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Audit History & Communication Log ({complaint.history.length})
            </h4>
            {studentFacingPreview && (
              <span className="text-[11px] font-medium text-emerald-700">
                Private internal notes are hidden in Student View
              </span>
            )}
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {complaint.history.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-3 text-xs ${
                  item.isInternalNote
                    ? 'bg-amber-50/70 border-amber-200'
                    : item.actionType === 'Resolved'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-900">{item.actorName}</span>
                    <Badge variant="slate">{item.actorRole}</Badge>
                    {item.isInternalNote && (
                      <Badge variant="amber">
                        <Lock className="w-3 h-3 mr-1" />
                        Private Internal Note (Faculty/HOD Only)
                      </Badge>
                    )}
                    {item.toStatus && (
                      <Badge variant={getComplaintStatusBadgeVariant(item.toStatus)}>
                        Status → {item.toStatus}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-slate-700 mt-1.5 leading-relaxed">{item.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Add Response / Internal Note / Resolve Form */}
        {!studentFacingPreview && (
          <form
            onSubmit={handlePostMessage}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setResponseTab('PUBLIC')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  responseTab === 'PUBLIC'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <MessageSquarePlus className="w-3.5 h-3.5 inline mr-1.5" />
                Add Public Response
              </button>
              <button
                type="button"
                onClick={() => setResponseTab('INTERNAL')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  responseTab === 'INTERNAL'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5 inline mr-1.5" />
                Add Private Internal Note
              </button>
              {complaint.status !== 'Resolved' && (
                <button
                  type="button"
                  onClick={() => setResponseTab('RESOLVE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    responseTab === 'RESOLVE'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
                  Resolve Complaint
                </button>
              )}
            </div>

            {responseTab === 'RESOLVE' ? (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Official Resolution Summary (visible to student and department audit)
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Describe the action taken and final outcome..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submit Resolution & Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  {responseTab === 'INTERNAL'
                    ? 'Private Internal Note — Strictly restricted to Faculty & HOD; omitted from all student-facing views'
                    : 'Public Response — Visible to the student on their grievance timeline'}
                </label>
                <textarea
                  rows={2}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    responseTab === 'INTERNAL'
                      ? 'Record internal verification remarks for faculty/HOD reference...'
                      : 'Write an official update or request for the student...'
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white ${
                      responseTab === 'INTERNAL'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {responseTab === 'INTERNAL' ? 'Save Private Note' : 'Post Response'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </Modal>
  );
};

