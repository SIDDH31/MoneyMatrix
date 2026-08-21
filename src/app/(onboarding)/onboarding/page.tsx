import { OnboardingWizard } from '@/components/onboarding/wizard';
import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Onboarding | MoneyMatrix',
  description: 'Set up your financial profile',
};

export default async function OnboardingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // If user already has a profile, redirect to dashboard
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  if (profile) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to MoneyMatrix</h1>
          <p className="mt-2 text-muted-foreground">Let's set up your financial profile to get started.</p>
        </div>
        
        <OnboardingWizard />
      </div>
    </div>
  );
}
