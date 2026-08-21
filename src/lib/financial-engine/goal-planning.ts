/**
 * Goal Planning Calculations
 * Pure deterministic functions for tracking and projecting financial goals.
 */

import { calculateRequiredSIP } from './investments';

/**
 * Calculates the percentage of the goal completed.
 * @param currentAmount Amount currently saved
 * @param targetAmount The target goal amount
 * @returns Progress as a percentage (0 to 100), rounded to 1 decimal place
 */
export function calculateGoalProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  if (currentAmount < 0) return 0;
  
  const rawProgress = (currentAmount / targetAmount) * 100;
  return Math.min(100, Math.round(rawProgress * 10) / 10);
}

/**
 * Calculates the exact amount remaining to reach the goal.
 */
export function calculateAmountRemaining(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return Math.max(0, targetAmount - Math.max(0, currentAmount));
}

/**
 * Calculates the number of months remaining until the deadline.
 * @param deadline The target date to complete the goal
 * @param fromDate Optional starting date (defaults to today)
 * @returns Number of full months remaining, or 0 if the deadline has passed
 */
export function calculateMonthsRemaining(deadline: Date, fromDate: Date = new Date()): number {
  const months = (deadline.getFullYear() - fromDate.getFullYear()) * 12 +
                 (deadline.getMonth() - fromDate.getMonth());
  return Math.max(0, months);
}

/**
 * Calculates the required monthly contribution to reach the target amount by the deadline.
 * If expectedReturn is provided (> 0), it factors in compounding growth (like an SIP).
 * Otherwise, it performs a simple linear division.
 * 
 * @param currentAmount Amount currently saved
 * @param targetAmount Target goal amount
 * @param deadline Target completion date
 * @param expectedAnnualReturn Optional expected return percentage (e.g., 8 for 8% returns)
 * @returns Required monthly investment amount, or null if no deadline is set or goal is already met
 */
export function calculateRequiredMonthlyContribution(
  currentAmount: number,
  targetAmount: number,
  deadline: Date | null,
  expectedAnnualReturn: number = 0
): number | null {
  const remaining = calculateAmountRemaining(currentAmount, targetAmount);
  if (remaining <= 0) return 0;
  if (!deadline) return null;

  const monthsRemaining = calculateMonthsRemaining(deadline);
  if (monthsRemaining <= 0) return remaining; // Due immediately

  if (expectedAnnualReturn <= 0) {
    // Simple division without compounding
    return remaining / monthsRemaining;
  }

  // With expected return, this is an SIP required calculation over the remaining years
  const yearsRemaining = monthsRemaining / 12;
  return calculateRequiredSIP(remaining, expectedAnnualReturn, yearsRemaining);
}

/**
 * Projects the date a goal will be completed given a fixed monthly contribution.
 * Does not factor in compound interest for simplicity (linear projection).
 * 
 * @param currentAmount Amount currently saved
 * @param targetAmount Target goal amount
 * @param monthlyContribution Amount saved per month
 * @returns A Date object representing the projected completion, or null if it's impossible
 */
export function calculateProjectedCompletion(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number
): Date | null {
  const remaining = calculateAmountRemaining(currentAmount, targetAmount);
  if (remaining <= 0) return new Date(); // Already complete
  if (monthlyContribution <= 0) return null; // Can't project if not contributing

  const monthsNeeded = Math.ceil(remaining / monthlyContribution);
  const projected = new Date();
  projected.setMonth(projected.getMonth() + monthsNeeded);
  return projected;
}
