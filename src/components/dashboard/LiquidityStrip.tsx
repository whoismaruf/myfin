import React from 'react';
import { Wallet, Lock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

interface LiquidityStripProps {
  totalLiquid: number;
  totalLocked: number;
  totalInvested: number;
  currency: string;
}

export default function LiquidityStrip({
  totalLiquid,
  totalLocked,
  totalInvested,
  currency,
}: LiquidityStripProps) {
  const cards = [
    {
      title: 'Liquid Reserves',
      amount: totalLiquid,
      icon: Wallet,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tag: 'Checking & Cash',
    },
    {
      title: 'Locked Capital',
      amount: totalLocked,
      icon: Lock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      tag: 'FDR & Term Deposits',
    },
    {
      title: 'Invested Assets',
      amount: totalInvested,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      tag: 'Equities & Holdings',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5 h-full">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-3xl border ${card.bg} flex flex-col justify-between shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">{card.title}</span>
              <div className="w-8 h-8 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                {formatCurrency(card.amount, currency)}
              </div>
              <div className="text-xs text-slate-400 truncate mt-1 font-medium">{card.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
