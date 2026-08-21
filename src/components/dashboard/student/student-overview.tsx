'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, ReceiptText, ArrowUpCircle, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/components/providers/currency-provider';
import { formatCurrency } from '@/lib/financial-engine';
import { motion } from 'motion/react';

interface StudentOverviewProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  savingsRate: number;
}

export function StudentOverview({ monthlyIncome, monthlyExpenses, totalSavings, savingsRate }: StudentOverviewProps) {
  const { currency } = useCurrency();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Allowance/Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyIncome, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total incoming cash</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <ReceiptText className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyExpenses, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total outgoing cash</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          <PiggyBank className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalSavings, currency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Bank balances + cash</p>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold", 
            savingsRate >= 20 ? "text-emerald-500" : savingsRate > 0 ? "text-yellow-500" : "text-destructive"
          )}>
            {savingsRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Target: &gt; 20%</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
