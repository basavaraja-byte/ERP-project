import { CampusRule } from '../models/CampusRule.js';
import { auditService } from './auditService.js';
import { isDbConnected } from '../config/database.js';
import { MOCK_CAMPUSES } from '../../../src/data/mockData.js';

// Initial in-memory rule set for the 6 campuses
let memoryRules = [
  {
    ruleId: 'RUL-C1-ATT-V1',
    campusId: 'campus-1',
    campusName: 'Maharaja Institute of Technology',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 75,
      criticalAttendanceThreshold: 60,
      condonationAllowed: true,
      condonationFeeINR: 1500
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'Baseline institutional policy initialization'
  },
  {
    ruleId: 'RUL-C2-ATT-V1',
    campusId: 'campus-2',
    campusName: 'Maharaja Polytechnic College',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 75,
      criticalAttendanceThreshold: 60,
      condonationAllowed: true,
      condonationFeeINR: 1000
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'Baseline institutional policy initialization'
  },
  {
    ruleId: 'RUL-C3-ATT-V1',
    campusId: 'campus-3',
    campusName: 'Maharaja College of Arts & Science',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 75,
      criticalAttendanceThreshold: 60,
      condonationAllowed: true,
      condonationFeeINR: 1200
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'Baseline institutional policy initialization'
  },
  {
    ruleId: 'RUL-C4-ATT-V1',
    campusId: 'campus-4',
    campusName: 'Maharaja PU College',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 80, // Higher cutoff for school
      criticalAttendanceThreshold: 70,
      condonationAllowed: false,
      condonationFeeINR: 0
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'School regulatory mandate for K-12'
  },
  {
    ruleId: 'RUL-C5-ATT-V1',
    campusId: 'campus-5',
    campusName: 'Maharaja School',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 70, // Executive PG flexibility
      criticalAttendanceThreshold: 55,
      condonationAllowed: true,
      condonationFeeINR: 2500
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'MBA executive internship allowance'
  },
  {
    ruleId: 'RUL-C6-ATT-V1',
    campusId: 'campus-6',
    campusName: 'MIT for Masters',
    academicYear: 'AY 2025–26',
    ruleType: 'ATTENDANCE_POLICY',
    version: 1,
    effectiveFrom: new Date('2025-06-01'),
    effectiveTo: null,
    status: 'ACTIVE',
    config: {
      attendanceThresholdPercentage: 75,
      criticalAttendanceThreshold: 60,
      condonationAllowed: true,
      condonationFeeINR: 500
    },
    lastEditor: { userId: 'USR-TRU-001', name: 'Dr. Vikram Mehta', role: 'TRUSTEE' },
    changeReason: 'Vocational training standard'
  }
];

export const rulesEngineService = {
  /**
   * Get all active rules for a campus
   */
  async getActiveRules({ campusId = 'campus-1', academicYear = 'AY 2025–26' } = {}) {
    if (isDbConnected()) {
      try {
        const query = { status: 'ACTIVE' };
        if (campusId && campusId !== 'all') query.campusId = campusId;
        if (academicYear) query.academicYear = academicYear;
        const docs = await CampusRule.find(query).sort({ campusId: 1, ruleType: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[RulesEngine] Mongo query failed, using memory fallback:', err.message);
      }
    }

    return memoryRules.filter(r => {
      if (r.status !== 'ACTIVE') return false;
      if (campusId !== 'all' && r.campusId !== campusId) return false;
      if (academicYear && r.academicYear !== academicYear) return false;
      return true;
    });
  },

  /**
   * Get version history for a campus and rule type
   */
  async getRuleHistory({ campusId = 'campus-1', ruleType = 'ATTENDANCE_POLICY' } = {}) {
    if (isDbConnected()) {
      try {
        const docs = await CampusRule.find({ campusId, ruleType }).sort({ version: -1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[RulesEngine] History query failed:', err.message);
      }
    }

    return memoryRules
      .filter(r => r.campusId === campusId && r.ruleType === ruleType)
      .sort((a, b) => b.version - a.version);
  },

  /**
   * Update / Version a Campus Policy Rule
   * Preserves historical version with timestamp and editor.
   */
  async updateRule({
    campusId,
    ruleType = 'ATTENDANCE_POLICY',
    academicYear = 'AY 2025–26',
    config,
    editor = { userId: 'USR-DEA-001', name: 'Prof. Rajesh Swaminathan', role: 'DEAN' },
    changeReason = 'Academic Council policy update'
  }) {
    if (!campusId) throw new Error('campusId is required to update campus rules.');

    const campus = MOCK_CAMPUSES.find(c => c.id === campusId);
    const campusName = campus ? campus.name : `Campus ${campusId}`;

    // Find current active rule
    const existingActive = memoryRules.find(r =>
      r.campusId === campusId &&
      r.ruleType === ruleType &&
      r.academicYear === academicYear &&
      r.status === 'ACTIVE'
    );

    const nextVersion = existingActive ? existingActive.version + 1 : 1;

    // Supersede old rule
    if (existingActive) {
      existingActive.status = 'SUPERSEDED';
      existingActive.effectiveTo = new Date();
    }

    const newRuleId = `RUL-${campusId.toUpperCase()}-${ruleType.substring(0, 3)}-V${nextVersion}`;
    const newRule = {
      ruleId: newRuleId,
      campusId,
      campusName,
      academicYear,
      ruleType,
      version: nextVersion,
      effectiveFrom: new Date(),
      effectiveTo: null,
      status: 'ACTIVE',
      config: {
        ...(existingActive ? existingActive.config : {}),
        ...config
      },
      lastEditor: editor,
      changeReason
    };

    if (isDbConnected()) {
      try {
        if (existingActive) {
          await CampusRule.updateOne(
            { ruleId: existingActive.ruleId },
            { $set: { status: 'SUPERSEDED', effectiveTo: new Date() } }
          );
        }
        await CampusRule.create(newRule);
      } catch (err) {
        console.warn('[RulesEngine] Mongo rule write failed, stored in memory:', err.message);
      }
    }

    memoryRules.unshift(newRule);

    // Audit log
    await auditService.log({
      actorId: editor.userId,
      actorName: editor.name,
      actorRole: editor.role,
      actorCampusId: campusId,
      action: 'CAMPUS_RULE_UPDATE',
      targetEntity: 'CampusRule',
      targetId: newRuleId,
      campusId,
      changeSummary: `Created version ${nextVersion} for ${ruleType} on ${campusName}. Reason: ${changeReason}`,
      metadata: { config, previousVersion: existingActive?.version }
    });

    return {
      success: true,
      message: `Rule updated to version ${nextVersion} successfully.`,
      rule: newRule
    };
  },

  /**
   * Recalculate Examination Eligibility for a Single Campus
   * Demonstrates strict campus isolation: leaves other 5 campuses unaffected.
   */
  async recalculateCampusEligibility({
    campusId = 'campus-1',
    academicYear = 'AY 2025–26',
    simulatedNewThreshold = null
  }) {
    const activeRules = await this.getActiveRules({ campusId, academicYear });
    const attendanceRule = activeRules.find(r => r.ruleType === 'ATTENDANCE_POLICY');

    const threshold = simulatedNewThreshold !== null
      ? Number(simulatedNewThreshold)
      : (attendanceRule?.config?.attendanceThresholdPercentage || 75);

    // Baseline sample students in Campus 1
    const campus1Students = [
      { id: 'AIT-01', name: 'Rahul Sharma', attendancePct: 88.5 },
      { id: 'AIT-02', name: 'V. Sneha', attendancePct: 76.2 },
      { id: 'AIT-03', name: 'K. Karthik', attendancePct: 72.0 },
      { id: 'AIT-04', name: 'R. Vignesh', attendancePct: 69.5 },
      { id: 'AIT-05', name: 'M. Divya', attendancePct: 81.0 },
      { id: 'AIT-06', name: 'S. Ananya', attendancePct: 58.0 }
    ];

    const baselineRiskCount = campus1Students.filter(s => s.attendancePct < 75).length; // 3 students below 75%
    const recalculatedRiskCount = campus1Students.filter(s => s.attendancePct < threshold).length;

    // Report showing isolated impact
    const campusImpactReport = {
      recalculatedCampusId: campusId,
      academicYear,
      appliedRuleVersion: attendanceRule?.version || 1,
      attendanceThresholdUsed: `${threshold}%`,
      sampleEvaluatedCount: campus1Students.length,
      previousRiskCount: baselineRiskCount,
      newRiskCount: recalculatedRiskCount,
      difference: recalculatedRiskCount - baselineRiskCount,
      isolatedUnaffectedCampuses: MOCK_CAMPUSES
        .filter(c => c.id !== campusId)
        .map(c => ({
          campusId: c.id,
          campusName: c.name,
          currentThreshold: c.id === 'campus-4' ? '80%' : (c.id === 'campus-5' ? '70%' : '75%'),
          status: 'UNTOUCHED (0 changes)'
        })),
      evaluatedAt: new Date()
    };

    await auditService.log({
      actorId: 'SYS-RULES',
      actorName: 'Rules Recalculation Engine',
      actorRole: 'SYSTEM',
      actorCampusId: campusId,
      action: 'ELIGIBILITY_RECALCULATION',
      targetEntity: 'CampusRule',
      targetId: attendanceRule?.ruleId || campusId,
      campusId,
      changeSummary: `Recalculated attendance eligibility for ${campusId} at ${threshold}% threshold. Unaffected: 5 other campuses.`,
      metadata: campusImpactReport
    });

    return campusImpactReport;
  }
};

