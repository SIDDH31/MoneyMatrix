import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongoose';
import { Profile, Transaction } from '@/lib/models';
import { TransactionManager, type TransactionRow } from '@/components/dashboard/transactions/transaction-manager';

export const metadata: Metadata = {
  title: 'Transactions | MoneyMatrix',
  description: 'Log and review your income and expenses.',
};

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = session.user.id;

  await connectDB();
  if (!(await Profile.exists({ userId }))) redirect('/onboarding');

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const transactions = await Transaction.find({ userId, type: { $in: ['INCOME', 'EXPENSE'] }, date: { $gte: since } })
    .sort({ date: -1, createdAt: -1 })
    .limit(500)
    .lean();

  const rows: TransactionRow[] = transactions.map((t) => ({
    id: t._id.toString(),
    type: t.type as 'INCOME' | 'EXPENSE',
    amount: t.amount,
    category: t.category,
    description: t.description ?? null,
    date: new Date(t.date).toISOString(),
  }));

  return <TransactionManager transactions={rows} />;
}
