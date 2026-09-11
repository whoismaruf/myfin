'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, ArrowUpRight, ArrowDownRight, Edit2, DollarSign, X } from 'lucide-react';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/money';

export default function InvestmentsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedValuationPos, setSelectedValuationPos] = useState<any | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Add position form states
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('EQUITY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [accountId, setAccountId] = useState('');

  const fetchInvestments = useCallback(async () => {
    try {
      const [invRes, accRes] = await Promise.all([
        fetch('/api/investments'),
        fetch('/api/accounts?tier=GROWTH'),
      ]);
      const [invData, accData] = await Promise.all([invRes.json(), accRes.json()]);
      setPositions(invData.positions || []);
      setSummary(invData.summary || null);
      const growthAccs = accData.accounts || [];
      setAccounts(growthAccs);
      if (growthAccs.length > 0) setAccountId(growthAccs[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          assetName,
          assetType,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setAssetName('');
        setQuantity('');
        setPrice('');
        fetchInvestments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateValuation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedValuationPos) return;
    setFormLoading(true);

    try {
      const res = await fetch(`/api/investments/${selectedValuationPos.id}/valuation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrice: parseFloat(newPrice),
        }),
      });

      if (res.ok) {
        setSelectedValuationPos(null);
        setNewPrice('');
        fetchInvestments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const isPositive = summary?.totalGainLoss >= 0;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Investments & Portfolio</h1>
          <p className="text-[11px] text-slate-400">Equity holdings, positions & market valuations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </button>
      </div>

      {/* Portfolio Performance Hero Card */}
      {summary && (
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950/40 border border-purple-500/20 rounded-3xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-purple-400 uppercase tracking-wider text-[10px]">
              Portfolio Valuation
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPositive ? '+' : ''}
              {summary.totalGainLossPercent}% All-Time
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-white">
              {formatCurrency(summary.totalPortfolioValue)}
            </div>
            <div className="flex items-center gap-2 text-xs mt-1">
              <span className="text-slate-400">
                Cost Basis: {formatCurrency(summary.totalCostBasis)}
              </span>
              <span>•</span>
              <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatSignedCurrency(summary.totalGainLoss)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Holdings List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-28 bg-slate-800/40 rounded-3xl" />
          <div className="h-28 bg-slate-800/40 rounded-3xl" />
        </div>
      ) : positions.length === 0 ? (
        <div className="p-10 text-center bg-slate-800/20 border border-slate-800 rounded-3xl text-xs text-slate-500 space-y-2">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto" />
          <p>No investment positions tracked yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {positions.map((pos) => {
            const gain = pos.unrealizedPL >= 0;
            return (
              <div
                key={pos.id}
                className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-800/70 transition-colors"
              >
                <div>
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <span>{pos.assetName}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {pos.assetType}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {pos.quantity} units @ Avg {formatCurrency(pos.avgPurchasePrice)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Current: {formatCurrency(pos.currentPrice)} / unit
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">
                      {formatCurrency(pos.currentValue)}
                    </div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${gain ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatSignedCurrency(pos.unrealizedPL)} ({gain ? '+' : ''}{pos.unrealizedPLPercent}%)
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedValuationPos(pos);
                      setNewPrice(pos.currentPrice.toString());
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-purple-400 transition-colors"
                    title="Update current market price"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Add Investment Position</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPosition} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Asset / Symbol Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple (AAPL), Beximco Pharma, S&P 500"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Asset Class</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="EQUITY">Equity / Stock</option>
                    <option value="MUTUAL_FUND">Mutual Fund</option>
                    <option value="INDEX">Index ETF</option>
                    <option value="COMMODITY">Commodity / Gold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Account</label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Units / Quantity</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Purchase Price / Unit</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading || !assetName || !quantity || !price}
                className="w-full py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95 mt-2"
              >
                {formLoading ? 'Adding Position...' : 'Record Position'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Update Valuation Modal */}
      {selectedValuationPos && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedValuationPos(null)}
          />
          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Update Valuation</h3>
              <button onClick={() => setSelectedValuationPos(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateValuation} className="space-y-3">
              <div className="text-xs text-slate-300">
                Asset: <span className="font-semibold text-white">{selectedValuationPos.assetName}</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">New Market Price per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !newPrice}
                className="w-full py-3 bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 active:scale-95"
              >
                {formLoading ? 'Updating...' : 'Update Valuation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
