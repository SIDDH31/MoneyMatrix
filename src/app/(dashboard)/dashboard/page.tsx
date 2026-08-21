import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        include: {
          bankAccounts: true,
          assets: true,
          liabilities: true,
          goals: true,
          riskProfile: true,
        }
      }
    }
  });

  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.user.name}</p>
        </div>
        <form action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}>
          <Button variant="outline" type="submit">Log Out</Button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Student Mode</h3>
          <p className="text-2xl font-bold mt-2">{profile.studentMode ? 'Active' : 'Disabled'}</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Risk Tolerance</h3>
          <p className="text-2xl font-bold mt-2">{profile.user.riskProfile?.riskTolerance}</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <h3 className="text-sm font-medium text-muted-foreground">Monthly Income</h3>
          <p className="text-2xl font-bold mt-2">₹{profile.monthlyIncome?.toLocaleString() ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
