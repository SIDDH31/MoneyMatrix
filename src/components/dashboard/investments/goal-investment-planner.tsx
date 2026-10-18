'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateRequiredMonthlyContribution, calculateMonthsRemaining } from '@/lib/financial-engine';
import { Target, TrendingUp, ShieldAlert, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useCurrency } from '@/components/providers/currency-provider';
import { formatCurrency } from '@/lib/financial-engine';
import { motion } from 'motion/react';

interface GoalShape {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | Date | null;
}

interface GoalInvestmentPlannerProps {
  goals: GoalShape[];
}

export function GoalInvestmentPlanner({ goals }: GoalInvestmentPlannerProps) {
  const { currency } = useCurrency();
  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoals[0]?.id || '');

  if (activeGoals.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Goal-Based Investment Planner</CardTitle>
            <CardDescription>See how different investment strategies help you reach your goals.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-8">
            No active financial goals found. Create a goal to see investment scenarios.
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const selectedGoal = activeGoals.find(g => g.id === selectedGoalId) || activeGoals[0];
  const goalDeadlineDate = selectedGoal.deadline ? new Date(selectedGoal.deadline) : null;
  const monthsRemaining = goalDeadlineDate ? calculateMonthsRemaining(goalDeadlineDate) : 0;
  
  // Calculate scenarios
  // Conservative: 6%
  // Moderate: 10%
  // Aggressive: 14%
  const conservativeReq = calculateRequiredMonthlyContribution(selectedGoal.currentAmount, selectedGoal.targetAmount, goalDeadlineDate, 6) || 0;
  const moderateReq = calculateRequiredMonthlyContribution(selectedGoal.currentAmount, selectedGoal.targetAmount, goalDeadlineDate, 10) || 0;
  const aggressiveReq = calculateRequiredMonthlyContribution(selectedGoal.currentAmount, selectedGoal.targetAmount, goalDeadlineDate, 14) || 0;
  const zeroReturnReq = calculateRequiredMonthlyContribution(selectedGoal.currentAmount, selectedGoal.targetAmount, goalDeadlineDate, 0) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Goal-Based Investment Planner</CardTitle>
          <CardDescription>See how different investment strategies help you reach your goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Select Goal</label>
              <Select value={selectedGoalId} onValueChange={(val: any) => setSelectedGoalId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  {activeGoals.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-lg border flex-1 text-center sm:text-left">
              <p className="text-xs text-muted-foreground">Target Amount</p>
              <p className="font-semibold">{formatCurrency(selectedGoal.targetAmount, currency)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg border flex-1 text-center sm:text-left">
              <p className="text-xs text-muted-foreground">Time Horizon</p>
              <p className="font-semibold">{monthsRemaining} months</p>
            </div>
          </div>

          {monthsRemaining > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              
              {/* Cash Scenario */}
              <div className="p-4 border rounded-xl bg-card flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span className="font-medium text-sm">Cash Savings</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(zeroReturnReq), currency)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
                <div className="mt-auto pt-4 border-t border-dashed">
                  <p className="text-xs text-muted-foreground">0% expected return</p>
                </div>
              </div>

              {/* Conservative */}
              <div className="p-4 border rounded-xl bg-card flex flex-col gap-2">
                <div className="flex items-center gap-2 text-blue-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="font-medium text-sm">Conservative</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(conservativeReq), currency)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
                <div className="mt-auto pt-4 border-t border-dashed">
                  <p className="text-xs text-muted-foreground">6% expected return</p>
                </div>
              </div>

              {/* Moderate */}
              <div className="p-4 border border-primary/30 rounded-xl bg-primary/5 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-bl-lg font-medium">Recommended</div>
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium text-sm">Moderate</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(Math.round(moderateReq), currency)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
                <div className="mt-auto pt-4 border-t border-dashed border-primary/20">
                  <p className="text-xs text-muted-foreground">10% expected return</p>
                </div>
              </div>

              {/* Aggressive */}
              <div className="p-4 border rounded-xl bg-card flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-500">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium text-sm">Aggressive</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(Math.round(aggressiveReq), currency)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
                <div className="mt-auto pt-4 border-t border-dashed">
                  <p className="text-xs text-muted-foreground">14% expected return</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-4 text-center text-destructive bg-destructive/10 rounded-lg">
              This goal's target date has already passed. Please update the goal timeline to see investment scenarios.
            </div>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}
