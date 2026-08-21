import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, ReceiptText, ArrowUpCircle, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentOverviewProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  savingsRate: number;
}

export function StudentOverview({ monthlyIncome, monthlyExpenses, totalSavings, savingsRate }: StudentOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Allowance/Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total incoming cash</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <ReceiptText className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total outgoing cash</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          <PiggyBank className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Bank balances + cash</p>
        </CardContent>
      </Card>

      <Card>
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
          <p className="text-xs text-muted-foreground mt-1">Of your monthly income</p>
        </CardContent>
      </Card>
    </div>
  );
}
