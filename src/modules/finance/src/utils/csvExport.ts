/**
 * Utility to export an array of tabular objects into a clean CSV file download
 */

export function exportToCSV<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): void {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  let csvContent = '';

  if (headers && headers.length > 0) {
    // Custom headers
    const headerRow = headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(',');
    csvContent += headerRow + '\r\n';

    rows.forEach(row => {
      const line = headers.map(h => {
        const val = row[h.key];
        const strVal = val === null || val === undefined ? '' : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });
  } else {
    // Automatic headers from keys of first object
    const keys = Object.keys(rows[0]) as (keyof T)[];
    const headerRow = keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(',');
    csvContent += headerRow + '\r\n';

    rows.forEach(row => {
      const line = keys.map(k => {
        const val = row[k];
        const strVal = val === null || val === undefined ? '' : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
