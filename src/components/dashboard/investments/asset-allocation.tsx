'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PortfolioSummary } from '@/lib/financial-engine/portfolio-analytics';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export function AssetAllocation({ analytics }: { analytics: PortfolioSummary }) {
  const data = analytics.allocations.map((a, index) => ({
    name: a.category,
    value: a.value,
    percentage: a.weightPercentage,
    color: COLORS[index % COLORS.length]
  }));

  if (data.length === 0) {
    return (
      <Card className="h-full min-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Composition of your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          No investments found to analyze allocation.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>Composition of your portfolio</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              labelFormatter={(label) => label}
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
