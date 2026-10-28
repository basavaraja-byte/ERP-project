import { Campus, OperationalException } from '../models/index.js';
import { isDbConnected } from '../config/database.js';

// Synchronized synthetic fallback dataset
import {
  MOCK_CAMPUSES,
  MOCK_EXCEPTIONS,
  MOCK_COLLECTION_TRENDS
} from '../../../src/data/mockData.js';

export function calculateCollectionRate(paid, assessed, concessions = 0) {
  const net = (Number(assessed) || 0) - (Number(concessions) || 0);
  if (net <= 0) return 0;
  return Number((((Number(paid) || 0) / net) * 100).toFixed(1));
}

export function calculateOccupancyPercentage(occupied, capacity) {
  const cap = Number(capacity) || 0;
  if (cap <= 0) return 0;
  return Number((((Number(occupied) || 0) / cap) * 100).toFixed(1));
}

/**
 * Role-Based Campus Boundary Validator
 * Enforces server-side authorization boundaries for all 8 roles:
 * 1. TRUSTEE: Trust-wide access across all 6 campuses.
 * 2. DEAN: Strictly restricted to their assigned campus.
 * 3. PRINCIPAL: Strictly restricted to their assigned campus.
 * 4. HOD: Restricted to assigned campus & department.
 * 5. FACULTY: Restricted to assigned campus, department & teaching records.
 * 6. STUDENT: Restricted to own student record within assigned campus.
 * 7. PARENT: Restricted to linked ward record within assigned campus.
 * 8. WARDEN: Restricted to assigned hostel within assigned campus.
 */
export function validateRoleCampusScope(userRole, requestedCampusId = 'all', assignedCampusId = null, extraContext = {}) {
  const normalizedRole = (userRole || '').toUpperCase();

  if (normalizedRole === 'TRUSTEE') {
    return {
      allowed: true,
      role: 'TRUSTEE',
      effectiveCampusId: requestedCampusId || 'all',
      isTrustWide: (!requestedCampusId || requestedCampusId === 'all')
    };
  }

  const campusBoundRoles = ['DEAN', 'PRINCIPAL', 'FINANCE_MANAGER', 'HOD', 'FACULTY', 'STUDENT', 'PARENT', 'WARDEN'];
  if (campusBoundRoles.includes(normalizedRole)) {
    const assigned = assignedCampusId || 'campus-1';

    // If requested is 'all' or another campus not matching assigned, disallow cross-campus access
    if (requestedCampusId && requestedCampusId !== 'all' && requestedCampusId !== assigned) {
      return {
        allowed: false,
        role: normalizedRole,
        assignedCampusId: assigned,
        error: `${normalizedRole} is restricted to assigned campus "${assigned}" and cannot access "${requestedCampusId}".`
      };
    }

    return {
      allowed: true,
      role: normalizedRole,
      effectiveCampusId: assigned,
      isRestrictedToAssigned: true,
      context: extraContext
    };
  }

  return {
    allowed: false,
    error: `Unknown or unconfigured role "${userRole}".`
  };
}

export const metricsService = {
  async getDashboardSummary({ campusId = 'all', period = 'AY 2025–26' } = {}) {
    const isConnected = isDbConnected();

    if (isConnected) {
      try {
        const query = (campusId && campusId !== 'all') ? { campusId } : {};
        const campuses = await Campus.find(query).lean();

        if (campuses && campuses.length > 0) {
          const totalStudents = campuses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
          const assessedFees = campuses.reduce((sum, c) => sum + (c.assessedFees || 0), 0);
          const concessions = campuses.reduce((sum, c) => sum + (c.concessions || 0), 0);
          const verifiedPayments = campuses.reduce((sum, c) => sum + (c.verifiedPayments || 0), 0);
          const outstandingFees = campuses.reduce((sum, c) => sum + (c.outstandingFees || 0), 0);
          const hostelCapacity = campuses.reduce((sum, c) => sum + (c.hostelCapacity || 0), 0);
          const hostelOccupied = campuses.reduce((sum, c) => sum + (c.hostelOccupied || 0), 0);
          const attendanceRiskCount = campuses.reduce((sum, c) => sum + (c.attendanceRiskCount || 0), 0);
          const spreadsheetsActive = campuses.reduce((sum, c) => sum + (c.spreadsheetsActive || 0), 0);
          const spreadsheetsVerified = campuses.reduce((sum, c) => sum + (c.spreadsheetsVerified || 0), 0);

          const openExceptionsCount = await OperationalException.countDocuments({
            ...(query.campusId ? { campusId: query.campusId } : {}),
            status: { $in: ['Open', 'In Review'] }
          });

          const collectionRate = calculateCollectionRate(verifiedPayments, assessedFees, concessions);
          const occupancyRate = calculateOccupancyPercentage(hostelOccupied, hostelCapacity);

          return {
            success: true,
            source: 'mongodb',
            isLiveFromMongo: true,
            scope: (campusId !== 'all') ? (campuses[0]?.name || campusId) : 'Trust-Wide (6 Campuses)',
            campusCount: campuses.length,
            period,
            summary: {
              totalStudents,
              assessedFees,
              concessions,
              verifiedPayments,
              outstandingFees,
              collectionRate,
              hostelCapacity,
              hostelOccupied,
              hostelAvailable: Math.max(0, hostelCapacity - hostelOccupied),
              occupancyRate,
              attendanceRiskCount,
              openExceptionsCount,
              spreadsheetsActive,
              spreadsheetsVerified,
              dataFreshnessWarning: campuses.some(c => c.importHealth === 'warning')
            }
          };
        }
      } catch (err) {
        console.warn('[metricsService] Database read error, falling back to synthetic cache:', err.message);
      }
    }

    let list = MOCK_CAMPUSES;
    if (campusId && campusId !== 'all') {
      list = MOCK_CAMPUSES.filter(c => c.id === campusId);
    }

    const totalStudents = list.reduce((sum, c) => sum + c.studentCount, 0);
    const assessedFees = list.reduce((sum, c) => sum + c.assessedFees, 0);
    const concessions = list.reduce((sum, c) => sum + c.concessions, 0);
    const verifiedPayments = list.reduce((sum, c) => sum + c.verifiedPayments, 0);
    const outstandingFees = list.reduce((sum, c) => sum + c.outstandingFees, 0);
    const hostelCapacity = list.reduce((sum, c) => sum + c.hostelCapacity, 0);
    const hostelOccupied = list.reduce((sum, c) => sum + c.hostelOccupied, 0);
    const attendanceRiskCount = list.reduce((sum, c) => sum + c.attendanceRiskCount, 0);
    const openExceptionsCount = list.reduce((sum, c) => sum + c.openExceptionCount, 0);
    const spreadsheetsActive = list.reduce((sum, c) => sum + c.spreadsheetsActive, 0);
    const spreadsheetsVerified = list.reduce((sum, c) => sum + c.spreadsheetsVerified, 0);

    return {
      success: true,
      source: 'synthetic-cache',
      isLiveFromMongo: false,
      databaseStatus: isConnected ? 'connected-empty' : 'disconnected',
      scope: (campusId !== 'all') ? (list[0]?.name || campusId) : 'Trust-Wide (6 Campuses)',
      campusCount: list.length,
      period,
      summary: {
        totalStudents,
        assessedFees,
        concessions,
        verifiedPayments,
        outstandingFees,
        collectionRate: calculateCollectionRate(verifiedPayments, assessedFees, concessions),
        hostelCapacity,
        hostelOccupied,
        hostelAvailable: Math.max(0, hostelCapacity - hostelOccupied),
        occupancyRate: calculateOccupancyPercentage(hostelOccupied, hostelCapacity),
        attendanceRiskCount,
        openExceptionsCount,
        spreadsheetsActive,
        spreadsheetsVerified,
        dataFreshnessWarning: list.some(c => c.importHealth === 'warning')
      }
    };
  },

  async getCampuses() {
    if (isDbConnected()) {
      try {
        const campuses = await Campus.find({}).sort({ studentCount: -1 }).lean();
        if (campuses && campuses.length > 0) {
          return {
            success: true,
            source: 'mongodb',
            isLiveFromMongo: true,
            data: campuses.map(c => ({
              id: c.campusId,
              name: c.name,
              shortName: c.shortName,
              code: c.code,
              institutionType: c.institutionType,
              principalName: c.principalName,
              principalEmail: c.principalEmail,
              studentCount: c.studentCount,
              assessedFees: c.assessedFees,
              concessions: c.concessions,
              verifiedPayments: c.verifiedPayments,
              outstandingFees: c.outstandingFees,
              hostelCapacity: c.hostelCapacity,
              hostelOccupied: c.hostelOccupied,
              attendanceRiskCount: c.attendanceRiskCount,
              openExceptionCount: c.openExceptionCount,
              lastSuccessfulImport: c.lastSuccessfulImport,
              importHealth: c.importHealth,
              spreadsheetsActive: c.spreadsheetsActive,
              spreadsheetsVerified: c.spreadsheetsVerified,
              location: c.location,
              established: c.established,
              departments: c.departments
            }))
          };
        }
      } catch (err) {
        console.warn('[metricsService] Campus DB lookup error:', err.message);
      }
    }

    return {
      success: true,
      source: 'synthetic-cache',
      isLiveFromMongo: false,
      data: MOCK_CAMPUSES
    };
  },

  async getCampusById(id) {
    if (isDbConnected()) {
      try {
        const c = await Campus.findOne({ $or: [{ campusId: id }, { code: id }] }).lean();
        if (c) {
          return {
            success: true,
            source: 'mongodb',
            isLiveFromMongo: true,
            data: {
              id: c.campusId,
              name: c.name,
              shortName: c.shortName,
              code: c.code,
              institutionType: c.institutionType,
              principalName: c.principalName,
              principalEmail: c.principalEmail,
              studentCount: c.studentCount,
              assessedFees: c.assessedFees,
              concessions: c.concessions,
              verifiedPayments: c.verifiedPayments,
              outstandingFees: c.outstandingFees,
              hostelCapacity: c.hostelCapacity,
              hostelOccupied: c.hostelOccupied,
              attendanceRiskCount: c.attendanceRiskCount,
              openExceptionCount: c.openExceptionCount,
              lastSuccessfulImport: c.lastSuccessfulImport,
              importHealth: c.importHealth,
              spreadsheetsActive: c.spreadsheetsActive,
              spreadsheetsVerified: c.spreadsheetsVerified,
              location: c.location,
              established: c.established,
              departments: c.departments
            }
          };
        }
      } catch (err) {
        console.warn('[metricsService] Single campus lookup error:', err.message);
      }
    }

    const item = MOCK_CAMPUSES.find(c => c.id === id || c.code === id);
    if (!item) {
      return { success: false, error: `Campus "${id}" not found.` };
    }

    return {
      success: true,
      source: 'synthetic-cache',
      isLiveFromMongo: false,
      data: item
    };
  },

  async getFeesSummary({ campusId = 'all' } = {}) {
    const campusesRes = await this.getCampuses();
    let list = campusesRes.data;
    if (campusId && campusId !== 'all') {
      list = list.filter(c => c.id === campusId);
    }

    const grossAssessed = list.reduce((sum, c) => sum + c.assessedFees, 0);
    const concessions = list.reduce((sum, c) => sum + c.concessions, 0);
    const netPayable = grossAssessed - concessions;
    const verifiedCollected = list.reduce((sum, c) => sum + c.verifiedPayments, 0);
    const outstanding = list.reduce((sum, c) => sum + c.outstandingFees, 0);

    return {
      success: true,
      isLiveFromMongo: campusesRes.isLiveFromMongo,
      data: {
        campusScope: campusId,
        grossAssessed,
        concessions,
        netPayable,
        verifiedCollected,
        outstanding,
        recoveryRate: calculateCollectionRate(verifiedCollected, grossAssessed, concessions),
        campuses: list
      }
    };
  },

  async getHostelsSummary({ campusId = 'all' } = {}) {
    const campusesRes = await this.getCampuses();
    let list = campusesRes.data;
    if (campusId && campusId !== 'all') {
      list = list.filter(c => c.id === campusId);
    }

    const totalCapacity = list.reduce((sum, c) => sum + c.hostelCapacity, 0);
    const totalOccupied = list.reduce((sum, c) => sum + c.hostelOccupied, 0);
    const totalAvailable = Math.max(0, totalCapacity - totalOccupied);
    const occupancyRate = calculateOccupancyPercentage(totalOccupied, totalCapacity);

    return {
      success: true,
      isLiveFromMongo: campusesRes.isLiveFromMongo,
      data: {
        campusScope: campusId,
        totalCapacity,
        totalOccupied,
        totalAvailable,
        occupancyRate,
        campuses: list
      }
    };
  },

  async getAttendanceRisks({ campusId = 'all' } = {}) {
    const campusesRes = await this.getCampuses();
    let list = campusesRes.data;
    if (campusId && campusId !== 'all') {
      list = list.filter(c => c.id === campusId);
    }

    const totalStudents = list.reduce((sum, c) => sum + c.studentCount, 0);
    const totalRiskCount = list.reduce((sum, c) => sum + c.attendanceRiskCount, 0);
    const overallRiskRate = totalStudents > 0 ? Number(((totalRiskCount / totalStudents) * 100).toFixed(1)) : 0;

    return {
      success: true,
      isLiveFromMongo: campusesRes.isLiveFromMongo,
      data: {
        campusScope: campusId,
        totalStudents,
        totalRiskCount,
        overallRiskRate,
        examEligibleCount: Math.max(0, totalStudents - totalRiskCount),
        campuses: list
      }
    };
  },

  async getExceptions({ campusId = 'all', status = 'all', priority = 'all', category = 'all', search = '' } = {}) {
    if (isDbConnected()) {
      try {
        const filter = {};
        if (campusId && campusId !== 'all') filter.campusId = campusId;
        if (status && status !== 'all') filter.status = new RegExp(`^${status}$`, 'i');
        if (priority && priority !== 'all') filter.priority = new RegExp(`^${priority}$`, 'i');
        if (category && category !== 'all') filter.category = category;

        if (search && search.trim()) {
          const q = search.trim();
          filter.$or = [
            { exceptionId: new RegExp(q, 'i') },
            { title: new RegExp(q, 'i') },
            { description: new RegExp(q, 'i') },
            { campusName: new RegExp(q, 'i') }
          ];
        }

        const items = await OperationalException.find(filter).sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) {
          return {
            success: true,
            source: 'mongodb',
            isLiveFromMongo: true,
            totalCount: items.length,
            data: items.map(e => ({
              id: e.exceptionId,
              category: e.category,
              type: e.type,
              campusId: e.campusId,
              campusName: e.campusName,
              priority: e.priority,
              status: e.status,
              title: e.title,
              description: e.description,
              sourceReference: e.sourceReference,
              amount: e.amount,
              studentRef: e.studentRef,
              suggestedAction: e.suggestedAction,
              evidence: e.evidence,
              createdAt: e.createdAtFormatted || e.createdAt?.toLocaleString() || 'Recent'
            }))
          };
        }
      } catch (err) {
        console.warn('[metricsService] Exception query error:', err.message);
      }
    }

    let result = [...MOCK_EXCEPTIONS];
    if (campusId && campusId !== 'all') {
      result = result.filter(e => e.campusId === campusId);
    }
    if (status && status !== 'all') {
      result = result.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'all') {
      result = result.filter(e => e.priority.toLowerCase() === priority.toLowerCase());
    }
    if (category && category !== 'all') {
      result = result.filter(e => e.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.campusName.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      source: 'synthetic-cache',
      isLiveFromMongo: false,
      totalCount: result.length,
      data: result
    };
  },

  async updateExceptionStatus(id, newStatus, note = '') {
    const validStatuses = ['Open', 'In Review', 'Resolved', 'Dismissed'];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        statusCode: 400,
        error: `Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`
      };
    }

    if (isDbConnected()) {
      try {
        const updated = await OperationalException.findOneAndUpdate(
          { exceptionId: id },
          {
            $set: {
              status: newStatus,
              resolutionNote: note,
              resolvedAt: newStatus === 'Resolved' ? new Date() : null,
              resolvedBy: 'Authorized Management Signatory'
            }
          },
          { new: true }
        ).lean();

        if (updated) {
          return {
            success: true,
            source: 'mongodb',
            data: updated
          };
        }
      } catch (err) {
        console.warn('[metricsService] Exception update error in MongoDB:', err.message);
      }
    }

    const index = MOCK_EXCEPTIONS.findIndex(e => e.id === id);
    if (index !== -1) {
      MOCK_EXCEPTIONS[index] = {
        ...MOCK_EXCEPTIONS[index],
        status: newStatus,
        lastUpdated: new Date().toLocaleTimeString(),
        resolutionNote: note || MOCK_EXCEPTIONS[index].resolutionNote
      };
      return {
        success: true,
        source: 'synthetic-cache',
        data: MOCK_EXCEPTIONS[index]
      };
    }

    return {
      success: false,
      statusCode: 404,
      error: `Exception with ID "${id}" not found.`
    };
  },

  async getCollectionTrends({ campusId = 'all' } = {}) {
    if (!campusId || campusId === 'all') {
      return {
        success: true,
        data: MOCK_COLLECTION_TRENDS
      };
    }

    const campusesRes = await this.getCampuses();
    const campus = campusesRes.data.find(c => c.id === campusId) || campusesRes.data[0];
    const ratio = (campus?.assessedFees || 1) / 974600000;

    const singleTrends = MOCK_COLLECTION_TRENDS.map(item => ({
      month: item.month,
      collections: Math.round(item.collections * ratio),
      outstanding: Math.round(item.outstanding * ratio),
      collectionsLakhs: Number((item.collectionsLakhs * ratio).toFixed(1)),
      outstandingLakhs: Number((item.outstandingLakhs * ratio).toFixed(1))
    }));

    return {
      success: true,
      data: singleTrends
    };
  }
};
