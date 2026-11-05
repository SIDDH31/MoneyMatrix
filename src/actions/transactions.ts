'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Transaction } from '@/lib/models';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/transaction-categories';

type Result = { success: true } | { error: string };

const transactionSchema = z
  .object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.coerce.number().positive('Amount must be more than 0').max(1e12),
    category: z.string().trim().min(1, 'Pick a category'),
    description: z.string().trim().max(120).optional(),
    date: z
      .string()
      .min(1, 'Pick a date')
      .transform((v) => new Date(v))
      .refine((d) => !Number.isNaN(d.getTime()), 'Invalid date')
      .refine((d) => d.getTime() <= Date.now() + 24 * 60 * 60 * 1000, "Date can't be in the future"),
  })
  .refine(
    (t) => ((t.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES) as readonly string[]).includes(t.category),
    { message: 'Pick a valid category', path: ['category'] }
  );

export async function addTransaction(formData: FormData): Promise<Result> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Please sign in again.' };

  const parsed = transactionSchema.safeParse({
    type: formData.get('type'),
    amount: formData.get('amount'),
    category: formData.get('category'),
    description: (formData.get('description') as string) || undefined,
    date: formData.get('date'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid transaction.' };

  try {
    await connectDB();
    await Transaction.create({ userId, ...parsed.data });
    revalidatePath('/dashboard/transactions');
    return { success: true };
  } catch (error) {
    console.error('addTransaction failed:', error);
    return { error: 'Could not save the transaction. Please try again.' };
  }
}

export async function deleteTransaction(transactionId: string): Promise<Result> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Please sign in again.' };
  if (!mongoose.isValidObjectId(transactionId)) return { error: 'Transaction not found.' };

  try {
    await connectDB();
    const res = await Transaction.deleteOne({ _id: transactionId, userId });
    if (res.deletedCount === 0) return { error: 'Transaction not found.' };
    revalidatePath('/dashboard/transactions');
    return { success: true };
  } catch (error) {
    console.error('deleteTransaction failed:', error);
    return { error: 'Could not delete the transaction. Please try again.' };
  }
}
