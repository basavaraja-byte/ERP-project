import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trustview_erp_super_secret_jwt_key_2026_hackathon';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const DEMO_PERSONAS = {
  'trustee@trustview.edu': { name: 'Dr. Vikram Mehta', role: 'TRUSTEE', campusId: null },
  // Campus 1
  'dean.campus1@trustview.edu': { name: 'Prof. Rajesh Swaminathan', role: 'DEAN', campusId: 'campus-1', department: 'Engineering & Technology' },
  'principal.campus1@trustview.edu': { name: 'Dr. K. S. Ramanathan', role: 'PRINCIPAL', campusId: 'campus-1' },
  'finance.campus1@trustview.edu': { name: 'Mr. Anand Srinivasan (CA)', role: 'FINANCE_MANAGER', campusId: 'campus-1' },
  'hod.cs@trustview.edu': { name: 'Dr. Aruna Natarajan', role: 'HOD', campusId: 'campus-1', department: 'Computer Science & Engineering' },
  'faculty.cs@trustview.edu': { name: 'Prof. Suresh Kumar', role: 'FACULTY', campusId: 'campus-1', department: 'CSE' },
  'student.rahul@trustview.edu': { name: 'Rahul Sharma', role: 'STUDENT', campusId: 'campus-1', studentId: 'MIT2023-CS-042', department: 'Computer Science & Engineering' },
  'parent.sharma@trustview.edu': { name: 'Mr. Ramesh Sharma', role: 'PARENT', campusId: 'campus-1', wardStudentId: 'MIT2023-CS-042' },
  'warden.blocka@trustview.edu': { name: 'Col. M. Sundaram', role: 'WARDEN', campusId: 'campus-1', hostelId: 'Block A (Boys Hostel)' },
  // Campus 2
  'dean.campus2@trustview.edu': { name: 'Prof. M. Venkatesan', role: 'DEAN', campusId: 'campus-2', department: 'Polytechnic & Applied Tech' },
  'principal.campus2@trustview.edu': { name: 'Prof. M. Anbarasan', role: 'PRINCIPAL', campusId: 'campus-2' },
  'finance.campus2@trustview.edu': { name: 'Mrs. Jayashree Venkat', role: 'FINANCE_MANAGER', campusId: 'campus-2' },
  'hod.auto@trustview.edu': { name: 'Prof. R. Balaji', role: 'HOD', campusId: 'campus-2', department: 'Automobile Engineering' },
  'faculty.auto@trustview.edu': { name: 'Prof. Deepa Mani', role: 'FACULTY', campusId: 'campus-2', department: 'Automobile Engineering' },
  'student.priya@trustview.edu': { name: 'Priya Patel', role: 'STUDENT', campusId: 'campus-2', studentId: 'APC2024-AUT-108' },
  'parent.patel@trustview.edu': { name: 'Mrs. Gita Patel', role: 'PARENT', campusId: 'campus-2', wardStudentId: 'APC2024-AUT-108' },
  'warden.polyres@trustview.edu': { name: 'Mr. P. Murugesan', role: 'WARDEN', campusId: 'campus-2', hostelId: 'Polytechnic Residence' },
  // Campus 3
  'dean.campus3@trustview.edu': { name: 'Prof. S. Meenakshi', role: 'DEAN', campusId: 'campus-3' },
  'principal.campus3@trustview.edu': { name: 'Dr. Lakshmi Parthasarathy', role: 'PRINCIPAL', campusId: 'campus-3' },
  'hod.commerce@trustview.edu': { name: 'Dr. N. Sengottaiyan', role: 'HOD', campusId: 'campus-3', department: 'Commerce & Accounting' },
  'faculty.commerce@trustview.edu': { name: 'Prof. Karthik Raja', role: 'FACULTY', campusId: 'campus-3', department: 'Commerce' },
  'student.ananya@trustview.edu': { name: 'Ananya Krishnan', role: 'STUDENT', campusId: 'campus-3', studentId: 'ACAS2024-BCA-055' },
  'parent.krishnan@trustview.edu': { name: 'Mr. K. Krishnan', role: 'PARENT', campusId: 'campus-3', wardStudentId: 'ACAS2024-BCA-055' },
  'warden.cityarts@trustview.edu': { name: 'Mrs. S. Vasanthi', role: 'WARDEN', campusId: 'campus-3', hostelId: 'City Arts & Science Hall' },
  // Campus 4
  'dean.campus4@trustview.edu': { name: 'Dr. G. Jayaraman', role: 'DEAN', campusId: 'campus-4' },
  'principal.campus4@trustview.edu': { name: 'Mrs. Revathi Sundaram', role: 'PRINCIPAL', campusId: 'campus-4' },
  // Campus 5
  'dean.campus5@trustview.edu': { name: 'Dr. Harish Chandra', role: 'DEAN', campusId: 'campus-5' },
  'principal.campus5@trustview.edu': { name: 'Dr. Rajeshwar Rao', role: 'PRINCIPAL', campusId: 'campus-5' },
  'hod.mba@trustview.edu': { name: 'Dr. Preeti Shenoy', role: 'HOD', campusId: 'campus-5', department: 'Secondary Education' },
  'student.aditya@trustview.edu': { name: 'Aditya Verma', role: 'STUDENT', campusId: 'campus-5', studentId: 'AIMR2024-MBA-019' },
  'parent.verma@trustview.edu': { name: 'Mr. Sanjay Verma', role: 'PARENT', campusId: 'campus-5', wardStudentId: 'AIMR2024-MBA-019' },
  'warden.execmgmt@trustview.edu': { name: 'Capt. V. Narayanan', role: 'WARDEN', campusId: 'campus-5', hostelId: 'School Residential Hall' },
  // Campus 6
  'principal.campus6@trustview.edu': { name: 'Mr. T. Govindaraj', role: 'PRINCIPAL', campusId: 'campus-6' }
};

function resolveDemoUser(cleanEmail) {
  const persona = DEMO_PERSONAS[cleanEmail];
  if (persona) {
    const roleUpper = persona.role.toUpperCase();
    return {
      userId: `USR-${roleUpper.slice(0, 3)}-${persona.campusId || 'ALL'}`,
      name: persona.name,
      email: cleanEmail,
      role: roleUpper,
      assignedCampusId: persona.campusId,
      campusId: persona.campusId,
      department: persona.department || null,
      studentId: persona.studentId || null,
      wardStudentId: persona.wardStudentId || null,
      hostelId: persona.hostelId || null
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

    // Query user including the hidden passwordHash field if database is connected
    let user = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: cleanEmail }).select('+passwordHash');
      } catch (dbErr) {
        console.warn('[authController] Database query failed or disconnected:', dbErr.message);
      }
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

