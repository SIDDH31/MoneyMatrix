import { CheckCircle2 } from 'lucide-react';

const steps = [
  {
    title: 'Connect your data',
    description: 'Manually add your accounts or let MoneyMatrix categorize your transactions intelligently.',
  },
  {
    title: 'Set your targets',
    description: 'Define your financial goals, whether it\'s an emergency fund, a new car, or retirement.',
  },
  {
    title: 'Analyze and optimize',
    description: 'Use our AI to uncover saving opportunities and optimize your investment strategy.',
  },
  {
    title: 'Watch your wealth grow',
    description: 'Track your net worth over time and stay on top of your financial health score.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How MoneyMatrix works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A simple, deterministic approach to complex personal finance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center">
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[1px] bg-border" />
              )}
              
              <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-4 border-background text-primary mb-6">
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
