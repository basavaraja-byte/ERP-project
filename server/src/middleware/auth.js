import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trustview_erp_super_secret_jwt_key_2026_hackathon';

/**
 * TrustView ERP - JWT Authentication Middleware
 * Extracts and verifies Bearer token from Authorization header.
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authentication token required. Please sign in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        status: 'error',
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: isExpired
          ? 'Session expired. Please sign in again.'
          : 'Invalid authentication token.'
      });
    }

    req.user = decoded;
    next();
  });
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified roles.
 * @param  {...string} allowedRoles Allowed role names (e.g. 'TRUSTEE', 'DEAN', 'PRINCIPAL')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN_ROLE',
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Campus Scope Enforcement Middleware
 * Ensures campus-bound roles (Dean, Principal, HOD, Faculty, Student, Parent, Warden)
 * can ONLY view or modify their assigned campus data.
 * Trustee has trust-wide access across all campuses.
 */
export const enforceCampusScope = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: 'Authentication required.'
    });
  }

  // Trustee has trust-wide privileges across all 6 campuses
  if (req.user.role === 'TRUSTEE') {
    return next();
  }

  const assignedCampusId = req.user.assignedCampusId;
  if (!assignedCampusId) {
    return res.status(403).json({
      status: 'error',
      code: 'NO_ASSIGNED_CAMPUS',
      message: 'User does not have an assigned campus configuration.'
    });
  }

  // Detect campus parameter from URL params, query strings, or body
  const targetCampusId = req.params.campusId || req.params.id || req.query.campusId || req.body?.campusId;

  if (targetCampusId && targetCampusId !== 'all' && targetCampusId !== assignedCampusId) {
    return res.status(403).json({
      status: 'error',
      code: 'FORBIDDEN_CAMPUS_ACCESS',
      message: `Access denied: Role '${req.user.role}' is restricted to campus '${assignedCampusId}', but attempted to access campus '${targetCampusId}'.`
    });
  }

  // Automatically enforce the assigned campus on the request
  req.enforcedCampusId = assignedCampusId;
  next();
};

/**
 * Optional Authentication Middleware
 * Populates req.user if valid token is provided, but allows unauthenticated pass-through.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (_err, decoded) => {
    if (decoded) {
      req.user = decoded;
    }
    next();
  });
};

