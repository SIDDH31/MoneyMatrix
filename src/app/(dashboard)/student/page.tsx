import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile, BankAccount, Asset, FinancialGoal, Budget } from '@/lib/models';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import mongoose from 'mongoose';

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

  await connectDB();

  const [profile, bankAccounts, assets, goals, budgets] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    BankAccount.find({ userId, isActive: true }).lean(),
    Asset.find({ userId }).lean(),
    FinancialGoal.find({ userId }).sort({ createdAt: -1 }).lean(),
    Budget.find({ userId, isActive: true }).lean(),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  // Fetch user name from users collection
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
      // ignore
    }
  }

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalSavings =
    assets
      .filter((a) => a.category === 'CASH_EQUIVALENT')
      .reduce((sum, a) => sum + a.value, 0) + totalBankBalance;

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlyExpenses = calculateTotalExpenses(budgets);
  // "Wants" categories from onboarding, used for the student insight
  const NON_ESSENTIAL = ['Subscriptions', 'Entertainment'];
  const nonEssentialExpenses = budgets
    .filter((b) => NON_ESSENTIAL.includes(b.category))
    .reduce((sum, b) => sum + (b.limit ?? 0), 0);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);

  const serializedGoals = goals.map((g) => ({
    ...g,
    _id: g._id.toString(),
    id: g._id.toString(),
    deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
    createdAt: (g.createdAt ? new Date(g.createdAt) : new Date()).toISOString(),
    updatedAt: (g.updatedAt ? new Date(g.updatedAt) : new Date()).toISOString(),
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader userName={userName} />

      <StudentOverview
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        totalSavings={totalSavings}
        savingsRate={savingsRate}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GoalsSection goals={serializedGoals as Parameters<typeof GoalsSection>[0]['goals']} monthlySavingCapacity={monthlySavingCapacity} />
        <EducationCards savingsRate={savingsRate} monthlyExpenses={monthlyExpenses} monthlyIncome={monthlyIncome} nonEssentialExpenses={nonEssentialExpenses} />
      </div>
    </div>
  );
}
