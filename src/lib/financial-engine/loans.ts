/**
 * Loan Calculations
 * Pure deterministic functions for loan amortization, EMI, and interest breakdown.
 */

export interface AmortizationRow {
  month: number;
  emi: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

export interface LoanSummary {
  emi: number;
  totalInterest: number;
  totalPayment: number;
  schedule: AmortizationRow[];
}

/**
 * Calculates the Equated Monthly Installment (EMI) for a loan.
 * Formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * Where:
 * P = Principal loan amount
 * r = Monthly interest rate (Annual Rate / 12 / 100)
 * n = Tenure in months
 * 
 * @param principal The total loan amount
 * @param annualRate Annual interest rate (percentage, e.g., 8.5 for 8.5%)
 * @param tenureMonths Loan duration in months
 * @returns The fixed monthly EMI amount
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return principal / tenureMonths;

  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return emi;
}

/**
 * Generates a full amortization schedule for a loan, including total interest.
 * 
 * @param principal The total loan amount
 * @param annualRate Annual interest rate (percentage)
 * @param tenureMonths Loan duration in months
 * @returns A summary object containing the EMI, total interest, and the month-by-month schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number
): LoanSummary {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const schedule: AmortizationRow[] = [];
  
  if (principal <= 0 || tenureMonths <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
  }

  let remainingBalance = principal;
  let totalInterest = 0;
  const monthlyRate = annualRate / 12 / 100;

  for (let month = 1; month <= tenureMonths; month++) {
    // If rate is 0, interest is 0, principal payment is just EMI
    const interestPayment = annualRate === 0 ? 0 : remainingBalance * monthlyRate;
    let principalPayment = emi - interestPayment;

    // Handle rounding issues on the final month
    if (month === tenureMonths) {
      principalPayment = remainingBalance;
    }

    remainingBalance -= principalPayment;
    // Prevent negative -0 due to floating point math
    if (remainingBalance < 0.01) remainingBalance = 0;

    totalInterest += interestPayment;

    schedule.push({
      month,
      emi,
      principalPayment,
      interestPayment,
      remainingBalance,
    });
  }

  return {
    emi,
    totalInterest,
    totalPayment: principal + totalInterest,
    schedule,
  };
}
