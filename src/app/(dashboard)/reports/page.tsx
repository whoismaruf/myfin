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
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-800/40 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800/40 rounded-3xl" />
          <div className="h-64 bg-slate-800/40 rounded-3xl" />
        </div>
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
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Reports & Cash Flow</h1>
        <p className="text-xs text-slate-400 mt-0.5">Aggregated inflow/outflow burn rates & category breakdowns</p>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-slate-800/50 border border-slate-700/60 rounded-3xl shadow-lg">
        <div className="p-2">
          <div className="text-xs text-slate-400 font-medium">Total Inflow (6 Months)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {formatCurrency(totals.totalIncome)}
          </div>
        </div>
        <div className="p-2 sm:border-x sm:border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium">Total Outflow (6 Months)</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {formatCurrency(totals.totalExpense)}
          </div>
        </div>
        <div className="p-2">
          <div className="text-xs text-slate-400 font-medium">Net Operational Surplus</div>
          <div
            className={`text-2xl font-black mt-1 ${
              totals.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(totals.netCashFlow)}
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 6-Month Monthly Comparison Chart */}
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white text-sm">Monthly Cash Flow Trajectory</span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Outflow
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 pt-6 items-end h-56">
            {monthly.map((m: any, idx: number) => {
              const incomeHeight = Math.round((m.income / maxMonthlyVal) * 100);
              const expenseHeight = Math.round((m.expense / maxMonthlyVal) * 100);

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Income bar */}
                    <div
                      className="w-3.5 bg-emerald-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                      style={{ height: `${Math.max(4, incomeHeight)}%` }}
                      title={`Income: ${formatCurrency(m.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      className="w-3.5 bg-rose-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                      style={{ height: `${Math.max(4, expenseHeight)}%` }}
                      title={`Expense: ${formatCurrency(m.expense)}`}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-4 shadow-md">
          <div className="font-bold text-white text-sm">Expense Distribution by Category</div>

          {categories.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500">
              No categorized expenses recorded in this period.
            </div>
          ) : (
            <div className="space-y-4 pt-1 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat: any, i: number) => {
                const pct = totals.totalExpense > 0
                  ? Math.round((cat.amount / totals.totalExpense) * 100)
                  : 0;

                return (
                  <div key={i} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{cat.name}</span>
                      <span className="font-bold text-slate-300">
                        {formatCurrency(cat.amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700/60 rounded-full overflow-hidden">
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
    </div>
  );
}
