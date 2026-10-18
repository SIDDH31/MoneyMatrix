import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongoose';
import { Profile } from '@/lib/models';
import mongoose from 'mongoose';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AIAdvisorSheet } from '@/components/dashboard/ai-advisor-sheet';
import { PageTransition } from '@/components/page-transition';
import { CurrencyProvider } from '@/components/providers/currency-provider';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  await connectDB();

  const db = mongoose.connection.db;
  let userName: string | null = null;
  let userEmail: string | null = null;

  if (db) {
    try {
      const userDoc = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(session.user.id) },
        { projection: { name: 1, email: 1 } }
      );
      userName = (userDoc?.name as string) ?? null;
      userEmail = (userDoc?.email as string) ?? null;
    } catch {
      // fallback if userId isn't an ObjectId format
    }
  }

  const profile = await Profile.findOne(
    { userId: session.user.id },
    { studentMode: 1, currency: 1 }
  ).lean();

  return (
    <CurrencyProvider initialCurrency={profile?.currency ?? 'INR'}>
      <div className="flex min-h-screen bg-mesh">
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          studentMode={profile?.studentMode ?? false}
        />
        <main className="flex-1 lg:ml-0 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto min-h-full">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <AIAdvisorSheet />
      </div>
    </CurrencyProvider>
  );
}
