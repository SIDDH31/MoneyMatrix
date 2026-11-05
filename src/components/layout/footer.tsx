import Link from 'next/link';
import { Activity } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12 md:py-16">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">MoneyMatrix</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI-powered personal finance and investment management designed for the modern generation.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Product</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
            <li><Link href="/#ai" className="hover:text-foreground transition-colors">AI Advisor</Link></li>
            <li><Link href="/#student" className="hover:text-foreground transition-colors">Student Mode</Link></li>
            <li><Link href="/#preview" className="hover:text-foreground transition-colors">Dashboard Preview</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Resources</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/#news" className="hover:text-foreground transition-colors">Market News</Link></li>
            <li><Link href="/investments" className="hover:text-foreground transition-colors">Investment Calculator</Link></li>
            <li><Link href="/dashboard/goals" className="hover:text-foreground transition-colors">Goal Planner</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
            <li><a href="https://github.com/SIDDH31/MoneyMatrix" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MoneyMatrix. All rights reserved.</p>
        <p>Built with precision.</p>
      </div>
    </footer>
  );
}
