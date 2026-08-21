import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, ChevronRight, Activity } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 md:pt-32 md:pb-40">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 transition-colors hover:bg-primary/10">
          <Activity className="mr-2 h-4 w-4" />
          <span>MoneyMatrix 1.0 is now available</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
        
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          Your Money. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
            Smarter Decisions.
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          The premium financial platform designed for the modern generation. Track expenses, plan investments, and get AI-powered insights to accelerate your wealth building.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/register"
            className={buttonVariants({ size: "lg", className: "w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25" })}
          >
            Start for free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="#preview"
            className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto h-12 px-8 text-base border-border bg-background" })}
          >
            View Demo
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-muted-foreground">
          No credit card required. Free for students.
        </div>
      </div>
    </section>
  );
}
