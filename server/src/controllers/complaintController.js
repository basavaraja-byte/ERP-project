import { Complaint } from '../models/Complaint.js';
import { AuditLog } from '../models/AuditLog.js';
import { isDbConnected } from '../config/database.js';

/**
 * TrustView ERP - Complaints & Grievance Management Controller
 * Supports Students and Parents submitting grievances, and HODs / Trustees resolving them.
 * Fully backed by MongoDB Atlas with in-memory resilient fallback cache.
 */

const INITIAL_COMPLAINTS = [
  {
    complaintId: 'CMP-2026-1001',
    title: 'Network lab Wi-Fi intermittent connection during practical hours',
    description: 'The Wi-Fi access points in Computer Lab 3 drop connection repeatedly during the afternoon 2 PM - 4 PM lab session.',
    category: 'Lab & Infrastructure',
    priority: 'Medium',
    submitterId: 'USR-STU-001',
    submitterName: 'Rahul Sharma',
    submitterRole: 'STUDENT',
    studentId: 'AIT2023-CS-042',
    campusId: 'campus-1',
    department: 'Computer Science & Engineering',
    status: 'Under Review',
    assignedTo: 'Dr. K. Swaminathan (HOD)',
    resolutionNotes: 'Investigation initiated with Network IT Administrator.',
    createdAt: new Date('2026-10-25T10:30:00Z'),
    updatedAt: new Date('2026-10-25T10:30:00Z')
  },
  {
    complaintId: 'CMP-2026-1002',
    title: 'Attendance calculation discrepancy for Data Structures lecture on Oct 14',
    description: 'I was present during Session 4 on Oct 14, but the portal reports an unexcused absence. Please verify physical attendance sheet.',
    category: 'Attendance Discrepancy',
    priority: 'High',
    submitterId: 'USR-STU-002',
    submitterName: 'Ananya Iyer',
    submitterRole: 'STUDENT',
    studentId: 'AIT2023-CS-088',
    campusId: 'campus-1',
    department: 'Computer Science & Engineering',
    status: 'Pending',
    createdAt: new Date('2026-10-26T14:15:00Z'),
    updatedAt: new Date('2026-10-26T14:15:00Z')
  },
  {
    complaintId: 'CMP-2026-1003',
    title: 'Hostel Block A hot water geyser not operating in 2nd floor bathroom',
    description: 'The hot water supply in Block A floor 2 has stopped heating since yesterday morning. Requires electrician maintenance.',
    category: 'Hostel',
    priority: 'Medium',
    submitterId: 'USR-STU-001',
    submitterName: 'Rahul Sharma',
    submitterRole: 'STUDENT',
    studentId: 'AIT2023-CS-042',
    campusId: 'campus-1',
    department: 'Computer Science & Engineering',
    status: 'Resolved',
    assignedTo: 'Col. M. Sundaram (Warden)',
    resolutionNotes: 'Electrician replaced heating thermostat unit. Hot water supply restored and inspected.',
    resolvedAt: new Date('2026-10-27T16:00:00Z'),
    resolvedBy: 'Dr. K. Swaminathan (HOD)',
    createdAt: new Date('2026-10-24T09:00:00Z'),
    updatedAt: new Date('2026-10-27T16:00:00Z')
  },
  {
    complaintId: 'CMP-2026-1004',
    title: 'Request for fee installment payment extension due to bank transfer delay',
    description: 'Parent bank transfer is clearing in 48 hours. Requesting 3-day extension before late fee surcharge applies.',
    category: 'Fee & Finance',
    priority: 'High',
    submitterId: 'USR-PAR-001',
    submitterName: 'Mr. Ramesh Sharma',
    submitterRole: 'PARENT',
    studentId: 'AIT2023-CS-042',
    campusId: 'campus-1',
    department: 'Computer Science & Engineering',
    status: 'Under Review',
    assignedTo: 'Dr. K. Swaminathan (HOD)',
    resolutionNotes: 'Forwarded to Campus Finance Controller for temporary surcharge waiver approval.',
    createdAt: new Date('2026-10-27T11:45:00Z'),
    updatedAt: new Date('2026-10-27T11:45:00Z')
  }
];

let inMemoryComplaints = INITIAL_COMPLAINTS.map(c => ({ ...c }));

/**
 * Auto-ensure seed records exist in MongoDB Atlas if connected
 */
async function ensureDbSeeded() {
  if (!isDbConnected()) return;
  try {
    const count = await Complaint.countDocuments();
    if (count === 0) {
      for (const item of INITIAL_COMPLAINTS) {
        await Complaint.updateOne(
          { complaintId: item.complaintId },
          { $set: item },
          { upsert: true }
        );
      }
    }
  } catch (err) {
    console.warn('[Complaint Seeder Warning]:', err.message);
  }
}

/**
 * POST /api/complaints
 * Create a new complaint. Automatically binds authenticated user session identity and campus.
 */
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Complaint title / subject is required.'
      });
    }

    if (!description || !String(description).trim()) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Complaint description is required.'
      });
    }

    if (!category || !String(category).trim()) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Complaint category is required.'
      });
    }

    // Automatically derive submitter context from authenticated JWT session
    const submitterId = req.user?.userId || req.user?.email || 'ANONYMOUS';
    const submitterName = req.user?.name || 'Verified User';
    const submitterRole = (req.user?.role || 'STUDENT').toUpperCase();
    const campusId = req.user?.assignedCampusId || req.body.campusId || 'campus-1';
    const department = req.user?.department || req.body.department || 'Computer Science & Engineering';
    const studentId = req.user?.studentId || req.user?.wardStudentId || req.body.studentId || 'N/A';

    // Generate unique complaint ID: e.g. CMP-YYYYMMDD-XXXXX
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const complaintId = `CMP-${dateStr}-${randomSuffix}`;

    const complaintDoc = {
      complaintId,
      title: String(title).trim(),
      description: String(description).trim(),
      category: String(category).trim(),
      priority: ['Low', 'Medium', 'High', 'Urgent'].includes(priority) ? priority : 'Medium',
      submitterId,
      submitterName,
      submitterRole,
      studentId,
      campusId,
      department,
      status: 'Pending',
      resolutionNotes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedComplaint = null;

    if (isDbConnected()) {
      try {
        savedComplaint = await Complaint.create(complaintDoc);
      } catch (dbErr) {
        console.warn('[Complaint DB Warning] Falling back to memory store:', dbErr.message);
      }
    }

    if (!savedComplaint) {
      inMemoryComplaints.unshift(complaintDoc);
      savedComplaint = complaintDoc;
    }

    // Record audit event
    try {
      if (isDbConnected()) {
        await AuditLog.create({
          auditId: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          actionType: 'COMPLAINT_SUBMITTED',
          category: 'GRIEVANCE',
          campusId,
          actor: {
            userId: submitterId,
            name: submitterName,
            role: submitterRole,
            campusId
          },
          entityType: 'Complaint',
          entityId: complaintId,
          details: `Grievance submitted by ${submitterName} (${submitterRole}) under category ${category}`,
          metadata: {
            complaintId,
            title: complaintDoc.title,
            category: complaintDoc.category
          }
        });
      }
    } catch (auditErr) {
      console.warn('[Complaint Audit Warning]:', auditErr.message);
    }

    return res.status(201).json({
      status: 'success',
      message: 'Complaint submitted successfully and registered in TrustView ERP.',
      data: savedComplaint
    });
  } catch (error) {
    console.error('[Complaint Error] Failed to create complaint:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to submit grievance. Please try again later.'
    });
  }
};

/**
 * GET /api/complaints
 * Fetch complaints with role-based and campus-based authorization.
 */
export const getComplaints = async (req, res) => {
  try {
    await ensureDbSeeded();

    const role = (req.user?.role || '').toUpperCase();
    const assignedCampusId = req.user?.assignedCampusId;

    if (isDbConnected()) {
      const query = {};

      if (role === 'TRUSTEE') {
        if (req.query.campusId && req.query.campusId !== 'all') {
          query.campusId = req.query.campusId;
        }
      } else if (role === 'HOD') {
        query.campusId = assignedCampusId;
        if (req.query.department) {
          query.department = req.query.department;
        }
      } else if (role === 'DEAN' || role === 'PRINCIPAL') {
        query.campusId = assignedCampusId;
      } else if (role === 'STUDENT') {
        query.$or = [
          { submitterId: req.user.userId },
          { submitterId: req.user.email },
          { studentId: req.user.studentId }
        ];
      } else if (role === 'PARENT') {
        const wardId = req.user.wardStudentId || req.user.studentId;
        query.$or = [
          { submitterId: req.user.userId },
          { submitterId: req.user.email },
          { studentId: wardId }
        ];
      } else {
        if (assignedCampusId) {
          query.campusId = assignedCampusId;
        }
      }

      if (req.query.status && req.query.status !== 'ALL') {
        query.status = req.query.status;
      }

      if (req.query.category && req.query.category !== 'ALL') {
        query.category = req.query.category;
      }

      if (req.query.search) {
        const searchRegex = new RegExp(String(req.query.search).trim(), 'i');
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { complaintId: searchRegex },
            { title: searchRegex },
            { description: searchRegex },
            { submitterName: searchRegex },
            { studentId: searchRegex }
          ]
        });
      }

      try {
        const complaints = await Complaint.find(query).sort({ createdAt: -1 }).lean();
        return res.status(200).json({
          status: 'success',
          count: complaints.length,
          data: complaints
        });
      } catch (dbErr) {
        console.warn('[Complaint DB Warning] Falling back to memory list:', dbErr.message);
      }
    }

    // In-memory fallback filtering
    let list = [...inMemoryComplaints];

    if (role === 'TRUSTEE') {
      if (req.query.campusId && req.query.campusId !== 'all') {
        list = list.filter(c => c.campusId === req.query.campusId);
      }
    } else if (role === 'HOD') {
      list = list.filter(c => c.campusId === assignedCampusId);
      if (req.query.department) {
        list = list.filter(c => c.department === req.query.department);
      }
    } else if (role === 'DEAN' || role === 'PRINCIPAL') {
      list = list.filter(c => c.campusId === assignedCampusId);
    } else if (role === 'STUDENT') {
      list = list.filter(c =>
        c.submitterId === req.user.userId ||
        c.submitterId === req.user.email ||
        c.studentId === req.user.studentId
      );
    } else if (role === 'PARENT') {
      const wardId = req.user.wardStudentId || req.user.studentId;
      list = list.filter(c =>
        c.submitterId === req.user.userId ||
        c.submitterId === req.user.email ||
        c.studentId === wardId
      );
    } else {
      if (assignedCampusId) {
        list = list.filter(c => c.campusId === assignedCampusId);
      }
    }

    if (req.query.status && req.query.status !== 'ALL') {
      list = list.filter(c => c.status === req.query.status);
    }

    if (req.query.category && req.query.category !== 'ALL') {
      list = list.filter(c => c.category === req.query.category);
    }

    if (req.query.search) {
      const s = String(req.query.search).toLowerCase();
      list = list.filter(c =>
        (c.complaintId && c.complaintId.toLowerCase().includes(s)) ||
        (c.title && c.title.toLowerCase().includes(s)) ||
        (c.description && c.description.toLowerCase().includes(s)) ||
        (c.submitterName && c.submitterName.toLowerCase().includes(s)) ||
        (c.studentId && c.studentId.toLowerCase().includes(s))
      );
    }

    return res.status(200).json({
      status: 'success',
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('[Complaint Error] Failed to retrieve complaints:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to retrieve complaints.'
    });
  }
};

/**
 * GET /api/complaints/:id
 * Retrieve a specific complaint by complaintId or MongoDB _id.
 */
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    let complaint = null;

    if (isDbConnected()) {
      try {
        complaint = await Complaint.findOne({
          $or: [{ complaintId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        }).lean();
      } catch (err) {
        console.warn('[Complaint DB Warning]:', err.message);
      }
    }

    if (!complaint) {
      complaint = inMemoryComplaints.find(c => c.complaintId === id);
    }

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: `Complaint '${id}' was not found.`
      });
    }

    // Role-based authorization
    const role = (req.user?.role || '').toUpperCase();
    if (role !== 'TRUSTEE') {
      if (['HOD', 'DEAN', 'PRINCIPAL'].includes(role)) {
        if (complaint.campusId !== req.user.assignedCampusId) {
          return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN_CAMPUS',
            message: 'You are not authorized to view complaints outside your assigned campus.'
          });
        }
      } else if (role === 'STUDENT' || role === 'PARENT') {
        const isOwner =
          complaint.submitterId === req.user.userId ||
          complaint.submitterId === req.user.email ||
          complaint.studentId === req.user.studentId ||
          complaint.studentId === req.user.wardStudentId;
        if (!isOwner) {
          return res.status(403).json({
            status: 'error',
            code: 'FORBIDDEN',
            message: 'You are not authorized to view this grievance.'
          });
        }
      }
    }

    return res.status(200).json({
      status: 'success',
      data: complaint
    });
  } catch (error) {
    console.error('[Complaint Error] Failed to retrieve complaint by ID:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to load complaint details.'
    });
  }
};

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status (Pending, Under Review, Resolved, Rejected) with notes and assignee.
 * Authorized for HOD, Dean, Principal, Trustee.
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const validStatuses = ['Pending', 'Under Review', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    let complaint = null;
    let isMongooseDoc = false;

    if (isDbConnected()) {
      try {
        complaint = await Complaint.findOne({
          $or: [{ complaintId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
        });
        if (complaint) isMongooseDoc = true;
      } catch (err) {
        console.warn('[Complaint DB Warning]:', err.message);
      }
    }

    if (!complaint) {
      complaint = inMemoryComplaints.find(c => c.complaintId === id);
    }

    if (!complaint) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: `Complaint '${id}' was not found.`
      });
    }

    // Campus authority verification
    const role = (req.user?.role || '').toUpperCase();
    if (role !== 'TRUSTEE' && complaint.campusId !== req.user?.assignedCampusId) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN_CAMPUS',
        message: 'You can only update grievances within your assigned campus.'
      });
    }

    const prevStatus = complaint.status;
    complaint.status = status;

    if (resolutionNotes !== undefined) {
      complaint.resolutionNotes = String(resolutionNotes).trim();
    }

    if (assignedTo !== undefined) {
      complaint.assignedTo = String(assignedTo).trim();
    }

    if (status === 'Resolved' || status === 'Rejected') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user?.name || 'Administrator';
    } else {
      complaint.resolvedAt = null;
      complaint.resolvedBy = null;
    }

    complaint.updatedAt = new Date();

    if (isMongooseDoc) {
      await complaint.save();
    }

    // Keep memory store in sync
    const memIdx = inMemoryComplaints.findIndex(c => c.complaintId === complaint.complaintId);
    if (memIdx >= 0) {
      inMemoryComplaints[memIdx] = isMongooseDoc ? complaint.toObject() : complaint;
    }

    // Record audit event
    try {
      if (isDbConnected()) {
        await AuditLog.create({
          auditId: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          actionType: 'COMPLAINT_STATUS_UPDATED',
          category: 'GRIEVANCE',
          campusId: complaint.campusId,
          actor: {
            userId: req.user?.userId || req.user?.email,
            name: req.user?.name,
            role: req.user?.role,
            campusId: req.user?.assignedCampusId
          },
          entityType: 'Complaint',
          entityId: complaint.complaintId,
          details: `Complaint ${complaint.complaintId} status transitioned from ${prevStatus} to ${status} by ${req.user?.name}`,
          metadata: {
            complaintId: complaint.complaintId,
            prevStatus,
            newStatus: status,
            resolutionNotes: complaint.resolutionNotes
          }
        });
      }
    } catch (auditErr) {
      console.warn('[Complaint Audit Warning]:', auditErr.message);
    }

    return res.status(200).json({
      status: 'success',
      message: `Complaint status updated to '${status}'.`,
      data: complaint
    });
  } catch (error) {
    console.error('[Complaint Error] Failed to update complaint status:', error);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Failed to update complaint status.'
    });
  }
};
