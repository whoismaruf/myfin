'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Clock, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/money';

export default function RecurringPage() {
  const [tab, setTab] = useState<'SCHEDULES' | 'FORECAST'>('SCHEDULES');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any | null>(null);
  const [horizonDays, setHorizonDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/recurring');
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchForecast = useCallback(async (days: number) => {
    try {
      const res = await fetch(`/api/recurring/forecast?days=${days}`);
      const data = await res.json();
      setForecast(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (tab === 'FORECAST') {
      fetchForecast(horizonDays);
    }
  }, [tab, horizonDays, fetchForecast]);

  const handleRunNow = async (id: string) => {
    setRunningId(id);
    try {
      const res = await fetch(`/api/recurring/${id}/run`, { method: 'POST' });
      if (res.ok) {
        fetchSchedules();
        if (tab === 'FORECAST') fetchForecast(horizonDays);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this recurring schedule?')) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSchedules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Subscriptions & Forecast</h1>
          <p className="text-[11px] text-slate-400">Predictive commitments & liquidity modeling</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-800/70 p-1 rounded-2xl border border-slate-700/60 text-xs">
        <button
          onClick={() => setTab('SCHEDULES')}
          className={`py-2 rounded-xl font-medium transition-all ${
            tab === 'SCHEDULES'
              ? 'bg-slate-700 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Commitments
        </button>
        <button
          onClick={() => setTab('FORECAST')}
          className={`py-2 rounded-xl font-medium transition-all ${
            tab === 'FORECAST'
              ? 'bg-slate-700 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cash Flow Forecast
        </button>
      </div>

      {/* Tab 1: SCHEDULES */}
      {tab === 'SCHEDULES' && (
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-20 bg-slate-800/40 rounded-2xl" />
              <div className="h-20 bg-slate-800/40 rounded-2xl" />
            </div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center bg-slate-800/20 border border-slate-800 rounded-3xl text-xs text-slate-500">
              No recurring rules configured yet. Use the center (+) FAB to add a bill.
            </div>
          ) : (
            <div className="space-y-2.5">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white text-sm">{item.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                        {item.frequency}
                      </span>
                      <span>•</span>
                      <span>Next: {new Date(item.nextRunDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{item.account?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-white text-sm">
                        {formatCurrency(item.amount, item.account?.currency || 'BDT')}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {item.type === 'INCOME' ? 'Scheduled Income' : 'Committed Debit'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRunNow(item.id)}
                        disabled={runningId === item.id}
                        className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Book / Confirm charge now"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: FORECAST */}
      {tab === 'FORECAST' && (
        <div className="space-y-4">
          {/* Horizon Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Forecast Window:</span>
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
              {[30, 60, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`py-1 px-3 rounded-lg transition-colors ${
                    horizonDays === days
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Summary Cards */}
          {forecast && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Starting Liquid Balance</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {formatCurrency(forecast.startingLiquidBalance)}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Projected Ending Balance</div>
                  <div
                    className={`text-sm font-bold mt-1 ${
                      forecast.endingProjectedBalance < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatCurrency(forecast.endingProjectedBalance)}
                  </div>
                </div>
              </div>

              {/* Risk Alert Banners */}
              {forecast.riskAlerts && forecast.riskAlerts.length > 0 && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Liquidity Deficit Risk Warning</span>
                  </div>
                  <div className="text-[11px] text-rose-300 space-y-1">
                    {forecast.riskAlerts.map((alert: any, i: number) => (
                      <div key={i}>• {alert.message} on {alert.date}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Events */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 px-1">
                  Projected Cash Flow Timeline
                </div>

                {forecast.events.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 bg-slate-800/30 rounded-2xl border border-slate-800">
                    No commitments scheduled within this {horizonDays}-day horizon.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forecast.events.map((ev: any, idx: number) => {
                      const isIncome = ev.type === 'INCOME';
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{ev.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {ev.date}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-bold ${
                                isIncome ? 'text-emerald-400' : 'text-slate-200'
                              }`}
                            >
                              {formatSignedCurrency(ev.signedAmount)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Bal: {formatCurrency(ev.projectedBalance)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
