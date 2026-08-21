import { auth, signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  userName: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

import { ModeToggle } from '@/components/mode-toggle';
import { CurrencyToggle } from '@/components/dashboard/currency-toggle';

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {getGreeting()}, {userName || 'there'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">{formatDate()}</p>
      </div>
      <div className="flex items-center gap-2">
        <CurrencyToggle />
        <ModeToggle />
        <Button variant="outline" size="icon-sm" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full border-2 border-card" />
        </Button>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <Button variant="outline" size="sm" type="submit" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
