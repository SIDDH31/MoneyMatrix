'use server';

import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile } from '@/lib/models';
import { revalidatePath } from 'next/cache';

export async function toggleStudentMode(enabled: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    await connectDB();

    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { studentMode: enabled },
      { new: true }
    );

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error toggling student mode:', error);
    return { error: 'Failed to update settings.' };
  }
}

const SUPPORTED_CURRENCIES = ['INR', 'USD'] as const;

export async function updateCurrencyPreference(currency: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    if (!(SUPPORTED_CURRENCIES as readonly string[]).includes(currency)) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    await connectDB();

    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      { currency },
      { new: true }
    );

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Error updating currency:', error);
    throw new Error('Failed to update currency');
  }
}
