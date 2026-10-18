import { Lightbulb, TrendingUp, PiggyBank, AlertTriangle, BookOpen, Target } from 'lucide-react';

/**
 * AI Insights Section
 * 
 * Falls back to structured mock insights when no AI API is configured
 * or when no DB insights exist. Mock insights are derived deterministically
 * from the user's financial data.
 */

// Types matching the Prisma AIInsight model
interface AIInsight {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface AIInsightsProps {
  dbInsights: AIInsight[];
  financialContext: {
    savingsRate: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    totalLiabilities: number;
    goalCount: number;
    hasInvestments: boolean;
  };
}

// ─────────────────────────────────────────────────────────
// Mock Insight Generator (deterministic, no LLM)
// ─────────────────────────────────────────────────────────
function generateMockInsights(ctx: AIInsightsProps['financialContext']): AIInsight[] {
  const insights: AIInsight[] = [];
  const now = new Date();

  // Savings rate insight
  if (ctx.savingsRate < 10) {
    insights.push({
      id: 'mock-savings-low',
      type: 'SAVINGS_TIP',
      title: 'Boost Your Savings',
      content: `Your savings rate is ${ctx.savingsRate}%. Financial experts recommend saving at least 20% of income. Consider automating a monthly transfer to a savings account.`,
      isRead: false,
      createdAt: now,
    });
  } else if (ctx.savingsRate >= 20) {
    insights.push({
      id: 'mock-savings-great',
      type: 'SAVINGS_TIP',
      title: 'Great Savings Habits! 🎉',
      content: `You're saving ${ctx.savingsRate}% of your income — that's above the recommended 20%. Consider channeling the extra into investments for compound growth.`,
      isRead: false,
      createdAt: now,
    });
  }

  // Debt insight
  if (ctx.totalLiabilities > 0 && ctx.monthlyIncome > 0) {
    const debtToIncome = ctx.totalLiabilities / (ctx.monthlyIncome * 12);
    if (debtToIncome > 0.5) {
      insights.push({
        id: 'mock-debt-high',
        type: 'BUDGET_ALERT',
        title: 'High Debt-to-Income Ratio',
        content: `Your total debt is ${Math.round(debtToIncome * 100)}% of annual income. Consider the avalanche method (paying high-interest debt first) to reduce your burden faster.`,
        isRead: false,
        createdAt: now,
      });
    }
  }

  // Investment insight
  if (!ctx.hasInvestments) {
    insights.push({
      id: 'mock-invest',
      type: 'INVESTMENT_SUGGESTION',
      title: 'Start Your Investment Journey',
      content: 'You haven\'t started investing yet. Even ₹500/month in a SIP (Systematic Investment Plan) can grow significantly over time through compound interest.',
      isRead: false,
      createdAt: now,
    });
  }

  // Goal insight
  if (ctx.goalCount === 0) {
    insights.push({
      id: 'mock-goals',
      type: 'GOAL_PROGRESS',
      title: 'Set Financial Goals',
      content: 'Setting specific, measurable financial goals increases your chances of achieving them by 42%. Start with an emergency fund covering 3-6 months of expenses.',
      isRead: false,
      createdAt: now,
    });
  }

  // Educational insight (always show one)
  insights.push({
    id: 'mock-edu',
    type: 'EDUCATIONAL',
    title: 'The 50/30/20 Rule',
    content: 'A popular budgeting framework: allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment. It\'s a great starting point for budget planning.',
    isRead: false,
    createdAt: now,
  });

  return insights.slice(0, 4); // Max 4 insights
}

// ─────────────────────────────────────────────────────────
// UI Component
// ─────────────────────────────────────────────────────────

function getInsightIcon(type: string) {
  switch (type) {
    case 'SAVINGS_TIP': return <PiggyBank className="h-4 w-4 text-emerald-500" />;
    case 'INVESTMENT_SUGGESTION': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case 'BUDGET_ALERT': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'GOAL_PROGRESS': return <Target className="h-4 w-4 text-violet-500" />;
    case 'EDUCATIONAL': return <BookOpen className="h-4 w-4 text-cyan-500" />;
    default: return <Lightbulb className="h-4 w-4 text-yellow-500" />;
  }
}

function getInsightBg(type: string) {
  switch (type) {
    case 'SAVINGS_TIP': return 'bg-emerald-500/10';
    case 'INVESTMENT_SUGGESTION': return 'bg-blue-500/10';
    case 'BUDGET_ALERT': return 'bg-orange-500/10';
    case 'GOAL_PROGRESS': return 'bg-violet-500/10';
    case 'EDUCATIONAL': return 'bg-cyan-500/10';
    default: return 'bg-yellow-500/10';
  }
}

export function AIInsights({ dbInsights, financialContext }: AIInsightsProps) {
  // Use DB insights if available, otherwise fall back to mock
  const insights = dbInsights.length > 0 ? dbInsights : generateMockInsights(financialContext);

  return (
    <div className="border rounded-xl bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-base font-medium">AI Insights</h3>
        </div>
        {dbInsights.length === 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
            Smart Suggestions
          </span>
        )}
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="group rounded-lg border p-4 transition-all hover:border-primary/20 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${getInsightBg(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
