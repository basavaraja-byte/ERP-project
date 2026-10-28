import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3,
  FileBarChart,
  Megaphone,
  Plus,
  Send,
  Trash2,
  Users,
} from 'lucide-react';
import { useDemoAuth } from '../../context/DemoAuthContext';
import { useErpStoreVersion } from '../../hooks/useErpStoreVersion';
import { useToast } from '../../context/ToastContext';
import { erpService } from '../../services/erpService';
import {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementStatus,
  DepartmentAnnouncement,
} from '../../types/erp';
import { Badge, getPriorityBadgeVariant } from '../../components/ui/Badge';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

export const HodAnnouncementsPage: React.FC = () => {
  useErpStoreVersion();
  const { currentUser } = useDemoAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Published' | 'Draft'>('ALL');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentAnnouncement | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audienceType, setAudienceType] =
    useState<AnnouncementAudienceType>('All Department');
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetSemester, setTargetSemester] = useState<number>(3);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');

  if (!currentUser) return null;

  const coursesData = erpService.getDepartmentCoursesData(currentUser.departmentId);
  const allAnnouncements = erpService.getDepartmentAnnouncements(currentUser.departmentId);
  const filteredAnnouncements =
    statusFilter === 'ALL'
      ? allAnnouncements
      : allAnnouncements.filter((a) => a.status === statusFilter);

  const openCreateModal = () => {
    setEditingId(undefined);
    setTitle('');
    setContent('');
    setAudienceType('All Department');
    setTargetCourseId(coursesData.courses[0]?.course.id ?? '');
    setTargetSemester(3);
    setTargetSectionId(coursesData.sections[0]?.id ?? '');
    setPriority('Normal');
    setEditorOpen(true);
  };

  const openEditModal = (ann: DepartmentAnnouncement) => {
    setEditingId(ann.id);
    setTitle(ann.title);
    setContent(ann.content);
    setAudienceType(ann.audienceType);
    setTargetCourseId(ann.targetCourseId ?? coursesData.courses[0]?.course.id ?? '');
    setTargetSemester(ann.targetSemester ?? 3);
    setTargetSectionId(ann.targetSectionId ?? coursesData.sections[0]?.id ?? '');
    setPriority(ann.priority);
    setEditorOpen(true);
  };

  const handleSave = (status: AnnouncementStatus) => {
    const res = erpService.saveAnnouncement({
      id: editingId,
      departmentId: currentUser.departmentId,
      campusId: currentUser.campusId,
      title,
      content,
      audienceType,
      targetCourseId:
        audienceType === 'Course & Semester' ? targetCourseId : undefined,
      targetSemester:
        audienceType === 'Course & Semester' ? Number(targetSemester) : undefined,
      targetSectionId:
        audienceType === 'Specific Section' ? targetSectionId : undefined,
      priority,
      status,
      authorId: currentUser.facultyId,
      authorName: currentUser.name,
    });

    if (!res.ok) {
      showToast(res.error ?? 'Announcement validation failed.', 'error');
      return;
    }

    showToast(
      status === 'Published'
        ? 'Department announcement published to selected audience.'
        : 'Announcement saved as draft.',
      'success'
    );
    setEditorOpen(false);
  };

  const handlePublishDraftDirectly = (ann: DepartmentAnnouncement) => {
    const res = erpService.saveAnnouncement({
      id: ann.id,
      departmentId: ann.departmentId,
      campusId: ann.campusId,
      title: ann.title,
      content: ann.content,
      audienceType: ann.audienceType,
      targetCourseId: ann.targetCourseId,
      targetSemester: ann.targetSemester,
      targetSectionId: ann.targetSectionId,
      priority: ann.priority,
      status: 'Published',
      authorId: currentUser.facultyId,
      authorName: currentUser.name,
    });
    if (res.ok) {
      showToast(`Published "${ann.title}".`, 'success');
    }
  };

  const semesters = Array.from(
    new Set(coursesData.sections.map((s) => s.semester))
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            HOD Portal • Department Circulars & Targeted Notices
          </p>
          <h1 className="text-2xl font-bold text-navy-900 mt-0.5">
            Department Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, draft, and publish official circulars for authorized faculty and
            student groups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/hod/reports')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 hover:bg-slate-50"
          >
            <FileBarChart className="w-4 h-4 text-slate-600" />
            View Reports & CSV
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2">
        {(['ALL', 'Published', 'Draft'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === tab
                ? 'bg-navy-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' ? 'All Circulars' : `${tab} Only`}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No announcements in this category"
          description="Create a new department circular or switch status filter."
          actionLabel="Create Announcement"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={ann.status === 'Published' ? 'green' : 'amber'} dot>
                    {ann.status}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(ann.priority)}>
                    {ann.priority}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    <Users className="w-3 h-3" />
                    {ann.audienceLabel}
                  </span>
                </div>

                <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{ann.title}</span>
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>

                <p className="text-[11px] text-slate-400">
                  Author: {ann.authorName} • Last updated {ann.updatedAt}
                  {ann.publishedAt ? ` • Published ${ann.publishedAt}` : ' • Unpublished Draft'}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                {ann.status === 'Draft' && (
                  <button
                    type="button"
                    onClick={() => handlePublishDraftDirectly(ann)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(ann)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(ann)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? 'Edit Department Announcement' : 'New Department Announcement'}
        subtitle="Select target audience from authorized department faculty or student groups"
        maxWidthClass="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave('Draft')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('Published')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Circular
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Circular Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., End-Semester Practical Viva Schedule..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intended Audience Group
              </label>
              <select
                value={audienceType}
                onChange={(e) =>
                  setAudienceType(e.target.value as AnnouncementAudienceType)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="All Department">All Department (Faculty & Students)</option>
                <option value="Faculty Only">Authorized Department Faculty Only</option>
                <option value="Students Only">All Department Students Only</option>
                <option value="Course & Semester">Specific Course & Semester</option>
                <option value="Specific Section">Specific Class Section</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="Normal">Normal</option>
                <option value="Important">Important</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {audienceType === 'Course & Semester' && (
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Course
                </label>
                <select
                  value={targetCourseId}
                  onChange={(e) => setTargetCourseId(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  {coursesData.courses.map(({ course }) => (
                    <option key={course.id} value={course.id}>
                      {course.shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Semester
                </label>
                <select
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(Number(e.target.value))}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                >
                  {semesters.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {audienceType === 'Specific Section' && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Class Section
              </label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
              >
                {coursesData.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.displayName} (Room {sec.roomNumber})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Announcement Body
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write official announcement details, dates, and instructions..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            erpService.deleteAnnouncement(deleteTarget.id);
            showToast(`Deleted announcement "${deleteTarget.title}".`, 'info');
            setDeleteTarget(null);
          }
        }}
        title="Delete Department Announcement?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}"?`}
        confirmLabel="Delete Circular"
        variant="danger"
      />
    </div>
  );
};

