'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { formatSignedCurrency } from '@/lib/utils/money';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');

  const fetchTransactions = useCallback(async () => {
    try {
      let url = '/api/transactions?limit=100';
      if (selectedType !== 'ALL') url += `&type=${selectedType}`;
      if (selectedAccount !== 'ALL') url += `&accountId=${selectedAccount}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedAccount, searchQuery]);

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction? Balance will be reversed.')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = (txs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    for (const tx of txs) {
      const txDate = new Date(tx.date).toISOString().split('T')[0];
      let label = txDate;
      if (txDate === today) label = 'Today';
      else if (txDate === yesterday) label = 'Yesterday';
      else {
        label = new Date(tx.date).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    }

    return Object.entries(groups);
  };

  const grouped = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Transaction Ledger</h1>
          <p className="text-[11px] text-slate-400">Chronological inflow & outflow entries</p>
        </div>
      </div>

      {/* Sticky Search & Filter Bar */}
      <div className="space-y-2 bg-slate-900/90 backdrop-blur sticky top-14 z-10 py-1">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes, descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {['ALL', 'EXPENSE', 'INCOME'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`py-1.5 px-3 rounded-xl font-medium shrink-0 transition-colors ${
                selectedType === t
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t === 'EXPENSE' ? 'Expenses (−)' : 'Income (+)'}
            </button>
          ))}

          {/* Account Dropdown */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs shrink-0 focus:outline-none"
          >
            <option value="ALL">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="space-y-3 animate-pulse pt-2">
          <div className="h-16 bg-slate-800/40 rounded-2xl" />
          <div className="h-16 bg-slate-800/40 rounded-2xl" />
          <div className="h-16 bg-slate-800/40 rounded-2xl" />
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-500">
          No transactions match your search criteria.
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateLabel, txList]) => (
            <div key={dateLabel} className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
                {dateLabel}
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl divide-y divide-slate-800/80 overflow-hidden">
                {txList.map((tx: any) => {
                  const isIncome = tx.type === 'INCOME';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
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
                          <div className="font-semibold text-white">
                            {tx.description || tx.category?.name || 'Transaction'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-slate-700/60 text-slate-300">
                              {tx.account?.name}
                            </span>
                            {tx.notes && (
                              <span className="truncate max-w-[120px] text-slate-500">
                                • {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`font-bold text-sm ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {formatSignedCurrency(
                            isIncome ? tx.amount : -tx.amount,
                            tx.account?.currency || 'BDT'
                          )}
                        </div>

                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
