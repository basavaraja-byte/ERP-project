/**
 * TrustView ERP - Dashboard Service
 * Provides an asynchronous abstraction for dashboard KPI calculations, charts, and audit activity.
 * When a real Node.js/Express backend is connected later, only this service needs to fetch from API endpoints.
 */

import {
  MOCK_CAMPUSES,
  MOCK_COLLECTION_TRENDS,
  MOCK_AUDIT_ACTIVITIES,
  MOCK_NOTIFICATIONS,
  MOCK_INSTITUTION_INFO
} from '../data/mockData';
import { aggregateCampusMetrics, calculateOccupancyPercentage, calculateCollectionRate } from '../utils/calculations';

// Optional small delay simulation to demonstrate async loading states cleanly if needed
const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  /**
   * Fetch consolidated dashboard KPI summary for the given scope
   * @param {Object} params - { campusId: 'all' | string, period: string }
   */
  async getDashboardSummary({ campusId = 'all', period = '2025-2026' } = {}) {
    await delay();
    
    let filteredCampuses = MOCK_CAMPUSES;
    const isSingleCampus = campusId && campusId !== 'all';
    
    if (isSingleCampus) {
      filteredCampuses = MOCK_CAMPUSES.filter(c => c.id === campusId);
    }

    const aggregated = aggregateCampusMetrics(filteredCampuses);
    const occupancyRate = calculateOccupancyPercentage(aggregated.totalHostelOccupied, aggregated.totalHostelCapacity);
    const collectionRate = calculateCollectionRate(
      aggregated.totalVerifiedPayments,
      aggregated.totalAssessedFees,
      aggregated.totalConcessions
    );

    return {
      success: true,
      scope: isSingleCampus ? filteredCampuses[0]?.name : 'Trust-Wide (6 Campuses)',
      campusCount: filteredCampuses.length,
      period,
      summary: {
        totalStudents: aggregated.totalStudents,
        assessedFees: aggregated.totalAssessedFees,
        concessions: aggregated.totalConcessions,
        verifiedPayments: aggregated.totalVerifiedPayments,
        outstandingFees: aggregated.totalOutstandingFees,
        collectionRate,
        hostelCapacity: aggregated.totalHostelCapacity,
        hostelOccupied: aggregated.totalHostelOccupied,
        hostelAvailable: Math.max(0, aggregated.totalHostelCapacity - aggregated.totalHostelOccupied),
        occupancyRate,
        attendanceRiskCount: aggregated.totalAttendanceRisks,
        openExceptionsCount: aggregated.totalOpenExceptions,
        spreadsheetsActive: aggregated.totalSpreadsheetsActive,
        spreadsheetsVerified: aggregated.totalSpreadsheetsVerified,
        dataFreshnessWarning: filteredCampuses.some(c => c.importHealth === 'warning')
      },
      metadata: {
        lastAuditTimestamp: MOCK_INSTITUTION_INFO.lastAuditDate,
        isSyntheticDemo: true,
        accountingStandard: 'Cash Basis / Verified Bank RTGS Reconciliation'
      }
    };
  },

  /**
   * Fetch monthly fee collection and outstanding trends
   */
  async getCollectionTrends({ campusId = 'all' } = {}) {
    await delay();
    if (!campusId || campusId === 'all') {
      return { success: true, data: MOCK_COLLECTION_TRENDS };
    }
    
    // Proportional breakdown for single campus preview
    const campus = MOCK_CAMPUSES.find(c => c.id === campusId) || MOCK_CAMPUSES[0];
    const ratio = campus.assessedFees / 974600000;
    
    const singleTrends = MOCK_COLLECTION_TRENDS.map(item => ({
      month: item.month,
      collections: Math.round(item.collections * ratio),
      outstanding: Math.round(item.outstanding * ratio),
      collectionsLakhs: Number((item.collectionsLakhs * ratio).toFixed(1)),
      outstandingLakhs: Number((item.outstandingLakhs * ratio).toFixed(1))
    }));

    return { success: true, data: singleTrends };
  },

  /**
   * Fetch recent audit activities
   */
  async getRecentActivities({ campusId = 'all', limit = 10 } = {}) {
    await delay();
    let activities = MOCK_AUDIT_ACTIVITIES;
    if (campusId && campusId !== 'all') {
      activities = activities.filter(a => a.campusId === campusId || a.campusId === 'all');
    }
    return { success: true, data: activities.slice(0, limit) };
  },

  /**
   * Fetch system notifications
   */
  async getNotifications() {
    await delay();
    return { success: true, data: MOCK_NOTIFICATIONS };
  },

  /**
   * Fetch reporting health status
   */
  async getReportingHealth() {
    await delay();
    const staleCampuses = MOCK_CAMPUSES.filter(c => c.importHealth === 'warning');
    return {
      success: true,
      totalSpreadsheets: MOCK_INSTITUTION_INFO.totalSpreadsheets,
      verifiedSpreadsheets: MOCK_INSTITUTION_INFO.verifiedSpreadsheets,
      integrityScore: 95.8,
      staleCampusesCount: staleCampuses.length,
      staleCampuses: staleCampuses.map(c => ({ id: c.id, name: c.name, lastImport: c.lastSuccessfulImport }))
    };
  }
};
