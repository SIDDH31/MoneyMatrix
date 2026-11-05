'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { CheckCircle2, Loader2, Pause, Play, Plus, Trash2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGoal, contributeToGoal, deleteGoal, setGoalStatus } from '@/actions/goals';
import { calculateGoalProgress, calculateProjectedCompletion, formatCurrency } from '@/lib/financial-engine';
import { useCurrency } from '@/components/providers/currency-provider';
import { cn } from '@/lib/utils';

export interface GoalRow {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
}

const PRIORITY_LABELS = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' } as const;
const PRIORITY_STYLES = {
  HIGH: 'bg-red-500/10 text-red-600 dark:text-red-400',
  MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  LOW: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
} as const;

function AddGoalDialog() {
  const { currency } = useCurrency();
  const symbol = currency === 'USD' ? '$' : '₹';
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError('');
    startTransition(async () => {
      const result = await createGoal(formData);
      if ('error' in result) {
        setError(result.error);
      } else {
        toast.success('Goal created');
        setOpen(false);
      }
    });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New Goal
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New financial goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal name</Label>
            <Input id="goal-name" name="name" placeholder="e.g. New Laptop, Trip to Goa" maxLength={80} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target ({symbol})</Label>
              <Input id="goal-target" name="targetAmount" type="number" min="1" step="1" placeholder="50000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-current">Saved so far ({symbol})</Label>
              <Input id="goal-current" name="currentAmount" type="number" min="0" step="1" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Target date (optional)</Label>
              <Input id="goal-deadline" name="deadline" type="date" min={today} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue="MEDIUM" items={PRIORITY_LABELS}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GoalCard({ goal, monthlySavingCapacity }: { goal: GoalRow; monthlySavingCapacity: number }) {
  const { currency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [pending, startTransition] = useTransition();
  const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const done = goal.status === 'COMPLETED';
  const paused = goal.status === 'PAUSED';
  const projected = !done && !paused ? calculateProjectedCompletion(goal.currentAmount, goal.targetAmount, monthlySavingCapacity) : null;

  const run = (action: () => Promise<{ success: true } | { error: string }>, okMessage: string) =>
    startTransition(async () => {
      const result = await action();
      if ('error' in result) toast.error(result.error);
      else toast.success(okMessage);
    });

  const addMoney = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    run(() => contributeToGoal(goal.id, value), `Added ${formatCurrency(value, currency)} to ${goal.name}`);
    setAmount('');
  };

  return (
    <Card className={cn('glass-card bg-card/70 backdrop-blur-md border-border/50', (done || paused) && 'opacity-80')}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{goal.name}</h3>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', PRIORITY_STYLES[goal.priority])}>
                {PRIORITY_LABELS[goal.priority]}
              </span>
              {done && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Completed</span>}
              {paused && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Paused</span>}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
              {goal.deadline && <> · due {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>}
            </p>
          </div>
          <span className="text-lg font-bold tabular-nums">{Math.round(progress)}%</span>
        </div>

        <div className="h-2 w-full rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn('h-full rounded-full transition-all', done ? 'bg-emerald-500' : 'bg-primary')} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>

        <p className="text-xs text-muted-foreground">
          {done
            ? 'Goal reached. Nice work!'
            : `${formatCurrency(remaining, currency)} to go${projected ? ` · at your current savings pace, about ${projected.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}`}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {!done && (
            <form onSubmit={addMoney} className="flex flex-1 min-w-[200px] gap-2">
              <Input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Add savings"
                aria-label={`Amount to add to ${goal.name}`}
                className="h-9"
                disabled={pending}
              />
              <Button type="submit" size="sm" disabled={pending || !amount}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </Button>
            </form>
          )}
          <div className="flex gap-1 ml-auto">
            {!done && (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                title={paused ? 'Resume goal' : 'Pause goal'}
                onClick={() => run(() => setGoalStatus(goal.id, paused ? 'ACTIVE' : 'PAUSED'), paused ? 'Goal resumed' : 'Goal paused')}
                disabled={pending}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            )}
            {!done && (
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                title="Mark as completed"
                onClick={() => run(() => setGoalStatus(goal.id, 'COMPLETED'), 'Goal marked as completed')}
                disabled={pending}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              title="Delete goal"
              className="hover:text-destructive"
              onClick={() => {
                if (window.confirm(`Delete "${goal.name}"? This can't be undone.`)) {
                  run(() => deleteGoal(goal.id), 'Goal deleted');
                }
              }}
              disabled={pending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GoalManager({ goals, monthlySavingCapacity }: { goals: GoalRow[]; monthlySavingCapacity: number }) {
  const { currency } = useCurrency();
  const active = goals.filter((g) => g.status === 'ACTIVE' || g.status === 'PAUSED');
  const completed = goals.filter((g) => g.status === 'COMPLETED');
  const totalTarget = active.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = active.reduce((s, g) => s + g.currentAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            {active.length > 0
              ? `${formatCurrency(totalSaved, currency)} saved across ${active.length} active goal${active.length === 1 ? '' : 's'} (target ${formatCurrency(totalTarget, currency)})`
              : 'Set a target and track your progress toward it.'}
          </p>
        </div>
        <AddGoalDialog />
      </div>

      {goals.length === 0 ? (
        <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <Target className="h-8 w-8 text-primary" />
            <p className="font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start with an emergency fund of 3 to 6 months of expenses, or something you&apos;re saving up for.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((g) => (
              <GoalCard key={g.id} goal={g} monthlySavingCapacity={monthlySavingCapacity} />
            ))}
          </div>
          {completed.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completed.map((g) => (
                  <GoalCard key={g.id} goal={g} monthlySavingCapacity={monthlySavingCapacity} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
