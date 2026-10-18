'use server';

import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import {
  Profile,
  BankAccount,
  Asset,
  Liability,
  FinancialGoal,
  Budget,
  RiskProfile,
  AIInsight,
} from '@/lib/models';
import mongoose from 'mongoose';

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  await connectDB();

  const db = mongoose.connection.db;
  if (!db) return null;

  const [user, profile, bankAccounts, assets, liabilities, goals, budgets, riskProfile, aiInsights] =
    await Promise.all([
      db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { projection: { _id: 1, name: 1, email: 1, createdAt: 1 } }
      ).catch(() =>
        db.collection('users').findOne(
          { _id: userId as unknown as mongoose.Types.ObjectId },
          { projection: { _id: 1, name: 1, email: 1, createdAt: 1 } }
        )
      ),
      Profile.findOne({ userId }).lean(),
      BankAccount.find({ userId, isActive: true }).lean(),
      Asset.find({ userId }).lean(),
      Liability.find({ userId }).lean(),
      FinancialGoal.find({ userId }).sort({ createdAt: -1 }).lean(),
      Budget.find({ userId, isActive: true }).lean(),
      RiskProfile.findOne({ userId }).lean(),
      AIInsight.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

  return {
    user: user
      ? { id: user._id.toString(), name: user.name, email: user.email, createdAt: user.createdAt }
      : null,
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
