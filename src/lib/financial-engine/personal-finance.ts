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
 * Format a number as a currency string.
 * Supports INR (base) and USD (converted at 83 INR = 1 USD).
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const rate = 83; // Fixed conversion rate: 1 USD = 83 INR
  const displayAmount = currency === 'USD' ? amount / rate : amount;

  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(displayAmount);
}

/**
 * Format a number with compact notation (e.g., 1.5L, 10K or $10K, $1.5M).
 */
export function formatCompact(amount: number, currency: string = 'INR'): string {
  const rate = 83;
  const displayAmount = currency === 'USD' ? amount / rate : amount;
  const absDisplayAmount = Math.abs(displayAmount);

  if (currency === 'USD') {
    if (absDisplayAmount >= 1000000) {
      return `$${(displayAmount / 1000000).toFixed(1)}M`;
    }
    if (absDisplayAmount >= 1000) {
      return `$${(displayAmount / 1000).toFixed(1)}K`;
    }
    return `$${Math.round(displayAmount)}`;
  } else {
    if (absDisplayAmount >= 10000000) {
      return `₹${(displayAmount / 10000000).toFixed(1)}Cr`;
    }
    if (absDisplayAmount >= 100000) {
      return `₹${(displayAmount / 100000).toFixed(1)}L`;
    }
    if (absDisplayAmount >= 1000) {
      return `₹${(displayAmount / 1000).toFixed(1)}K`;
    }
    return `₹${Math.round(displayAmount)}`;
  }
}
