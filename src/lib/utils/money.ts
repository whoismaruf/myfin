import { Decimal } from 'decimal.js';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

export function getCurrencySymbol(currency: string = 'BDT'): string {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
}

/**
 * Formats a monetary value with locale commas and 2 decimal places.
 * Example: 1240500.5 -> "৳ 1,240,500.50"
 */
export function formatCurrency(
  amount: number | string | Decimal | null | undefined,
  currency: string = 'BDT',
  includeSymbol: boolean = true
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    amount = 0;
  }

  const num = typeof amount === 'number' ? amount : Number(amount.toString());
  const symbol = includeSymbol ? `${getCurrencySymbol(currency)} ` : '';

  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));

  return `${num < 0 ? '-' : ''}${symbol}${formattedNum}`;
}

/**
 * Formats signed currency with explicit '+' or '-' sign.
 * Example: +৳ 50,000.00 or -৳ 2,500.00
 */
export function formatSignedCurrency(
  amount: number | string | Decimal | null | undefined,
  currency: string = 'BDT'
): string {
  const num = amount ? Number(amount.toString()) : 0;
  const symbol = getCurrencySymbol(currency);
  const formattedNum = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));

  if (num > 0) return `+${symbol} ${formattedNum}`;
  if (num < 0) return `-${symbol} ${formattedNum}`;
  return `${symbol} 0.00`;
}

/**
 * Safe conversion to Decimal number
 */
export function toDecimalNumber(val: any): number {
  if (!val) return 0;
  try {
    return new Decimal(val.toString()).toNumber();
  } catch {
    return 0;
  }
}
