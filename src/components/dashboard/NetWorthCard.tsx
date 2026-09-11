'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

interface NetWorthCardProps {
  netWorth: number;
  totalLiquid: number;
  totalLocked: number;
  totalInvested: number;
  grossAssets?: number;
  totalCreditDebt?: number;
  currency: string;
}

export default function NetWorthCard({
  netWorth,
  totalLiquid,
  totalLocked,
  totalInvested,
  grossAssets,
  totalCreditDebt = 0,
  currency,
}: NetWorthCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3 relative z-10">
          <div className="flex items-center gap-2 font-semibold tracking-wider uppercase text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Consolidated Net Worth</span>
          </div>
          <button
            onClick={() => setHideValues(!hideValues)}
            className="p-1.5 hover:text-white text-slate-400 rounded-xl hover:bg-slate-800/60 transition-colors"
            title={hideValues ? 'Show values' : 'Hide values'}
          >
            {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Big Number */}
        <div className="mb-5 relative z-10">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            {hideValues ? '••••••••' : formatCurrency(netWorth, currency)}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Real-time aggregated capital across all accounts
          </p>
        </div>
      </div>



      {/* Accordion Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-xs text-slate-300 transition-colors relative z-10"
      >
        <span>Capital Distribution by Tier</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Breakdown */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5 relative z-10 animate-in fade-in duration-200 text-xs">
          {/* Liquid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-slate-300">Liquid Reserves (Cash, Checking)</span>
            </div>
            <span className="font-semibold text-emerald-400">
              {hideValues ? '••••' : formatCurrency(totalLiquid, currency)}
            </span>
          </div>

          {/* Locked */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
              <span className="text-slate-300">Locked Capital (FDR, Term)</span>
            </div>
            <span className="font-semibold text-blue-400">
              {hideValues ? '••••' : formatCurrency(totalLocked, currency)}
            </span>
          </div>

          {/* Growth */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
              <span className="text-slate-300">Invested Capital (Equities, Funds)</span>
            </div>
            <span className="font-semibold text-purple-400">
              {hideValues ? '••••' : formatCurrency(totalInvested, currency)}
            </span>
          </div>

          {/* Credit Card Liabilities (if any) */}
          {totalCreditDebt > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <span className="text-rose-300 font-medium">Credit Card Debt (Liabilities)</span>
              </div>
              <span className="font-bold text-rose-400">
                {hideValues ? '••••' : `− ${formatCurrency(totalCreditDebt, currency)}`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
