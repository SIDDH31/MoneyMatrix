'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Target,
  ArrowLeftRight,
  Settings,
  Activity,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, comingSoon: true },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, comingSoon: true },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, comingSoon: true },
];

interface SidebarProps {
  userName: string | null;
  userEmail: string | null;
  studentMode: boolean;
}

import { GraduationCap, Briefcase } from 'lucide-react';
import { toggleStudentMode } from '@/actions/profile';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export function Sidebar({ userName, userEmail, studentMode }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsPending(true);
    await toggleStudentMode(checked);
    setIsPending(false);
    if (checked) {
      router.push('/student');
    } else {
      router.push('/dashboard');
    }
  };

  const currentNavItems = studentMode 
    ? [
        { href: '/student', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/goals', label: 'Goals', icon: Target, comingSoon: true },
      ]
    : [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/investments', label: 'Investments', icon: Briefcase },
        { href: '/dashboard/goals', label: 'Goals', icon: Target, comingSoon: true },
        { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight, comingSoon: true },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings, comingSoon: true },
      ];

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon-sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">MoneyMatrix</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.comingSoon ? '#' : item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  item.comingSoon && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Student Mode Toggle */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <Label htmlFor="student-mode" className="text-sm cursor-pointer">Student Mode</Label>
            </div>
            <Switch 
              id="student-mode" 
              checked={studentMode} 
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{userName || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail || ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
