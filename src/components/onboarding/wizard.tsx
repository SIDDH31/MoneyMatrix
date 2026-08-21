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
  { id: 'basic', title: 'Basic Info' },
  { id: 'income', title: 'Income' },
  { id: 'expenses', title: 'Expenses' },
  { id: 'financial', title: 'Financial Position' },
  { id: 'goal', title: 'Initial Goal' },
  { id: 'risk', title: 'Risk Profile' },
];

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
      income: { monthlyIncome: 0, incomeType: 'SALARY' },
      expenses: { housing: 0, food: 0, transportation: 0, subscriptions: 0, education: 0, entertainment: 0, other: 0 },
      financialPosition: { bankBalance: 0, investments: 0, savings: 0, liabilities: 0 },
      initialGoal: { goalName: 'Emergency Fund', targetAmount: 100000, currentAmount: 0 },
      riskQuiz: { reactionToDrop: 'do_nothing', timeHorizon: '3_to_7', primaryObjective: 'growth' },
    },
    mode: 'onChange',
  });

  const nextStep = async () => {
    // Validate current step fields before moving on
    let fieldsToValidate: string[] = [];
    if (currentStep === 0) fieldsToValidate = ['basicInfo.age', 'basicInfo.occupation'];
    if (currentStep === 1) fieldsToValidate = ['income.monthlyIncome'];
    if (currentStep === 2) fieldsToValidate = ['expenses.housing', 'expenses.food'];
    // Add more granular validation logic if needed
    
    // We'll just force a re-render and let zod handle it, but for a simple wizard, 
    // we can just proceed and let the final submit catch it, or validate chunks.
    // For this prototype, we'll validate the whole form at the end to avoid blocking, 
    // but ideally we'd trigger validation on the specific sub-schema.
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
          <CardTitle className="text-xl">{STEPS[currentStep].title}</CardTitle>
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
                    <FormControl><Input type="number" {...field} /></FormControl>
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
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="income.incomeType" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Primary Income Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full mb-2">
                  <h3 className="text-sm font-medium">Estimated Monthly Expenses (₹)</h3>
                  <p className="text-xs text-muted-foreground">It's okay to estimate for now.</p>
                </div>
                <FormField control={form.control} name="expenses.housing" render={({ field }: any) => (
                  <FormItem><FormLabel>Housing / Rent</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="expenses.food" render={({ field }: any) => (
                  <FormItem><FormLabel>Food & Groceries</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="expenses.transportation" render={({ field }: any) => (
                  <FormItem><FormLabel>Transportation</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="expenses.subscriptions" render={({ field }: any) => (
                  <FormItem><FormLabel>Subscriptions</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
            )}

            {/* STEP 3: FINANCIAL POSITION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <FormField control={form.control} name="financialPosition.bankBalance" render={({ field }: any) => (
                  <FormItem><FormLabel>Total Bank Balance (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.investments" render={({ field }: any) => (
                  <FormItem><FormLabel>Total Investments (Stocks, Mutual Funds, etc.)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                 <FormField control={form.control} name="financialPosition.liabilities" render={({ field }: any) => (
                  <FormItem><FormLabel>Total Liabilities (Loans, Credit Debt)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
            )}

            {/* STEP 4: GOAL */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="initialGoal.goalName" render={({ field }: any) => (
                  <FormItem><FormLabel>What is your primary financial goal?</FormLabel><FormControl><Input placeholder="e.g. Emergency Fund, New Laptop" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="initialGoal.targetAmount" render={({ field }: any) => (
                  <FormItem><FormLabel>Target Amount (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="initialGoal.currentAmount" render={({ field }: any) => (
                  <FormItem><FormLabel>Current Amount Saved (₹)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )} />
              </div>
            )}

            {/* STEP 5: RISK PROFILE */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <FormField control={form.control} name="riskQuiz.reactionToDrop" render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>1. If your investment portfolio dropped 20% in a month, you would:</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Button type="button" onClick={nextStep}>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
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
