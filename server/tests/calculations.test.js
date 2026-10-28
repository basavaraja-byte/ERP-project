import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCollectionRate,
  calculateOccupancyPercentage,
  validateRoleCampusScope,
  metricsService
} from '../src/services/metricsService.js';
import { MOCK_CAMPUSES } from '../../src/data/mockData.js';

test('Math calculation utilities', async (t) => {
  await t.test('calculateCollectionRate calculates net payable recovery rate correctly', () => {
    // 38.15 Cr paid on (41.20 - 1.65 = 39.55) Cr net payable = 96.46... -> 96.5%
    const rate = calculateCollectionRate(381500000, 412000000, 16500000);
    assert.equal(rate, 96.5);

    // Zero / edge cases
    assert.equal(calculateCollectionRate(0, 100, 0), 0);
    assert.equal(calculateCollectionRate(100, 0, 0), 0);
    assert.equal(calculateCollectionRate(100, 100, 100), 0); // Net is 0
  });

  await t.test('calculateOccupancyPercentage calculates occupancy accurately', () => {
    // 3,840 occupied out of 4,500 capacity = 85.333... -> 85.3%
    const rate = calculateOccupancyPercentage(3840, 4500);
    assert.equal(rate, 85.3);

    // Edge cases
    assert.equal(calculateOccupancyPercentage(0, 500), 0);
    assert.equal(calculateOccupancyPercentage(500, 0), 0);
  });
});

test('TrustView Consolidated Metrics Reconciliation', async (t) => {
  await t.test('Consolidated campus counts sum to 14,280 students across 6 campuses', async () => {
    const summaryRes = await metricsService.getDashboardSummary({ campusId: 'all' });
    assert.equal(summaryRes.success, true);
    assert.equal(summaryRes.campusCount, 6);
    assert.equal(summaryRes.summary.totalStudents, 14280);

    // Sum individually from mock list
    const sumStudents = MOCK_CAMPUSES.reduce((sum, c) => sum + c.studentCount, 0);
    assert.equal(sumStudents, 14280);
  });

  await t.test('Financial figures reconcile exactly: Net = Gross - Concessions', async () => {
    const summaryRes = await metricsService.getDashboardSummary({ campusId: 'all' });
    const s = summaryRes.summary;

    assert.equal(s.assessedFees, 974600000);   // ₹97.46 Cr
    assert.equal(s.concessions, 39900000);     // ₹3.99 Cr
    assert.equal(s.verifiedPayments, 886450000); // ₹88.645 Cr
    assert.equal(s.outstandingFees, 48250000);  // ₹4.825 Cr

    // Check accounting equation: Net Payable = Paid + Outstanding
    const netPayable = s.assessedFees - s.concessions; // 93,47,00,000
    assert.equal(netPayable, 934700000);
    assert.equal(s.verifiedPayments + s.outstandingFees, netPayable);

    // Collection rate: 88.645 / 93.47 = 94.8%
    assert.equal(s.collectionRate, 94.8);
  });

  await t.test('Hostel beds sum to 4,500 capacity and 3,840 occupied (85.3%)', async () => {
    const hostelsRes = await metricsService.getHostelsSummary({ campusId: 'all' });
    assert.equal(hostelsRes.success, true);
    assert.equal(hostelsRes.data.totalCapacity, 4500);
    assert.equal(hostelsRes.data.totalOccupied, 3840);
    assert.equal(hostelsRes.data.totalAvailable, 660);
    assert.equal(hostelsRes.data.occupancyRate, 85.3);
  });

  await t.test('Attendance risks sum to 488 students trust-wide', async () => {
    const attRes = await metricsService.getAttendanceRisks({ campusId: 'all' });
    assert.equal(attRes.success, true);
    assert.equal(attRes.data.totalRiskCount, 488);
    assert.equal(attRes.data.examEligibleCount, 14280 - 488);
  });
});

test('Single Campus (Principal Scope) Metrics', async (t) => {
  await t.test('Campus 1 Scope returns correct 4,120 students and single campus metrics', async () => {
    const summaryRes = await metricsService.getDashboardSummary({ campusId: 'campus-1' });
    assert.equal(summaryRes.success, true);
    assert.equal(summaryRes.campusCount, 1);
    assert.equal(summaryRes.summary.totalStudents, 4120);
    assert.equal(summaryRes.summary.assessedFees, 412000000);
    assert.equal(summaryRes.summary.concessions, 16500000);
    assert.equal(summaryRes.summary.verifiedPayments, 381500000);
    assert.equal(summaryRes.summary.outstandingFees, 14000000);
    assert.equal(summaryRes.summary.collectionRate, 96.5);
    assert.equal(summaryRes.summary.hostelCapacity, 1600);
    assert.equal(summaryRes.summary.hostelOccupied, 1480);
  });
});

test('Role-Based Campus Access Boundaries (Trustee vs Dean vs Principal)', async (t) => {
  await t.test('Trustee has full access to all 6 campuses and consolidated view', () => {
    const resAll = validateRoleCampusScope('TRUSTEE', 'all');
    assert.equal(resAll.allowed, true);
    assert.equal(resAll.isTrustWide, true);

    const resSingle = validateRoleCampusScope('TRUSTEE', 'campus-3');
    assert.equal(resSingle.allowed, true);
    assert.equal(resSingle.effectiveCampusId, 'campus-3');
  });

  await t.test('Dean is strictly restricted to their assigned campus', () => {
    // Accessing assigned campus is allowed
    const resAssigned = validateRoleCampusScope('DEAN', 'campus-2', 'campus-2');
    assert.equal(resAssigned.allowed, true);
    assert.equal(resAssigned.effectiveCampusId, 'campus-2');

    // Accessing 'all' or another campus defaults to or restricts to assigned campus
    const resAll = validateRoleCampusScope('DEAN', 'all', 'campus-2');
    assert.equal(resAll.allowed, true);
    assert.equal(resAll.effectiveCampusId, 'campus-2');

    // Attempting to access an unauthorized campus is rejected
    const resOther = validateRoleCampusScope('DEAN', 'campus-5', 'campus-2');
    assert.equal(resOther.allowed, false);
    assert.match(resOther.error, /restricted to assigned campus/);
  });

  await t.test('Principal is strictly restricted to their assigned campus', () => {
    // Accessing assigned campus is allowed
    const resAssigned = validateRoleCampusScope('PRINCIPAL', 'campus-1', 'campus-1');
    assert.equal(resAssigned.allowed, true);
    assert.equal(resAssigned.effectiveCampusId, 'campus-1');

    // Accessing 'all' defaults to assigned campus
    const resAll = validateRoleCampusScope('PRINCIPAL', 'all', 'campus-1');
    assert.equal(resAll.allowed, true);
    assert.equal(resAll.effectiveCampusId, 'campus-1');

    // Attempting to access an unauthorized campus is rejected
    const resOther = validateRoleCampusScope('PRINCIPAL', 'campus-4', 'campus-1');
    assert.equal(resOther.allowed, false);
    assert.match(resOther.error, /restricted to assigned campus/);
  });
});

