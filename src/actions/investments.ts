'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AssetCategory } from '@prisma/client';

export async function addAsset(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    const category = formData.get('category') as AssetCategory;
    const name = formData.get('name') as string;
    const investedAmount = parseFloat(formData.get('investedAmount') as string);
    const currentValue = parseFloat(formData.get('currentValue') as string);

    if (!category || !name || isNaN(investedAmount) || isNaN(currentValue)) {
      return { error: 'Invalid input data.' };
    }

    await prisma.asset.create({
      data: {
        userId: session.user.id,
        category,
        name,
        investedAmount,
        value: currentValue,
      }
    });

    revalidatePath('/investments');
    return { success: true };
  } catch (error) {
    console.error('Error adding asset:', error);
    return { error: 'Failed to add asset. Please try again.' };
  }
}
