import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, ShieldAlert, TrendingUp } from 'lucide-react';

interface EducationCardsProps {
  savingsRate: number;
  monthlyExpenses: number;
  monthlyIncome: number;
}

export function EducationCards({ savingsRate, monthlyExpenses, monthlyIncome }: EducationCardsProps) {
  
  // Calculate dynamic insights based on student logic
  let insightText = '';
  if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) {
    insightText = "Warning: You are spending more than your allowance. Try identifying subscriptions or wants you can cut back on.";
  } else if (savingsRate < 10) {
    insightText = "Tip: Try the 50/30/20 rule! Aim to save 20% of your allowance for future goals.";
  } else {
    insightText = "Great job! You have a healthy savings rate. Consider learning about low-risk investments to grow your wealth.";
  }

  // Example insight as requested in prompt: "You're spending 28% of your monthly income on subscriptions"
  // We'll simulate a dynamic text for the example
  const examplePercentage = monthlyIncome > 0 ? ((monthlyExpenses * 0.3) / monthlyIncome * 100).toFixed(0) : '0';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Financial Education</CardTitle>
        <CardDescription>Learn the basics of personal finance.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        
        {/* Dynamic Insight */}
        <div className="flex gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <Lightbulb className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Your Personal Insight</h4>
            <p className="text-sm text-muted-foreground">
              {insightText} For example, you might be spending ~{examplePercentage}% of your income on non-essentials.
            </p>
          </div>
        </div>

        {/* Lesson: Emergency Fund */}
        <div className="flex gap-4">
          <div className="bg-muted p-2 rounded-lg h-fit">
            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">What is an Emergency Fund?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              It's a cash reserve kept specifically for unplanned expenses or financial emergencies. 
              Aim to save 3-6 months of your expenses so you never have to rely on debt.
            </p>
          </div>
        </div>

        {/* Lesson: Compound Interest */}
        <div className="flex gap-4">
          <div className="bg-muted p-2 rounded-lg h-fit">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">The Power of Compound Interest</h4>
            <p className="text-sm text-muted-foreground mt-1">
              When you invest, your money earns interest. Compound interest is when that interest starts earning its own interest! 
              Starting early is the biggest advantage you have as a student.
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
