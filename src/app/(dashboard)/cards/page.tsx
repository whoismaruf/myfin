'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  ArrowUpRight,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import BankCardVisual from '@/components/cards/BankCardVisual';
import { CardSummaryDTO, CreditDebtOverview } from '@/lib/services/card.service';

export default function CardsPage() {
  const [cards, setCards] = useState<CardSummaryDTO[]>([]);
  const [overview, setOverview] = useState<CreditDebtOverview>({
    totalCreditLimit: 0,
    totalCreditDebt: 0,
    totalAvailableCredit: 0,
    overallUtilization: 0,
    activeCardsCount: 0,
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [currency, setCurrency] = useState('BDT');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCardForPay, setSelectedCardForPay] = useState<CardSummaryDTO | null>(null);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<CardSummaryDTO | null>(null);

  // Add Card form state
  const [formAccountId, setFormAccountId] = useState('');
  const [formCardType, setFormCardType] = useState<'DEBIT' | 'CREDIT'>('CREDIT');
  const [formCardName, setFormCardName] = useState('');
  const [formNetwork, setFormNetwork] = useState('VISA');
  const [formCardNumber, setFormCardNumber] = useState('');
  const [formCardholderName, setFormCardholderName] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formCvv, setFormCvv] = useState('');
  const [formColor, setFormColor] = useState('indigo');
  const [formCreditLimit, setFormCreditLimit] = useState('');
  const [formCurrentBalance, setFormCurrentBalance] = useState('');
  const [formStatementDay, setFormStatementDay] = useState('');
  const [formDueDay, setFormDueDay] = useState('');
  const [formApr, setFormApr] = useState('');
  const [formMinPayment, setFormMinPayment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Pay Modal form state
  const [payFromAccountId, setPayFromAccountId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [cardsRes, accsRes] = await Promise.all([
        fetch('/api/cards'),
        fetch('/api/accounts'),
      ]);

      const cardsData = await cardsRes.json();
      const accsData = await accsRes.json();

      if (cardsRes.ok) {
        setCards(cardsData.cards || []);
        setOverview(cardsData.overview || {
          totalCreditLimit: 0,
          totalCreditDebt: 0,
          totalAvailableCredit: 0,
          overallUtilization: 0,
          activeCardsCount: 0,
        });
      }

      if (accsRes.ok) {
        const userAccs = accsData.accounts || [];
        setAccounts(userAccs);
        if (userAccs.length > 0) {
          setCurrency(userAccs[0].currency || 'BDT');
          setFormAccountId(userAccs[0].id);
          setPayFromAccountId(userAccs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching cards or accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: formAccountId,
          cardType: formCardType,
          cardName: formCardName,
          network: formNetwork,
          cardNumber: formCardNumber,
          cardholderName: formCardholderName,
          expiry: formExpiry,
          cvv: formCvv,
          color: formColor,
          creditLimit: formCreditLimit,
          currentBalance: formCurrentBalance,
          statementDay: formStatementDay,
          dueDay: formDueDay,
          apr: formApr,
          minPayment: formMinPayment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to save card');

      // Reset form
      setFormCardName('');
      setFormCardNumber('');
      setFormCardholderName('');
      setFormExpiry('');
      setFormCvv('');
      setFormCreditLimit('');
      setFormCurrentBalance('');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForPay) return;
    setPayError(null);
    setPaySubmitting(true);

    try {
      const res = await fetch(`/api/cards/${selectedCardForPay.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: payFromAccountId,
          amount: parseFloat(payAmount),
          notes: payNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Payment failed');

      setIsPayModalOpen(false);
      setSelectedCardForPay(null);
      setPayAmount('');
      setPayNotes('');
      fetchData();
    } catch (err: any) {
      setPayError(err.message);
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to remove this card?')) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const openPayModal = (card: CardSummaryDTO) => {
    setSelectedCardForPay(card);
    setPayAmount((card.currentDebt || 0).toString());
    setIsPayModalOpen(true);
  };

  const filteredCards = cards.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.cardType === filterType;
  });

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & ACTIONS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">Cards & Credit Debt</h1>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              AES-256-GCM Encrypted
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1.5">
            Debit and credit cards under your accounts. Direct liquidity synchronization and real-time debt management.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Card</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CREDIT DEBT OVERVIEW HERO
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Total Credit Debt */}
        <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900/90 border border-rose-500/30 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credit Debt</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight text-rose-400">
            {currency} {overview.totalCreditDebt.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Across {overview.activeCardsCount} credit cards
          </div>
        </div>

        {/* Total Credit Limit */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Credit Limit</span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight text-white">
            {currency} {overview.totalCreditLimit.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium">Approved borrowing capacity</div>
        </div>

        {/* Available Credit */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Credit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight text-emerald-400">
            {currency} {overview.totalAvailableCredit.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium">Remaining limit ready to use</div>
        </div>

        {/* Overall Utilization */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Debt Utilization</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                overview.overallUtilization > 50
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : overview.overallUtilization > 30
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {overview.overallUtilization}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-1">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                overview.overallUtilization > 50
                  ? 'bg-rose-500'
                  : overview.overallUtilization > 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, overview.overallUtilization))}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>{overview.overallUtilization <= 30 ? 'Healthy (<30%)' : 'Caution: High usage'}</span>
            <span>Target: &lt;30%</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER TABS
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Cards ({cards.length})
        </button>
        <button
          onClick={() => setFilterType('CREDIT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'CREDIT'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Credit Cards ({cards.filter((c) => c.cardType === 'CREDIT').length})
        </button>
        <button
          onClick={() => setFilterType('DEBIT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'DEBIT'
              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Debit Cards ({cards.filter((c) => c.cardType === 'DEBIT').length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CARDS GRID
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs">Loading cards securely...</div>
      ) : filteredCards.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-200">No cards registered yet</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add your debit cards to mirror bank account balances, or add credit cards to track debt, limits, and due dates.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Card</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCards.map((card) => (
            <BankCardVisual
              key={card.id}
              card={card}
              currency={currency}
              onPay={openPayModal}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. ADD CARD MODAL
         ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Add New Card</span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                    AES-256-GCM
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Card will be linked under your selected account.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="p-5 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Linked Account */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Parent Account <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.tier}) — Balance: {currency} {Number(acc.currentBalance).toLocaleString()}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Multiple cards can be registered under the same account.
                </p>
              </div>

              {/* Card Type Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Card Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFormCardType('CREDIT')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      formCardType === 'CREDIT'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Credit Card (Debt & Limit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCardType('DEBIT')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                      formCardType === 'DEBIT'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Debit Card (Account Balance)
                  </button>
                </div>
              </div>

              {/* Card Name & Network */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Card Name / Nickname <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SCB Visa Infinite"
                    value={formCardName}
                    onChange={(e) => setFormCardName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Network</label>
                  <select
                    value={formNetwork}
                    onChange={(e) => setFormNetwork(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="AMEX">American Express</option>
                    <option value="DISCOVER">Discover</option>
                    <option value="UNIONPAY">UnionPay</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Card Number & Cardholder */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Card Number (16 Digits) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  value={formCardNumber}
                  onChange={(e) => setFormCardNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Will be fully encrypted at rest with AES-256-GCM.</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formExpiry}
                    onChange={(e) => setFormExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="123"
                    maxLength={4}
                    value={formCvv}
                    onChange={(e) => setFormCvv(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Card Theme</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="indigo">Indigo Blue</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="slate">Dark Slate</option>
                    <option value="rose">Ruby Rose</option>
                    <option value="amber">Gold Amber</option>
                    <option value="violet">Deep Violet</option>
                    <option value="cyan">Electric Cyan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. MOHAMMED MARUF KHAN"
                  value={formCardholderName}
                  onChange={(e) => setFormCardholderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* CREDIT CARD SPECIFIC FIELDS */}
              {formCardType === 'CREDIT' && (
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Credit Limits & Debt Terms</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Credit Limit ({currency}) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="150000"
                        value={formCreditLimit}
                        onChange={(e) => setFormCreditLimit(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Current Debt / Utilized ({currency})
                      </label>
                      <input
                        type="number"
                        placeholder="35000"
                        value={formCurrentBalance}
                        onChange={(e) => setFormCurrentBalance(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Payment Due Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="15 (e.g. 15th)"
                        value={formDueDay}
                        onChange={(e) => setFormDueDay(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Statement Cutoff Day
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="25 (e.g. 25th)"
                        value={formStatementDay}
                        onChange={(e) => setFormStatementDay(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DEBIT CARD NOTE */}
              {formCardType === 'DEBIT' && (
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300">
                  💡 <span className="font-semibold">Direct Liquidity Link:</span> This debit card will always reflect the exact live balance of its parent account.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Encrypting & Saving Card...' : 'Save Encrypted Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. PAY CREDIT CARD MODAL
         ───────────────────────────────────────────────────────────── */}
      {isPayModalOpen && selectedCardForPay && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm p-0 md:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Record Card Payment</h2>
                <p className="text-xs text-slate-400">
                  Pay down {selectedCardForPay.cardName} (•••• {selectedCardForPay.cardNumberLast4})
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySubmit} className="p-5 space-y-4">
              {payError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                  {payError}
                </div>
              )}

              {/* Current Debt Banner */}
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Outstanding Debt</span>
                  <span className="text-base font-extrabold text-rose-400">
                    {currency} {(selectedCardForPay.currentDebt || 0).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPayAmount((selectedCardForPay.currentDebt || 0).toString())}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Pay Full Balance
                </button>
              </div>

              {/* Pay From Account */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Pay From Account</label>
                <select
                  value={payFromAccountId}
                  onChange={(e) => setPayFromAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {accounts
                    .filter((acc) => acc.tier === 'LIQUID')
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — Available: {currency} {Number(acc.currentBalance).toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Payment Amount ({currency}) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Ref</label>
                <input
                  type="text"
                  placeholder="e.g. September Statement Settlement"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={paySubmitting || !payAmount}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {paySubmitting ? 'Recording Payment...' : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
