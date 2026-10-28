import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Merge,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../../services/api';

export default function StudentRegistryView({ selectedCampusId = 'all' }) {
  const [students, setStudents] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState('');

  const fetchStudents = async () => {
    setIsLoading(true);
    const res = await apiService.getCanonicalStudents({
      campusId: selectedCampusId,
      search: searchQuery
    });
    if (res && res.data) {
      setStudents(res.data);
    }
    setIsLoading(false);
  };

  const scanDuplicates = async () => {
    const res = await apiService.detectStudentDuplicates();
    if (res && res.data) {
      setDuplicates(res.data);
    }
  };

  useEffect(() => {
    fetchStudents();
    scanDuplicates();
  }, [selectedCampusId]);

  const handleApproveMerge = async () => {
    if (!selectedPair) return;
    setIsMerging(true);
    const res = await apiService.approveStudentMerge({
      primaryCanonicalId: selectedPair.primaryStudent.canonicalId,
      secondaryCanonicalId: selectedPair.candidateStudent.canonicalId,
      evidenceNotes: 'Authorized administrative confirmation of student identity transfer across campuses'
    });

    if (res && res.success) {
      setMergeSuccessMsg(res.message);
      setSelectedPair(null);
      await fetchStudents();
      await scanDuplicates();
    }
    setIsMerging(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <ShieldCheck size={13} />
            Trust-Wide Unified Student Master Registry
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Canonical Student Identities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent unique canonical IDs linking historical campus profiles, preventing duplicate counting across all six institutions.
          </p>
        </div>

        <button
          onClick={scanDuplicates}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
        >
          <Sparkles size={14} className="text-blue-200" />
          <span>Scan Potential Duplicates ({duplicates.length})</span>
        </button>
      </div>

      {mergeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{mergeSuccessMsg}</span>
          </div>
          <button onClick={() => setMergeSuccessMsg('')} className="text-emerald-600 hover:underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Duplicate Candidates Alert Banner */}
      {duplicates.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} className="text-amber-600" />
              Potential Cross-Campus Identity Match Detected ({duplicates.length})
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Human review & approval required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {duplicates.map((dup) => (
              <div
                key={dup.pairId}
                className="p-3 bg-white rounded-xl border border-amber-200/90 shadow-xs flex flex-col justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">{dup.primaryStudent.fullName} &amp; {dup.candidateStudent.fullName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {dup.confidenceScore}% Match
                    </span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    {dup.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedPair(dup)}
                  className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Merge size={13} />
                  <span>Review Evidence &amp; Merge Identities</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search canonical ID, student name, or admission number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchStudents()}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchStudents}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      {/* Students List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Canonical Student ID</th>
                <th className="py-3 px-4">Full Legal Name</th>
                <th className="py-3 px-4">Primary Campus</th>
                <th className="py-3 px-4">Enrolled Profiles &amp; Historical IDs</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Merge History</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">Loading student registry...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">No canonical students found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.canonicalId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{s.canonicalId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.fullName}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Building size={12} className="text-slate-400" />
                        {s.primaryCampusId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {s.campusProfiles.map((p, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-800 font-semibold">
                              {p.localAdmissionNo}
                            </span>
                            <span>({p.campusName} • {p.program})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      <div>{s.primaryEmail}</div>
                      <div>{s.primaryPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.mergeHistory && s.mergeHistory.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                          <History size={11} /> {s.mergeHistory.length} Merged ID(s)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Review & Merge Approval Modal */}
      {selectedPair && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Merge size={18} className="text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Approve Student Identity Merge</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                {selectedPair.confidenceScore}% Confidence Score
              </span>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed">
              Verify equivalence evidence before unification. Approving will absorb secondary campus records into the primary canonical identity without losing historical identifiers or audit logs.
            </div>

            {/* Side-by-Side Records */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Primary Record (Retained)</span>
                <div className="font-bold text-slate-900 text-sm">{selectedPair.primaryStudent.fullName}</div>
                <div className="font-mono text-blue-700 text-[11px]">{selectedPair.primaryStudent.canonicalId}</div>
                <div className="text-slate-600">DOB: {selectedPair.primaryStudent.dob || 'N/A'}</div>
                <div className="text-slate-600">Phone: {selectedPair.primaryStudent.primaryPhone}</div>
                <div className="text-slate-600">Campus: {selectedPair.primaryStudent.primaryCampusId}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Secondary Record (Absorbed)</span>
                <div className="font-bold text-slate-900 text-sm">{selectedPair.candidateStudent.fullName}</div>
                <div className="font-mono text-slate-600 text-[11px]">{selectedPair.candidateStudent.canonicalId}</div>
                <div className="text-slate-600">DOB: {selectedPair.candidateStudent.dob || 'N/A'}</div>
                <div className="text-slate-600">Phone: {selectedPair.candidateStudent.primaryPhone}</div>
                <div className="text-slate-600">Campus: {selectedPair.candidateStudent.primaryCampusId}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold">Match Evidence: </span>
              {selectedPair.reasons.join('; ')}.
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedPair(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={isMerging}
                onClick={handleApproveMerge}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Merge size={14} />
                <span>{isMerging ? 'Unifying Identity...' : 'Confirm & Approve Merge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

