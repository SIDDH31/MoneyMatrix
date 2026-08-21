import { GraduationCap, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export function StudentMode() {
  return (
    <section id="student" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Student Mode
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                MoneyMatrix adapts to your life stage. Enable Student Mode for a simplified interface focusing on managing stipends, tracking allowances, minimizing student debt, and building an early credit history.
              </p>
              
              <ul className="space-y-3 mb-10">
                <li className="flex items-center text-sm font-medium">
                  <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">✓</span>
                  Tailored budget categories (Tuition, Books, Dining Hall)
                </li>
                <li className="flex items-center text-sm font-medium">
                  <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">✓</span>
                  Income tracking for stipends and part-time work
                </li>
                <li className="flex items-center text-sm font-medium">
                  <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">✓</span>
                  AI recommendations for building credit safely
                </li>
              </ul>
              
              <div>
                <Link 
                  href="/register?mode=student"
                  className={buttonVariants({ variant: "outline", className: "h-12 px-6" })}
                >
                  Start Student Mode
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="bg-muted relative hidden lg:block overflow-hidden">
               {/* Abstract visualization of student finance */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full max-w-md space-y-4 p-8">
                   <div className="h-24 w-full rounded-xl bg-background/80 shadow-sm border p-4 flex flex-col justify-between backdrop-blur">
                     <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
                     <div className="h-8 w-48 bg-primary/20 rounded"></div>
                   </div>
                   <div className="flex gap-4">
                     <div className="h-32 flex-1 rounded-xl bg-background/80 shadow-sm border p-4 flex flex-col justify-between backdrop-blur">
                       <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
                       <div className="h-12 w-12 rounded-full border-4 border-emerald-500/50"></div>
                     </div>
                     <div className="h-32 flex-1 rounded-xl bg-background/80 shadow-sm border p-4 flex flex-col justify-between backdrop-blur">
                       <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
                       <div className="h-12 w-12 rounded-full border-4 border-primary/50"></div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
