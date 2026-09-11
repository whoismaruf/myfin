'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

export default function ReportsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/cash-flow')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-slate-800/40 rounded-3xl" />
        <div className="h-44 bg-slate-800/40 rounded-3xl" />
      </div>
    );
  }

  const totals = data?.totals || { totalIncome: 0, totalExpense: 0, netCashFlow: 0 };
  const monthly = data?.monthlySeries || [];
  const categories = data?.categoryBreakdown || [];

  const maxMonthlyVal = Math.max(
    1,
    ...monthly.map((m: any) => Math.max(m.income, m.expense))
  );

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div>
        <h1 className="text-lg font-bold text-white">Reports & Cash Flow</h1>
        <p className="text-[11px] text-slate-400">Aggregated burn rates & category breakdowns</p>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-3 gap-2 p-4 bg-slate-800/50 border border-slate-700/60 rounded-3xl text-xs">
        <div>
          <div className="text-[10px] text-slate-400">Total Inflow</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">
            {formatCurrency(totals.totalIncome)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Total Outflow</div>
          <div className="text-sm font-bold text-rose-400 mt-0.5">
            {formatCurrency(totals.totalExpense)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400">Net Surplus</div>
          <div
            className={`text-sm font-bold mt-0.5 ${
              totals.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(totals.netCashFlow)}
          </div>
        </div>
      </div>

      {/* 6-Month Monthly Comparison Chart */}
      <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Monthly Cash Flow (6 Months)</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Expense
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 pt-4 items-end h-40">
          {monthly.map((m: any, idx: number) => {
            const incomeHeight = Math.round((m.income / maxMonthlyVal) * 100);
            const expenseHeight = Math.round((m.expense / maxMonthlyVal) * 100);

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  {/* Income bar */}
                  <div
                    className="w-2.5 bg-emerald-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(4, incomeHeight)}%` }}
                    title={`Income: ${m.income}`}
                  />
                  {/* Expense bar */}
                  <div
                    className="w-2.5 bg-rose-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(4, expenseHeight)}%` }}
                    title={`Expense: ${m.expense}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Category Breakdown */}
      <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-3">
        <div className="text-xs font-semibold text-white">Expense Distribution by Category</div>

        {categories.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No expense records found.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {categories.map((cat: any, i: number) => {
              const pct = totals.totalExpense > 0
                ? Math.round((cat.amount / totals.totalExpense) * 100)
                : 0;

              return (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{cat.name}</span>
                    <span className="font-bold text-slate-300">
                      {formatCurrency(cat.amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color || '#F43F5E',
                      }}
                    />
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
