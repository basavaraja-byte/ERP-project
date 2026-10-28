import { importPipelineService, MESSY_DEMO_ROWS } from '../services/importPipelineService.js';

export const createImportJob = async (req, res, next) => {
  try {
    const { fileName, rows, importCategory, campusId, academicYear } = req.body;

    const uploadedBy = req.user?.name || 'Authorized Import Operator';

    const job = await importPipelineService.createJob({
      fileName,
      rows: rows || MESSY_DEMO_ROWS, // If no rows supplied, loads the standard messy demo file
      importCategory,
      campusId: campusId || req.user?.assignedCampusId || 'campus-1',
      academicYear,
      uploadedBy
    });

    return res.status(201).json({
      success: true,
      data: job
    });
  } catch (err) {
    next(err);
  }
};

export const validateImportJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { columnMapping } = req.body;

    const validatedJob = await importPipelineService.validateJob({
      jobId,
      columnMapping
    });

    return res.status(200).json({
      success: true,
      data: validatedJob
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const approveImportJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { commitMode } = req.body;

    const approvedBy = req.user?.name || 'Administrator';
    const actorRole = req.user?.role || 'TRUSTEE';
    const actorCampusId = req.user?.assignedCampusId || null;

    const result = await importPipelineService.approveAndCommit({
      jobId,
      approvedBy,
      actorRole,
      actorCampusId,
      commitMode
    });

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getDemoMessySpreadsheet = (req, res) => {
  return res.status(200).json({
    success: true,
    fileName: 'Campus1_Fee_Ledger_Messy_Demonstration.csv',
    description: 'Deliberately flawed spreadsheet containing duplicate rows, missing student roll numbers, negative paid amounts, and invalid numbers for data quality verification.',
    sampleRows: MESSY_DEMO_ROWS
  });
};

