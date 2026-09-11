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
      title: 'Liquid Cash',
      amount: totalLiquid,
      icon: Wallet,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tag: 'Ready to spend',
    },
    {
      title: 'Locked Term',
      amount: totalLocked,
      icon: Lock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      tag: 'FDR & DPS',
    },
    {
      title: 'Invested',
      amount: totalInvested,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      tag: 'Equities & Assets',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-3 rounded-2xl border ${card.bg} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-400">{card.title}</span>
              <Icon className={`w-3.5 h-3.5 ${card.color}`} />
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate">
                {formatCurrency(card.amount, currency)}
              </div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">{card.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
