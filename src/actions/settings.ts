'use server';

import { z } from 'zod';
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile } from '@/lib/models';

type Result = { success: true } | { error: string };

const settingsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  occupation: z.string().trim().max(60).optional(),
  age: z.coerce.number().int().min(13, 'Age must be at least 13').max(120).optional(),
  monthlyIncome: z.coerce.number().min(0).max(1e12),
  additionalIncome: z.coerce.number().min(0).max(1e12),
  incomeType: z.enum(['SALARY', 'STIPEND', 'ALLOWANCE', 'FREELANCE', 'PART_TIME', 'OTHER']),
  currency: z.enum(['INR', 'USD']),
  studentMode: z.boolean(),
});

export async function updateSettings(formData: FormData): Promise<Result> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: 'Please sign in again.' };

  const ageRaw = formData.get('age');
  const parsed = settingsSchema.safeParse({
    name: formData.get('name'),
    occupation: (formData.get('occupation') as string) || undefined,
    age: ageRaw ? ageRaw : undefined,
    monthlyIncome: formData.get('monthlyIncome') || 0,
    additionalIncome: formData.get('additionalIncome') || 0,
    incomeType: formData.get('incomeType'),
    currency: formData.get('currency'),
    studentMode: formData.get('studentMode') === 'on',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Please check the form.' };

  const { name, ...profile } = parsed.data;

  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) return { error: 'Database unavailable.' };

    await Promise.all([
      db.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId(userId) },
        { $set: { name, updatedAt: new Date() } }
      ),
      Profile.updateOne({ userId }, { $set: profile }),
    ]);

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('updateSettings failed:', error);
    return { error: 'Could not save your settings. Please try again.' };
  }
}
