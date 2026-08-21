import { prisma } from '@/lib/prisma';
import {
  calculateNetWorth,
  calculateTotalExpenses,
  calculateSavingsRate,
  calculateDebtToIncomeRatio,
  calculateHealthScore,
  analyzePortfolio,
  calculateGoalProgress,
  calculateProjectedCompletion,
} from '@/lib/financial-engine';

export async function buildFinancialContext(userId: string): Promise<string> {
  // 1. Fetch all relevant user data securely from the database
  const [profile, bankAccounts, assets, liabilities, goals, budgets] = await Promise.all([
    prisma.profile.findUnique({ where: { userId }, include: { user: { select: { name: true } } } }),
    prisma.bankAccount.findMany({ where: { userId, isActive: true } }),
    prisma.asset.findMany({ where: { userId } }),
    prisma.liability.findMany({ where: { userId } }),
    prisma.financialGoal.findMany({ where: { userId, status: 'ACTIVE' } }),
    prisma.budget.findMany({ where: { userId, isActive: true } }),
  ]);

  if (!profile) {
    return 'The user has not completed their financial profile onboarding yet.';
  }

  // 2. Aggregate Data using the pure Financial Engine
  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalAssetsValue = totalBankBalance + assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = calculateNetWorth(totalAssetsValue, totalLiabilitiesValue);

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlyExpenses = calculateTotalExpenses(budgets);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

  // Health Score
  const totalSavings = totalBankBalance + assets.filter(a => a.category === 'CASH_EQUIVALENT').reduce((sum, a) => sum + a.value, 0);
  const hasInvestments = assets.some(a => a.category === 'INVESTMENT');
  const investmentCount = assets.filter(a => a.category === 'INVESTMENT').length;

  const healthScore = calculateHealthScore({
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    totalLiabilities: totalLiabilitiesValue,
    hasInvestments,
    investmentCount,
    goals: goals.map(g => ({ currentAmount: g.currentAmount, targetAmount: g.targetAmount })),
  });

  // Portfolio Analytics
  const positions = assets.map(a => ({
    id: a.id,
    name: a.name,
    category: a.category,
    investedAmount: a.value, // Simplified: assuming current value = invested for context
    currentValue: a.value,
  }));
  const portfolio = analyzePortfolio(positions);

  // 3. Format into a strict structured text string (Markdown/YAML)
  const context = `
=== USER FINANCIAL CONTEXT ===
DO NOT expose exact bank account IDs or sensitive PII.

Profile:
- Name: ${profile.user.name}
- Age: ${profile.age}
- Occupation: ${profile.occupation}

Cash Flow (Monthly):
- Total Income: ₹${monthlyIncome}
- Total Expenses: ₹${monthlyExpenses}
- Savings Rate: ${savingsRate}%
- Saving Capacity: ₹${monthlySavingCapacity}

Balance Sheet:
- Total Assets: ₹${totalAssetsValue}
- Total Liabilities: ₹${totalLiabilitiesValue}
- Net Worth: ₹${netWorth}
- Debt-to-Income Ratio (Annualized): ${calculateDebtToIncomeRatio(totalLiabilitiesValue / 12, monthlyIncome)}%

Health Score:
- Score: ${healthScore.score}/100 (${healthScore.grade})
- Key Weaknesses: ${healthScore.factors.filter(f => f.percentage < 50).map(f => f.name).join(', ') || 'None'}

Portfolio Allocation:
${portfolio.allocations.map(a => `- ${a.category}: ${a.weightPercentage}% (₹${a.value})`).join('\n') || '- No portfolio assets.'}

Active Goals:
${goals.map(g => {
  const progress = calculateGoalProgress(g.currentAmount, g.targetAmount);
  const projected = calculateProjectedCompletion(g.currentAmount, g.targetAmount, monthlySavingCapacity);
  return `- ${g.name}: ₹${g.currentAmount} / ₹${g.targetAmount} (${progress}% completed). Projected completion: ${projected ? projected.toLocaleDateString() : 'Unknown'}`;
}).join('\n') || '- No active goals.'}

Top Budgets:
${budgets.sort((a, b) => b.limit - a.limit).slice(0, 3).map(b => `- ${b.category}: ₹${b.limit}`).join('\n') || '- No budgets set.'}
==============================
`;

  return context;
}
