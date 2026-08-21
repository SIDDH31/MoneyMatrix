'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@/components/providers/currency-provider';
import { formatCurrency, formatCompact } from '@/lib/financial-engine';
import { motion } from 'motion/react';

export function InvestmentSimulator() {
  const { currency } = useCurrency();
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(8);
  const [years, setYears] = useState(10);

  const data = useMemo(() => {
    const points = [];
    let currentTotal = initialInvestment;
    let totalInvested = initialInvestment;
    
    // Monthly rate
    const r = expectedReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      if (year === 0) {
        points.push({
          year: 'Year 0',
          totalInvested: initialInvestment,
          totalValue: initialInvestment,
        });
        continue;
      }
      
      // Calculate for this year (12 months)
      for (let month = 1; month <= 12; month++) {
        currentTotal = currentTotal * (1 + r) + monthlyContribution;
        totalInvested += monthlyContribution;
      }

      points.push({
        year: `Year ${year}`,
        totalInvested: Math.round(totalInvested),
        totalValue: Math.round(currentTotal),
      });
    }
    
    return points;
  }, [initialInvestment, monthlyContribution, expectedReturn, years]);

  const finalValue = data[data.length - 1].totalValue;
  const finalInvested = data[data.length - 1].totalInvested;
  const estimatedReturns = finalValue - finalInvested;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full flex flex-col glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Investment Simulator</CardTitle>
          <CardDescription>Visualize the power of compound interest over time.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-6">
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Initial Investment</Label>
              <span className="text-sm font-medium">{formatCurrency(initialInvestment, currency)}</span>
            </div>
            <Slider 
              value={[initialInvestment]} 
              min={0} 
              max={100000} 
              step={1000} 
              onValueChange={(val: any) => setInitialInvestment(val[0])} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Monthly Contribution</Label>
              <span className="text-sm font-medium">{formatCurrency(monthlyContribution, currency)}</span>
            </div>
            <Slider 
              value={[monthlyContribution]} 
              min={0} 
              max={5000} 
              step={100} 
              onValueChange={(val: any) => setMonthlyContribution(val[0])} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Expected Return (%)</Label>
              <span className="text-sm font-medium">{expectedReturn}%</span>
            </div>
            <Slider 
              value={[expectedReturn]} 
              min={1} 
              max={20} 
              step={0.5} 
              onValueChange={(val: any) => setExpectedReturn(val[0])} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Duration (Years)</Label>
              <span className="text-sm font-medium">{years} Years</span>
            </div>
            <Slider 
              value={[years]} 
              min={1} 
              max={40} 
              step={1} 
              onValueChange={(val: any) => setYears(val[0])} 
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
            <p className="text-lg font-semibold">{formatCurrency(finalInvested, currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Est. Returns</p>
            <p className="text-lg font-semibold text-emerald-500">+{formatCurrency(estimatedReturns, currency)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Final Value</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(finalValue, currency)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} minTickGap={30} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(val) => formatCompact(val, currency)}
                width={60}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value), currency), '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
              />
              <Area 
                type="monotone" 
                dataKey="totalValue" 
                name="Total Value" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
              <Area 
                type="monotone" 
                dataKey="totalInvested" 
                name="Total Invested" 
                stroke="#64748b" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorInvested)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-[10px] text-muted-foreground text-center">
          *Projections are estimates based on expected compound returns. Actual market returns will vary and are not guaranteed.
        </p>
      </CardContent>
    </Card>
    </motion.div>
  );
}
