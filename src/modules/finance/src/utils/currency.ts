/**
 * Currency utilities for Indian Rupee (INR) formatting and monetary calculation
 */

export function formatINR(amount: number, options: { compact?: boolean; showDecimals?: boolean } = {}): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const { compact = false, showDecimals = false } = options;

  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}₹${(abs / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `${sign}₹${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Format with standard Indian Numbering system (e.g., 12,34,567.00)
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  });

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function parseRupeeToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function parsePaiseToRupee(paise: number): number {
  return Math.round(paise) / 100;
}
