export type CompoundFrequency = 'SIMPLE' | 'MONTHLY' | 'QUARTERLY' | 'AT_MATURITY';

export interface FDRCalculationResult {
  principal: number;
  interestRate: number;
  tenureMonths: number;
  maturityValue: number;
  totalInterest: number;
  daysRemaining: number;
  progressPercent: number;
  isMatured: boolean;
  isNearingMaturity: boolean; // within 30 days
}

/**
 * Calculates interest, maturity value, and tenure progress for Fixed Deposits.
 */
export function calculateFDR(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  openDate: Date | string,
  maturityDate: Date | string,
  compoundFrequency: CompoundFrequency = 'SIMPLE'
): FDRCalculationResult {
  const p = Number(principal);
  const r = Number(annualRatePercent) / 100;
  const t = Number(tenureMonths) / 12;

  let maturityValue = p;

  if (compoundFrequency === 'SIMPLE') {
    maturityValue = p * (1 + r * t);
  } else if (compoundFrequency === 'MONTHLY') {
    const n = 12;
    maturityValue = p * Math.pow(1 + r / n, n * t);
  } else if (compoundFrequency === 'QUARTERLY') {
    const n = 4;
    maturityValue = p * Math.pow(1 + r / n, n * t);
  } else {
    // AT_MATURITY simple compound
    maturityValue = p * (1 + r * t);
  }

  // Round to 2 decimal places
  maturityValue = Math.round(maturityValue * 100) / 100;
  const totalInterest = Math.round((maturityValue - p) * 100) / 100;

  const now = new Date().getTime();
  const start = new Date(openDate).getTime();
  const end = new Date(maturityDate).getTime();

  const totalDuration = Math.max(1, end - start);
  const elapsed = Math.max(0, now - start);

  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  const isMatured = now >= end;
  const isNearingMaturity = !isMatured && daysRemaining <= 30;

  return {
    principal: p,
    interestRate: Number(annualRatePercent),
    tenureMonths,
    maturityValue,
    totalInterest,
    daysRemaining,
    progressPercent,
    isMatured,
    isNearingMaturity,
  };
}
