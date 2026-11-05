'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { FinancialGoal } from '@/lib/models';

type Result = { success: true } | { error: string };

const goalSchema = z.object({
  name: z.string().trim().min(1, 'Give your goal a name').max(80),
  targetAmount: z.coerce.number().positive('Target must be more than 0').max(1e12),
  currentAmount: z.coerce.number().min(0).max(1e12).default(0),
  deadline: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined))
    .refine((d) => d === undefined || !Number.isNaN(d.getTime()), 'Invalid date'),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
});

async function requireUser(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function revalidateGoalPages() {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/goals');
  revalidatePath('/student');
  revalidatePath('/investments');
}

export async function createGoal(formData: FormData): Promise<Result> {
  const userId = await requireUser();
  if (!userId) return { error: 'Please sign in again.' };

  const parsed = goalSchema.safeParse({
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    currentAmount: formData.get('currentAmount') || 0,
    deadline: (formData.get('deadline') as string) || undefined,
    priority: formData.get('priority') || 'MEDIUM',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid goal.' };

  const { currentAmount, targetAmount } = parsed.data;
  try {
    await connectDB();
    await FinancialGoal.create({
      userId,
      ...parsed.data,
      status: currentAmount >= targetAmount ? 'COMPLETED' : 'ACTIVE',
    });
    revalidateGoalPages();
    return { success: true };
  } catch (error) {
    console.error('createGoal failed:', error);
    return { error: 'Could not save the goal. Please try again.' };
  }
}

/** Add (or, with a negative amount, withdraw) money saved toward a goal. */
export async function contributeToGoal(goalId: string, amount: number): Promise<Result> {
  const userId = await requireUser();
  if (!userId) return { error: 'Please sign in again.' };
  if (!mongoose.isValidObjectId(goalId)) return { error: 'Goal not found.' };
  if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 1e12) return { error: 'Enter an amount.' };

  try {
    await connectDB();
    const goal = await FinancialGoal.findOne({ _id: goalId, userId });
    if (!goal) return { error: 'Goal not found.' };

    goal.currentAmount = Math.max(0, (goal.currentAmount ?? 0) + amount);
    if (goal.currentAmount >= goal.targetAmount) goal.status = 'COMPLETED';
    else if (goal.status === 'COMPLETED') goal.status = 'ACTIVE';
    await goal.save();

    revalidateGoalPages();
    return { success: true };
  } catch (error) {
    console.error('contributeToGoal failed:', error);
    return { error: 'Could not update the goal. Please try again.' };
  }
}

export async function setGoalStatus(goalId: string, status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'): Promise<Result> {
  const userId = await requireUser();
  if (!userId) return { error: 'Please sign in again.' };
  if (!mongoose.isValidObjectId(goalId) || !['ACTIVE', 'COMPLETED', 'PAUSED'].includes(status)) {
    return { error: 'Invalid request.' };
  }

  try {
    await connectDB();
    const res = await FinancialGoal.updateOne({ _id: goalId, userId }, { status });
    if (res.matchedCount === 0) return { error: 'Goal not found.' };
    revalidateGoalPages();
    return { success: true };
  } catch (error) {
    console.error('setGoalStatus failed:', error);
    return { error: 'Could not update the goal. Please try again.' };
  }
}

export async function deleteGoal(goalId: string): Promise<Result> {
  const userId = await requireUser();
  if (!userId) return { error: 'Please sign in again.' };
  if (!mongoose.isValidObjectId(goalId)) return { error: 'Goal not found.' };

  try {
    await connectDB();
    const res = await FinancialGoal.deleteOne({ _id: goalId, userId });
    if (res.deletedCount === 0) return { error: 'Goal not found.' };
    revalidateGoalPages();
    return { success: true };
  } catch (error) {
    console.error('deleteGoal failed:', error);
    return { error: 'Could not delete the goal. Please try again.' };
  }
}
