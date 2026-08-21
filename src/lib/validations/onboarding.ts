import { z } from 'zod';

// Step 1: Basic Info
export const basicInfoSchema = z.object({
  age: z.coerce.number().min(16).max(100),
  studentMode: z.boolean().default(false),
  occupation: z.string().min(2, 'Occupation is required'),
});

// Step 2: Income
export const incomeSchema = z.object({
  monthlyIncome: z.coerce.number().min(0),
  incomeType: z.enum(['SALARY', 'STIPEND', 'ALLOWANCE', 'FREELANCE', 'PART_TIME', 'OTHER']),
});

// Step 3: Expenses (Monthly)
export const expensesSchema = z.object({
  housing: z.coerce.number().min(0).default(0),
  food: z.coerce.number().min(0).default(0),
  transportation: z.coerce.number().min(0).default(0),
  subscriptions: z.coerce.number().min(0).default(0),
  education: z.coerce.number().min(0).default(0),
  entertainment: z.coerce.number().min(0).default(0),
  other: z.coerce.number().min(0).default(0),
});

// Step 4: Financial Position
export const financialPositionSchema = z.object({
  bankBalance: z.coerce.number().min(0).default(0),
  investments: z.coerce.number().min(0).default(0),
  savings: z.coerce.number().min(0).default(0),
  liabilities: z.coerce.number().min(0).default(0), // Total debt
});

// Step 5: Initial Goal
export const initialGoalSchema = z.object({
  goalName: z.string().min(2, 'Goal name is required'),
  targetAmount: z.coerce.number().min(1),
  currentAmount: z.coerce.number().min(0).default(0),
});

// Step 6: Risk Quiz
export const riskQuizSchema = z.object({
  // Q1: What would you do if your investment dropped 20% in a month?
  reactionToDrop: z.enum(['sell_all', 'sell_some', 'do_nothing', 'buy_more']),
  // Q2: When do you need this money?
  timeHorizon: z.enum(['less_than_1', '1_to_3', '3_to_7', 'more_than_7']),
  // Q3: Primary objective?
  primaryObjective: z.enum(['capital_preservation', 'income', 'growth', 'speculation']),
});

// Combined schema for the entire wizard
export const onboardingSchema = z.object({
  basicInfo: basicInfoSchema,
  income: incomeSchema,
  expenses: expensesSchema,
  financialPosition: financialPositionSchema,
  initialGoal: initialGoalSchema.optional(),
  riskQuiz: riskQuizSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
