"use client";

import { motion } from "motion/react";
import {
  formatCurrency,
  calculateNetWorth,
  calculateSavingsRate,
  calculateTotalExpenses,
} from '@/lib/financial-engine';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
} from 'lucide-react';

interface OverviewCardsProps {
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

const iconMap = [
  { icon: Wallet, label: 'Net Worth', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: TrendingUp, label: 'Total Assets', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: CreditCard, label: 'Total Liabilities', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: DollarSign, label: 'Monthly Income', color: 'text-green-500', bg: 'bg-green-500/10' },
  { icon: TrendingDown, label: 'Monthly Expenses', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { icon: PiggyBank, label: 'Savings Rate', color: 'text-violet-500', bg: 'bg-violet-500/10' },
];

import { useCurrency } from '@/components/providers/currency-provider';

export function OverviewCards({
  totalAssets,
  totalLiabilities,
  monthlyIncome,
  monthlyExpenses,
}: OverviewCardsProps) {
  const { currency } = useCurrency();
  const netWorth = calculateNetWorth(totalAssets, totalLiabilities);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);

  const cards = [
    { ...iconMap[0], value: formatCurrency(netWorth, currency), sub: netWorth >= 0 ? 'Positive' : 'Negative', subColor: netWorth >= 0 ? 'text-emerald-500' : 'text-red-500' },
    { ...iconMap[1], value: formatCurrency(totalAssets, currency), sub: 'All asset classes', subColor: 'text-muted-foreground' },
    { ...iconMap[2], value: formatCurrency(totalLiabilities, currency), sub: totalLiabilities === 0 ? 'Debt-free!' : 'Outstanding', subColor: totalLiabilities === 0 ? 'text-emerald-500' : 'text-muted-foreground' },
    { ...iconMap[3], value: formatCurrency(monthlyIncome, currency), sub: 'Per month', subColor: 'text-muted-foreground' },
    { ...iconMap[4], value: formatCurrency(monthlyExpenses, currency), sub: 'Per month', subColor: 'text-muted-foreground' },
    { ...iconMap[5], value: `${savingsRate}%`, sub: savingsRate >= 20 ? 'Healthy' : savingsRate >= 10 ? 'Fair' : 'Needs improvement', subColor: savingsRate >= 20 ? 'text-emerald-500' : savingsRate >= 10 ? 'text-yellow-500' : 'text-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            key={card.label}
            className="group relative overflow-hidden rounded-xl glass-card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold tracking-tight mt-1">{card.value}</p>
            <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
            {/* Subtle gradient accent */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        );
      })}
    </div>
  );
}
