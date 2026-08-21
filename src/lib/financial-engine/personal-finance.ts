/**
 * Personal Finance Calculations
 * Pure deterministic functions for personal finance metrics.
 * Uses precision floating-point math, rounding only for final display/percentage formats.
 */

/**
 * Calculates the total net worth.
 * @param totalAssets Sum of all assets
 * @param totalLiabilities Sum of all liabilities
 * @returns Net worth
 */
export function calculateNetWorth(totalAssets: number, totalLiabilities: number): number {
  return totalAssets - totalLiabilities;
}

/**
 * Calculates the savings rate as a percentage (0 to 100).
 * Rounds to 2 decimal places.
 * @param monthlyIncome Total monthly income
 * @param monthlyExpenses Total monthly expenses
 * @returns Savings rate percentage
 */
export function calculateSavingsRate(monthlyIncome: number, monthlyExpenses: number): number {
  if (monthlyIncome <= 0) return 0;
  const rate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
  return Math.max(0, Math.min(100, Math.round(rate * 100) / 100));
}

/**
 * Calculates Debt-to-Income (DTI) ratio as a percentage.
 * @param monthlyDebtPayments Total monthly debt obligations (EMI, etc.)
 * @param monthlyIncome Total gross monthly income
 * @returns DTI percentage
 */
export function calculateDebtToIncomeRatio(monthlyDebtPayments: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) {
    return monthlyDebtPayments > 0 ? 100 : 0;
  }
  const ratio = (monthlyDebtPayments / monthlyIncome) * 100;
  return Math.round(ratio * 100) / 100;
}

/**
 * Calculates the emergency fund coverage in months.
 * @param liquidSavings Total liquid/cash savings
 * @param monthlyExpenses Total mandatory monthly expenses
 * @returns Number of months the savings can cover expenses
 */
export function calculateEmergencyFundCoverage(liquidSavings: number, monthlyExpenses: number): number {
  if (liquidSavings <= 0) return 0;
  if (monthlyExpenses <= 0) return Infinity; // Technically infinite if 0 expenses
  return Math.round((liquidSavings / monthlyExpenses) * 100) / 100;
}

/**
 * Calculates an expense ratio for a specific category against total income.
 * @param categoryExpense Expense amount for the category
 * @param monthlyIncome Total monthly income
 * @returns Percentage of income spent on the category
 */
export function calculateExpenseRatio(categoryExpense: number, monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 0;
  if (categoryExpense <= 0) return 0;
  const ratio = (categoryExpense / monthlyIncome) * 100;
  return Math.round(ratio * 100) / 100;
}

/**
 * Convenience method to sum an array of expense objects.
 */
export function calculateTotalExpenses(budgets: { limit: number }[]): number {
  return budgets.reduce((sum, b) => sum + Math.max(0, b.limit), 0);
}

/**
 * Format a number as Indian Rupee currency string.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a number with compact notation (e.g., 1.5L, 10K).
 */
export function formatCompact(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${Math.round(amount)}`;
}
