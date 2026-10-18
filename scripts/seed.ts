/**
 * MongoDB Seed Script for MoneyMatrix
 * Creates a realistic test user with complete onboarding and financial data.
 * 
 * Usage: npm run db:seed
 * 
 * Test credentials:
 *   Email: test@moneymatrix.dev
 *   Password: Test1234!
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  Profile,
  BankAccount,
  Asset,
  Liability,
  Budget,
  FinancialGoal,
  RiskProfile,
  AIInsight,
  Portfolio,
  Investment,
  Transaction,
} from '../src/lib/models';

// Load environment variables if running outside Next.js
const envLocal = path.resolve(process.cwd(), '.env.local');
const envDefault = path.resolve(process.cwd(), '.env');

if (!process.env.MONGODB_URI) {
  if (fs.existsSync(envLocal)) {
    try {
      process.loadEnvFile(envLocal);
    } catch {
      // ignore
    }
  } else if (fs.existsSync(envDefault)) {
    try {
      process.loadEnvFile(envDefault);
    } catch {
      // ignore
    }
  }
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is not defined.');
  console.error('   Please define MONGODB_URI in .env or .env.local');
  process.exit(1);
}

async function main() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(uri!);
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error('Could not access MongoDB database instance.');
  }

  console.log(`Connected to database: ${mongoose.connection.name || 'moneymatrix'}`);

  const email = 'test@moneymatrix.dev';
  const usersCollection = db.collection('users');

  // 1. Clean up existing test user and associated data
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    const userId = existingUser._id.toString();
    await Promise.all([
      usersCollection.deleteOne({ _id: existingUser._id }),
      Profile.deleteMany({ userId }),
      BankAccount.deleteMany({ userId }),
      Asset.deleteMany({ userId }),
      Liability.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      FinancialGoal.deleteMany({ userId }),
      RiskProfile.deleteMany({ userId }),
      AIInsight.deleteMany({ userId }),
      Portfolio.deleteMany({ userId }),
      Investment.deleteMany({ userId }),
      Transaction.deleteMany({ userId }),
    ]);
    console.log('  ♻️  Cleaned up existing test user and records');
  }

  // 2. Create User
  const passwordHash = await bcrypt.hash('Test1234!', 10);
  const userInsertResult = await usersCollection.insertOne({
    name: 'Arjun Mehta',
    email,
    password: passwordHash,
    emailVerified: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const userId = userInsertResult.insertedId.toString();
  console.log(`  ✅ User created: ${email} (ID: ${userId})`);

  // 3. Create Profile
  await Profile.create({
    userId,
    age: 24,
    occupation: 'Software Engineer',
    studentMode: false,
    monthlyIncome: 85000,
    additionalIncome: 15000,
    incomeType: 'SALARY',
    currency: 'INR',
  });
  console.log('  ✅ Profile created');

  // 4. Bank Accounts
  const [hdfcAccount, sbiAccount] = await BankAccount.create([
    {
      userId,
      name: 'HDFC Savings',
      type: 'SAVINGS',
      balance: 245000,
      currency: 'INR',
      institution: 'HDFC Bank',
      isActive: true,
    },
    {
      userId,
      name: 'SBI Salary',
      type: 'CHECKING',
      balance: 52000,
      currency: 'INR',
      institution: 'SBI',
      isActive: true,
    },
  ]);
  console.log('  ✅ Bank accounts created');

  // 5. Assets
  await Asset.create([
    { userId, name: 'Mutual Funds', category: 'INVESTMENT', value: 320000 },
    { userId, name: 'Stocks Portfolio', category: 'INVESTMENT', value: 180000 },
    { userId, name: 'Fixed Deposits', category: 'CASH_EQUIVALENT', value: 200000 },
    { userId, name: 'Gold (Digital)', category: 'JEWELRY', value: 50000 },
    { userId, name: 'Laptop & Electronics', category: 'ELECTRONICS', value: 85000 },
  ]);
  console.log('  ✅ Assets created');

  // 6. Liabilities
  await Liability.create([
    {
      userId,
      name: 'Education Loan',
      category: 'STUDENT_LOAN',
      amount: 280000,
      interestRate: 8.5,
    },
    {
      userId,
      name: 'Credit Card',
      category: 'CREDIT_CARD_DEBT',
      amount: 12000,
    },
  ]);
  console.log('  ✅ Liabilities created');

  // 7. Budgets (Monthly Expenses)
  await Budget.create([
    { userId, category: 'Housing', limit: 18000, period: 'MONTHLY', isActive: true },
    { userId, category: 'Food', limit: 8000, period: 'MONTHLY', isActive: true },
    { userId, category: 'Transportation', limit: 4000, period: 'MONTHLY', isActive: true },
    { userId, category: 'Subscriptions', limit: 2500, period: 'MONTHLY', isActive: true },
    { userId, category: 'Education', limit: 3000, period: 'MONTHLY', isActive: true },
    { userId, category: 'Entertainment', limit: 5000, period: 'MONTHLY', isActive: true },
    { userId, category: 'Other', limit: 4500, period: 'MONTHLY', isActive: true },
  ]);
  console.log('  ✅ Budgets created');

  // 8. Financial Goals
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

  await FinancialGoal.create([
    {
      userId,
      name: 'Emergency Fund',
      targetAmount: 500000,
      currentAmount: 200000,
      deadline: sixMonthsFromNow,
      priority: 'HIGH',
      status: 'ACTIVE',
      icon: '🛡️',
    },
    {
      userId,
      name: 'New Laptop',
      targetAmount: 120000,
      currentAmount: 45000,
      deadline: oneYearFromNow,
      priority: 'MEDIUM',
      status: 'ACTIVE',
      icon: '💻',
    },
    {
      userId,
      name: 'International Trip',
      targetAmount: 300000,
      currentAmount: 60000,
      deadline: twoYearsFromNow,
      priority: 'LOW',
      status: 'ACTIVE',
      icon: '✈️',
    },
  ]);
  console.log('  ✅ Financial goals created');

  // 9. Risk Profile
  await RiskProfile.create({
    userId,
    riskTolerance: 'MODERATELY_AGGRESSIVE',
    investmentHorizon: '5-10 years',
    answers: {
      reactionToDrop: 'buy_more',
      timeHorizon: '3_to_7',
      primaryObjective: 'growth',
    },
  });
  console.log('  ✅ Risk profile created');

  // 10. AI Insights
  await AIInsight.create([
    {
      userId,
      type: 'SPENDING_PATTERN',
      title: 'Entertainment Spending Up',
      content:
        'Your entertainment spending has increased this month. Consider if all subscriptions are still being used.',
      isRead: false,
    },
    {
      userId,
      type: 'SAVINGS_TIP',
      title: 'Great Savings Rate!',
      content:
        "You're saving 55% of your income — well above the recommended 20%. Consider investing the surplus for compound growth.",
      isRead: false,
    },
    {
      userId,
      type: 'GOAL_PROGRESS',
      title: 'Emergency Fund on Track',
      content:
        'At your current savings rate, you will reach your emergency fund goal 2 months ahead of schedule.',
      isRead: false,
    },
  ]);
  console.log('  ✅ AI insights created');

  // 11. Portfolio & Investments
  const portfolio = await Portfolio.create({
    userId,
    name: 'Growth & Tech Focus',
    description: 'Long-term equity wealth creation',
  });

  await Investment.create([
    {
      userId,
      portfolioId: portfolio._id.toString(),
      name: 'NIFTY 50 Index Fund',
      type: 'MUTUAL_FUND',
      units: 120,
      buyPrice: 1800,
      currentPrice: 2050,
      purchaseDate: new Date('2024-01-15'),
      sector: 'Diversified',
    },
    {
      userId,
      portfolioId: portfolio._id.toString(),
      name: 'Tata Consultancy Services',
      type: 'STOCK',
      units: 25,
      buyPrice: 3400,
      currentPrice: 3850,
      purchaseDate: new Date('2024-03-10'),
      sector: 'IT',
    },
  ]);
  console.log('  ✅ Portfolio & investments created');

  // 12. Recent Transactions
  await Transaction.create([
    {
      userId,
      accountId: sbiAccount._id.toString(),
      amount: 85000,
      type: 'INCOME',
      category: 'Salary',
      description: 'Monthly Salary Credit',
      date: new Date(),
    },
    {
      userId,
      accountId: hdfcAccount._id.toString(),
      amount: 18000,
      type: 'EXPENSE',
      category: 'Housing',
      description: 'Apartment Rent',
      date: new Date(),
    },
    {
      userId,
      accountId: hdfcAccount._id.toString(),
      amount: 4200,
      type: 'EXPENSE',
      category: 'Food',
      description: 'Groceries & Dining',
      date: new Date(),
    },
  ]);
  console.log('  ✅ Sample transactions created');

  console.log('\n🎉 MongoDB seed complete!');
  console.log('   Login with: test@moneymatrix.dev / Test1234!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
