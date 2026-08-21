import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

import { DashboardHeader } from '@/components/dashboard/header';
import { StudentOverview } from '@/components/dashboard/student/student-overview';
import { GoalsSection } from '@/components/dashboard/goals-section';
import { EducationCards } from '@/components/dashboard/student/education-cards';

import {
  calculateTotalExpenses,
  calculateSavingsRate,
} from '@/lib/financial-engine';

export const metadata: Metadata = {
  title: 'Student Dashboard | MoneyMatrix',
  description: 'Your simplified financial command center',
};

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;

  const [profile, bankAccounts, assets, goals, budgets] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    }),
    prisma.bankAccount.findMany({ where: { userId, isActive: true } }),
    prisma.asset.findMany({ where: { userId } }),
    prisma.financialGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.budget.findMany({ where: { userId, isActive: true } }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalSavings = assets
    .filter((a) => a.category === 'CASH_EQUIVALENT')
    .reduce((sum, a) => sum + a.value, 0) + totalBankBalance;

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlyExpenses = calculateTotalExpenses(budgets);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

  return (
    <div className="space-y-6">
      <DashboardHeader userName={profile.user.name} />

      <StudentOverview 
        monthlyIncome={monthlyIncome} 
        monthlyExpenses={monthlyExpenses} 
        totalSavings={totalSavings} 
        savingsRate={savingsRate} 
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GoalsSection goals={goals} monthlySavingCapacity={monthlySavingCapacity} />
        <EducationCards savingsRate={savingsRate} monthlyExpenses={monthlyExpenses} monthlyIncome={monthlyIncome} />
      </div>
    </div>
  );
}
