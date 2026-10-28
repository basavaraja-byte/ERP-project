import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Layers,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../../services/api';

const PIPELINE_STEPS = [
  { step: 1, label: 'Upload' },
  { step: 2, label: 'Map Columns' },
  { step: 3, label: 'Validate' },
  { step: 4, label: 'Preview & Quarantine' },
  { step: 5, label: 'Approve & Commit' }
];

export default function SpreadsheetImportView({ selectedCampusId = 'campus-1' }) {
  const [activeStep, setActiveStep] = useState(1);
  const [activeCampus, setActiveCampus] = useState(
    selectedCampusId === 'all' ? 'campus-1' : selectedCampusId
  );
  const [targetEntity, setTargetEntity] = useState('STUDENT_ENROLLMENT');
  const [isLoading, setIsLoading] = useState(false);
  const [importJob, setImportJob] = useState(null);
  const [commitSummary, setCommitSummary] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Column mapping state
  const [mappings, setMappings] = useState({
    rollNumber: 'Roll Number',
    fullName: 'Student Name',
    department: 'Department',
    enrollmentDate: 'Enrollment Date',
    feeAmount: 'Amount Paid'
  });

  // Step 1: Load messy hackathon demo dataset
  const handleLoadMessyDemo = async () => {
    setIsLoading(true);
    setFeedback(null);
    setCommitSummary(null);

    const demoRes = await apiService.getMessyDemoSpreadsheet();
    if (demoRes && demoRes.success) {
      const uploadRes = await apiService.createImportJob({
        filename: 'Messy_Student_Enrollment_Hackathon_Audit.csv',
        targetEntityType: targetEntity,
        campusId: activeCampus,
        rawHeaders: demoRes.data.headers,
        rawRows: demoRes.data.rows
      });

      if (uploadRes && uploadRes.success) {
        setImportJob(uploadRes.data);
        if (uploadRes.data.columnMapping) {
          setMappings(uploadRes.data.columnMapping);
        }
        setActiveStep(2);
        setFeedback({
          type: 'success',
          text: `Loaded Messy Hackathon Demo Dataset with deliberate edge cases (${demoRes.data.rows.length} rows including negative fees, invalid dates, duplicate rolls).`
        });
      }
    } else {
      setFeedback({
        type: 'error',
        text: 'Failed to load messy demo dataset.'
      });
    }
    setIsLoading(false);
  };

  // Step 2: Validate Mapped Data
  const handleValidatePipeline = async () => {
    if (!importJob) return;
    setIsLoading(true);
    setFeedback(null);

    const valRes = await apiService.validateImportJob(importJob.jobId, {
      columnMapping: mappings
    });

    if (valRes && valRes.success) {
      setImportJob(valRes.data);
      setActiveStep(4);
      setFeedback({
        type: 'success',
        text: `Pipeline validation completed: ${valRes.data.validationSummary.validRows} valid rows passed, ${valRes.data.validationSummary.errorRows} quarantined for administrative review.`
      });
    } else {
      setFeedback({
        type: 'error',
        text: valRes?.message || 'Data validation failed.'
      });
    }
    setIsLoading(false);
  };

  // Step 4 -> 5: Approve & Commit Clean Rows
  const handleApproveAndCommit = async () => {
    if (!importJob) return;
    setIsLoading(true);
    setFeedback(null);

    const approveRes = await apiService.approveImportJob(importJob.jobId, {
      notes: 'Authorized commit of verified clean rows via TrustView Data Quality Gate'
    });

    if (approveRes && approveRes.success) {
      setImportJob(approveRes.data.job);
      setCommitSummary(approveRes.data);
      setActiveStep(5);
      setFeedback({
        type: 'success',
        text: `Committed ${approveRes.data.committedRecords} clean rows into canonical database. Audit trail logged.`
      });
    } else {
      setFeedback({
        type: 'error',
        text: approveRes?.message || 'Commit failed.'
      });
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setImportJob(null);
    setCommitSummary(null);
    setActiveStep(1);
    setFeedback(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
            <UploadCloud size={13} />
            7-Stage Guided Spreadsheet Import &amp; Data Quality Gate
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Guided Spreadsheet Ingestion Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict row-level quarantine, fuzzy duplicate check, and human approval gate preventing bad spreadsheet data from contaminating the database.
          </p>
        </div>

        <button
          onClick={handleLoadMessyDemo}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} className="text-blue-200" />
          )}
          <span>Load Messy Hackathon Demo Dataset</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-500 hover:text-slate-700 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stepper Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {PIPELINE_STEPS.map((stepItem, idx) => {
            const isCompleted = activeStep > stepItem.step;
            const isCurrent = activeStep === stepItem.step;

            return (
              <React.Fragment key={stepItem.step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={14} /> : stepItem.step}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden md:inline ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      activeStep > stepItem.step ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Upload or Select Preset */}
      {activeStep === 1 && (
        <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UploadCloud size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Upload Campus Operational Spreadsheet</h3>
            <p className="text-xs text-slate-500">
              Supports Excel (.xlsx, .xls) and CSV files up to 25MB across Student Enrollment, Fee Receipts, and Hostel Bed allocations.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLoadMessyDemo}
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Load Messy Hackathon Demo Dataset</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            The messy dataset includes real-world edge cases: invalid calendar dates (Feb 31), negative fees (-₹15,000), duplicate roll numbers, and missing student names.
          </p>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {activeStep === 2 && importJob && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Step 2: Auto-Detected Column Mapping</h3>
              <p className="text-xs text-slate-500">
                Confirm how headers in <strong>{importJob.filename}</strong> correspond to canonical schema fields.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {importJob.rawRows?.length || 0} Total Rows Detected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(mappings).map((fieldKey) => (
              <div key={fieldKey} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">
                  Target Field: {fieldKey}
                </span>
                <select
                  value={mappings[fieldKey]}
                  onChange={(e) => setMappings({ ...mappings, [fieldKey]: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                >
                  {importJob.rawHeaders?.map((hdr) => (
                    <option key={hdr} value={hdr}>
                      {hdr}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Back
            </button>
            <button
              onClick={handleValidatePipeline}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <FileCheck size={14} />}
              <span>Validate Rows &amp; Quarantine Errors</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Preview Clean vs Quarantined Error Rows */}
      {activeStep === 4 && importJob && (
        <div className="space-y-6">
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Total Rows Evaluated</span>
              <span className="text-2xl font-black text-slate-900">{importJob.validationSummary?.totalRows || 0}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs">
              <span className="block text-[10px] font-bold text-emerald-600 uppercase">Clean Rows (Ready to Commit)</span>
              <span className="text-2xl font-black text-emerald-600">{importJob.validationSummary?.validRows || 0}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs">
              <span className="block text-[10px] font-bold text-rose-600 uppercase">Quarantined Error Rows</span>
              <span className="text-2xl font-black text-rose-600">{importJob.validationSummary?.errorRows || 0}</span>
            </div>
          </div>

          {/* Quarantined Error Rows Table */}
          {importJob.validationSummary?.errorRows > 0 && (
            <div className="bg-rose-50/50 rounded-2xl border border-rose-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-rose-100/60 border-b border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle size={15} className="text-rose-600" />
                  <span>Quarantined Error Rows ({importJob.validationSummary?.errorRows})</span>
                </div>
                <span className="text-[11px] text-rose-700 font-semibold">
                  Excluded from database commit to guarantee data integrity
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-rose-100/30 border-b border-rose-200 text-rose-800 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-4">Row #</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Roll Number</th>
                      <th className="py-2.5 px-4">Violated Field</th>
                      <th className="py-2.5 px-4">Validation Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 bg-white">
                    {importJob.rowResults
                      ?.filter((r) => r.status === 'ERROR')
                      .map((errRow) => (
                        <tr key={errRow.rowNumber} className="hover:bg-rose-50/40">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                            #{errRow.rowNumber}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 font-medium">
                            {errRow.rawData['Student Name'] || <span className="italic text-rose-600">&lt;MISSING&gt;</span>}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-600">
                            {errRow.rawData['Roll Number'] || '—'}
                          </td>
                          <td className="py-2.5 px-4">
                            {errRow.errors?.map((err, i) => (
                              <span key={i} className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold mr-1">
                                {err.field}
                              </span>
                            ))}
                          </td>
                          <td className="py-2.5 px-4 text-rose-700 font-semibold">
                            {errRow.errors?.map((err) => err.message).join('; ')}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Clean Valid Rows Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-emerald-50/60 border-b border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span>Clean Valid Records Ready for Database Ingestion ({importJob.validationSummary?.validRows})</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Verified against canonical schemas &amp; idempotency keys
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-4">Row #</th>
                    <th className="py-2.5 px-4">Roll Number</th>
                    <th className="py-2.5 px-4">Full Name</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4">Enrollment Date</th>
                    <th className="py-2.5 px-4 text-right">Fee (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importJob.rowResults
                    ?.filter((r) => r.status === 'VALID')
                    .map((validRow) => (
                      <tr key={validRow.rowNumber} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">
                          #{validRow.rowNumber}
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-600">
                          {validRow.rawData['Roll Number']}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {validRow.rawData['Student Name']}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {validRow.rawData['Department']}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {validRow.rawData['Enrollment Date']}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-600">
                          ₹{Number(validRow.rawData['Amount Paid'] || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Modify Mapping
            </button>

            <button
              onClick={handleApproveAndCommit}
              disabled={isLoading || importJob.validationSummary?.validRows === 0}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              <span>Approve &amp; Commit {importJob.validationSummary?.validRows} Clean Rows</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success & Audit Log */}
      {activeStep === 5 && commitSummary && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">Spreadsheet Ingestion Complete!</h3>
            <p className="text-xs text-slate-500">
              Successfully committed {commitSummary.committedRecords} clean student records to canonical registry for {activeCampus.toUpperCase()}.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs text-slate-700 space-y-1 text-left font-mono">
            <div>Job ID: {importJob?.jobId}</div>
            <div>Committed Records: {commitSummary.committedRecords}</div>
            <div>Quarantined Records: {importJob?.validationSummary?.errorRows || 0}</div>
            <div>Status: COMMITTED_AND_AUDITED</div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Import Another Spreadsheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

