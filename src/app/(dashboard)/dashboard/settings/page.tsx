import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile } from '@/lib/models';
import { SettingsForm, type SettingsValues } from '@/components/dashboard/settings/settings-form';

export const metadata: Metadata = {
  title: 'Settings | MoneyMatrix',
  description: 'Manage your profile, income and preferences.',
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  await connectDB();
  const profile = await Profile.findOne({ userId }).lean();
  if (!profile) redirect('/onboarding');

  let name = session.user.name ?? '';
  let email = session.user.email ?? '';
  const db = mongoose.connection.db;
  if (db && mongoose.isValidObjectId(userId)) {
    const user = await db.collection('users').findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { name: 1, email: 1 } }
    );
    name = (user?.name as string) ?? name;
    email = (user?.email as string) ?? email;
  }

  const initial: SettingsValues = {
    name,
    email,
    occupation: profile.occupation ?? '',
    age: profile.age ?? null,
    monthlyIncome: profile.monthlyIncome ?? 0,
    additionalIncome: profile.additionalIncome ?? 0,
    incomeType: (profile.incomeType as SettingsValues['incomeType']) ?? 'OTHER',
    currency: profile.currency === 'USD' ? 'USD' : 'INR',
    studentMode: profile.studentMode ?? false,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Update your profile, income and preferences.</p>
      </div>
      <SettingsForm initial={initial} />
    </div>
  );
}
