import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { analyzePortfolio } from '@/lib/financial-engine/portfolio-analytics';
import { InvestmentOverview } from '@/components/dashboard/investments/investment-overview';
import { AssetAllocation } from '@/components/dashboard/investments/asset-allocation';
import { AddAssetModal } from '@/components/dashboard/investments/add-asset-modal';
import { InvestmentSimulator } from '@/components/dashboard/investments/investment-simulator';
import { GoalInvestmentPlanner } from '@/components/dashboard/investments/goal-investment-planner';

export const metadata = {
  title: 'Investments | MoneyMatrix',
  description: 'Track and forecast your investment portfolio.',
};

export default async function InvestmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [assets, goals] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.financialGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { deadline: 'asc' }
    })
  ]);

  // Calculate portfolio analytics
  const portfolioData = assets.map(asset => ({
    id: asset.id,
    category: asset.category,
    name: asset.name,
    investedAmount: asset.investedAmount || asset.value, // Fallback to value if not set
    currentValue: asset.value
  }));

  const analytics = analyzePortfolio(portfolioData);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground mt-1">
            Track your portfolio and explore growth scenarios.
          </p>
        </div>
        <AddAssetModal />
      </div>

      <InvestmentOverview analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AssetAllocation analytics={analytics} />
        </div>
        <div className="lg:col-span-2">
          <InvestmentSimulator />
        </div>
      </div>
      <div className="mt-6">
        <GoalInvestmentPlanner goals={goals} />
      </div>
    </div>
  );
}
