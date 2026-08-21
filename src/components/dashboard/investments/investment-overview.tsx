'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, TrendingUp, TrendingDown, Percent, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PortfolioSummary } from '@/lib/financial-engine/portfolio-analytics';
import { formatCurrency } from '@/lib/financial-engine';
import { useCurrency } from '@/components/providers/currency-provider';
import { motion } from 'motion/react';

export function InvestmentOverview({ analytics }: { analytics: PortfolioSummary }) {
  const { currency } = useCurrency();
  const { totalInvested, totalCurrentValue: currentValue, totalGainLoss, totalReturnPercentage: overallReturnPercentage } = analytics;
  const isPositive = totalGainLoss >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentValue, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Current market value</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalInvested, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Capital deployed</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gain / Loss</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl font-bold', isPositive ? 'text-emerald-500' : 'text-red-500')}>
            {isPositive ? '+' : ''}{formatCurrency(totalGainLoss, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Unrealized profit/loss</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Return</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl font-bold', isPositive ? 'text-emerald-500' : 'text-red-500')}>
            {isPositive ? '+' : ''}{overallReturnPercentage.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Absolute return</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
