import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { authenticateToken, requireRole, enforceCampusScope } from '../src/middleware/auth.js';
import { validateRoleCampusScope } from '../src/services/metricsService.js';
import { User } from '../src/models/User.js';

const TEST_SECRET = process.env.JWT_SECRET || 'trustview_erp_super_secret_jwt_key_2026_hackathon';

function createMockContext({ headers = {}, params = {}, query = {}, body = {}, user = null } = {}) {
  const req = { headers, params, query, body, user };
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

test('Authentication & RBAC Middleware Unit Tests', async (t) => {
  await t.test('Password hashing and comparison with bcrypt', async () => {
    const rawPassword = 'TrustView@2026';
    const hash = await User.hashPassword(rawPassword);
    assert.notEqual(hash, rawPassword);
    assert.ok(hash.startsWith('$2'));

    const isMatch = await bcrypt.compare(rawPassword, hash);
    assert.equal(isMatch, true);

    const isBadMatch = await bcrypt.compare('WrongPassword', hash);
    assert.equal(isBadMatch, false);
  });

  await t.test('authenticateToken rejects missing token with 401', () => {
    const ctx = createMockContext();
    let nextCalled = false;
    authenticateToken(ctx.req, ctx.res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(ctx.getStatus(), 401);
    assert.equal(ctx.getData().code, 'UNAUTHORIZED');
  });

  await t.test('authenticateToken rejects invalid token with 401', () => {
    const ctx = createMockContext({
      headers: { authorization: 'Bearer invalid.token.value' }
    });
    let nextCalled = false;
    authenticateToken(ctx.req, ctx.res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(ctx.getStatus(), 401);
    assert.equal(ctx.getData().code, 'INVALID_TOKEN');
  });

  await t.test('authenticateToken succeeds with valid JWT and attaches req.user', () => {
    const payload = {
      userId: 'USR-TRU-001',
      email: 'trustee@trustview.edu',
      role: 'TRUSTEE',
      name: 'Dr. Vikram Mehta'
    };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });

    const ctx = createMockContext({
      headers: { authorization: `Bearer ${token}` }
    });
    let nextCalled = false;
    authenticateToken(ctx.req, ctx.res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.equal(ctx.req.user.email, 'trustee@trustview.edu');
    assert.equal(ctx.req.user.role, 'TRUSTEE');
  });

  await t.test('requireRole allows authorized roles and blocks unauthorized roles with 403', () => {
    const middleware = requireRole('TRUSTEE', 'DEAN');

    // Case 1: Authorized role (DEAN)
    const ctxAllowed = createMockContext({ user: { role: 'DEAN' } });
    let allowedNext = false;
    middleware(ctxAllowed.req, ctxAllowed.res, () => { allowedNext = true; });
    assert.equal(allowedNext, true);

    // Case 2: Unauthorized role (STUDENT attempting to access Trustee/Dean route)
    const ctxBlocked = createMockContext({ user: { role: 'STUDENT' } });
    let blockedNext = false;
    middleware(ctxBlocked.req, ctxBlocked.res, () => { blockedNext = true; });
    assert.equal(blockedNext, false);
    assert.equal(ctxBlocked.getStatus(), 403);
    assert.equal(ctxBlocked.getData().code, 'FORBIDDEN_ROLE');
  });

  await t.test('enforceCampusScope allows Trustee to access all campuses', () => {
    const ctx = createMockContext({
      user: { role: 'TRUSTEE' },
      query: { campusId: 'campus-4' }
    });
    let nextCalled = false;
    enforceCampusScope(ctx.req, ctx.res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  await t.test('enforceCampusScope restricts Principal/Dean to assigned campus', () => {
    // Permitted: Principal accessing assigned campus-1
    const ctxPermitted = createMockContext({
      user: { role: 'PRINCIPAL', assignedCampusId: 'campus-1' },
      query: { campusId: 'campus-1' }
    });
    let permittedNext = false;
    enforceCampusScope(ctxPermitted.req, ctxPermitted.res, () => { permittedNext = true; });
    assert.equal(permittedNext, true);

    // Blocked: Principal attempting to access campus-2
    const ctxBlocked = createMockContext({
      user: { role: 'PRINCIPAL', assignedCampusId: 'campus-1' },
      query: { campusId: 'campus-2' }
    });
    let blockedNext = false;
    enforceCampusScope(ctxBlocked.req, ctxBlocked.res, () => { blockedNext = true; });
    assert.equal(blockedNext, false);
    assert.equal(ctxBlocked.getStatus(), 403);
    assert.equal(ctxBlocked.getData().code, 'FORBIDDEN_CAMPUS_ACCESS');
  });

  await t.test('validateRoleCampusScope correctly handles all eight roles', () => {
    // 1. TRUSTEE: Trust-wide
    const trusteeScope = validateRoleCampusScope('TRUSTEE', 'all');
    assert.equal(trusteeScope.allowed, true);
    assert.equal(trusteeScope.isTrustWide, true);

    // 2. DEAN: Single campus
    const deanScope = validateRoleCampusScope('DEAN', 'campus-1', 'campus-1');
    assert.equal(deanScope.allowed, true);
    assert.equal(deanScope.effectiveCampusId, 'campus-1');
    const deanCross = validateRoleCampusScope('DEAN', 'campus-3', 'campus-1');
    assert.equal(deanCross.allowed, false);

    // 3. PRINCIPAL: Single campus
    const principalScope = validateRoleCampusScope('PRINCIPAL', 'campus-1', 'campus-1');
    assert.equal(principalScope.allowed, true);

    // 4. HOD: Assigned campus & department
    const hodScope = validateRoleCampusScope('HOD', 'campus-1', 'campus-1', { department: 'CSE' });
    assert.equal(hodScope.allowed, true);

    // 5. FACULTY: Assigned campus
    const facultyScope = validateRoleCampusScope('FACULTY', 'campus-1', 'campus-1');
    assert.equal(facultyScope.allowed, true);

    // 6. STUDENT: Own campus
    const studentScope = validateRoleCampusScope('STUDENT', 'campus-1', 'campus-1', { studentId: 'AIT2023-CS-042' });
    assert.equal(studentScope.allowed, true);

    // 7. PARENT: Ward campus
    const parentScope = validateRoleCampusScope('PARENT', 'campus-1', 'campus-1', { wardStudentId: 'AIT2023-CS-042' });
    assert.equal(parentScope.allowed, true);

    // 8. WARDEN: Hostel campus
    const wardenScope = validateRoleCampusScope('WARDEN', 'campus-1', 'campus-1', { hostelId: 'Block A (Boys)' });
    assert.equal(wardenScope.allowed, true);

    // 9. FINANCE_MANAGER: Assigned campus
    const financeScope = validateRoleCampusScope('FINANCE_MANAGER', 'campus-1', 'campus-1');
    assert.equal(financeScope.allowed, true);
    assert.equal(financeScope.effectiveCampusId, 'campus-1');
    const financeCross = validateRoleCampusScope('FINANCE_MANAGER', 'campus-2', 'campus-1');
    assert.equal(financeCross.allowed, false);
  });
});

