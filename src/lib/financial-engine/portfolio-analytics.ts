/**
 * Portfolio Analytics Calculations
 * Pure deterministic functions for analyzing asset allocation and returns.
 */

export interface AssetPosition {
  id: string;
  name: string;
  category: string;
  investedAmount: number;
  currentValue: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalReturnPercentage: number;
  allocations: AllocationSummary[];
}

export interface AllocationSummary {
  category: string;
  value: number;
  weightPercentage: number;
}

/**
 * Calculates the total Return on Investment (ROI) percentage.
 */
export function calculateTotalROI(investedAmount: number, currentValue: number): number {
  if (investedAmount <= 0) return 0;
  const roi = ((currentValue - investedAmount) / investedAmount) * 100;
  return Math.round(roi * 100) / 100;
}

/**
 * Analyzes a list of asset positions to generate a complete portfolio summary.
 * Calculates total values, gains, and groups by category for asset allocation weights.
 * 
 * @param positions Array of individual asset positions
 * @returns PortfolioSummary containing totals and allocation weights
 */
export function analyzePortfolio(positions: AssetPosition[]): PortfolioSummary {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  const categoryMap = new Map<string, number>();

  // Aggregate totals and group by category
  for (const pos of positions) {
    if (pos.investedAmount < 0 || pos.currentValue < 0) continue; // Skip invalid entries
    
    totalInvested += pos.investedAmount;
    totalCurrentValue += pos.currentValue;

    const currentCategoryTotal = categoryMap.get(pos.category) || 0;
    categoryMap.set(pos.category, currentCategoryTotal + pos.currentValue);
  }

  // Calculate overall metrics
  const totalGainLoss = totalCurrentValue - totalInvested;
  const totalReturnPercentage = calculateTotalROI(totalInvested, totalCurrentValue);

  // Calculate allocation weights
  const allocations: AllocationSummary[] = [];
  categoryMap.forEach((value, category) => {
    let weightPercentage = 0;
    if (totalCurrentValue > 0) {
      weightPercentage = (value / totalCurrentValue) * 100;
    }
    
    allocations.push({
      category,
      value,
      weightPercentage: Math.round(weightPercentage * 100) / 100,
    });
  });

  // Sort allocations largest to smallest
  allocations.sort((a, b) => b.weightPercentage - a.weightPercentage);

  return {
    totalInvested,
    totalCurrentValue,
    totalGainLoss,
    totalReturnPercentage,
    allocations,
  };
}

/**
 * Convenience function to just get the weight of a single value against a total.
 */
export function calculatePortfolioWeight(value: number, totalPortfolioValue: number): number {
  if (totalPortfolioValue <= 0 || value <= 0) return 0;
  const weight = (value / totalPortfolioValue) * 100;
  return Math.round(weight * 100) / 100;
}
