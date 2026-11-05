'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, Loader2, Plus, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTransaction, deleteTransaction } from '@/actions/transactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/transaction-categories';
import { formatCurrency } from '@/lib/financial-engine';
import { useCurrency } from '@/components/providers/currency-provider';
import { cn } from '@/lib/utils';

export interface TransactionRow {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  category: string;
  description: string | null;
  date: string; // ISO
}

type Filter = 'ALL' | 'INCOME' | 'EXPENSE';

function localDateInputValue(d = new Date()) {
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function AddTransactionDialog() {
  const { currency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('type', type);
    setError('');
    startTransition(async () => {
      const result = await addTransaction(formData);
      if ('error' in result) setError(result.error);
      else {
        toast.success(type === 'INCOME' ? 'Income added' : 'Expense added');
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add Transaction
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Transaction type">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  type === t
                    ? t === 'EXPENSE'
                      ? 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400'
                      : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {t === 'EXPENSE' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Amount ({currency === 'USD' ? '$' : '₹'})</Label>
              <Input id="tx-amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">Date</Label>
              <Input id="tx-date" name="date" type="date" defaultValue={localDateInputValue()} max={localDateInputValue()} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            {/* key resets the selection when switching between income and expense */}
            <Select key={type} name="category" defaultValue={categories[0]} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-description">Note (optional)</Label>
            <Input id="tx-description" name="description" placeholder="e.g. Groceries at DMart" maxLength={120} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TransactionManager({ transactions }: { transactions: TransactionRow[] }) {
  const { currency } = useCurrency();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = thisMonth.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const categoryTotals = new Map<string, number>();
  for (const t of thisMonth) if (t.type === 'EXPENSE') categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + t.amount);
  const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const visible = filter === 'ALL' ? transactions : transactions.filter((t) => t.type === filter);
  const monthName = now.toLocaleDateString('en-IN', { month: 'long' });

  const remove = (t: TransactionRow) => {
    if (!window.confirm(`Delete this ${t.type === 'INCOME' ? 'income' : 'expense'} of ${formatCurrency(t.amount, currency)}?`)) return;
    startTransition(async () => {
      const result = await deleteTransaction(t.id);
      if ('error' in result) toast.error(result.error);
      else toast.success('Transaction deleted');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Log your income and spending to see where your money goes.</p>
        </div>
        <AddTransactionDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: `Income in ${monthName}`, value: income, tone: 'text-emerald-600 dark:text-emerald-400' },
          { label: `Spent in ${monthName}`, value: expenses, tone: 'text-red-600 dark:text-red-400' },
          { label: 'Net this month', value: income - expenses, tone: income - expenses >= 0 ? 'text-foreground' : 'text-red-600 dark:text-red-400' },
        ].map((s) => (
          <Card key={s.label} className="glass-card bg-card/70 backdrop-blur-md border-border/50">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-bold mt-1 tabular-nums', s.tone)}>{formatCurrency(s.value, currency)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 glass-card bg-card/70 backdrop-blur-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
            <div>
              <CardTitle>History</CardTitle>
              <CardDescription>Last 90 days</CardDescription>
            </div>
            <div className="flex gap-1" role="tablist" aria-label="Filter transactions">
              {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    filter === f ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {f === 'ALL' ? 'All' : f === 'INCOME' ? 'Income' : 'Expenses'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
                <Receipt className="h-6 w-6" />
                <p>{transactions.length === 0 ? 'No transactions yet. Add your first one to start tracking.' : 'Nothing matches this filter.'}</p>
              </div>
            ) : (
              <ul className="divide-y">
                {visible.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      )}
                    >
                      {t.type === 'INCOME' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} · {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <p className={cn('text-sm font-semibold tabular-nums', t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : '')}>
                      {t.type === 'INCOME' ? '+' : '−'}
                      {formatCurrency(t.amount, currency)}
                    </p>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      title="Delete transaction"
                      className="hover:text-destructive"
                      onClick={() => remove(t)}
                      disabled={pending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Top spending</CardTitle>
            <CardDescription>{monthName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No expenses logged this month.</p>
            ) : (
              topCategories.map(([category, total]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(total, currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-red-500/70" style={{ width: `${expenses > 0 ? (total / expenses) * 100 : 0}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
