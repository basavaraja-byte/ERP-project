/**
 * TrustView ERP - Campus Service
 * Handles operations related to campus records, departmental breakdowns, and campus-specific stats.
 */

import { MOCK_CAMPUSES } from '../data/mockData';

const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

export const campusService = {
  /**
   * Get list of all registered campuses
   */
  async getAllCampuses() {
    await delay();
    return {
      success: true,
      data: MOCK_CAMPUSES
    };
  },

  /**
   * Get single campus details by ID
   * @param {string} campusId
   */
  async getCampusById(campusId) {
    await delay();
    const campus = MOCK_CAMPUSES.find(c => c.id === campusId);
    if (!campus) {
      return {
        success: false,
        error: `Campus with ID "${campusId}" not found.`
      };
    }
    return {
      success: true,
      data: campus
    };
  },

  /**
   * Get comparison metrics formatted for Recharts
   */
  async getCampusComparisonMetrics() {
    await delay();
    const data = MOCK_CAMPUSES.map(c => ({
      id: c.id,
      name: c.shortName,
      fullName: c.name,
      students: c.studentCount,
      outstandingLakhs: Number((c.outstandingFees / 100000).toFixed(1)),
      occupiedBeds: c.hostelOccupied,
      hostelCapacity: c.hostelCapacity,
      occupancyRate: Number(((c.hostelOccupied / c.hostelCapacity) * 100).toFixed(1)),
      attendanceRisk: c.attendanceRiskCount,
      openExceptions: c.openExceptionCount
    }));

    return {
      success: true,
      data
    };
  }
};
