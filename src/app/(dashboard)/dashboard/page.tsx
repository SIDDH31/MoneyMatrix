import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

import { calculateHealthScore } from '@/lib/financial-engine';
import {
  calculateNetWorth,
  calculateTotalExpenses,
  calculateSavingsRate,
} from '@/lib/financial-engine';

export const metadata: Metadata = {
  title: 'Dashboard | MoneyMatrix',
  description: 'Your financial command center',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  // Fetch all data in parallel
  const [profile, bankAccounts, assets, liabilities, goals, budgets, riskProfile, aiInsights] =
    await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        include: { user: { select: { name: true, email: true, createdAt: true } } },
      }),
      prisma.bankAccount.findMany({ where: { userId, isActive: true } }),
      prisma.asset.findMany({ where: { userId } }),
      prisma.liability.findMany({ where: { userId } }),
      prisma.financialGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.budget.findMany({ where: { userId, isActive: true } }),
      prisma.riskProfile.findUnique({ where: { userId } }),
      prisma.aIInsight.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

  // If no profile, redirect to onboarding
  if (!profile) {
    redirect('/onboarding');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader userName={profile.user.name} />

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
        <GoalsSection goals={goals} monthlySavingCapacity={monthlySavingCapacity} />
        <AIInsights
          dbInsights={aiInsights}
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
