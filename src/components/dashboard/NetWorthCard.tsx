'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

interface NetWorthCardProps {
  netWorth: number;
  totalLiquid: number;
  totalLocked: number;
  totalInvested: number;
  currency: string;
}

export default function NetWorthCard({
  netWorth,
  totalLiquid,
  totalLocked,
  totalInvested,
  currency,
}: NetWorthCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 relative z-10">
        <div className="flex items-center gap-1.5 font-medium tracking-wide uppercase text-[11px] text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Consolidated Net Worth</span>
        </div>
        <button
          onClick={() => setHideValues(!hideValues)}
          className="p-1 hover:text-slate-200 text-slate-400 transition-colors"
          title={hideValues ? 'Show values' : 'Hide values'}
        >
          {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Big Number */}
      <div className="mb-4 relative z-10">
        <div className="text-3xl font-black tracking-tight text-white">
          {hideValues ? '••••••••' : formatCurrency(netWorth, currency)}
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Real-time aggregated capital across all accounts
        </p>
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
        </div>
      )}
    </div>
  );
}
