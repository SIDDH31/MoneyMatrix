/**
 * Mongoose Models for MoneyMatrix
 * All user-owned financial data is keyed by userId (ObjectId string from Auth.js).
 */

import mongoose, { Schema, Model } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type IncomeType = 'SALARY' | 'STIPEND' | 'ALLOWANCE' | 'FREELANCE' | 'PART_TIME' | 'OTHER';
export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'WALLET' | 'OTHER';
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type GoalPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type InvestmentType = 'STOCK' | 'MUTUAL_FUND' | 'ETF' | 'BOND' | 'FIXED_DEPOSIT' | 'CRYPTO' | 'GOLD' | 'REAL_ESTATE' | 'OTHER';
export type AssetCategory = 'CASH_EQUIVALENT' | 'INVESTMENT' | 'PROPERTY' | 'VEHICLE' | 'ELECTRONICS' | 'JEWELRY' | 'OTHER';
export type LiabilityCategory = 'STUDENT_LOAN' | 'PERSONAL_LOAN' | 'CREDIT_CARD_DEBT' | 'MORTGAGE' | 'AUTO_LOAN' | 'OTHER';
export type RiskTolerance = 'CONSERVATIVE' | 'MODERATELY_CONSERVATIVE' | 'MODERATE' | 'MODERATELY_AGGRESSIVE' | 'AGGRESSIVE';
export type InsightType = 'SPENDING_PATTERN' | 'SAVINGS_TIP' | 'INVESTMENT_SUGGESTION' | 'GOAL_PROGRESS' | 'BUDGET_ALERT' | 'MARKET_INSIGHT' | 'EDUCATIONAL';

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface IProfile {
  userId: string;
  age?: number;
  occupation?: string;
  currency: string;
  studentMode: boolean;
  incomeType: IncomeType;
  monthlyIncome?: number;
  additionalIncome?: number;
  categories?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    age: { type: Number },
    occupation: { type: String },
    currency: { type: String, default: 'INR' },
    studentMode: { type: Boolean, default: false },
    incomeType: {
      type: String,
      enum: ['SALARY', 'STIPEND', 'ALLOWANCE', 'FREELANCE', 'PART_TIME', 'OTHER'],
      default: 'SALARY',
    },
    monthlyIncome: { type: Number },
    additionalIncome: { type: Number },
    categories: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'profiles' }
);

// ─── BankAccount ──────────────────────────────────────────────────────────────

export interface IBankAccount {
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  institution?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['CHECKING', 'SAVINGS', 'CREDIT_CARD', 'CASH', 'WALLET', 'OTHER'],
      required: true,
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    institution: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'bank_accounts' }
);

BankAccountSchema.index({ userId: 1, isActive: 1 });

// ─── Transaction ──────────────────────────────────────────────────────────────

export interface ITransaction {
  userId: string;
  accountId?: string;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description?: string;
  date: Date;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    accountId: { type: String },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['INCOME', 'EXPENSE', 'TRANSFER'], required: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    description: { type: String },
    date: { type: Date, default: Date.now },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    },
  },
  { timestamps: true, collection: 'transactions' }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, category: 1 });

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface IBudget {
  userId: string;
  category: string;
  limit: number;
  period: BudgetPeriod;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    period: { type: String, enum: ['WEEKLY', 'MONTHLY', 'YEARLY'], default: 'MONTHLY' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'budgets' }
);

BudgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });

// ─── FinancialGoal ────────────────────────────────────────────────────────────

export interface IFinancialGoal {
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: GoalPriority;
  status: GoalStatus;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FinancialGoalSchema = new Schema<IFinancialGoal>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    priority: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
    status: { type: String, enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED'], default: 'ACTIVE' },
    icon: { type: String },
  },
  { timestamps: true, collection: 'financial_goals' }
);

FinancialGoalSchema.index({ userId: 1, status: 1 });
FinancialGoalSchema.index({ userId: 1, createdAt: -1 });

// ─── Portfolio ────────────────────────────────────────────────────────────────

export interface IPortfolio {
  userId: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true, collection: 'portfolios' }
);

// ─── Investment ───────────────────────────────────────────────────────────────

export interface IInvestment {
  userId: string;
  portfolioId?: string;
  name: string;
  type: InvestmentType;
  units: number;
  buyPrice: number;
  currentPrice: number;
  purchaseDate: Date;
  sector?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: { type: String, required: true, index: true },
    portfolioId: { type: String },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['STOCK', 'MUTUAL_FUND', 'ETF', 'BOND', 'FIXED_DEPOSIT', 'CRYPTO', 'GOLD', 'REAL_ESTATE', 'OTHER'],
      required: true,
    },
    units: { type: Number, default: 0 },
    buyPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now },
    sector: { type: String },
    notes: { type: String },
  },
  { timestamps: true, collection: 'investments' }
);

InvestmentSchema.index({ userId: 1, type: 1 });

// ─── Asset ────────────────────────────────────────────────────────────────────

export interface IAsset {
  userId: string;
  name: string;
  category: AssetCategory;
  value: number;
  investedAmount?: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['CASH_EQUIVALENT', 'INVESTMENT', 'PROPERTY', 'VEHICLE', 'ELECTRONICS', 'JEWELRY', 'OTHER'],
      required: true,
    },
    value: { type: Number, required: true },
    investedAmount: { type: Number },
    notes: { type: String },
  },
  { timestamps: true, collection: 'assets' }
);

AssetSchema.index({ userId: 1, category: 1 });

// ─── Liability ────────────────────────────────────────────────────────────────

export interface ILiability {
  userId: string;
  name: string;
  category: LiabilityCategory;
  amount: number;
  interestRate?: number;
  dueDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const LiabilitySchema = new Schema<ILiability>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['STUDENT_LOAN', 'PERSONAL_LOAN', 'CREDIT_CARD_DEBT', 'MORTGAGE', 'AUTO_LOAN', 'OTHER'],
      required: true,
    },
    amount: { type: Number, required: true },
    interestRate: { type: Number },
    dueDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true, collection: 'liabilities' }
);

// ─── RiskProfile ──────────────────────────────────────────────────────────────

export interface IRiskProfile {
  userId: string;
  riskTolerance: RiskTolerance;
  investmentHorizon?: string;
  answers?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const RiskProfileSchema = new Schema<IRiskProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    riskTolerance: {
      type: String,
      enum: ['CONSERVATIVE', 'MODERATELY_CONSERVATIVE', 'MODERATE', 'MODERATELY_AGGRESSIVE', 'AGGRESSIVE'],
      default: 'MODERATE',
    },
    investmentHorizon: { type: String },
    answers: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'risk_profiles' }
);

// ─── AIInsight ────────────────────────────────────────────────────────────────

export interface IAIInsight {
  userId: string;
  type: InsightType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt?: Date;
}

const AIInsightSchema = new Schema<IAIInsight>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['SPENDING_PATTERN', 'SAVINGS_TIP', 'INVESTMENT_SUGGESTION', 'GOAL_PROGRESS', 'BUDGET_ALERT', 'MARKET_INSIGHT', 'EDUCATIONAL'],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'ai_insights' }
);

AIInsightSchema.index({ userId: 1, isRead: 1 });
AIInsightSchema.index({ userId: 1, type: 1 });
AIInsightSchema.index({ userId: 1, createdAt: -1 });

// ─── AIConversation ───────────────────────────────────────────────────────────

export interface IAIConversation {
  userId: string;
  title?: string;
  messages: Array<{ role: string; content: string; timestamp: Date }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'ai_conversations' }
);

// ─── Model registry (prevents re-compile on HMR) ─────────────────────────────

function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const Profile = getModel<IProfile>('Profile', ProfileSchema);
export const BankAccount = getModel<IBankAccount>('BankAccount', BankAccountSchema);
export const Transaction = getModel<ITransaction>('Transaction', TransactionSchema);
export const Budget = getModel<IBudget>('Budget', BudgetSchema);
export const FinancialGoal = getModel<IFinancialGoal>('FinancialGoal', FinancialGoalSchema);
export const Portfolio = getModel<IPortfolio>('Portfolio', PortfolioSchema);
export const Investment = getModel<IInvestment>('Investment', InvestmentSchema);
export const Asset = getModel<IAsset>('Asset', AssetSchema);
export const Liability = getModel<ILiability>('Liability', LiabilitySchema);
export const RiskProfile = getModel<IRiskProfile>('RiskProfile', RiskProfileSchema);
export const AIInsight = getModel<IAIInsight>('AIInsight', AIInsightSchema);
export const AIConversation = getModel<IAIConversation>('AIConversation', AIConversationSchema);
