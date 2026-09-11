'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Plus, Calendar, AlertCircle, ArrowUpRight, CheckCircle2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

export default function FixedDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [renewingFdr, setRenewingFdr] = useState<any | null>(null);

  // Add FDR form states
  const [fdrName, setFdrName] = useState('');
  const [institution, setInstitution] = useState('');
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('8.5');
  const [tenure, setTenure] = useState('12');
  const [openDate, setOpenDate] = useState(new Date().toISOString().split('T')[0]);
  const [payoutAccountId, setPayoutAccountId] = useState('');
  const [compoundFreq, setCompoundFreq] = useState('SIMPLE');
  const [formLoading, setFormLoading] = useState(false);

  // Renew FDR form states
  const [renewTenure, setRenewTenure] = useState('12');
  const [renewRate, setRenewRate] = useState('');
  const [rolloverInterest, setRolloverInterest] = useState(true);

  const fetchDeposits = useCallback(async () => {
    try {
      const [fdrRes, accRes] = await Promise.all([
        fetch('/api/fixed-deposits'),
        fetch('/api/accounts?tier=LIQUID'),
      ]);
      const [fdrData, accData] = await Promise.all([fdrRes.json(), accRes.json()]);
      setDeposits(fdrData.fixedDeposits || []);
      const liquidAccs = accData.accounts || [];
      setAccounts(liquidAccs);
      if (liquidAccs.length > 0) setPayoutAccountId(liquidAccs[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleCreateFdr = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/fixed-deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fdrName,
          institution,
          principal: parseFloat(principal),
          interestRate: parseFloat(rate),
          tenureMonths: parseInt(tenure),
          compoundFrequency: compoundFreq,
          openDate: new Date(openDate).toISOString(),
          payoutAccountId,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFdrName('');
        setPrincipal('');
        fetchDeposits();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRenewFdr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingFdr) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/fixed-deposits/${renewingFdr.id}/renew`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenureMonths: parseInt(renewTenure),
          interestRate: renewRate ? parseFloat(renewRate) : undefined,
          rolloverInterest,
        }),
      });

      if (res.ok) {
        setRenewingFdr(null);
        fetchDeposits();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleWithdraw = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to withdraw and liquidate "${name}" to its payout account?`)) return;
    try {
      const res = await fetch(`/api/fixed-deposits/${id}/withdraw`, { method: 'POST' });
      if (res.ok) fetchDeposits();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Fixed Deposits (FDR)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Term savings, compounding & maturity pipeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Open FDR</span>
        </button>
      </div>

      {/* Responsive Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          <div className="h-44 bg-slate-800/40 rounded-3xl" />
          <div className="h-44 bg-slate-800/40 rounded-3xl" />
        </div>
      ) : deposits.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/20 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <Lock className="w-8 h-8 text-blue-400 mx-auto" />
          <p>No fixed deposits currently registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deposits.map((fdr) => {
            const isWithdrawn = fdr.status === 'WITHDRAWN';
            const progress = fdr.metrics?.progressPercent || 0;

            return (
              <div
                key={fdr.id}
                className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                  isWithdrawn
                    ? 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-200 hover:border-slate-600 shadow-md'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-bold text-white text-base flex items-center gap-2">
                        <span>{fdr.account?.name || 'Fixed Deposit'}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isWithdrawn
                              ? 'bg-slate-800 text-slate-500'
                              : fdr.metrics?.isMatured
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {fdr.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {fdr.institution} • {fdr.tenureMonths} Months @ {fdr.interestRate}% APR
                      </div>
                    </div>

                    {/* Progress Badge */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-blue-400">
                        {progress}% elapsed
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {fdr.metrics?.daysRemaining} days left
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-700/80 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/60 rounded-2xl text-xs mb-4">
                    <div>
                      <div className="text-[10px] text-slate-500">Principal</div>
                      <div className="font-bold text-white mt-0.5 text-xs sm:text-sm">
                        {formatCurrency(fdr.principal)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Est. Interest</div>
                      <div className="font-bold text-emerald-400 mt-0.5 text-xs sm:text-sm">
                        +{formatCurrency(fdr.metrics?.totalInterest)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Target Maturity</div>
                      <div className="font-bold text-blue-400 mt-0.5 text-xs sm:text-sm">
                        {formatCurrency(fdr.metrics?.maturityValue)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isWithdrawn && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/40">
                    <button
                      onClick={() => {
                        setRenewingFdr(fdr);
                        setRenewRate(fdr.interestRate.toString());
                      }}
                      className="py-1.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium transition-colors"
                    >
                      Renew / Roll
                    </button>
                    <button
                      onClick={() => handleWithdraw(fdr.id, fdr.account?.name)}
                      className="py-1.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                    >
                      Liquidate Payout
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Open FDR Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-50 bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Open New Fixed Deposit</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFdr} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Deposit Name / Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Bank 1-Year FDR"
                  value={fdrName}
                  onChange={(e) => setFdrName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Principal Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Open Date</label>
                  <input
                    type="date"
                    required
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Compounding Frequency</label>
                <select
                  value={compoundFreq}
                  onChange={(e) => setCompoundFreq(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SIMPLE">Simple Interest</option>
                  <option value="MONTHLY">Monthly Compounding</option>
                  <option value="QUARTERLY">Quarterly Compounding</option>
                  <option value="AT_MATURITY">At Maturity</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Destination Payout Account (Liquid)</label>
                <select
                  value={payoutAccountId}
                  onChange={(e) => setPayoutAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={formLoading || !principal || !fdrName}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 mt-2"
              >
                {formLoading ? 'Booking FDR...' : 'Open Fixed Deposit'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Renew FDR Modal */}
      {renewingFdr && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setRenewingFdr(null)}
          />
          <div className="relative z-50 bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Renew Fixed Deposit</h3>
              <button onClick={() => setRenewingFdr(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewFdr} className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
                <div className="text-slate-400">Current Principal: {formatCurrency(renewingFdr.principal)}</div>
                <div className="text-emerald-400 font-bold">Maturity Value: {formatCurrency(renewingFdr.metrics?.maturityValue)}</div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">New Tenure (Months)</label>
                <input
                  type="number"
                  required
                  value={renewTenure}
                  onChange={(e) => setRenewTenure(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={renewRate}
                  onChange={(e) => setRenewRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rollover"
                  checked={rolloverInterest}
                  onChange={(e) => setRolloverInterest(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0"
                />
                <label htmlFor="rollover" className="text-slate-300">
                  Rollover accrued interest into new principal
                </label>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 mt-2"
              >
                {formLoading ? 'Renewing...' : 'Confirm FDR Renewal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
