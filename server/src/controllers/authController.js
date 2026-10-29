import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trustview_erp_super_secret_jwt_key_2026_hackathon';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function resolveDemoUser(cleanEmail) {
  if (cleanEmail === 'trustee@trustview.edu') {
    return {
      userId: 'USR-TRU-001',
      name: 'Dr. Vikram Mehta',
      email: cleanEmail,
      role: 'TRUSTEE',
      assignedCampusId: null
    };
  }
  const match = cleanEmail.match(/^(dean|principal|finance|hod|faculty|student|parent|warden)[._]([^@]+)@/);
  if (match) {
    const rolePrefix = match[1].toUpperCase();
    const roleMap = {
      DEAN: 'DEAN',
      PRINCIPAL: 'PRINCIPAL',
      FINANCE: 'FINANCE_MANAGER',
      HOD: 'HOD',
      FACULTY: 'FACULTY',
      STUDENT: 'STUDENT',
      PARENT: 'PARENT',
      WARDEN: 'WARDEN'
    };
    const role = roleMap[rolePrefix] || 'TRUSTEE';
    const campusMatch = cleanEmail.match(/campus([1-6])/);
    const campusId = campusMatch ? `campus-${campusMatch[1]}` : 'campus-1';
    return {
      userId: `USR-${role.slice(0, 3)}-${campusId}`,
      name: `${role} (${campusId})`,
      email: cleanEmail,
      role,
      assignedCampusId: role === 'TRUSTEE' ? null : campusId,
      department: null
    };
  }
  return null;
}

/**
 * POST /api/auth/login
 * Authenticates user credentials and generates JWT token.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Both email and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Query user including the hidden passwordHash field
    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
    } catch (dbErr) {
      console.warn('[authController] Database query failed or disconnected:', dbErr.message);
    }

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          status: 'error',
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated. Please contact your administrator.'
        });
      }

      // Verify password via bcrypt
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        });
      }

      // Update lastLogin timestamp without triggering full validation
      await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).catch(() => {});
    } else {
      // If user not in DB or DB offline during cold start, check demo account fallback with TrustView@2026
      if (password === 'TrustView@2026' || password === 'Demo@123') {
        const demoUser = resolveDemoUser(cleanEmail);
        if (demoUser) {
          user = demoUser;
        }
      }

      if (!user) {
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.'
        });
      }
    }

    // Payload for JWT
    const tokenPayload = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      role: user.role,
      assignedCampusId: user.assignedCampusId,
      department: user.department,
      studentId: user.studentId,
      wardStudentId: user.wardStudentId,
      hostelId: user.hostelId
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      status: 'success',
      message: `Welcome back, ${user.name}`,
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedCampusId: user.assignedCampusId,
        campusId: user.assignedCampusId,
        department: user.department,
        studentId: user.studentId,
        wardStudentId: user.wardStudentId,
        hostelId: user.hostelId,
        lastLogin: new Date()
      }
    });
  } catch (error) {
    console.error('[Auth Error] Login failure:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'An unexpected server error occurred during authentication.'
    });
  }
};

/**
 * GET /api/auth/me
 * Retrieves current authenticated user profile.
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    // Refresh user state from database if available
    const user = await User.findOne({ userId: req.user.userId });
    if (user) {
      return res.status(200).json({
        status: 'success',
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedCampusId: user.assignedCampusId,
          campusId: user.assignedCampusId,
          department: user.department,
          studentId: user.studentId,
          wardStudentId: user.wardStudentId,
          hostelId: user.hostelId,
          isActive: user.isActive,
          lastLogin: user.lastLogin
        }
      });
    }

    // Fallback to token payload
    return res.status(200).json({
      status: 'success',
      user: req.user
    });
  } catch (error) {
    console.error('[Auth Error] GetMe failure:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve user profile.'
    });
  }
};

/**
 * POST /api/auth/logout
 * Handles logout and informs client to clear authorization token.
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully. Please clear client-side credentials.'
  });
};

