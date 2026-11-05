import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Budget, FinancialGoal, Profile } from '@/lib/models';
import { calculateTotalExpenses } from '@/lib/financial-engine';
import { GoalManager, type GoalRow } from '@/components/dashboard/goals/goal-manager';

export const metadata: Metadata = {
  title: 'Goals | MoneyMatrix',
  description: 'Create and track your savings goals.',
};

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  await connectDB();

  const [profile, goals, budgets] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    FinancialGoal.find({ userId, status: { $ne: 'CANCELLED' } }).sort({ status: 1, priority: 1, createdAt: -1 }).lean(),
    Budget.find({ userId, isActive: true }).lean(),
  ]);

  if (!profile) redirect('/onboarding');

  const monthlyIncome = (profile.monthlyIncome ?? 0) + (profile.additionalIncome ?? 0);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - calculateTotalExpenses(budgets));

  const rows: GoalRow[] = goals.map((g) => ({
    id: g._id.toString(),
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount ?? 0,
    deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
    priority: g.priority ?? 'MEDIUM',
    status: g.status ?? 'ACTIVE',
  }));

  return <GoalManager goals={rows} monthlySavingCapacity={monthlySavingCapacity} />;
}
