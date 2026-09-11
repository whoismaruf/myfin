'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

interface UpcomingCommitmentsProps {
  schedules: any[];
  currency: string;
  onLogged?: () => void;
}

export default function UpcomingCommitments({
  schedules,
  currency,
  onLogged,
}: UpcomingCommitmentsProps) {
  const [runningId, setRunningId] = useState<string | null>(null);

  const activeSchedules = schedules
    .filter((s) => s.isActive)
    .slice(0, 3);

  const handleRun = async (id: string) => {
    setRunningId(id);
    try {
      const res = await fetch(`/api/recurring/${id}/run`, { method: 'POST' });
      if (res.ok && onLogged) {
        onLogged();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningId(null);
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Due today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Upcoming Commitments</span>
        </div>
        <Link
          href="/recurring"
          className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <span>Forecast</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {activeSchedules.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-500">
          No scheduled bills or commitments found.
        </div>
      ) : (
        <div className="space-y-2">
          {activeSchedules.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-medium text-white">{item.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    {getDaysUntil(item.nextRunDate)}
                  </span>
                  <span>• {item.frequency}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-200">
                  {formatCurrency(item.amount, currency)}
                </span>
                <button
                  onClick={() => handleRun(item.id)}
                  disabled={runningId === item.id}
                  className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                  title="Confirm & Log charge now"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
