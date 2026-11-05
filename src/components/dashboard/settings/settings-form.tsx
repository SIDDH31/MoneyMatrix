'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateSettings } from '@/actions/settings';

export interface SettingsValues {
  name: string;
  email: string;
  occupation: string;
  age: number | null;
  monthlyIncome: number;
  additionalIncome: number;
  incomeType: 'SALARY' | 'STIPEND' | 'ALLOWANCE' | 'FREELANCE' | 'PART_TIME' | 'OTHER';
  currency: 'INR' | 'USD';
  studentMode: boolean;
}

const INCOME_TYPES = {
  SALARY: 'Salary',
  FREELANCE: 'Freelance / Contract',
  STIPEND: 'Stipend',
  ALLOWANCE: 'Allowance',
  PART_TIME: 'Part-Time',
  OTHER: 'Other',
} as const;

const CURRENCIES = { INR: '₹ Indian Rupee (INR)', USD: '$ US Dollar (USD)' } as const;

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [studentMode, setStudentMode] = useState(initial.studentMode);
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (studentMode) formData.set('studentMode', 'on');
    else formData.delete('studentMode');
    setError('');

    startTransition(async () => {
      const result = await updateSettings(formData);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      toast.success('Settings saved');
      // Currency is held in client state by CurrencyProvider, so a full reload picks up a change.
      if (formData.get('currency') !== initial.currency) window.location.reload();
      else router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you appear in MoneyMatrix.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={initial.name} maxLength={60} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={initial.email} disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input id="occupation" name="occupation" defaultValue={initial.occupation} maxLength={60} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" name="age" type="number" min={13} max={120} defaultValue={initial.age ?? ''} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>Used for your savings rate, health score and AI advice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Monthly income</Label>
            <Input id="monthlyIncome" name="monthlyIncome" type="number" min={0} step="1" defaultValue={initial.monthlyIncome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="additionalIncome">Additional monthly income</Label>
            <Input id="additionalIncome" name="additionalIncome" type="number" min={0} step="1" defaultValue={initial.additionalIncome} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Main income source</Label>
            <Select name="incomeType" defaultValue={initial.incomeType} items={INCOME_TYPES}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INCOME_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card bg-card/70 backdrop-blur-md border-border/50">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select name="currency" defaultValue={initial.currency} items={CURRENCIES}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div>
              <Label htmlFor="studentMode" className="cursor-pointer">Student Mode</Label>
              <p className="text-xs text-muted-foreground mt-0.5">A simpler dashboard built around allowances, stipends and saving.</p>
            </div>
            <Switch id="studentMode" checked={studentMode} onCheckedChange={setStudentMode} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
