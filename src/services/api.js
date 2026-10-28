/**
 * TrustView ERP - API Client & Resilience Layer
 * Connects the React frontend to the Node.js / Express backend.
 * Automatically falls back gracefully to local synthetic cache if the backend server is offline.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let activeAuthToken = null;

/**
 * Perform a resilient fetch with timeout, error capture, and auth header injection
 */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 3500, headers = {}, ...customOptions } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (activeAuthToken) {
    requestHeaders['Authorization'] = `Bearer ${activeAuthToken}`;
  }

  try {
    const response = await fetch(resource, {
      ...customOptions,
      headers: requestHeaders,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const apiService = {
  baseUrl: API_BASE_URL,

  setAuthToken(token) {
    activeAuthToken = token;
  },

  getAuthToken() {
    return activeAuthToken;
  },

  /**
   * User Authentication: Login
   */
  async login(email, password) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        timeout: 5000
      });
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to authentication server.'
      };
    }
  },

  /**
   * User Authentication: Get Profile
   */
  async getMe() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, { timeout: 3000 });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * User Authentication: Logout
   */
  async logout() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        timeout: 2000
      });
      return await res.json();
    } catch {
      return { status: 'success' };
    }
  },

  /**
   * Health check to query the server and MongoDB Atlas connection status
   */
  async getHealth() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { timeout: 2000 });
      if (!res.ok) {
        return {
          isOnline: false,
          serverOk: false,
          database: { connected: false, message: 'Server returned error status' }
        };
      }
      const data = await res.json();
      return {
        isOnline: true,
        serverOk: true,
        database: data.database || { connected: false },
        environment: data.environment,
        uptime: data.uptime
      };
    } catch {
      return {
        isOnline: false,
        serverOk: false,
        database: {
          connected: false,
          message: 'Backend server offline at http://localhost:5000. Running with local mock cache.'
        }
      };
    }
  },

  /**
   * Get campuses list from backend API
   */
  async getCampuses() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/campuses`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get single campus by ID
   */
  async getCampusById(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/campuses/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get dashboard summary from backend API
   */
  async getDashboardSummary({ campusId = 'all', period = 'AY 2025–26' } = {}) {
    try {
      const url = `${API_BASE_URL}/dashboard/summary?campusId=${encodeURIComponent(campusId)}&period=${encodeURIComponent(period)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get collection trends from backend API
   */
  async getCollectionTrends({ campusId = 'all' } = {}) {
    try {
      const url = `${API_BASE_URL}/dashboard/trends?campusId=${encodeURIComponent(campusId)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get fee collection summary
   */
  async getFeesSummary({ campusId = 'all' } = {}) {
    try {
      const url = `${API_BASE_URL}/fees/summary?campusId=${encodeURIComponent(campusId)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get hostel summary
   */
  async getHostelsSummary({ campusId = 'all' } = {}) {
    try {
      const url = `${API_BASE_URL}/hostels/summary?campusId=${encodeURIComponent(campusId)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get attendance risk summary
   */
  async getAttendanceRisks({ campusId = 'all' } = {}) {
    try {
      const url = `${API_BASE_URL}/attendance/risks?campusId=${encodeURIComponent(campusId)}`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Get operational exceptions from backend API
   */
  async getExceptions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/exceptions?${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback handled by caller
    }
    return null;
  },

  /**
   * Update operational exception status
   */
  async updateExceptionStatus(id, { status, note }) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/exceptions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Network error updating exception' };
    }
  },

  // ==========================================
  // PART 1: Unified Student Master Registry
  // ==========================================
  async getCanonicalStudents(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/students/registry?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async detectStudentDuplicates() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/students/registry/duplicates`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async approveStudentMerge(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/students/registry/merge`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================================
  // PART 2: Campus-Specific Rules Engine
  // ==========================================
  async getActiveRules(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/rules?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async getRuleHistory(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/rules/history?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async updateCampusRule(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/rules`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async recalculateCampusEligibility(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/rules/recalculate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================================
  // PART 3: Fee Ledger & Payment Reconciliation
  // ==========================================
  async getLedgerEntries(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async getStudentBalance(studentId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger/balance/${encodeURIComponent(studentId)}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async importPayment(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger/import-payment`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async reconcilePayment(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger/reconcile`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async reverseTransaction(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger/reverse`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async evaluatePaymentReminder(studentId) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/ledger/reminder/${encodeURIComponent(studentId)}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  // ==========================================
  // PART 4: Guided Spreadsheet Import
  // ==========================================
  async getMessyDemoSpreadsheet() {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/imports/messy-demo`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async createImportJob(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/imports/upload`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async validateImportJob(jobId, payload = {}) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/imports/validate/${encodeURIComponent(jobId)}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async approveImportJob(jobId, payload = {}) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/imports/approve/${encodeURIComponent(jobId)}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================================
  // PART 5: Real Hostel Inventory & Occupancy
  // ==========================================
  async getHostelBeds(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/hostels/inventory/beds?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async getHostelLiveOccupancy(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/hostels/inventory/stats?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  async allocateHostelBed(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/hostels/inventory/allocate`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async releaseHostelBed(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/hostels/inventory/release`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================================
  // PART 6: Append-Only Audit Trail
  // ==========================================
  async getAuditLogs(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/audit?${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by caller
    }
    return null;
  },

  // ==========================================
  // PART 7: Grievance & Complaint Management
  // ==========================================
  async createComplaint(payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        body: JSON.stringify(payload),
        timeout: 5000
      });
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to submit grievance to server.'
      };
    }
  },

  async getComplaints(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithTimeout(`${API_BASE_URL}/complaints?${query}`, { timeout: 5000 });
      if (res.ok) return await res.json();
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        message: err.message || 'Failed to fetch complaints from server.'
      };
    }
  },

  async getComplaintById(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}`, { timeout: 4000 });
      if (res.ok) return await res.json();
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        message: err.message || 'Failed to fetch complaint details.'
      };
    }
  },

  async updateComplaintStatus(id, payload) {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        timeout: 5000
      });
      return await res.json();
    } catch (err) {
      return {
        status: 'error',
        message: err.message || 'Failed to update complaint status.'
      };
    }
  }
};
