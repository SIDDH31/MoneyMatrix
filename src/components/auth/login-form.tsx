'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginSchema } from '@/lib/validations/auth';
import { loginUser } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { Activity } from 'lucide-react';

export function LoginForm() {
  const [error, setError] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof loginSchema>>({
    // @ts-ignore
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError('');
    startTransition(() => {
      loginUser(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
      });
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                // @ts-ignore
                control={form.control}
                name="email"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="john.doe@example.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                // @ts-ignore
                control={form.control}
                name="password"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="******"
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {error && (
              <div className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-500/50 text-sm p-3 rounded-md flex items-center gap-x-2">
                <Activity className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 text-center">
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
