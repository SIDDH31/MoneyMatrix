'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCompact } from '@/lib/financial-engine';

import { useCurrency } from '@/components/providers/currency-provider';
import { motion } from 'motion/react';

interface CashFlowChartProps {
  monthlyIncome: number;
  monthlyExpenses: number;
}

export function CashFlowChart({
  monthlyIncome,
  monthlyExpenses,
}: CashFlowChartProps) {
  const { currency } = useCurrency();
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);

  // Generate simulated monthly data based on current values
  // In production, this would come from transaction history
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = months.map((month, index) => {
    // Add slight variance for visual realism (deterministic based on index)
    const variance = 1 + (((index * 7 + 3) % 11) - 5) / 100; // ±5% variance
    const inc = Math.round(monthlyIncome * variance);
    const exp = Math.round(monthlyExpenses * (1 + (((index * 5 + 1) % 9) - 4) / 100));
    return {
      month,
      Income: inc,
      Expenses: exp,
      Savings: Math.max(0, inc - exp),
    };
  });

  if (monthlyIncome === 0 && monthlyExpenses === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-base font-medium mb-2">Cash Flow</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No income or expense data available yet.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium">Cash Flow</h3>
          <p className="text-sm text-muted-foreground">Income vs Expenses vs Savings (Monthly)</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
            Income
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-4)' }} />
            Expenses
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--chart-2)' }} />
            Savings
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompact(v, currency)}
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: any, name: any) => [formatCompact(value, currency), name]}
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Area
            type="monotone"
            dataKey="Income"
            stroke="var(--chart-1)"
            fill="url(#gradIncome)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Expenses"
            stroke="var(--chart-4)"
            fill="url(#gradExpenses)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="Savings"
            stroke="var(--chart-2)"
            fill="url(#gradSavings)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
