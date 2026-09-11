'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Clock, RefreshCw } from 'lucide-react';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import LiquidityStrip from '@/components/dashboard/LiquidityStrip';
import FDRAlertBanner from '@/components/dashboard/FDRAlertBanner';
import UpcomingCommitments from '@/components/dashboard/UpcomingCommitments';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/money';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [netWorthData, setNetWorthData] = useState<any>(null);
  const [fixedDeposits, setFixedDeposits] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [nwRes, fdrRes, recRes, txRes, cfRes] = await Promise.all([
        fetch('/api/reports/net-worth'),
        fetch('/api/fixed-deposits'),
        fetch('/api/recurring'),
        fetch('/api/transactions?limit=5'),
        fetch('/api/reports/cash-flow'),
      ]);

      const [nw, fdr, rec, tx, cf] = await Promise.all([
        nwRes.json(),
        fdrRes.json(),
        recRes.json(),
        txRes.json(),
        cfRes.json(),
      ]);

      setNetWorthData(nw);
      setFixedDeposits(fdr.fixedDeposits || []);
      setSchedules(rec.schedules || []);
      setRecentTransactions(tx.transactions || []);
      setCashFlow(cf);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-slate-800/60 rounded-3xl" />
        <div className="grid grid-cols-3 gap-2.5 h-20">
          <div className="bg-slate-800/40 rounded-2xl" />
          <div className="bg-slate-800/40 rounded-2xl" />
          <div className="bg-slate-800/40 rounded-2xl" />
        </div>
        <div className="h-36 bg-slate-800/40 rounded-3xl" />
      </div>
    );
  }

  const currency = netWorthData?.currency || 'BDT';

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Financial Overview
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. Net Worth Hero Card */}
      <NetWorthCard
        netWorth={netWorthData?.netWorth || 0}
        totalLiquid={netWorthData?.totalLiquid || 0}
        totalLocked={netWorthData?.totalLocked || 0}
        totalInvested={netWorthData?.totalInvested || 0}
        currency={currency}
      />

      {/* 2. Liquidity Strip (3 Tiers) */}
      <LiquidityStrip
        totalLiquid={netWorthData?.totalLiquid || 0}
        totalLocked={netWorthData?.totalLocked || 0}
        totalInvested={netWorthData?.totalInvested || 0}
        currency={currency}
      />

      {/* 3. FDR 30-Day Maturity Alert Banner */}
      <FDRAlertBanner fixedDeposits={fixedDeposits} currency={currency} />

      {/* 4. Mini Cash-Flow Burn Summary */}
      {cashFlow?.totals && (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">Monthly Cash Flow</span>
            <Link
              href="/reports"
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Inflow</div>
                <div className="text-xs font-bold text-emerald-400">
                  {formatCurrency(cashFlow.totals.totalIncome, currency)}
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Outflow</div>
                <div className="text-xs font-bold text-rose-400">
                  {formatCurrency(cashFlow.totals.totalExpense, currency)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Upcoming Commitments */}
      <UpcomingCommitments
        schedules={schedules}
        currency={currency}
        onLogged={loadDashboardData}
      />

      {/* 6. Recent Transactions Ledger Preview */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Activity</span>
          </div>
          <Link
            href="/ledger"
            className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No transactions yet. Tap the center (+) button to add one!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: tx.category?.color ? `${tx.category.color}20` : '#334155',
                        color: tx.category?.color || '#94A3B8',
                      }}
                    >
                      <CategoryIcon name={tx.category?.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white truncate max-w-[160px]">
                        {tx.description || tx.category?.name || 'Transaction'}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span className="text-slate-500">{tx.account?.name}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`font-bold text-xs ${isIncome ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {formatSignedCurrency(isIncome ? tx.amount : -tx.amount, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
