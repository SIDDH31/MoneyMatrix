import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react';

export function DashboardPreview() {
  return (
    <section id="preview" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            A dashboard you'll actually want to use
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Clean, data-dense, and beautifully crafted to give you absolute clarity on your financial position.
          </p>
        </div>

        <div className="relative mx-auto max-w-5xl">
          {/* Main Dashboard Mockup */}
          <div className="rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden ring-1 ring-border/50">
            {/* Mock Header */}
            <div className="border-b border-border/50 bg-muted/20 px-6 py-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-6 w-48 rounded-md bg-muted/50" />
              <div className="h-8 w-8 rounded-full bg-muted/80" />
            </div>
            
            {/* Mock Content */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-background">
              
              {/* Left Column */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm font-medium">Net Worth</span>
                    </div>
                    <div className="text-3xl font-bold">₹12,45,000</div>
                    <div className="mt-2 flex items-center text-sm text-emerald-500">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      <span>+4.2% this month</span>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="text-sm font-medium">Investments</span>
                    </div>
                    <div className="text-3xl font-bold">₹8,30,000</div>
                    <div className="mt-2 flex items-center text-sm text-emerald-500">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      <span>+12.4% XIRR</span>
                    </div>
                  </Card>
                </div>
                
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Cash Flow Overview</h3>
                  {/* Mock Chart Area */}
                  <div className="h-48 w-full flex items-end gap-2 px-2">
                    {[30, 45, 25, 60, 40, 75, 50, 85, 55, 90, 65, 80].map((h, i) => (
                      <div key={i} className="relative flex-1 group">
                        <div 
                          className="absolute bottom-0 w-full rounded-t-sm bg-primary/20 transition-all group-hover:bg-primary/40" 
                          style={{ height: `${h}%` }}
                        />
                        <div 
                          className="absolute bottom-0 w-full rounded-t-sm bg-primary transition-all group-hover:bg-primary/80" 
                          style={{ height: `${h * 0.7}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column (AI & Goals) */}
              <div className="space-y-6">
                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary flex items-center">
                      AI Insight
                    </h3>
                    <Badge variant="outline" className="border-primary/30 text-primary">New</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Based on your spending this month, you are on track to save an extra <span className="font-medium text-foreground">₹4,500</span>. Consider allocating this to your Emergency Fund goal.
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Goals Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Emergency Fund</span>
                        <span className="text-muted-foreground">80%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[80%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">New Laptop</span>
                        <span className="text-muted-foreground">45%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary w-[45%]" />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
