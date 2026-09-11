'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, CreditCard } from 'lucide-react';
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
  const [cardsOverview, setCardsOverview] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [nwRes, fdrRes, recRes, txRes, cfRes, cardsRes] = await Promise.all([
        fetch('/api/reports/net-worth'),
        fetch('/api/fixed-deposits'),
        fetch('/api/recurring'),
        fetch('/api/transactions?limit=8'),
        fetch('/api/reports/cash-flow'),
        fetch('/api/cards'),
      ]);

      const [nw, fdr, rec, tx, cf, cardsData] = await Promise.all([
        nwRes.json(),
        fdrRes.json(),
        recRes.json(),
        txRes.json(),
        cfRes.json(),
        cardsRes.json(),
      ]);

      setNetWorthData(nw);
      setFixedDeposits(fdr.fixedDeposits || []);
      setSchedules(rec.schedules || []);
      setRecentTransactions(tx.transactions || []);
      setCashFlow(cf);
      setCardsOverview(cardsData.overview || null);
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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-52 bg-slate-800/60 rounded-3xl" />
          <div className="lg:col-span-1 h-52 bg-slate-800/40 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-slate-800/40 rounded-3xl" />
          <div className="h-44 bg-slate-800/40 rounded-3xl" />
        </div>
      </div>
    );
  }

  const currency = netWorthData?.currency || 'BDT';

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time financial status & asset distribution</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Row 1: Net Worth Card & Liquidity Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        <div className="lg:col-span-2 flex">
          <div className="w-full">
            <NetWorthCard
              netWorth={netWorthData?.netWorth || 0}
              totalLiquid={netWorthData?.totalLiquid || 0}
              totalLocked={netWorthData?.totalLocked || 0}
              totalInvested={netWorthData?.totalInvested || 0}
              grossAssets={netWorthData?.grossAssets}
              totalCreditDebt={netWorthData?.totalCreditDebt || 0}
              currency={currency}
            />
          </div>
        </div>

        <div className="lg:col-span-1 flex">
          <div className="w-full">
            <LiquidityStrip
              totalLiquid={netWorthData?.totalLiquid || 0}
              totalLocked={netWorthData?.totalLocked || 0}
              totalInvested={netWorthData?.totalInvested || 0}
              currency={currency}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Credit Debt Status Bar (if any credit cards registered) */}
      {cardsOverview && cardsOverview.activeCardsCount > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Credit Card Debt:</span>
                <span className="text-rose-400 font-black">
                  {currency} {cardsOverview.totalCreditDebt.toLocaleString()}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                  cardsOverview.overallUtilization > 50
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : cardsOverview.overallUtilization > 30
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  {cardsOverview.overallUtilization}% Utilized
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Available credit: {currency} {cardsOverview.totalAvailableCredit.toLocaleString()} of {currency} {cardsOverview.totalCreditLimit.toLocaleString()}
              </div>
            </div>
          </div>

          <Link
            href="/cards"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors shrink-0"
          >
            <span>Manage Cards & Debt</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Row 3: FDR Maturity Alert (If any matures within 30 days) */}
      <FDRAlertBanner fixedDeposits={fixedDeposits} currency={currency} />

      {/* Row 3: Cash Flow & Upcoming Commitments (2-Column on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cash-Flow Summary Card */}
        {cashFlow?.totals && (
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white text-sm">Monthly Cash Flow</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Transactions only (transfers excluded)</p>
              </div>
              <Link
                href="/reports"
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Inflow</div>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                    {formatCurrency(cashFlow.totals.totalIncome, currency)}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Outflow</div>
                  <div className="text-base font-extrabold text-rose-400 mt-0.5">
                    {formatCurrency(cashFlow.totals.totalExpense, currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-between text-xs">
              <span className="text-slate-400">Net Operational Surplus:</span>
              <span className={`font-bold ${cashFlow.totals.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatSignedCurrency(cashFlow.totals.netCashFlow, currency)}
              </span>
            </div>
          </div>
        )}

        {/* Upcoming Commitments */}
        <UpcomingCommitments
          schedules={schedules}
          currency={currency}
          onLogged={loadDashboardData}
        />
      </div>

      {/* Row 4: Recent Transactions Ledger Preview */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Recent Activity</span>
          </div>
          <Link
            href="/ledger"
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No transactions yet. Click "+ Quick Action" to log your first entry!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: tx.category?.color ? `${tx.category.color}20` : '#334155',
                        color: tx.category?.color || '#94A3B8',
                      }}
                    >
                      <CategoryIcon name={tx.category?.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">
                        {tx.description || tx.category?.name || 'Transaction'}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-400 font-medium">{tx.account?.name}</span>
                        <span>•</span>
                        <span>{new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`font-black text-sm ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
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
