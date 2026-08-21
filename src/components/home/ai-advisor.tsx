import { BrainCircuit, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function AiAdvisor() {
  return (
    <section id="ai" className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Google Gemini
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Your personal AI <br /> Financial Advisor
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We separate the math from the advice. Our deterministic calculation engine handles the complex financial models, while Gemini AI provides natural-language insights, personalized recommendations, and educational content based on your unique data.
            </p>
            
            <ul className="space-y-4">
              {[
                'Context-aware spending analysis',
                'Personalized investment education',
                'Proactive budget alerts and suggestions',
                'Interactive financial Q&A'
              ].map((item, i) => (
                <li key={i} className="flex items-center text-foreground">
                  <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <BrainCircuit className="h-3 w-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl -z-10 rounded-full" />
            <Card className="border-border/50 shadow-2xl p-6 bg-card/80 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none p-4 text-sm">
                    Based on your portfolio data, your technology sector allocation is at 45%. While tech has performed well (18% CAGR), you might consider diversifying into index funds to reduce volatility risk.
                  </div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold">
                    ME
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-none p-4 text-sm">
                    What's a good index fund strategy for a beginner?
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-none p-4 text-sm flex flex-col gap-2">
                    <p>For beginners, a "Three-Fund Portfolio" is a great starting point. It typically consists of:</p>
                    <div className="bg-background rounded p-2 text-xs border">
                      <div className="flex justify-between mb-1">
                        <span>Total Domestic Stock Market</span>
                        <span className="font-semibold text-primary">60%</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Total International Stock Market</span>
                        <span className="font-semibold text-primary">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bond Market</span>
                        <span className="font-semibold text-primary">20%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
