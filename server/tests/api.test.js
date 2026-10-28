import test from 'node:test';
import assert from 'node:assert/strict';

import { getHealth } from '../src/controllers/healthController.js';
import { getCampuses, getCampusById } from '../src/controllers/campusController.js';
import { getDashboardSummary, getCollectionTrends } from '../src/controllers/dashboardController.js';
import { getFeesSummary } from '../src/controllers/feeController.js';
import { getHostelsSummary } from '../src/controllers/hostelController.js';
import { getAttendanceRisks } from '../src/controllers/attendanceController.js';
import { getExceptions, updateExceptionStatus } from '../src/controllers/exceptionController.js';

// Helper to create mock request and response
function createMockContext({ params = {}, query = {}, body = {} } = {}) {
  const req = { params, query, body };
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

test('Controller API Units (Zero Network Socket / Fully Sandboxed)', async (t) => {
  await t.test('HealthController returns server status and Atlas readiness', async () => {
    const ctx = createMockContext();
    await getHealth(ctx.req, ctx.res);
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.status, 'ok');
    assert.ok(data.database);
    assert.equal(typeof data.database.connected, 'boolean');
    assert.ok(data.database.message);
  });

  await t.test('CampusController getCampuses returns 6 campuses', async () => {
    const ctx = createMockContext();
    await getCampuses(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.length, 6);
    assert.equal(data.data[0].id, 'campus-1');
  });

  await t.test('CampusController getCampusById returns single campus', async () => {
    const ctx = createMockContext({ params: { id: 'campus-1' } });
    await getCampusById(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.id, 'campus-1');
    assert.ok(['MIT-ENG', 'AIT-ENG'].includes(data.data.code));
    assert.equal(data.data.studentCount, 4120);
  });

  await t.test('CampusController getCampusById returns 404 for unknown campus', async () => {
    const ctx = createMockContext({ params: { id: 'unknown-id' } });
    await getCampusById(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 404);
    const data = ctx.getData();
    assert.equal(data.success, false);
  });

  await t.test('DashboardController getDashboardSummary returns consolidated metrics', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getDashboardSummary(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.summary.totalStudents, 14280);
    assert.equal(data.summary.collectionRate, 94.8);
  });

  await t.test('DashboardController getCollectionTrends returns 6 monthly data points', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getCollectionTrends(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.length, 6);
  });

  await t.test('FeeController getFeesSummary returns accurate financial breakdown', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getFeesSummary(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.grossAssessed, 974600000);
    assert.equal(data.data.netPayable, 934700000);
    assert.equal(data.data.outstanding, 48250000);
  });

  await t.test('HostelController getHostelsSummary returns capacity and occupancy', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getHostelsSummary(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.totalCapacity, 4500);
    assert.equal(data.data.totalOccupied, 3840);
  });

  await t.test('AttendanceController getAttendanceRisks returns risk counts', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getAttendanceRisks(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.totalRiskCount, 488);
  });

  await t.test('ExceptionController getExceptions returns operational exceptions', async () => {
    const ctx = createMockContext({ query: { campusId: 'all' } });
    await getExceptions(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.ok(data.data.length > 0);
  });

  await t.test('ExceptionController updateExceptionStatus validates input', async () => {
    const ctx = createMockContext({ params: { id: 'EXC-1091' }, body: {} });
    await updateExceptionStatus(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 400);
    assert.equal(ctx.getData().success, false);
  });

  await t.test('ExceptionController updateExceptionStatus updates exception status', async () => {
    const ctx = createMockContext({
      params: { id: 'EXC-1091' },
      body: { status: 'In Review', note: 'Audit team dispatched.' }
    });
    await updateExceptionStatus(ctx.req, ctx.res, (err) => { throw err; });
    assert.equal(ctx.getStatus(), 200);
    const data = ctx.getData();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'In Review');
  });
});
