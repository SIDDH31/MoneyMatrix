'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { formatCompact } from '@/lib/financial-engine';
import { motion } from 'motion/react';
import { useCurrency } from '@/components/providers/currency-provider';

interface NetWorthChartProps {
  totalAssets: number;
  totalLiabilities: number;
  bankBalance: number;
  investments: number;
  savings: number;
  otherAssets: number;
}

export function NetWorthChart({
  totalAssets,
  totalLiabilities,
  bankBalance,
  investments,
  savings,
  otherAssets,
}: NetWorthChartProps) {
  const { currency } = useCurrency();
  const netWorth = totalAssets - totalLiabilities;

  const data = [
    { name: 'Bank Balance', value: bankBalance, fill: 'var(--chart-1)' },
    { name: 'Investments', value: investments, fill: 'var(--chart-2)' },
    { name: 'Savings', value: savings, fill: 'var(--chart-5)' },
    { name: 'Other Assets', value: otherAssets, fill: 'var(--chart-3)' },
    { name: 'Liabilities', value: -totalLiabilities, fill: 'var(--chart-4)' },
  ].filter((d) => d.value !== 0);

  if (data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card rounded-xl p-6"
      >
        <h3 className="text-base font-medium mb-2">Net Worth Breakdown</h3>
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No financial data yet. Complete onboarding to see your net worth.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-medium">Net Worth Breakdown</h3>
          <p className="text-sm text-muted-foreground">Assets − Liabilities = Net Worth</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {formatCompact(netWorth, currency)}
          </p>
          <p className="text-xs text-muted-foreground">Net Worth</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
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
            formatter={(value: any) => [formatCompact(Math.abs(value), currency), '']}
            contentStyle={{
              backgroundColor: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <ReferenceLine y={0} stroke="var(--border)" />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
