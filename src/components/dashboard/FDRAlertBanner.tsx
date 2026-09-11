'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

interface FDRAlertBannerProps {
  fixedDeposits: any[];
  currency: string;
}

export default function FDRAlertBanner({ fixedDeposits, currency }: FDRAlertBannerProps) {
  // Find deposits maturing within 30 days
  const nearingMaturity = fixedDeposits.filter(
    (d) => d.status === 'ACTIVE' && d.metrics?.isNearingMaturity
  );

  if (nearingMaturity.length === 0) return null;

  const firstFdr = nearingMaturity[0];

  return (
    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-amber-300">
            FDR Matures in {firstFdr.metrics.daysRemaining} days!
          </div>
          <div className="text-[11px] text-amber-400/80">
            {firstFdr.account?.name || 'Fixed Deposit'}: {formatCurrency(firstFdr.metrics.maturityValue, currency)}
          </div>
        </div>
      </div>

      <Link
        href="/fixed-deposits"
        className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors"
      >
        <span>Manage</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
