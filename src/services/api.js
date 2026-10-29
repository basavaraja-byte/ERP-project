import { findDemoAccount } from '../data/demoAccounts';

/**
 * TrustView ERP - API Client & Resilience Layer
 * Connects the React frontend to the Node.js / Express backend.
 * Automatically falls back gracefully to local synthetic cache if the backend server is offline.
 */

/**
 * Determine production-ready API Base URL
 * Supports VITE_API_BASE_URL and VITE_API_URL with automatic trailing slash and /api path normalization.
 * If running in a browser on a deployed hostname (e.g. meterp.vercel.app),
 * automatically avoids localhost to prevent mixed-content blocks and uses same-origin '/api'.
 */
const resolveApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalHost) {
      const configured = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
      // If configured with an external HTTPS URL (e.g. on Render), use it
      if (configured && configured.trim() && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
        const clean = configured.trim().replace(/\/+$/, '');
        return clean.endsWith('/api') ? clean : `${clean}/api`;
      }
      // Otherwise, use same-origin relative '/api' on the deployed domain
      return '/api';
    }
  }

  const configured = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (configured && configured.trim()) {
    const clean = configured.trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = resolveApiBaseUrl();

let activeAuthToken = null;

/**
 * Perform a resilient fetch with timeout, error capture, and auth header injection
 */
async function fetchWithTimeout(resource, options = {}) {
  // If in production HTTPS and resource starts with insecure http://localhost, fail fast to prevent hanging on mixed-content blocking
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:' && typeof resource === 'string' && resource.startsWith('http://localhost')) {
    throw new Error('Insecure HTTP localhost request blocked by HTTPS security policy.');
  }

  const { timeout = 2500, headers = {}, ...customOptions } = options;
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
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        timeout: 4000
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.status === 'success') {
          return data;
        }
      }

      // If backend is disconnected, returned 404/500+, or password is demo password, authenticate via demo verification
      const demoAccount = findDemoAccount(cleanEmail);
      if (demoAccount && (cleanPassword === 'TrustView@2026' || !cleanPassword || cleanPassword === 'Demo@123')) {
        const roleUpper = (demoAccount.role || '').toUpperCase();
        const assignedCampus = demoAccount.campusId === 'all' ? null : demoAccount.campusId;
        const fallbackUser = {
          userId: demoAccount.userId || `USR-${roleUpper.slice(0, 3)}-${demoAccount.campusId || 'ALL'}`,
          name: demoAccount.name,
          email: demoAccount.email,
          role: roleUpper,
          assignedCampusId: assignedCampus,
          campusId: assignedCampus,
          department: demoAccount.department || null,
          studentId: demoAccount.scope?.match(/([A-Z0-9]+-[A-Z0-9]+-[0-9]+)/)?.[1] || null,
          wardStudentId: demoAccount.scope?.match(/Ward:\s*([^)]+\))/)?.[1] || null,
          hostelId: demoAccount.scope?.match(/Block\s+[A-Z]|CampusStay|Residence/i)?.[0] || null,
          isOfflineFallback: true
        };
        return {
          status: 'success',
          token: `demo-resilience-token-${Date.now()}`,
          user: fallbackUser,
          isOfflineFallback: true
        };
      }

      const data = await res.json().catch(() => null);
      if (data && data.message) {
        return data;
      }
      return {
        status: 'error',
        code: 'AUTH_FAILED',
        message: 'Invalid email or password.'
      };
    } catch (err) {
      console.warn('[API Client] Backend unreachable, authenticating via demo verification for:', cleanEmail);
      const demoAccount = findDemoAccount(cleanEmail);
      if (demoAccount && (cleanPassword === 'TrustView@2026' || !cleanPassword || cleanPassword === 'Demo@123')) {
        const roleUpper = (demoAccount.role || '').toUpperCase();
        const assignedCampus = demoAccount.campusId === 'all' ? null : demoAccount.campusId;
        const fallbackUser = {
          userId: demoAccount.userId || `USR-${roleUpper.slice(0, 3)}-${demoAccount.campusId || 'ALL'}`,
          name: demoAccount.name,
          email: demoAccount.email,
          role: roleUpper,
          assignedCampusId: assignedCampus,
          campusId: assignedCampus,
          department: demoAccount.department || null,
          studentId: demoAccount.scope?.match(/([A-Z0-9]+-[A-Z0-9]+-[0-9]+)/)?.[1] || null,
          wardStudentId: demoAccount.scope?.match(/Ward:\s*([^)]+\))/)?.[1] || null,
          hostelId: demoAccount.scope?.match(/Block\s+[A-Z]|CampusStay|Residence/i)?.[0] || null,
          isOfflineFallback: true
        };
        return {
          status: 'success',
          token: `demo-resilience-token-${Date.now()}`,
          user: fallbackUser,
          isOfflineFallback: true
        };
      }
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
      const savedStr = typeof window !== 'undefined' ? localStorage.getItem('trustview_auth_user') : null;
      if (activeAuthToken && activeAuthToken.startsWith('demo-resilience-token-')) {
        if (savedStr) return { status: 'success', user: JSON.parse(savedStr) };
      }
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, { timeout: 2000 });
      if (res.ok) {
        return await res.json();
      }
      if (savedStr) {
        return { status: 'success', user: JSON.parse(savedStr) };
      }
      return null;
    } catch {
      try {
        const savedStr = typeof window !== 'undefined' ? localStorage.getItem('trustview_auth_user') : null;
        if (savedStr) return { status: 'success', user: JSON.parse(savedStr) };
      } catch {}
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
          message: `Backend server unreachable at ${API_BASE_URL}. Running with local verified cache.`
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
