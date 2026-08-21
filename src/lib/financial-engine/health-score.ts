/**
 * Financial Health Score Engine
 * 
 * Deterministic scoring system (0-100) based on real financial metrics.
 * Separated from UI for testability and reuse.
 * 
 * Scoring breakdown:
 * - Savings Rate:              0-25 pts
 * - Emergency Fund:            0-20 pts
 * - Debt Burden:               0-20 pts
 * - Investment Diversification: 0-15 pts
 * - Goal Progress:             0-20 pts
 * 
 * Total possible: 100 pts
 */

export type FactorStatus = 'excellent' | 'good' | 'fair' | 'warning' | 'danger';

export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  explanation: string;
  status: FactorStatus;
}

export interface HealthScoreResult {
  score: number;
  grade: string;
  gradeColor: string;
  factors: HealthFactor[];
}

function getStatus(ratio: number): FactorStatus {
  if (ratio >= 0.8) return 'excellent';
  if (ratio >= 0.6) return 'good';
  if (ratio >= 0.4) return 'fair';
  if (ratio >= 0.2) return 'warning';
  return 'danger';
}

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 85) return { grade: 'Excellent', color: 'text-emerald-500' };
  if (score >= 70) return { grade: 'Good', color: 'text-green-500' };
  if (score >= 50) return { grade: 'Fair', color: 'text-yellow-500' };
  if (score >= 30) return { grade: 'Needs Attention', color: 'text-orange-500' };
  return { grade: 'Critical', color: 'text-red-500' };
}

export function calculateHealthScore(params: {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;        // cash + savings accounts
  totalLiabilities: number;
  hasInvestments: boolean;
  investmentCount: number;      // number of distinct asset types
  goals: { currentAmount: number; targetAmount: number }[];
}): HealthScoreResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    totalLiabilities,
    hasInvestments,
    investmentCount,
    goals,
  } = params;

  const factors: HealthFactor[] = [];

  // 1. SAVINGS RATE (0-25 points)
  // Target: 20%+ of income saved = full marks
  const MAX_SAVINGS_RATE = 25;
  let savingsRateScore = 0;
  if (monthlyIncome > 0) {
    const savingsRate = (monthlyIncome - monthlyExpenses) / monthlyIncome;
    if (savingsRate >= 0.30) savingsRateScore = 25;
    else if (savingsRate >= 0.20) savingsRateScore = 20;
    else if (savingsRate >= 0.10) savingsRateScore = 15;
    else if (savingsRate >= 0.05) savingsRateScore = 10;
    else if (savingsRate > 0) savingsRateScore = 5;
    else savingsRateScore = 0;
  }
  factors.push({
    name: 'Savings Rate',
    score: savingsRateScore,
    maxScore: MAX_SAVINGS_RATE,
    percentage: Math.round((savingsRateScore / MAX_SAVINGS_RATE) * 100),
    explanation: savingsRateScore >= 20
      ? 'Great savings habits! You\'re saving a healthy portion of your income.'
      : savingsRateScore >= 10
        ? 'Decent savings rate. Try to increase it to 20% for better financial health.'
        : 'Your savings rate needs improvement. Aim to save at least 10% of your income.',
    status: getStatus(savingsRateScore / MAX_SAVINGS_RATE),
  });

  // 2. EMERGENCY FUND (0-20 points)
  // Target: 6+ months of expenses in savings
  const MAX_EMERGENCY = 20;
  let emergencyScore = 0;
  if (monthlyExpenses > 0) {
    const monthsCovered = totalSavings / monthlyExpenses;
    if (monthsCovered >= 6) emergencyScore = 20;
    else if (monthsCovered >= 3) emergencyScore = 15;
    else if (monthsCovered >= 1) emergencyScore = 10;
    else if (monthsCovered > 0) emergencyScore = 5;
    else emergencyScore = 0;
  } else if (totalSavings > 0) {
    emergencyScore = 15; // Has savings but no expenses to measure against
  }
  factors.push({
    name: 'Emergency Fund',
    score: emergencyScore,
    maxScore: MAX_EMERGENCY,
    percentage: Math.round((emergencyScore / MAX_EMERGENCY) * 100),
    explanation: emergencyScore >= 15
      ? 'Solid emergency fund. You\'re well-prepared for unexpected expenses.'
      : emergencyScore >= 10
        ? 'You have some emergency cushion. Aim for 6 months of expenses.'
        : 'Building an emergency fund should be a priority. Target 3-6 months of expenses.',
    status: getStatus(emergencyScore / MAX_EMERGENCY),
  });

  // 3. DEBT BURDEN (0-20 points)
  // Lower debt-to-income ratio = higher score
  const MAX_DEBT = 20;
  let debtScore = 0;
  if (totalLiabilities === 0) {
    debtScore = 20; // No debt = perfect score
  } else if (monthlyIncome > 0) {
    const annualIncome = monthlyIncome * 12;
    const debtRatio = totalLiabilities / annualIncome;
    if (debtRatio <= 0.1) debtScore = 18;
    else if (debtRatio <= 0.3) debtScore = 14;
    else if (debtRatio <= 0.5) debtScore = 10;
    else if (debtRatio <= 1.0) debtScore = 5;
    else debtScore = 2;
  }
  factors.push({
    name: 'Debt Burden',
    score: debtScore,
    maxScore: MAX_DEBT,
    percentage: Math.round((debtScore / MAX_DEBT) * 100),
    explanation: debtScore >= 18
      ? 'Minimal or no debt. Excellent financial position!'
      : debtScore >= 10
        ? 'Manageable debt levels. Keep working on reducing them.'
        : 'High debt burden. Focus on a debt payoff strategy.',
    status: getStatus(debtScore / MAX_DEBT),
  });

  // 4. INVESTMENT DIVERSIFICATION (0-15 points)
  const MAX_INVEST = 15;
  let investScore = 0;
  if (!hasInvestments) {
    investScore = 0;
  } else if (investmentCount >= 3) {
    investScore = 15;
  } else if (investmentCount >= 2) {
    investScore = 10;
  } else {
    investScore = 6;
  }
  factors.push({
    name: 'Investments',
    score: investScore,
    maxScore: MAX_INVEST,
    percentage: Math.round((investScore / MAX_INVEST) * 100),
    explanation: investScore >= 10
      ? 'Good investment activity. Diversification helps manage risk.'
      : investScore > 0
        ? 'You\'ve started investing! Consider diversifying across asset classes.'
        : 'No investments yet. Consider starting with low-risk options like mutual funds.',
    status: getStatus(investScore / MAX_INVEST),
  });

  // 5. GOAL PROGRESS (0-20 points)
  const MAX_GOALS = 20;
  let goalScore = 0;
  if (goals.length === 0) {
    goalScore = 5; // At least they have a plan mindset (they went through onboarding)
  } else {
    const avgProgress =
      goals.reduce((sum, g) => {
        const progress = g.targetAmount > 0 ? g.currentAmount / g.targetAmount : 0;
        return sum + Math.min(1, progress);
      }, 0) / goals.length;
    goalScore = Math.round(avgProgress * 20);
  }
  factors.push({
    name: 'Goal Progress',
    score: goalScore,
    maxScore: MAX_GOALS,
    percentage: Math.round((goalScore / MAX_GOALS) * 100),
    explanation: goalScore >= 15
      ? 'Excellent progress toward your financial goals!'
      : goalScore >= 8
        ? 'Making steady progress. Keep contributing regularly.'
        : goals.length === 0
          ? 'Set some financial goals to track your progress.'
          : 'Just getting started with your goals. Every contribution counts!',
    status: getStatus(goalScore / MAX_GOALS),
  });

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const { grade, color } = getGrade(totalScore);

  return {
    score: totalScore,
    grade,
    gradeColor: color,
    factors,
  };
}
