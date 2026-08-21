/**
 * Seed script — creates a realistic test user with complete onboarding data.
 * 
 * Usage: npx prisma db seed
 * 
 * Test credentials:
 *   Email: test@moneymatrix.dev
 *   Password: Test1234!
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MoneyMatrix database...\n');

  const email = 'test@moneymatrix.dev';
  const password = await bcrypt.hash('Test1234!', 10);

  // Clean up existing test user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.delete({ where: { email } });
    console.log('  ♻️  Cleaned up existing test user');
  }

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email,
      password,
    },
  });
  console.log(`  ✅ User created: ${user.email}`);

  // 2. Create Profile
  await prisma.profile.create({
    data: {
      userId: user.id,
      age: 24,
      occupation: 'Software Engineer',
      studentMode: false,
      monthlyIncome: 85000,
      additionalIncome: 15000,
      incomeType: 'SALARY',
      currency: 'INR',
    },
  });
  console.log('  ✅ Profile created');

  // 3. Bank Accounts
  await prisma.bankAccount.createMany({
    data: [
      { userId: user.id, name: 'HDFC Savings', type: 'SAVINGS', balance: 245000, institution: 'HDFC Bank' },
      { userId: user.id, name: 'SBI Salary', type: 'CHECKING', balance: 52000, institution: 'SBI' },
    ],
  });
  console.log('  ✅ Bank accounts created');

  // 4. Assets
  await prisma.asset.createMany({
    data: [
      { userId: user.id, name: 'Mutual Funds', category: 'INVESTMENT', value: 320000 },
      { userId: user.id, name: 'Stocks Portfolio', category: 'INVESTMENT', value: 180000 },
      { userId: user.id, name: 'Fixed Deposits', category: 'CASH_EQUIVALENT', value: 200000 },
      { userId: user.id, name: 'Gold (Digital)', category: 'JEWELRY', value: 50000 },
      { userId: user.id, name: 'Laptop & Electronics', category: 'ELECTRONICS', value: 85000 },
    ],
  });
  console.log('  ✅ Assets created');

  // 5. Liabilities
  await prisma.liability.createMany({
    data: [
      { userId: user.id, name: 'Education Loan', category: 'STUDENT_LOAN', amount: 280000, interestRate: 8.5 },
      { userId: user.id, name: 'Credit Card', category: 'CREDIT_CARD_DEBT', amount: 12000 },
    ],
  });
  console.log('  ✅ Liabilities created');

  // 6. Budgets (Monthly Expenses)
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'Housing', limit: 18000, period: 'MONTHLY' },
      { userId: user.id, category: 'Food', limit: 8000, period: 'MONTHLY' },
      { userId: user.id, category: 'Transportation', limit: 4000, period: 'MONTHLY' },
      { userId: user.id, category: 'Subscriptions', limit: 2500, period: 'MONTHLY' },
      { userId: user.id, category: 'Education', limit: 3000, period: 'MONTHLY' },
      { userId: user.id, category: 'Entertainment', limit: 5000, period: 'MONTHLY' },
      { userId: user.id, category: 'Other', limit: 4500, period: 'MONTHLY' },
    ],
  });
  console.log('  ✅ Budgets created');

  // 7. Financial Goals
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

  await prisma.financialGoal.createMany({
    data: [
      {
        userId: user.id,
        name: 'Emergency Fund',
        targetAmount: 500000,
        currentAmount: 200000,
        deadline: sixMonthsFromNow,
        priority: 'HIGH',
        status: 'ACTIVE',
        icon: '🛡️',
      },
      {
        userId: user.id,
        name: 'New Laptop',
        targetAmount: 120000,
        currentAmount: 45000,
        deadline: oneYearFromNow,
        priority: 'MEDIUM',
        status: 'ACTIVE',
        icon: '💻',
      },
      {
        userId: user.id,
        name: 'International Trip',
        targetAmount: 300000,
        currentAmount: 60000,
        deadline: twoYearsFromNow,
        priority: 'LOW',
        status: 'ACTIVE',
        icon: '✈️',
      },
    ],
  });
  console.log('  ✅ Financial goals created');

  // 8. Risk Profile
  await prisma.riskProfile.create({
    data: {
      userId: user.id,
      riskTolerance: 'MODERATELY_AGGRESSIVE',
      investmentHorizon: '5-10 years',
      answers: {
        reactionToDrop: 'buy_more',
        timeHorizon: '3_to_7',
        primaryObjective: 'growth',
      },
    },
  });
  console.log('  ✅ Risk profile created');

  // 9. AI Insights (sample)
  await prisma.aIInsight.createMany({
    data: [
      {
        userId: user.id,
        type: 'SPENDING_PATTERN',
        title: 'Entertainment Spending Up',
        content: 'Your entertainment spending has increased this month. Consider if all subscriptions are still being used.',
      },
      {
        userId: user.id,
        type: 'SAVINGS_TIP',
        title: 'Great Savings Rate!',
        content: 'You\'re saving 55% of your income — well above the recommended 20%. Consider investing the surplus for compound growth.',
      },
      {
        userId: user.id,
        type: 'GOAL_PROGRESS',
        title: 'Emergency Fund on Track',
        content: 'At your current savings rate, you\'ll reach your emergency fund goal 2 months ahead of schedule.',
      },
    ],
  });
  console.log('  ✅ AI insights created');

  console.log('\n🎉 Seed complete!');
  console.log('   Login with: test@moneymatrix.dev / Test1234!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
