import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/dashboard/sidebar';
import { AIAdvisorSheet } from '@/components/dashboard/ai-advisor-sheet';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });
  
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { studentMode: true },
  });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar 
        userName={user?.name ?? null} 
        userEmail={user?.email ?? null} 
        studentMode={profile?.studentMode ?? false}
      />
      <main className="flex-1 lg:ml-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <AIAdvisorSheet />
    </div>
  );
}
