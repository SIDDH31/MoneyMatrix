'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const [user, profile, bankAccounts, assets, liabilities, goals, budgets, riskProfile, aiInsights] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.profile.findUnique({
        where: { userId },
      }),
      prisma.bankAccount.findMany({
        where: { userId, isActive: true },
      }),
      prisma.asset.findMany({
        where: { userId },
      }),
      prisma.liability.findMany({
        where: { userId },
      }),
      prisma.financialGoal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.budget.findMany({
        where: { userId, isActive: true },
      }),
      prisma.riskProfile.findUnique({
        where: { userId },
      }),
      prisma.aIInsight.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

  return {
    user,
    profile,
    bankAccounts,
    assets,
    liabilities,
    goals,
    budgets,
    riskProfile,
    aiInsights,
  };
}
