'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, PlusCircle, Repeat, ArrowRight, Check } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [mode, setMode] = useState<'TRANSACTION' | 'TRANSFER' | 'RECURRING'>('TRANSACTION');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transaction form states
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Transfer form states
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Recurring form states
  const [recurringName, setRecurringName] = useState('');
  const [recurringType, setRecurringType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [recurringAccountId, setRecurringAccountId] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState('MONTHLY');
  const [autoLog, setAutoLog] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch user accounts and categories
      Promise.all([
        fetch('/api/accounts').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ])
        .then(([accData, catData]) => {
          const accs = accData.accounts || [];
          setAccounts(accs);
          if (accs.length > 0) {
            setAccountId(accs[0].id);
            setFromAccountId(accs[0].id);
            if (accs.length > 1) {
              setToAccountId(accs[1].id);
            }
            setRecurringAccountId(accs[0].id);
          }

          const cats = catData.categories || [];
          setCategories(cats);
          const firstCat = cats.find((c: any) => c.type === txType);
          if (firstCat) setCategoryId(firstCat.id);
        })
        .catch(console.error);
    }
  }, [isOpen, txType]);

  if (!isOpen) return null;

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          categoryId: categoryId || null,
          type: txType,
          amount: parseFloat(amount),
          date: new Date(date).toISOString(),
          description,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to save transaction');

      // Reset
      setAmount('');
      setDescription('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount: parseFloat(transferAmount),
          date: new Date().toISOString(),
          notes: transferNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to execute transfer');

      setTransferAmount('');
      setTransferNotes('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recurringName,
          type: recurringType,
          amount: parseFloat(recurringAmount),
          accountId: recurringAccountId,
          frequency: recurringFrequency,
          startDate: new Date().toISOString(),
          autoLog,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create recurring rule');

      setRecurringName('');
      setRecurringAmount('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const swapTransferAccounts = () => {
    const temp = fromAccountId;
    setFromAccountId(toAccountId);
    setToAccountId(temp);
  };

  const filteredCategories = categories.filter((c) => c.type === txType);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl max-w-lg mx-auto w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header with Mode Switcher */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Quick Action</h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-way Segmented Control */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setMode('TRANSACTION')}
              className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                mode === 'TRANSACTION'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Transaction</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('TRANSFER')}
              className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                mode === 'TRANSFER'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('RECURRING')}
              className={`py-2 px-2 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
                mode === 'RECURRING'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Recurring</span>
            </button>
          </div>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="p-4 overflow-y-auto space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* 1. TRANSACTION FORM */}
          {mode === 'TRANSACTION' && (
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              {/* Income / Expense Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-800/50 p-1 rounded-xl border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    txType === 'EXPENSE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Expense (−)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                    txType === 'INCOME'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Account Picker */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Account</label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.tier}) — {acc.currency} {acc.currentBalance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Picker */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Category</label>
                <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                  {filteredCategories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryId(cat.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Note / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Weekly Groceries"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
              >
                {loading ? 'Saving...' : 'Record Transaction'}
              </button>
            </form>
          )}

          {/* 2. TRANSFER FORM */}
          {mode === 'TRANSFER' && (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Zero-Sum Banner */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                💡 <span className="font-semibold">Zero-Sum Principle:</span> Inter-account transfers reposition capital without impacting income or expense reports.
              </div>

              {/* From & To Selectors */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">From Account (Debit)</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — {acc.currency} {acc.currentBalance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center -my-1">
                  <button
                    type="button"
                    onClick={swapTransferAccounts}
                    className="p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
                    title="Swap Accounts"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">To Account (Credit)</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {accounts
                      .filter((a) => a.id !== fromAccountId)
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} — {acc.currency} {acc.currentBalance.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Transfer Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Transfer Note (Encrypted)</label>
                <input
                  type="text"
                  placeholder="e.g. ATM withdrawal to cash wallet"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !transferAmount || fromAccountId === toAccountId}
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.99]"
              >
                {loading ? 'Executing Transfer...' : 'Confirm Transfer'}
              </button>
            </form>
          )}

          {/* 3. RECURRING BILL FORM */}
          {mode === 'RECURRING' && (
            <form onSubmit={handleRecurringSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Subscription / Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, High-Speed Internet, Gym"
                  value={recurringName}
                  onChange={(e) => setRecurringName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={recurringAmount}
                    onChange={(e) => setRecurringAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Frequency</label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Every 2 Weeks</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Linked Payment Account</label>
                <select
                  value={recurringAccountId}
                  onChange={(e) => setRecurringAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.tier})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !recurringName || !recurringAmount}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
              >
                {loading ? 'Adding Commitment...' : 'Add Recurring Commitment'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
