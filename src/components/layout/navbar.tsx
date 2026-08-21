import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Activity } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-xl">MoneyMatrix</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Features</Link>
          <Link href="#ai" className="transition-colors hover:text-foreground/80 text-foreground/60">AI Advisor</Link>
          <Link href="#student" className="transition-colors hover:text-foreground/80 text-foreground/60">Student Mode</Link>
          <Link href="#investments" className="transition-colors hover:text-foreground/80 text-foreground/60">Investments</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium transition-colors hover:text-foreground/80">
            Log in
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
