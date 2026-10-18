import { connectDB } from '@/lib/mongoose';
import { Profile, BankAccount, Asset, Liability, FinancialGoal, Budget } from '@/lib/models';
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
import mongoose from 'mongoose';

export async function buildFinancialContext(userId: string): Promise<string> {
  await connectDB();

  // Fetch user name from the users collection managed by Auth.js adapter
  const db = mongoose.connection.db;
  let userName = 'User';
  if (db) {
    try {
      const userDoc = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { name: 1 } }
      );
      userName = (userDoc?.name as string) ?? 'User';
    } catch {
      // ignore ObjectId parse errors
    }
  }

  const [profile, bankAccounts, assets, liabilities, goals, budgets] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    BankAccount.find({ userId, isActive: true }).lean(),
    Asset.find({ userId }).lean(),
    Liability.find({ userId }).lean(),
    FinancialGoal.find({ userId, status: 'ACTIVE' }).lean(),
    Budget.find({ userId, isActive: true }).lean(),
  ]);

  if (!profile) {
    return 'The user has not completed their financial profile onboarding yet.';
  }

  // Aggregate Data using the pure Financial Engine
  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalAssetsValue = totalBankBalance + assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilitiesValue = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const netWorth = calculateNetWorth(totalAssetsValue, totalLiabilitiesValue);

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlyExpenses = calculateTotalExpenses(budgets);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

  const totalSavings =
    totalBankBalance +
    assets
      .filter((a) => a.category === 'CASH_EQUIVALENT')
      .reduce((sum, a) => sum + a.value, 0);
  const hasInvestments = assets.some((a) => a.category === 'INVESTMENT');
  const investmentCount = assets.filter((a) => a.category === 'INVESTMENT').length;

  const healthScore = calculateHealthScore({
    monthlyIncome,
    monthlyExpenses,
    totalSavings,
    totalLiabilities: totalLiabilitiesValue,
    hasInvestments,
    investmentCount,
    goals: goals.map((g) => ({ currentAmount: g.currentAmount, targetAmount: g.targetAmount })),
  });

  const positions = assets.map((a) => ({
    id: a._id.toString(),
    name: a.name,
    category: a.category,
    investedAmount: a.value,
    currentValue: a.value,
  }));
  const portfolio = analyzePortfolio(positions);

  const context = `
=== USER FINANCIAL CONTEXT ===
DO NOT expose exact bank account IDs or sensitive PII.

Profile:
- Name: ${userName}
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
- Key Weaknesses: ${healthScore.factors.filter((f) => f.percentage < 50).map((f) => f.name).join(', ') || 'None'}

Portfolio Allocation:
${portfolio.allocations.map((a) => `- ${a.category}: ${a.weightPercentage}% (₹${a.value})`).join('\n') || '- No portfolio assets.'}

Active Goals:
${
  goals
    .map((g) => {
      const progress = calculateGoalProgress(g.currentAmount, g.targetAmount);
      const projected = calculateProjectedCompletion(
        g.currentAmount,
        g.targetAmount,
        monthlySavingCapacity
      );
      return `- ${g.name}: ₹${g.currentAmount} / ₹${g.targetAmount} (${progress}% completed). Projected completion: ${projected ? projected.toLocaleDateString() : 'Unknown'}`;
    })
    .join('\n') || '- No active goals.'
}

Top Budgets:
${
  budgets
    .sort((a, b) => b.limit - a.limit)
    .slice(0, 3)
    .map((b) => `- ${b.category}: ₹${b.limit}`)
    .join('\n') || '- No budgets set.'
}
==============================
`;

  return context;
}
