'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Wallet, Lock, TrendingUp, CheckCircle, Scale, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [reconcileAccount, setReconcileAccount] = useState<any | null>(null);

  // Form states for Add Account
  const [accName, setAccName] = useState('');
  const [accTier, setAccTier] = useState<'LIQUID' | 'LOCKED' | 'GROWTH'>('LIQUID');
  const [accSubtype, setAccSubtype] = useState('CHECKING');
  const [institution, setInstitution] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form states for Reconcile
  const [statementBalance, setStatementBalance] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconcileResult, setReconcileResult] = useState<any | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accName,
          tier: accTier,
          subtype: accSubtype,
          institution,
          openingBalance: parseFloat(openingBalance) || 0,
        }),
      });

      if (res.ok) {
        setAccName('');
        setInstitution('');
        setOpeningBalance('');
        setShowAddModal(false);
        fetchAccounts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileAccount) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/accounts/${reconcileAccount.id}/reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementBalance: parseFloat(statementBalance),
          notes: reconcileNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReconcileResult(data);
        fetchAccounts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const tiers = [
    {
      key: 'LIQUID',
      label: 'Liquid Reserves',
      icon: Wallet,
      desc: 'Checking, digital wallets, and physical cash',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      key: 'LOCKED',
      label: 'Locked & Term Savings',
      icon: Lock,
      desc: 'Fixed deposits (FDR), DPS, and certificates',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      key: 'GROWTH',
      label: 'Invested & Growth Capital',
      icon: TrendingUp,
      desc: 'Equities, mutual funds, and assets',
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Accounts & Reserves</h1>
          <p className="text-[11px] text-slate-400">Multi-tier liquidity management</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Tier Sections */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-slate-800/40 rounded-3xl" />
          <div className="h-32 bg-slate-800/40 rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {tiers.map((tier) => {
            const tierAccounts = accounts.filter((a) => a.tier === tier.key);
            const tierSubtotal = tierAccounts.reduce(
              (sum, a) => sum + (Number(a.currentBalance) || 0),
              0
            );
            const currency = tierAccounts[0]?.currency || 'BDT';
            const Icon = tier.icon;

            return (
              <div key={tier.key} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${tier.color}`} />
                    <span className="text-xs font-bold text-white">{tier.label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {formatCurrency(tierSubtotal, currency)}
                  </span>
                </div>

                {tierAccounts.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 text-center text-xs text-slate-500">
                    No accounts in this tier.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {tierAccounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex items-center justify-between hover:bg-slate-800/70 transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-2">
                            <span>{acc.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
                              {acc.subtype}
                            </span>
                          </div>
                          {acc.institution && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {acc.institution}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-white text-sm">
                              {formatCurrency(acc.currentBalance, acc.currency)}
                            </div>
                            <div className="text-[9px] text-slate-500">Ledger Balance</div>
                          </div>

                          <button
                            onClick={() => {
                              setReconcileAccount(acc);
                              setStatementBalance(acc.currentBalance.toString());
                              setReconcileResult(null);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-emerald-400 transition-colors"
                            title="Reconcile with bank statement"
                          >
                            <Scale className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Bottom Sheet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create New Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Chartered Checking"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Liquidity Tier</label>
                  <select
                    value={accTier}
                    onChange={(e) => setAccTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LIQUID">Liquid (Cash/Wallet)</option>
                    <option value="LOCKED">Locked (FDR/DPS)</option>
                    <option value="GROWTH">Growth (Investments)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Subtype</label>
                  <select
                    value={accSubtype}
                    onChange={(e) => setAccSubtype(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="WALLET">Digital Wallet</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="FDR">Fixed Deposit (FDR)</option>
                    <option value="DPS">DPS</option>
                    <option value="EQUITY">Stocks / Equities</option>
                    <option value="MUTUAL_FUND">Mutual Fund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Institution / Bank (Encrypted)</label>
                <input
                  type="text"
                  placeholder="e.g. BRAC Bank, HSBC, bKash"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Opening Balance</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !accName}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {formLoading ? 'Creating...' : 'Save Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Statement Reconciliation Modal */}
      {reconcileAccount && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setReconcileAccount(null)}
          />
          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Reconcile Account</h3>
                <p className="text-[11px] text-slate-400">{reconcileAccount.name}</p>
              </div>
              <button
                onClick={() => setReconcileAccount(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reconcileResult ? (
              <div className="space-y-4 py-2">
                <div
                  className={`p-4 rounded-2xl border text-center space-y-1 ${
                    reconcileResult.isBalanced
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="font-bold text-sm">
                    {reconcileResult.isBalanced ? '✓ Balanced Perfectly!' : 'Variance Detected'}
                  </div>
                  <div className="text-xs">
                    Difference: {formatCurrency(reconcileResult.log.difference, reconcileAccount.currency)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReconcileAccount(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReconcile} className="space-y-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Current App Ledger:</span>
                  <span className="font-bold text-white">
                    {formatCurrency(reconcileAccount.currentBalance, reconcileAccount.currency)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Bank Statement Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={statementBalance}
                    onChange={(e) => setStatementBalance(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Audit Notes (Encrypted)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Audited against monthly PDF statement"
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading || !statementBalance}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  {formLoading ? 'Auditing...' : 'Confirm Reconciliation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
