"use client";

import { motion } from "motion/react";
import {
  formatCurrency,
  calculateGoalProgress,
  calculateProjectedCompletion,
} from '@/lib/financial-engine';
import { Target, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | Date | null;
  priority: string;
  status: string;
}

interface GoalsSectionProps {
  goals: Goal[];
  monthlySavingCapacity: number;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'HIGH': return 'bg-red-500/10 text-red-600';
    case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-600';
    case 'LOW': return 'bg-blue-500/10 text-blue-600';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getProgressColor(progress: number) {
  if (progress >= 75) return 'bg-emerald-500';
  if (progress >= 50) return 'bg-green-500';
  if (progress >= 25) return 'bg-yellow-500';
  return 'bg-orange-500';
}

export function GoalsSection({ goals, monthlySavingCapacity }: GoalsSectionProps) {
  const { currency } = useCurrency();
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');

  if (activeGoals.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">Financial Goals</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No active goals. Set financial targets to track your progress.
          </p>
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
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-base font-medium">Financial Goals</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
        </span>
      </div>

      <div className="space-y-5">
        {activeGoals.map((goal) => {
          const progress = calculateGoalProgress(goal.currentAmount, goal.targetAmount);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const requiredMonthly = remaining > 0 && monthlySavingCapacity > 0
            ? Math.ceil(remaining / Math.max(1, monthlySavingCapacity > 0 ? remaining / monthlySavingCapacity : 12))
            : null;

          const projected = calculateProjectedCompletion(
            goal.currentAmount,
            goal.targetAmount,
            monthlySavingCapacity
          );

          return (
            <div key={goal.id} className="group rounded-lg border p-4 transition-colors hover:border-primary/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{goal.name}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums">
                  {progress}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Remaining: {formatCurrency(remaining, currency)}</span>
                </div>
                {projected && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Est. {projected.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {goal.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Due: {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
                {progress >= 100 && (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed!</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
