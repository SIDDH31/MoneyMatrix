'use server';

import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Asset } from '@/lib/models';
import type { AssetCategory } from '@/lib/models';
import { revalidatePath } from 'next/cache';

const VALID_CATEGORIES: AssetCategory[] = [
  'CASH_EQUIVALENT',
  'INVESTMENT',
  'PROPERTY',
  'VEHICLE',
  'ELECTRONICS',
  'JEWELRY',
  'OTHER',
];

export async function addAsset(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const category = formData.get('category') as AssetCategory;
    const name = String(formData.get('name') ?? '').trim();
    const investedAmount = parseFloat(formData.get('investedAmount') as string);
    const currentValue = parseFloat(formData.get('currentValue') as string);

    if (
      !category ||
      !VALID_CATEGORIES.includes(category) ||
      !name ||
      name.length > 100 ||
      !Number.isFinite(investedAmount) ||
      !Number.isFinite(currentValue) ||
      investedAmount < 0 ||
      currentValue < 0
    ) {
      return { error: 'Invalid input data.' };
    }

    await connectDB();

    await Asset.create({
      userId: session.user.id,
      category,
      name,
      investedAmount,
      value: currentValue,
    });

    revalidatePath('/investments');
    return { success: true };
  } catch (error) {
    console.error('Error adding asset:', error);
    return { error: 'Failed to add asset. Please try again.' };
  }
}
