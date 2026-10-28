import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { apiService } from '../../services/api';
import ComplaintSubmissionModal from './ComplaintSubmissionModal';

export default function UserComplaintsList({ user, title = 'Submitted Grievances & Resolution Desk' }) {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.getComplaints();
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load grievances.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleComplaintSubmitted = (newDoc) => {
    setComplaints((prev) => [newDoc, ...prev]);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Resolved
          </span>
        );
      case 'Under Review':
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} />
            Under Review
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Pending Action
          </span>
        );
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const reviewCount = complaints.filter((c) => c.status === 'Under Review' || c.status === 'In Review').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-4">
      {/* Header & Launcher Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              MongoDB Atlas Persisted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit service requests regarding academic fees, attendance verification, lab facilities, or hostel maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={fetchComplaints}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors"
            title="Refresh records"
            aria-label="Refresh grievance list"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-blue-600' : ''} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <PlusCircle size={15} />
            <span>Raise New Grievance</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Filed</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{complaints.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[11px] text-amber-600 font-medium">Pending Action</span>
          <div className="text-xl font-bold text-amber-600 mt-0.5">{pendingCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[11px] text-blue-600 font-medium">Under Review</span>
          <div className="text-xl font-bold text-blue-600 mt-0.5">{reviewCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
          <span className="text-[11px] text-emerald-600 font-medium">Resolved</span>
          <div className="text-xl font-bold text-emerald-600 mt-0.5">{resolvedCount}</div>
        </div>
      </div>

      {/* Grievance Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading && complaints.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-2">
            <RefreshCw size={20} className="animate-spin text-blue-600 mx-auto" />
            <p>Loading grievances from server...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600 space-y-2">
            <AlertCircle size={22} className="mx-auto" />
            <p>{error}</p>
            <button
              onClick={fetchComplaints}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Retry
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-3">
            <FileText size={32} className="mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No grievances filed yet.</p>
            <p className="max-w-md mx-auto text-slate-400">
              If you have any academic discrepancies, lab concerns, or campus facility requests, click the button above to register a formal ticket.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((item) => (
              <div
                key={item.complaintId}
                className="p-4 hover:bg-slate-50/80 transition-colors space-y-2 cursor-pointer"
                onClick={() => setSelectedComplaint(item)}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {item.complaintId}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                    {item.priority && item.priority !== 'Medium' && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        item.priority === 'High' || item.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.priority}
                      </span>
                    )}
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Resolution Notes preview if present */}
                {item.resolutionNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                    <span className="font-semibold text-slate-900 block">
                      HOD / Resolution Remark:
                    </span>
                    <p className="text-slate-600">{item.resolutionNotes}</p>
                    {item.resolvedBy && (
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Resolved by: {item.resolvedBy}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    Submitted: {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <span className="font-mono font-bold text-sm text-slate-900">
                  {selectedComplaint.complaintId}
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between">
                <div>{getStatusBadge(selectedComplaint.status)}</div>
                <span className="text-slate-500 text-[11px]">
                  Category: <strong>{selectedComplaint.category}</strong>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{selectedComplaint.title}</h4>
                <p className="text-slate-700 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Submitter:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.submitterName} ({selectedComplaint.submitterRole})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Student ID:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedComplaint.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Campus:</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.campusId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted At:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedComplaint.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedComplaint.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
                  <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Official Resolution Remark:
                  </span>
                  <p className="text-emerald-900 leading-relaxed">
                    {selectedComplaint.resolutionNotes}
                  </p>
                  {selectedComplaint.resolvedBy && (
                    <span className="text-[10px] text-emerald-700 block pt-1">
                      Recorded by: {selectedComplaint.resolvedBy} on{' '}
                      {new Date(selectedComplaint.resolvedAt || selectedComplaint.updatedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Submission Modal */}
      <ComplaintSubmissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onSuccess={handleComplaintSubmitted}
      />
    </div>
  );
}
