/**
 * Investment Calculations
 * Pure deterministic functions for investment growth, interest, and SIPs.
 */

/**
 * Calculates Simple Interest.
 * @param principal Initial investment amount
 * @param annualRate Annual interest rate (percentage, e.g., 10 for 10%)
 * @param years Time period in years
 * @returns The total interest earned
 */
export function calculateSimpleInterest(principal: number, annualRate: number, years: number): number {
  if (principal < 0 || years < 0) return 0;
  return (principal * annualRate * years) / 100;
}

/**
 * Calculates Compound Interest (Future Value of a lump sum).
 * Formula: A = P(1 + r/n)^(nt)
 * @param principal Initial investment amount
 * @param annualRate Annual interest rate (percentage, e.g., 10 for 10%)
 * @param years Time period in years
 * @param compoundingFrequency Times interest is compounded per year (default: 1 for annual)
 * @returns Total future value (Principal + Interest)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: number = 1
): number {
  if (principal < 0 || years < 0 || compoundingFrequency <= 0) return principal > 0 ? principal : 0;
  const r = annualRate / 100;
  const n = compoundingFrequency;
  const amount = principal * Math.pow(1 + r / n, n * years);
  return amount; // We leave rounding to the display layer or caller if needed
}

/**
 * Calculates the Compound Annual Growth Rate (CAGR).
 * Formula: CAGR = (Final Value / Initial Value)^(1 / Years) - 1
 * @param initialValue Starting value of investment
 * @param finalValue Ending value of investment
 * @param years Time period in years
 * @returns CAGR as a percentage (e.g., 12.5 for 12.5%)
 */
export function calculateCAGR(initialValue: number, finalValue: number, years: number): number {
  if (initialValue <= 0 || finalValue <= 0 || years <= 0) return 0;
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  return Math.round(cagr * 100) / 100;
}

/**
 * Calculates the Future Value of a Systematic Investment Plan (SIP).
 * This assumes investments are made at the *beginning* or *end* of each period.
 * Standard Indian SIPs are typically calculated assuming start-of-month (annuity due)
 * or end-of-month (ordinary annuity). We default to end-of-month.
 * 
 * Formula (End of month): FV = P × {[(1 + r)^n - 1] / r} × (1 + r)
 * Where:
 * P = SIP amount
 * r = monthly interest rate (annualRate / 12 / 100)
 * n = total number of months (years * 12)
 * 
 * @param monthlyInvestment Amount invested each month
 * @param expectedAnnualReturn Expected annual return (percentage, e.g., 12 for 12%)
 * @param years Time period in years
 * @returns Total future value
 */
export function calculateSIPFutureValue(
  monthlyInvestment: number,
  expectedAnnualReturn: number,
  years: number
): number {
  if (monthlyInvestment <= 0 || years <= 0) return 0;
  if (expectedAnnualReturn === 0) return monthlyInvestment * years * 12;

  const r = expectedAnnualReturn / 100 / 12; // monthly rate
  const n = years * 12; // total months

  // Future Value of an Annuity formula (assuming investment at end of month)
  // Standard Indian mutual fund calculators typically use (1+r) at the end if invested at start of month
  // We will use the start-of-month formula (Annuity Due) which is common for SIPs.
  const fv = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fv;
}

/**
 * Calculates the required monthly SIP to reach a target amount.
 * Reverse of SIP Future Value.
 * 
 * @param targetAmount The goal amount to reach
 * @param expectedAnnualReturn Expected annual return (percentage)
 * @param years Time period in years
 * @returns Required monthly investment amount
 */
export function calculateRequiredSIP(
  targetAmount: number,
  expectedAnnualReturn: number,
  years: number
): number {
  if (targetAmount <= 0 || years <= 0) return 0;
  if (expectedAnnualReturn === 0) return targetAmount / (years * 12);

  const r = expectedAnnualReturn / 100 / 12;
  const n = years * 12;

  // Reverse of the Annuity Due formula
  const requiredSIP = targetAmount / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  return requiredSIP;
}
