import { AuditLog } from '../models/AuditLog.js';
import { isDbConnected } from '../config/database.js';

// Fallback in-memory audit store if database is offline
const memoryAuditLogs = [];

export const auditService = {
  /**
   * Record an immutable audit log entry
   */
  async log({
    actorId = 'SYS-001',
    actorName = 'System Engine',
    actorRole = 'SYSTEM',
    actorCampusId = null,
    action,
    targetEntity,
    targetId,
    campusId = null,
    changeSummary,
    metadata = {}
  }) {
    const logId = `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const logEntry = {
      logId,
      timestamp: new Date(),
      actorId,
      actorName,
      actorRole,
      actorCampusId,
      action,
      targetEntity,
      targetId,
      campusId,
      changeSummary,
      metadata
    };

    if (isDbConnected()) {
      try {
        await AuditLog.create(logEntry);
        return logEntry;
      } catch (err) {
        console.warn('[AuditService] Failed to persist to Mongo, writing to memory buffer:', err.message);
      }
    }

    memoryAuditLogs.unshift(logEntry);
    if (memoryAuditLogs.length > 500) memoryAuditLogs.pop();
    return logEntry;
  },

  /**
   * Query audit logs with role and campus scoping
   */
  async getLogs({ userRole = 'TRUSTEE', userCampusId = null, campusId = 'all', limit = 50 } = {}) {
    let effectiveCampus = campusId;
    if (userRole !== 'TRUSTEE' && userCampusId) {
      effectiveCampus = userCampusId; // Server-side enforcement: non-trustees only see their campus
    }

    if (isDbConnected()) {
      try {
        const query = {};
        if (effectiveCampus && effectiveCampus !== 'all') {
          query.$or = [{ campusId: effectiveCampus }, { campusId: null }];
        }
        const docs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(Number(limit)).lean();
        if (docs && docs.length > 0) return docs;
      } catch (err) {
        console.warn('[AuditService] Failed to query Mongo logs:', err.message);
      }
    }

    // Filter memory buffer
    return memoryAuditLogs
      .filter(l => (effectiveCampus === 'all' || !l.campusId || l.campusId === effectiveCampus))
      .slice(0, Number(limit));
  }
};

