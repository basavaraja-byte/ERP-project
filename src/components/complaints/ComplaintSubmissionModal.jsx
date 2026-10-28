import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  ShieldCheck,
  Building,
  User,
  GraduationCap
} from 'lucide-react';
import { apiService } from '../../services/api';

const CATEGORIES = [
  'Academic',
  'Attendance Discrepancy',
  'Lab & Infrastructure',
  'Assessment & Grading',
  'Hostel',
  'Fee & Finance',
  'Administration',
  'Other'
];

const PRIORITIES = [
  { value: 'Low', label: 'Low — Normal response time' },
  { value: 'Medium', label: 'Medium — Standard academic inquiry' },
  { value: 'High', label: 'High — Urgent attention required' },
  { value: 'Urgent', label: 'Urgent — Critical blocker' }
];

export default function ComplaintSubmissionModal({
  isOpen,
  onClose,
  user,
  onSuccess
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  if (!isOpen) return null;

  const roleUpper = (user?.role || 'STUDENT').toUpperCase();
  const campusLabel = user?.assignedCampusId
    ? `Campus ${user.assignedCampusId.replace('campus-', '')}`
    : 'Assigned Campus';
  const studentIdentifier = user?.studentId || user?.wardStudentId || 'Enrolled Student';

  const resetForm = () => {
    setTitle('');
    setCategory('Academic');
    setPriority('Medium');
    setDescription('');
    setValidationError('');
    setServerError('');
    setIsSuccess(false);
    setSubmittedComplaint(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setServerError('');

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanCategory = category.trim();

    // Validation checks
    if (!cleanTitle) {
      setValidationError('Please provide a subject / title for your grievance.');
      return;
    }
    if (cleanTitle.length < 5) {
      setValidationError('Subject / title should be at least 5 characters.');
      return;
    }
    if (!cleanCategory) {
      setValidationError('Please select a complaint category.');
      return;
    }
    if (!cleanDesc) {
      setValidationError('Please provide a detailed description of your grievance.');
      return;
    }
    if (cleanDesc.length < 15) {
      setValidationError('Please describe your grievance in more detail (at least 15 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: cleanTitle,
        category: cleanCategory,
        priority,
        description: cleanDesc,
        campusId: user?.assignedCampusId || 'campus-1',
        department: user?.department || 'General',
        studentId: studentIdentifier
      };

      const res = await apiService.createComplaint(payload);

      if (res && res.status === 'success' && res.data) {
        setIsSuccess(true);
        setSubmittedComplaint(res.data);
        if (onSuccess) {
          onSuccess(res.data);
        }
        setTimeout(() => {
          handleClose();
        }, 1600);
      } else {
        setServerError(res?.message || 'Failed to submit grievance. Please try again.');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Submit Formal Grievance / Complaint
              </h3>
              <p className="text-[11px] text-slate-500">
                Official TrustView ERP Grievance Portal • Scoped to {campusLabel}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Submitter Context Pill (Auto-derived from JWT session) */}
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                Verified Submitter Context (Auto-Attached)
              </span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-300">
                JWT Authenticated
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1 border-t border-blue-100">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                <span className="truncate"><strong>{user?.name || 'Submitter'}</strong> ({roleUpper})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={12} className="text-slate-400" />
                <span className="truncate font-mono">ID: {studentIdentifier}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building size={12} className="text-slate-400" />
                <span className="truncate">{campusLabel}</span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {isSuccess && submittedComplaint && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Grievance Registered Successfully!</p>
                <p className="mt-0.5">
                  Assigned Complaint ID: <span className="font-mono font-bold text-emerald-800">{submittedComplaint.complaintId}</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Forwarded to HOD &amp; Campus Authority for review and resolution.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {(validationError || serverError) && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{validationError || serverError}</span>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="complaint-category" className="block text-xs font-semibold text-slate-700 mb-1">
                    Grievance Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="complaint-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="complaint-priority" className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority Level
                  </label>
                  <select
                    id="complaint-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <label htmlFor="complaint-title" className="block text-xs font-semibold text-slate-700 mb-1">
                  Grievance Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  id="complaint-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Computer Lab 2 workstation monitor flickering during class"
                  maxLength={200}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="complaint-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="complaint-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete facts, dates, room numbers, course names, or reference numbers to help the HOD investigate promptly..."
                  maxLength={2000}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Minimum 15 characters required</span>
                  <span>{description.length} / 2000</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Submitting Grievance...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Grievance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

