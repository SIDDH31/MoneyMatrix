import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile, BankAccount, Asset, Liability, FinancialGoal, Budget, RiskProfile, AIInsight } from '@/lib/models';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

import { DashboardHeader } from '@/components/dashboard/header';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { NetWorthChart } from '@/components/dashboard/net-worth-chart';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { ExpenseAnalysis } from '@/components/dashboard/expense-analysis';
import { HealthScoreDisplay } from '@/components/dashboard/health-score';
import { GoalsSection } from '@/components/dashboard/goals-section';
import { AIInsights } from '@/components/dashboard/ai-insights';

import {
  calculateHealthScore,
  calculateTotalExpenses,
  calculateSavingsRate,
} from '@/lib/financial-engine';
import mongoose from 'mongoose';

export const metadata: Metadata = {
  title: 'Dashboard | MoneyMatrix',
  description: 'Your financial command center',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  await connectDB();

  // Fetch all data in parallel
  const [profile, bankAccounts, assets, liabilities, goals, budgets, riskProfile, aiInsights] =
    await Promise.all([
      Profile.findOne({ userId })
        .populate({ path: 'user', model: 'User', localField: 'userId', foreignField: '_id', justOne: true })
        .lean(),
      BankAccount.find({ userId, isActive: true }).lean(),
      Asset.find({ userId }).lean(),
      Liability.find({ userId }).lean(),
      FinancialGoal.find({ userId }).sort({ createdAt: -1 }).lean(),
      Budget.find({ userId, isActive: true }).lean(),
      RiskProfile.findOne({ userId }).lean(),
      AIInsight.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  // If no profile, redirect to onboarding
  if (!profile) {
    redirect('/onboarding');
  }

  // Fetch user name separately (Auth.js stores in 'users' collection)
  const db = mongoose.connection.db;
  let userName: string | null = null;
  if (db) {
    try {
      const userDoc = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { name: 1 } }
      );
      userName = (userDoc?.name as string) ?? null;
    } catch {
      // userId may not be an ObjectId in some adapter versions
    }
  }

  // ─── Compute derived values ───────────────────────────
  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalInvestments = assets
    .filter((a) => a.category === 'INVESTMENT')
    .reduce((sum, a) => sum + a.value, 0);
  const totalSavings = assets
    .filter((a) => a.category === 'CASH_EQUIVALENT')
    .reduce((sum, a) => sum + a.value, 0);
  const totalOtherAssets = assets
    .filter((a) => !['INVESTMENT', 'CASH_EQUIVALENT'].includes(a.category))
    .reduce((sum, a) => sum + a.value, 0);
  const totalAssetValue = totalBankBalance + assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilityValue = liabilities.reduce((sum, l) => sum + l.amount, 0);

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlyExpenses = calculateTotalExpenses(budgets);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

  // ─── Health score ─────────────────────────────────────
  const healthScore = calculateHealthScore({
    monthlyIncome,
    monthlyExpenses,
    totalSavings: totalSavings + totalBankBalance,
    totalLiabilities: totalLiabilityValue,
    hasInvestments: totalInvestments > 0,
    investmentCount: assets.filter((a) => a.category === 'INVESTMENT').length,
    goals: goals.map((g) => ({
      currentAmount: g.currentAmount,
      targetAmount: g.targetAmount,
    })),
  });

  // ─── Budget breakdown for charts ──────────────────────
  const budgetBreakdown = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
  }));

  // Serialize Mongoose docs for passing to Client Components
  const serializedGoals = goals.map((g) => ({
    ...g,
    _id: g._id.toString(),
    id: g._id.toString(),
    deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
    createdAt: (g.createdAt ? new Date(g.createdAt) : new Date()).toISOString(),
    updatedAt: (g.updatedAt ? new Date(g.updatedAt) : new Date()).toISOString(),
  }));

  const serializedAiInsights = aiInsights.map((i) => ({
    ...i,
    _id: i._id.toString(),
    id: i._id.toString(),
    createdAt: (i.createdAt ? new Date(i.createdAt) : new Date()).toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader userName={userName} />

      {/* Overview Cards */}
      <OverviewCards
        totalAssets={totalAssetValue}
        totalLiabilities={totalLiabilityValue}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NetWorthChart
          totalAssets={totalAssetValue}
          totalLiabilities={totalLiabilityValue}
          bankBalance={totalBankBalance}
          investments={totalInvestments}
          savings={totalSavings}
          otherAssets={totalOtherAssets}
        />
        <CashFlowChart
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
        />
      </div>

      {/* Analysis Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ExpenseAnalysis budgets={budgetBreakdown} />
        <HealthScoreDisplay result={healthScore} />
      </div>

      {/* Goals & Insights Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GoalsSection goals={serializedGoals as Parameters<typeof GoalsSection>[0]['goals']} monthlySavingCapacity={monthlySavingCapacity} />
        <AIInsights
          dbInsights={serializedAiInsights as Parameters<typeof AIInsights>[0]['dbInsights']}
          financialContext={{
            savingsRate,
            monthlyIncome,
            monthlyExpenses,
            totalLiabilities: totalLiabilityValue,
            goalCount: goals.length,
            hasInvestments: totalInvestments > 0,
          }}
        />
      </div>
    </div>
  );
}
