import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus
} from '../src/controllers/complaintController.js';

function createMockContext({ user = null, params = {}, query = {}, body = {} } = {}) {
  const req = { user, params, query, body };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    }
  };

  return {
    req,
    res,
    getStatus: () => statusCode,
    getData: () => responseData
  };
}

test('Grievance & Complaint Management Controller Units', async (t) => {
  let createdComplaintId = null;

  await t.test('createComplaint rejects blank fields with 400 validation error', async () => {
    const ctx = createMockContext({
      user: { userId: 'USR-STU-001', name: 'Rahul Sharma', role: 'STUDENT', assignedCampusId: 'campus-1' },
      body: { title: '   ', description: '', category: '' }
    });
    await createComplaint(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
    assert.equal(ctx.getData().code, 'VALIDATION_ERROR');
  });

  await t.test('createComplaint automatically derives identity, campus, and studentId from session', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-STU-001',
        email: 'student.rahul@trustview.edu',
        name: 'Rahul Sharma',
        role: 'STUDENT',
        assignedCampusId: 'campus-1',
        department: 'Computer Science & Engineering',
        studentId: 'AIT2023-CS-042'
      },
      body: {
        title: 'Projector resolution issue in Room 302',
        description: 'The overhead projector only displays 800x600 resolution and cuts off slide edges.',
        category: 'Lab & Infrastructure',
        priority: 'Medium'
      }
    });

    await createComplaint(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 201);
    const data = ctx.getData().data;
    assert.ok(data.complaintId.startsWith('CMP-'));
    assert.equal(data.submitterName, 'Rahul Sharma');
    assert.equal(data.submitterRole, 'STUDENT');
    assert.equal(data.campusId, 'campus-1');
    assert.equal(data.studentId, 'AIT2023-CS-042');
    assert.equal(data.status, 'Pending');
    createdComplaintId = data.complaintId;
  });

  await t.test('getComplaints scopes results to student identity', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-STU-001',
        email: 'student.rahul@trustview.edu',
        role: 'STUDENT',
        studentId: 'AIT2023-CS-042'
      }
    });

    await getComplaints(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 200);
    const list = ctx.getData().data;
    assert.ok(Array.isArray(list));
    // All returned complaints should be submitted by Rahul or match his student ID
    for (const c of list) {
      assert.ok(
        c.submitterId === 'USR-STU-001' ||
        c.submitterId === 'student.rahul@trustview.edu' ||
        c.studentId === 'AIT2023-CS-042'
      );
    }
  });

  await t.test('getComplaints scopes results to HOD campus', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-HOD-001',
        name: 'Dr. K. Swaminathan',
        role: 'HOD',
        assignedCampusId: 'campus-1',
        department: 'Computer Science & Engineering'
      }
    });

    await getComplaints(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 200);
    const list = ctx.getData().data;
    assert.ok(Array.isArray(list));
    for (const c of list) {
      assert.equal(c.campusId, 'campus-1');
    }
  });

  await t.test('updateComplaintStatus rejects invalid status values', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-HOD-001',
        name: 'Dr. K. Swaminathan',
        role: 'HOD',
        assignedCampusId: 'campus-1'
      },
      params: { id: createdComplaintId },
      body: { status: 'INVALID_STATUS' }
    });

    await updateComplaintStatus(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 400);
  });

  await t.test('updateComplaintStatus blocks HOD from updating complaint outside their campus', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-HOD-002',
        name: 'Prof. Campus 2 HOD',
        role: 'HOD',
        assignedCampusId: 'campus-2'
      },
      params: { id: createdComplaintId },
      body: { status: 'Resolved' }
    });

    await updateComplaintStatus(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 403);
    assert.equal(ctx.getData().code, 'FORBIDDEN_CAMPUS');
  });

  await t.test('updateComplaintStatus updates status and records resolver name', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-HOD-001',
        name: 'Dr. K. Swaminathan',
        role: 'HOD',
        assignedCampusId: 'campus-1'
      },
      params: { id: createdComplaintId },
      body: {
        status: 'Resolved',
        resolutionNotes: 'HDMI transmitter replaced by AV team.',
        assignedTo: 'AV Support Team'
      }
    });

    await updateComplaintStatus(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 200);
    const updated = ctx.getData().data;
    assert.equal(updated.status, 'Resolved');
    assert.equal(updated.resolutionNotes, 'HDMI transmitter replaced by AV team.');
    assert.equal(updated.resolvedBy, 'Dr. K. Swaminathan');
    assert.ok(updated.resolvedAt);
  });

  await t.test('getComplaintById returns complaint details for authorized user', async () => {
    const ctx = createMockContext({
      user: {
        userId: 'USR-HOD-001',
        role: 'HOD',
        assignedCampusId: 'campus-1'
      },
      params: { id: createdComplaintId }
    });

    await getComplaintById(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 200);
    assert.equal(ctx.getData().data.complaintId, createdComplaintId);
  });
});

