/**
 * TrustView ERP - Calculation & Formatting Utilities
 * Standardized financial, hostel, student count, and CSV formatting methods.
 */

/**
 * Format raw number to Indian Rupee (INR) currency representation.
 * @param {number} amount In numeric INR
 * @param {boolean} compact If true, shows in Lakhs/Crores (e.g. ₹4.82 Cr)
 * @returns {string}
 */
export function formatINR(amount, compact = false) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  const num = Number(amount);

  if (compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)} K`;
    }
  }

  // Full standard Indian Currency Formatting (e.g., ₹4,82,50,000)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

/**
 * Format number with Indian comma grouping
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(num));
}

/**
 * Calculate hostel occupancy percentage safely
 * Occupancy percentage = (occupied beds / total capacity) * 100
 * @param {number} occupied
 * @param {number} capacity
 * @returns {number} 0-100 float rounded to 1 decimal place
 */
export function calculateOccupancyPercentage(occupied, capacity) {
  const cap = Number(capacity) || 0;
  const occ = Number(occupied) || 0;
  if (cap <= 0) return 0;
  const pct = (occ / cap) * 100;
  return Math.min(100, Math.max(0, Number(pct.toFixed(1))));
}

/**
 * Calculate fee recovery rate % = verified payments / (assessed - concessions) * 100
 */
export function calculateCollectionRate(verifiedPayments, assessedFees, concessions = 0) {
  const netDue = (Number(assessedFees) || 0) - (Number(concessions) || 0);
  if (netDue <= 0) return 0;
  const pct = ((Number(verifiedPayments) || 0) / netDue) * 100;
  return Math.min(100, Math.max(0, Number(pct.toFixed(1))));
}

/**
 * Aggregate summary metrics across a list of campus records
 * @param {Array} campuses
 * @returns {Object}
 */
export function aggregateCampusMetrics(campuses = []) {
  return campuses.reduce(
    (acc, c) => {
      acc.totalStudents += Number(c.studentCount) || 0;
      acc.totalAssessedFees += Number(c.assessedFees) || 0;
      acc.totalConcessions += Number(c.concessions) || 0;
      acc.totalVerifiedPayments += Number(c.verifiedPayments) || 0;
      acc.totalOutstandingFees += Number(c.outstandingFees) || 0;
      acc.totalHostelCapacity += Number(c.hostelCapacity) || 0;
      acc.totalHostelOccupied += Number(c.hostelOccupied) || 0;
      acc.totalAttendanceRisks += Number(c.attendanceRiskCount) || 0;
      acc.totalOpenExceptions += Number(c.openExceptionCount) || 0;
      acc.totalSpreadsheetsActive += Number(c.spreadsheetsActive) || 0;
      acc.totalSpreadsheetsVerified += Number(c.spreadsheetsVerified) || 0;
      return acc;
    },
    {
      totalStudents: 0,
      totalAssessedFees: 0,
      totalConcessions: 0,
      totalVerifiedPayments: 0,
      totalOutstandingFees: 0,
      totalHostelCapacity: 0,
      totalHostelOccupied: 0,
      totalAttendanceRisks: 0,
      totalOpenExceptions: 0,
      totalSpreadsheetsActive: 0,
      totalSpreadsheetsVerified: 0
    }
  );
}

/**
 * Escape and export a dataset as CSV file download
 * @param {Array<Object>} rows Array of row objects
 * @param {Array<{key: string, label: string}>} columns Ordered columns to export
 * @param {string} filename Output file name
 */
export function exportToCSV(rows, columns, filename = 'trustview-export.csv') {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = columns.map(col => escapeCSV(col.label)).join(',');
  const dataRows = rows.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (typeof col.formatter === 'function') {
        val = col.formatter(val, row);
      }
      return escapeCSV(val);
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n'); // Include UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
