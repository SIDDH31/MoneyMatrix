'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/financial-engine';

interface ExpenseAnalysisProps {
  budgets: { category: string; limit: number }[];
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'oklch(0.6 0.15 280)',  // purple
  'oklch(0.7 0.12 200)',  // teal
];

export function ExpenseAnalysis({ budgets }: ExpenseAnalysisProps) {
  if (budgets.length === 0) {
    return (
      <div className="border rounded-xl bg-card p-6">
        <h3 className="text-base font-medium mb-2">Expense Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No expense categories set up yet.
        </div>
      </div>
    );
  }

  const totalExpenses = budgets.reduce((sum, b) => sum + b.limit, 0);
  const sortedBudgets = [...budgets].sort((a, b) => b.limit - a.limit);

  const pieData = sortedBudgets.map((b) => ({
    name: b.category,
    value: b.limit,
    percentage: totalExpenses > 0 ? Math.round((b.limit / totalExpenses) * 1000) / 10 : 0,
  }));

  return (
    <div className="border rounded-xl bg-card p-6">
      <div className="mb-4">
        <h3 className="text-base font-medium">Expense Breakdown</h3>
        <p className="text-sm text-muted-foreground">
          Monthly total: {formatCurrency(totalExpenses)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [formatCurrency(value), '']}
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Category List */}
        <div className="space-y-3">
          {sortedBudgets.map((budget, index) => {
            const percentage = totalExpenses > 0 ? (budget.limit / totalExpenses) * 100 : 0;
            return (
              <div key={budget.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{budget.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                    <span className="font-medium tabular-nums w-20 text-right">
                      {formatCurrency(budget.limit)}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
