'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { onboardingSchema, OnboardingData } from '@/lib/validations/onboarding';
import { calculateRiskScore } from '@/lib/utils/risk-calculator';
import { redirect } from 'next/navigation';
import { AccountType, AssetCategory, LiabilityCategory, BudgetPeriod, GoalPriority } from '@prisma/client';

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

  const { basicInfo, income, expenses, financialPosition, initialGoal, riskQuiz } = validatedFields.data;
  
  // Calculate deterministic risk score
  const { tolerance } = calculateRiskScore(riskQuiz);

  try {
    // Wrap everything in a Prisma transaction
    await prisma.$transaction(async (tx) => {
      // 1. Create Profile (now includes age, occupation, additionalIncome)
      await tx.profile.create({
        data: {
          userId,
          age: basicInfo.age,
          occupation: basicInfo.occupation,
          studentMode: basicInfo.studentMode,
          monthlyIncome: income.monthlyIncome,
          additionalIncome: income.additionalIncome,
          incomeType: income.incomeType,
          currency: 'INR',
        }
      });

      // 2. Create Base Accounts & Balances
      if (financialPosition.bankBalance > 0) {
        await tx.bankAccount.create({
          data: {
            userId,
            name: 'Main Account',
            type: AccountType.CHECKING,
            balance: financialPosition.bankBalance,
          }
        });
      }

      // 3. Create Assets & Liabilities
      if (financialPosition.investments > 0) {
        await tx.asset.create({
          data: { userId, name: 'Investments', category: AssetCategory.INVESTMENT, value: financialPosition.investments }
        });
      }
      if (financialPosition.savings > 0) {
        await tx.asset.create({
          data: { userId, name: 'Savings', category: AssetCategory.CASH_EQUIVALENT, value: financialPosition.savings }
        });
      }
      if (financialPosition.assets > 0) {
        await tx.asset.create({
          data: { userId, name: 'Other Assets', category: AssetCategory.OTHER, value: financialPosition.assets }
        });
      }
      if (financialPosition.liabilities > 0) {
        await tx.liability.create({
          data: { userId, name: 'General Debt', category: LiabilityCategory.OTHER, amount: financialPosition.liabilities }
        });
      }

      // 4. Create Initial Goal
      if (initialGoal) {
        await tx.financialGoal.create({
          data: {
            userId,
            name: initialGoal.goalName,
            targetAmount: initialGoal.targetAmount,
            currentAmount: initialGoal.currentAmount,
            priority: GoalPriority.HIGH,
          }
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

      for (const exp of expenseMap) {
        if (exp.amount > 0) {
          await tx.budget.create({
            data: {
              userId,
              category: exp.category,
              limit: exp.amount,
              period: BudgetPeriod.MONTHLY,
            }
          });
        }
      }

      // 6. Create Risk Profile
      await tx.riskProfile.create({
        data: {
          userId,
          riskTolerance: tolerance,
          answers: riskQuiz as any, 
        }
      });
    });

  } catch (error) {
    console.error('Onboarding Error:', error);
    return { error: 'Failed to save profile. Please try again.' };
  }

  // Redirect to dashboard after successful onboarding
  redirect('/dashboard');
}
