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
} from '@/lib/models';
import { onboardingSchema, OnboardingData } from '@/lib/validations/onboarding';
import { calculateRiskScore } from '@/lib/utils/risk-calculator';
import { redirect } from 'next/navigation';

export async function submitOnboarding(data: OnboardingData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const userId = session.user.id;

  const validatedFields = onboardingSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: 'Invalid data submitted' };
  }

  const { basicInfo, income, expenses, financialPosition, initialGoal, riskQuiz } =
    validatedFields.data;

  const { tolerance } = calculateRiskScore(riskQuiz);

  await connectDB();

  // Already onboarded (e.g. double-submit or back button): don't try to create a second profile
  if (await Profile.exists({ userId })) {
    redirect('/dashboard');
  }

  try {
    // 1. Create Profile
    await Profile.create({
      userId,
      age: basicInfo.age,
      occupation: basicInfo.occupation,
      studentMode: basicInfo.studentMode,
      monthlyIncome: income.monthlyIncome,
      additionalIncome: income.additionalIncome,
      incomeType: income.incomeType,
      currency: 'INR',
    });

    // 2. Create Bank Account (if any balance)
    if (financialPosition.bankBalance > 0) {
      await BankAccount.create({
        userId,
        name: 'Main Account',
        type: 'CHECKING',
        balance: financialPosition.bankBalance,
      });
    }

    // 3. Create Assets & Liabilities
    if (financialPosition.investments > 0) {
      await Asset.create({
        userId,
        name: 'Investments',
        category: 'INVESTMENT',
        value: financialPosition.investments,
      });
    }
    if (financialPosition.savings > 0) {
      await Asset.create({
        userId,
        name: 'Savings',
        category: 'CASH_EQUIVALENT',
        value: financialPosition.savings,
      });
    }
    if (financialPosition.assets > 0) {
      await Asset.create({
        userId,
        name: 'Other Assets',
        category: 'OTHER',
        value: financialPosition.assets,
      });
    }
    if (financialPosition.liabilities > 0) {
      await Liability.create({
        userId,
        name: 'General Debt',
        category: 'OTHER',
        amount: financialPosition.liabilities,
      });
    }

    // 4. Create Initial Goal
    if (initialGoal) {
      await FinancialGoal.create({
        userId,
        name: initialGoal.goalName,
        targetAmount: initialGoal.targetAmount,
        currentAmount: initialGoal.currentAmount,
        priority: 'HIGH',
      });
    }

    // 5. Create Initial Budgets (Expenses)
    const expenseMap = [
      { category: 'Housing', amount: expenses.housing },
      { category: 'Food', amount: expenses.food },
      { category: 'Transportation', amount: expenses.transportation },
      { category: 'Subscriptions', amount: expenses.subscriptions },
      { category: 'Education', amount: expenses.education },
      { category: 'Entertainment', amount: expenses.entertainment },
      { category: 'Other', amount: expenses.other },
    ];

    const budgetsToCreate = expenseMap
      .filter((e) => e.amount > 0)
      .map((e) => ({ userId, category: e.category, limit: e.amount, period: 'MONTHLY' }));

    if (budgetsToCreate.length > 0) {
      await Budget.insertMany(budgetsToCreate);
    }

    // 6. Create Risk Profile
    await RiskProfile.create({
      userId,
      riskTolerance: tolerance,
      answers: riskQuiz,
    });
  } catch (error) {
    console.error('Onboarding Error:', error);
    return { error: 'Failed to save profile. Please try again.' };
  }

  redirect('/dashboard');
}
