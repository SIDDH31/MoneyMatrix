'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { onboardingSchema, OnboardingData } from '@/lib/validations/onboarding';
import { submitOnboarding } from '@/actions/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'income', title: 'Income', description: 'Your earnings overview' },
  { id: 'expenses', title: 'Expenses', description: 'Monthly spending breakdown' },
  { id: 'financial', title: 'Financial Position', description: 'Your current financial standing' },
  { id: 'goal', title: 'Initial Goal', description: 'Set your first financial target' },
  { id: 'risk', title: 'Risk Profile', description: 'Understand your risk tolerance' },
];

// Map step index to the form field paths that need validation
const STEP_FIELDS: Record<number, string[]> = {
  0: ['basicInfo.age', 'basicInfo.occupation', 'basicInfo.studentMode'],
  1: ['income.monthlyIncome', 'income.additionalIncome', 'income.incomeType'],
  2: ['expenses.housing', 'expenses.food', 'expenses.transportation', 'expenses.subscriptions', 'expenses.education', 'expenses.entertainment', 'expenses.other'],
  3: ['financialPosition.bankBalance', 'financialPosition.investments', 'financialPosition.savings', 'financialPosition.assets', 'financialPosition.liabilities'],
  4: ['initialGoal.goalName', 'initialGoal.targetAmount', 'initialGoal.currentAmount'],
  5: ['riskQuiz.reactionToDrop', 'riskQuiz.timeHorizon', 'riskQuiz.primaryObjective'],
};

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<OnboardingData>({
    // @ts-ignore
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      basicInfo: { age: 25, studentMode: false, occupation: '' },
      income: { monthlyIncome: 0, additionalIncome: 0, incomeType: 'SALARY' },
      expenses: { housing: 0, food: 0, transportation: 0, subscriptions: 0, education: 0, entertainment: 0, other: 0 },
      financialPosition: { bankBalance: 0, investments: 0, savings: 0, assets: 0, liabilities: 0 },
      initialGoal: { goalName: 'Emergency Fund', targetAmount: 100000, currentAmount: 0 },
      riskQuiz: { reactionToDrop: 'do_nothing', timeHorizon: '3_to_7', primaryObjective: 'growth' },
    },
    mode: 'onChange',
  });

  const nextStep = async () => {
    // Validate current step fields before advancing
    const fields = STEP_FIELDS[currentStep];
    if (fields) {
      const isValid = await form.trigger(fields as any);
      if (!isValid) return; // Don't advance if validation fails
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = (data: OnboardingData) => {
    setError('');
    startTransition(() => {
      submitOnboarding(data).then((res) => {
        if (res?.error) {
          setError(res.error);
        }
      });
    });
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div>
            <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
            <CardDescription className="mt-1">{STEPS[currentStep].description}</CardDescription>
          </div>
          <span className="text-sm text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 py-4">
            
            {/* STEP 0: BASIC INFO */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="basicInfo.age" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 22" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="basicInfo.occupation" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl><Input placeholder="Software Engineer, Student, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="basicInfo.studentMode" render={({ field }: any) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Student Mode</FormLabel>
                      <FormDescription>
                        Optimizes the UI for tracking stipends, allowances, and minimizing debt.
                      </FormDescription>
                    </div>
                  </FormItem>
                )} />
              </div>
            )}

            {/* STEP 1: INCOME */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="income.monthlyIncome" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Average Monthly Income (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 50000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="income.additionalIncome" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Additional Monthly Income (₹)</FormLabel>
                    <FormDescription>Freelance, side projects, rental income, etc.</FormDescription>
                    <FormControl><Input type="number" placeholder="e.g. 10000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="income.incomeType" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Primary Income Source</FormLabel>
                    <Select items={{SALARY: 'Salary', FREELANCE: 'Freelance / Contract', STIPEND: 'Stipend', ALLOWANCE: 'Allowance', PART_TIME: 'Part-Time', OTHER: 'Other'}} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select income type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SALARY">Salary</SelectItem>
                        <SelectItem value="FREELANCE">Freelance / Contract</SelectItem>
                        <SelectItem value="STIPEND">Stipend</SelectItem>
                        <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                        <SelectItem value="PART_TIME">Part-Time</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}

            {/* STEP 2: EXPENSES */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="mb-2">
                  <h3 className="text-sm font-medium">Estimated Monthly Expenses (₹)</h3>
                  <p className="text-xs text-muted-foreground">It's okay to estimate for now.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="expenses.housing" render={({ field }: any) => (
                    <FormItem><FormLabel>Housing / Rent</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.food" render={({ field }: any) => (
                    <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.transportation" render={({ field }: any) => (
                    <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.subscriptions" render={({ field }: any) => (
                    <FormItem><FormLabel>Subscriptions</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.education" render={({ field }: any) => (
                    <FormItem><FormLabel>Education</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.entertainment" render={({ field }: any) => (
                    <FormItem><FormLabel>Entertainment</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="expenses.other" render={({ field }: any) => (
                    <FormItem><FormLabel>Other Expenses</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
            )}

            {/* STEP 3: FINANCIAL POSITION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <FormField control={form.control} name="financialPosition.bankBalance" render={({ field }: any) => (
                  <FormItem><FormLabel>Total Bank Balance (₹)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.savings" render={({ field }: any) => (
                  <FormItem><FormLabel>Savings (₹)</FormLabel><FormDescription>Fixed deposits, recurring deposits, etc.</FormDescription><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.investments" render={({ field }: any) => (
                  <FormItem><FormLabel>Investments (₹)</FormLabel><FormDescription>Stocks, mutual funds, crypto, etc.</FormDescription><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.assets" render={({ field }: any) => (
                  <FormItem><FormLabel>Other Assets (₹)</FormLabel><FormDescription>Property, vehicles, electronics, jewelry, etc.</FormDescription><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.liabilities" render={({ field }: any) => (
                  <FormItem><FormLabel>Total Liabilities (₹)</FormLabel><FormDescription>Loans, credit card debt, etc.</FormDescription><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            )}

            {/* STEP 4: GOAL */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="initialGoal.goalName" render={({ field }: any) => (
                  <FormItem><FormLabel>What is your primary financial goal?</FormLabel><FormControl><Input placeholder="e.g. Emergency Fund, New Laptop" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="initialGoal.targetAmount" render={({ field }: any) => (
                  <FormItem><FormLabel>Target Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="e.g. 100000" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="initialGoal.currentAmount" render={({ field }: any) => (
                  <FormItem><FormLabel>Current Amount Saved (₹)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            )}

            {/* STEP 5: RISK PROFILE */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="riskQuiz.reactionToDrop" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>1. If your investment portfolio dropped 20% in a month, you would:</FormLabel>
                    <Select items={{sell_all: 'Sell everything to avoid further loss', sell_some: 'Sell some of it to feel safer', do_nothing: 'Do nothing and wait for it to recover', buy_more: "Buy more while it's cheap"}} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select answer" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sell_all">Sell everything to avoid further loss</SelectItem>
                        <SelectItem value="sell_some">Sell some of it to feel safer</SelectItem>
                        <SelectItem value="do_nothing">Do nothing and wait for it to recover</SelectItem>
                        <SelectItem value="buy_more">Buy more while it's cheap</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="riskQuiz.timeHorizon" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>2. When will you need to withdraw a significant portion of your investments?</FormLabel>
                    <Select items={{less_than_1: 'Less than 1 year', '1_to_3': '1 to 3 years', '3_to_7': '3 to 7 years', more_than_7: 'More than 7 years'}} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select answer" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                        <SelectItem value="1_to_3">1 to 3 years</SelectItem>
                        <SelectItem value="3_to_7">3 to 7 years</SelectItem>
                        <SelectItem value="more_than_7">More than 7 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="riskQuiz.primaryObjective" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>3. What is your primary investment objective?</FormLabel>
                    <Select items={{capital_preservation: 'Preserve my money (low risk)', income: 'Generate steady income', growth: 'Grow wealth over time (moderate risk)', speculation: 'Maximize returns (high risk)'}} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select answer" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="capital_preservation">Preserve my money (low risk)</SelectItem>
                        <SelectItem value="income">Generate steady income</SelectItem>
                        <SelectItem value="growth">Grow wealth over time (moderate risk)</SelectItem>
                        <SelectItem value="speculation">Maximize returns (high risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            )}

            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between pt-6 border-t mt-8">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0 || isPending}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                // Distinct keys stop React reusing this button as the submit button mid-click,
                // which used to submit the form when moving from step 5 to step 6.
                <Button key="next" type="button" onClick={nextStep}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button key="submit" type="submit" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Complete Setup'} 
                  {!isPending && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
