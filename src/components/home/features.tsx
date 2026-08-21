import { 
  BrainCircuit, 
  LineChart, 
  Target, 
  Wallet, 
  PieChart, 
  GraduationCap 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    title: 'AI Financial Advisor',
    description: 'Get personalized insights on your spending habits and actionable advice to optimize your wealth.',
    icon: BrainCircuit,
  },
  {
    title: 'Expense Intelligence',
    description: 'Automatically categorize and analyze your spending to identify areas where you can save.',
    icon: Wallet,
  },
  {
    title: 'Investment Insights',
    description: 'Track your portfolio performance, sector diversification, and calculate precise CAGRs.',
    icon: LineChart,
  },
  {
    title: 'Goal Planning',
    description: 'Set financial targets and visualize your progress with deterministic milestone projections.',
    icon: Target,
  },
  {
    title: 'Net Worth Tracking',
    description: 'Aggregate all your assets and liabilities in one place for a complete financial picture.',
    icon: PieChart,
  },
  {
    title: 'Student Mode',
    description: 'A simplified, tailored experience focusing on stipends, allowances, and building early credit.',
    icon: GraduationCap,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to master your money
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Professional-grade financial tools, beautifully designed for everyday use.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-border bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
