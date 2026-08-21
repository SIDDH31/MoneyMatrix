'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function toggleStudentMode(enabled: boolean) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { studentMode: enabled },
    });

    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling student mode:', error);
    return { error: 'Failed to update settings.' };
  }
}
