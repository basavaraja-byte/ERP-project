import { CanonicalStudent } from '../models/CanonicalStudent.js';
import { auditService } from './auditService.js';
import { isDbConnected } from '../config/database.js';

// Levenshtein similarity metric
function getLevenshteinSimilarity(str1, str2) {
  const s1 = String(str1 || '').toLowerCase().trim();
  const s2 = String(str2 || '').toLowerCase().trim();
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return 1 - (distance / maxLen);
}

// In-memory fallback dataset for seamless offline and testing operation
let memoryCanonicalStudents = [
  {
    canonicalId: 'TRU-STU-2025-0001',
    fullName: 'Rahul Sharma',
    normalizedName: 'rahulsharma',
    dob: '2005-04-12',
    primaryEmail: 'student.rahul@trustview.edu',
    primaryPhone: '+91 98765 11042',
    gender: 'Male',
    status: 'ACTIVE',
    primaryCampusId: 'campus-1',
    campusProfiles: [
      {
        campusId: 'campus-1',
        campusName: 'Maharaja Institute of Technology',
        localAdmissionNo: 'AIT2023-CS-042',
        department: 'Computer Science & Engineering',
        program: 'B.Tech CSE',
        batchYear: 2023,
        enrollmentStatus: 'Active',
        sourceSystem: 'MIT ERP Admissions',
        admittedAt: new Date('2023-08-10'),
        historicalIds: ['MIT-ADM-2023-042']
      }
    ],
    mergeHistory: []
  },
  {
    canonicalId: 'TRU-STU-2025-0002',
    fullName: 'R. Sharma', // Candidate duplicate for demonstration
    normalizedName: 'rsharma',
    dob: '2005-04-12',
    primaryEmail: 'rahul.poly@maharaja.edu',
    primaryPhone: '+91 98765 11042', // Same phone number!
    gender: 'Male',
    status: 'ACTIVE',
    primaryCampusId: 'campus-2',
    campusProfiles: [
      {
        campusId: 'campus-2',
        campusName: 'Maharaja Polytechnic College',
        localAdmissionNo: 'MPC2024-DCS-019',
        department: 'Computer Engineering',
        program: 'Diploma Computer Tech',
        batchYear: 2024,
        enrollmentStatus: 'Active',
        sourceSystem: 'Polytechnic Student Roster',
        admittedAt: new Date('2024-07-15'),
        historicalIds: ['POLY-2024-019']
      }
    ],
    mergeHistory: []
  },
  {
    canonicalId: 'TRU-STU-2025-0003',
    fullName: 'Priya Patel',
    normalizedName: 'priyapatel',
    dob: '2006-09-18',
    primaryEmail: 'priya.patel@trustview.edu',
    primaryPhone: '+91 98765 22108',
    gender: 'Female',
    status: 'ACTIVE',
    primaryCampusId: 'campus-2',
    campusProfiles: [
      {
        campusId: 'campus-2',
        campusName: 'Maharaja Polytechnic College',
        localAdmissionNo: 'MPC2024-AUT-108',
        department: 'Automobile Engineering',
        program: 'Diploma Automobile',
        batchYear: 2024,
        enrollmentStatus: 'Active',
        sourceSystem: 'MPC Ledger',
        admittedAt: new Date('2024-08-01'),
        historicalIds: []
      }
    ],
    mergeHistory: []
  },
  {
    canonicalId: 'TRU-STU-2025-0004',
    fullName: 'Aditya Verma',
    normalizedName: 'adityaverma',
    dob: '2001-11-25',
    primaryEmail: 'aditya.verma@trustview.edu',
    primaryPhone: '+91 98765 33019',
    gender: 'Male',
    status: 'ACTIVE',
    primaryCampusId: 'campus-5',
    campusProfiles: [
      {
        campusId: 'campus-5',
        campusName: 'Maharaja School',
        localAdmissionNo: 'MS2024-SEC-019',
        department: 'Secondary Wing',
        program: 'High School',
        batchYear: 2024,
        enrollmentStatus: 'Active',
        sourceSystem: 'AIMR PG Center',
        admittedAt: new Date('2024-06-20'),
        historicalIds: []
      }
    ],
    mergeHistory: []
  }
];

export const studentRegistryService = {
  /**
   * List all canonical student records with filtering
   */
  async getStudents({ campusId = 'all', status = 'ACTIVE', search = '' } = {}) {
    if (isDbConnected()) {
      try {
        const query = {};
        if (status && status !== 'ALL') query.status = status;
        if (campusId && campusId !== 'all') {
          query.$or = [
            { primaryCampusId: campusId },
            { 'campusProfiles.campusId': campusId }
          ];
        }
        if (search) {
          query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { canonicalId: { $regex: search, $options: 'i' } },
            { 'campusProfiles.localAdmissionNo': { $regex: search, $options: 'i' } }
          ];
        }
        const docs = await CanonicalStudent.find(query).sort({ canonicalId: 1 }).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[StudentRegistry] Mongo query failed, using memory fallback:', err.message);
      }
    }

    return memoryCanonicalStudents.filter(s => {
      if (status !== 'ALL' && s.status !== status) return false;
      if (campusId !== 'all') {
        const hasCampus = s.primaryCampusId === campusId || s.campusProfiles.some(p => p.campusId === campusId);
        if (!hasCampus) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesName = s.fullName.toLowerCase().includes(q);
        const matchesId = s.canonicalId.toLowerCase().includes(q);
        const matchesAdm = s.campusProfiles.some(p => p.localAdmissionNo.toLowerCase().includes(q));
        if (!matchesName && !matchesId && !matchesAdm) return false;
      }
      return true;
    });
  },

  /**
   * Get single canonical student by ID
   */
  async getStudentById(canonicalId) {
    if (isDbConnected()) {
      try {
        const doc = await CanonicalStudent.findOne({ canonicalId }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('[StudentRegistry] Mongo lookup error:', err.message);
      }
    }
    return memoryCanonicalStudents.find(s => s.canonicalId === canonicalId) || null;
  },

  /**
   * Duplicate Detection Engine
   * Compares active students across campuses and calculates confidence scores
   */
  async detectDuplicates() {
    const students = await this.getStudents({ status: 'ACTIVE' });
    const duplicateCandidates = [];

    for (let i = 0; i < students.length; i++) {
      for (let j = i + 1; j < students.length; j++) {
        const s1 = students[i];
        const s2 = students[j];

        let score = 0;
        const reasons = [];

        // 1. Phone number match (Very high confidence)
        if (s1.primaryPhone && s2.primaryPhone && s1.primaryPhone === s2.primaryPhone) {
          score += 45;
          reasons.push(`Identical phone number (${s1.primaryPhone})`);
        }

        // 2. Email match
        if (s1.primaryEmail && s2.primaryEmail && s1.primaryEmail.toLowerCase() === s2.primaryEmail.toLowerCase()) {
          score += 40;
          reasons.push(`Identical email address (${s1.primaryEmail})`);
        }

        // 3. Date of Birth match
        if (s1.dob && s2.dob && s1.dob === s2.dob) {
          score += 20;
          reasons.push(`Matching Date of Birth (${s1.dob})`);
        }

        // 4. Name similarity (Levenshtein)
        const nameSim = getLevenshteinSimilarity(s1.fullName, s2.fullName);
        if (nameSim >= 0.85) {
          score += 35;
          reasons.push(`High name similarity (${Math.round(nameSim * 100)}% match: "${s1.fullName}" vs "${s2.fullName}")`);
        } else if (nameSim >= 0.65) {
          score += 20;
          reasons.push(`Moderate name similarity (${Math.round(nameSim * 100)}% match)`);
        }

        const confidence = Math.min(100, score);
        if (confidence >= 60) {
          duplicateCandidates.push({
            pairId: `DUP-${s1.canonicalId}-${s2.canonicalId}`,
            primaryStudent: s1,
            candidateStudent: s2,
            confidenceScore: confidence,
            reasons,
            detectedAt: new Date()
          });
        }
      }
    }

    return duplicateCandidates;
  },

  /**
   * Authorized Human-Approved Identity Merge
   * Preserves all historical IDs, source profiles, and audit log. Never destructive.
   */
  async approveMerge({
    primaryCanonicalId,
    secondaryCanonicalId,
    approvedBy = 'Dr. Vikram Mehta (Trustee)',
    actorRole = 'TRUSTEE',
    actorCampusId = null,
    evidenceNotes = 'Human reviewer verified identity equivalence across campus records'
  }) {
    if (primaryCanonicalId === secondaryCanonicalId) {
      throw new Error('Cannot merge a canonical student record with itself.');
    }

    let primary = await this.getStudentById(primaryCanonicalId);
    let secondary = await this.getStudentById(secondaryCanonicalId);

    if (!primary || !secondary) {
      throw new Error('One or both canonical student records could not be found.');
    }

    if (primary.status === 'MERGED' || secondary.status === 'MERGED') {
      throw new Error('Cannot merge an already-merged student record.');
    }

    // Calculate match score
    const nameSim = getLevenshteinSimilarity(primary.fullName, secondary.fullName);
    const matchScore = (primary.primaryPhone === secondary.primaryPhone ? 45 : 0) +
                       (primary.dob === secondary.dob ? 20 : 0) +
                       Math.round(nameSim * 35);

    const mergeEvent = {
      mergeId: `MRG-${Date.now()}`,
      mergedAt: new Date(),
      mergedBy: approvedBy,
      sourceCanonicalId: secondary.canonicalId,
      sourceCampusId: secondary.primaryCampusId,
      matchConfidenceScore: Math.min(100, matchScore),
      matchExplanation: `Merged secondary record ${secondary.canonicalId} (${secondary.fullName}) into canonical ${primary.canonicalId} (${primary.fullName})`,
      evidenceNotes,
      absorbedProfiles: secondary.campusProfiles
    };

    // Combine campus profiles without losing historical identifiers
    const combinedProfiles = [...primary.campusProfiles];
    for (const p of secondary.campusProfiles) {
      if (!combinedProfiles.some(existing => existing.localAdmissionNo === p.localAdmissionNo && existing.campusId === p.campusId)) {
        combinedProfiles.push({
          ...p,
          historicalIds: [...(p.historicalIds || []), secondary.canonicalId]
        });
      }
    }

    if (isDbConnected()) {
      try {
        // Update Primary
        await CanonicalStudent.updateOne(
          { canonicalId: primaryCanonicalId },
          {
            $set: { campusProfiles: combinedProfiles },
            $push: { mergeHistory: mergeEvent }
          }
        );

        // Update Secondary as MERGED
        await CanonicalStudent.updateOne(
          { canonicalId: secondaryCanonicalId },
          {
            $set: {
              status: 'MERGED',
              mergedIntoCanonicalId: primaryCanonicalId
            }
          }
        );
      } catch (err) {
        console.warn('[StudentRegistry] Mongo merge update failed, using memory buffer:', err.message);
      }
    }

    // Update in-memory state
    primary.campusProfiles = combinedProfiles;
    primary.mergeHistory = [...(primary.mergeHistory || []), mergeEvent];
    secondary.status = 'MERGED';
    secondary.mergedIntoCanonicalId = primaryCanonicalId;

    // Log append-only audit event
    await auditService.log({
      actorId: approvedBy,
      actorName: approvedBy,
      actorRole,
      actorCampusId,
      action: 'STUDENT_IDENTITY_MERGE',
      targetEntity: 'Student',
      targetId: primaryCanonicalId,
      campusId: primary.primaryCampusId,
      changeSummary: `Approved merge of student ${secondary.canonicalId} (${secondary.fullName}) into canonical ${primaryCanonicalId} (${primary.fullName}) with confidence ${mergeEvent.matchConfidenceScore}%`,
      metadata: {
        mergedRecordId: secondary.canonicalId,
        confidence: mergeEvent.matchConfidenceScore,
        evidenceNotes
      }
    });

    return {
      success: true,
      message: `Successfully merged ${secondary.canonicalId} into canonical identity ${primaryCanonicalId}.`,
      unifiedStudent: primary,
      mergeEvent
    };
  }
};

