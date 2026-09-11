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
    <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5 h-full">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-3.5 rounded-2xl border ${card.bg} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300">{card.title}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div>
              <div className="text-sm font-black text-white truncate">
                {formatCurrency(card.amount, currency)}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{card.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
