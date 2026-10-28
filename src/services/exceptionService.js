/**
 * TrustView ERP - Exception Service
 * Handles operational exceptions from spreadsheet ingestions and provides simulated AI Copilot explanations.
 */

import { MOCK_EXCEPTIONS } from '../data/mockData';
import { apiService } from './api';

// Maintain in-memory state for prototype interactivity (e.g. changing status, marking reviewed)
let localExceptions = [...MOCK_EXCEPTIONS];

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

export const exceptionService = {
  /**
   * Filter and search exceptions
   */
  async getExceptions({ campusId = 'all', status = 'all', priority = 'all', search = '' } = {}) {
    // Try live backend API first
    const apiResult = await apiService.getExceptions({ campusId, status, priority, search });
    if (apiResult && apiResult.success && Array.isArray(apiResult.data)) {
      return apiResult;
    }

    await delay();
    let result = [...localExceptions];

    if (campusId && campusId !== 'all') {
      result = result.filter(e => e.campusId === campusId);
    }

    if (status && status !== 'all') {
      result = result.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    if (priority && priority !== 'all') {
      result = result.filter(e => e.priority.toLowerCase() === priority.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.campusName.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: result,
      totalCount: result.length
    };
  },

  /**
   * Get single exception details
   */
  async getExceptionById(id) {
    await delay();
    const item = localExceptions.find(e => e.id === id);
    if (!item) {
      return { success: false, error: `Exception ${id} not found.` };
    }
    return { success: true, data: item };
  },

  /**
   * Update exception status (e.g. 'In Review', 'Resolved', 'Dismissed')
   */
  async updateExceptionStatus(id, newStatus, note = '') {
    // Attempt backend update asynchronously
    apiService.updateExceptionStatus(id, newStatus, note).catch(() => {});

    await delay();
    const index = localExceptions.findIndex(e => e.id === id);
    if (index === -1) {
      return { success: false, error: `Exception ${id} not found.` };
    }
    localExceptions[index] = {
      ...localExceptions[index],
      status: newStatus,
      lastUpdated: new Date().toLocaleTimeString(),
      resolutionNote: note || localExceptions[index].resolutionNote
    };
    return { success: true, data: localExceptions[index] };
  },

  /**
   * Request simulated AI Copilot Explanation for an exception
   * Prepared for future backend API integration.
   * NOTE: Does not call external APIs or require API keys.
   */
  async requestAiExplanation(exceptionId) {
    await delay(350); // Small realistic delay
    const item = localExceptions.find(e => e.id === exceptionId);
    if (!item) {
      return { success: false, error: 'Exception not found' };
    }

    // High quality deterministic simulated analysis
    const simulatedAnalysis = {
      exceptionId: item.id,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      disclaimer: 'Offline Prototype Copilot: Generates structured evidence analysis based on spreadsheet row metadata. No student PII is transmitted to public LLM endpoints.',
      rootCauseAnalysis: `The exception was triggered because the master ingestion validator detected an inconsistency in '${item.sourceReference}'. Specifically: ${item.description}`,
      primaryEvidence: item.evidence || [
        `Ingested record source: ${item.sourceReference}`,
        `Campus originator: ${item.campusName}`,
        `Classification priority: ${item.priority}`
      ],
      recommendedNextSteps: [
        '1. Inspect original spreadsheet file hash to confirm no tampering during network transmission.',
        '2. Cross-reference campus bank reconciliation voucher before altering student ledger.',
        item.suggestedAction || '3. Solicit digital sign-off from campus principal.'
      ],
      missingHumanVerification: [
        'Confirmation from Campus Accounts Section Head.',
        'Physical verification of fee counter receipt counterfoil or transfer certificate.'
      ],
      confidenceScore: '94% Confidence (Rule-based & Pattern-matched)'
    };

    return {
      success: true,
      data: simulatedAnalysis
    };
  }
};
