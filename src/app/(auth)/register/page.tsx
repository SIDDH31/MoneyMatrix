import { RegisterForm } from '@/components/auth/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | MoneyMatrix',
  description: 'Create a new MoneyMatrix account',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <RegisterForm />
    </div>
  );
}
