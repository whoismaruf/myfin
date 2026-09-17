'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Wallet,
  Building,
  Hash,
  FileText,
  CreditCard,
  Plus,
  Scale,
  Edit2,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  X,
  AlertCircle,
} from 'lucide-react';
import BankCardVisual from '@/components/cards/BankCardVisual';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { formatCurrency, formatSignedCurrency } from '@/lib/utils/money';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  const [account, setAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);

  // Account edit form
  const [accName, setAccName] = useState('');
  const [accTier, setAccTier] = useState('LIQUID');
  const [accSubtype, setAccSubtype] = useState('CHECKING');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reconciliation form
  const [statementBalance, setStatementBalance] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconcileResult, setReconcileResult] = useState<any | null>(null);

  // Card form
  const [cardName, setCardName] = useState('');
  const [cardType, setCardType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');
  const [network, setNetwork] = useState('VISA');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [color, setColor] = useState('indigo');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentDebt, setCurrentDebt] = useState('');
  const [statementDay, setStatementDay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [apr, setApr] = useState('');
  const [minPayment, setMinPayment] = useState('');
  const [cardNotes, setCardNotes] = useState('');
  const [cardFormLoading, setCardFormLoading] = useState(false);
  const [cardFormError, setCardFormError] = useState<string | null>(null);

  // Ledger Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const fetchAccount = useCallback(async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/accounts/${accountId}`);
      const data = await res.json();
      if (res.ok && data.account) {
        setAccount(data.account);
        setAccName(data.account.name || '');
        setAccTier(data.account.tier || 'LIQUID');
        setAccSubtype(data.account.subtype || 'CHECKING');
        setInstitution(data.account.institution || '');
        setAccountNumber(data.account.accountNumber || '');
        setDescription(data.account.description || '');
      } else {
        setError(data.error?.message || 'Account not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accName,
          tier: accTier,
          subtype: accSubtype,
          institution,
          accountNumber,
          description,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchAccount();
      } else {
        const err = await res.json();
        setFormError(err.error?.message || 'Failed to update account');
      }
    } catch (e: any) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setFormLoading(true);
    try {
      const res = await fetch(`/api/accounts/${accountId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/accounts');
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Failed to delete account');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch(`/api/accounts/${accountId}/reconcile`, {
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
        fetchAccount();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const openAddCardModal = () => {
    setEditingCard(null);
    setCardName('');
    setCardType(account?.subtype === 'CHECKING' || account?.subtype === 'SAVINGS' ? 'DEBIT' : 'CREDIT');
    setNetwork('VISA');
    setCardNumber('');
    setCardholderName('');
    setExpiry('');
    setCvv('');
    setColor('indigo');
    setCreditLimit('');
    setCurrentDebt('');
    setStatementDay('');
    setDueDay('');
    setApr('');
    setMinPayment('');
    setCardNotes('');
    setCardFormError(null);
    setShowAddCardModal(true);
  };

  const openEditCardModal = (c: any) => {
    setEditingCard(c);
    setCardName(c.cardName || '');
    setCardType(c.cardType || 'DEBIT');
    setNetwork(c.network || 'VISA');
    setCardNumber('');
    setCardholderName(c.cardholderName || '');
    setExpiry(c.expiry || '');
    setCvv('');
    setColor(c.color || 'indigo');
    setCreditLimit(c.creditLimit?.toString() || '');
    setCurrentDebt(c.currentBalance?.toString() || '');
    setStatementDay(c.statementDay?.toString() || '');
    setDueDay(c.dueDay?.toString() || '');
    setApr(c.apr?.toString() || '');
    setMinPayment(c.minPayment?.toString() || '');
    setCardNotes('');
    setCardFormError(null);
    setShowAddCardModal(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardFormLoading(true);
    setCardFormError(null);

    try {
      if (editingCard) {
        const payload: any = {
          cardName,
          network,
          color,
          cardholderName,
          expiry,
          creditLimit: creditLimit ? parseFloat(creditLimit) : null,
          currentBalance: currentDebt ? parseFloat(currentDebt) : null,
          statementDay: statementDay ? parseInt(statementDay, 10) : null,
          dueDay: dueDay ? parseInt(dueDay, 10) : null,
          apr: apr ? parseFloat(apr) : null,
          minPayment: minPayment ? parseFloat(minPayment) : null,
        };
        if (cardNumber && cardNumber.replace(/\s+/g, '').length >= 12) {
          payload.cardNumber = cardNumber;
        }
        if (cvv) payload.cvv = cvv;
        if (cardNotes) payload.notes = cardNotes;

        const res = await fetch(`/api/cards/${editingCard.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setShowAddCardModal(false);
          fetchAccount();
        } else {
          const err = await res.json();
          setCardFormError(err.error?.message || 'Failed to update card');
        }
      } else {
        const payload = {
          accountId,
          cardType,
          cardName,
          network,
          cardNumber,
          cardholderName,
          expiry,
          cvv,
          color,
          creditLimit,
          currentBalance: currentDebt,
          statementDay,
          dueDay,
          apr,
          minPayment,
          notes: cardNotes,
        };

        const res = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setShowAddCardModal(false);
          fetchAccount();
        } else {
          const err = await res.json();
          setCardFormError(err.error?.message || 'Failed to create card');
        }
      }
    } catch (e: any) {
      setCardFormError(e.message || 'An error occurred');
    } finally {
      setCardFormLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAccount();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-app-card rounded-lg" />
        <div className="h-48 bg-app-card border border-app-border rounded-3xl" />
        <div className="h-80 bg-app-card border border-app-border rounded-3xl" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-4">
        <Link href="/accounts" className="text-xs text-app-muted hover:text-app-text flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accounts</span>
        </Link>
        <div className="p-8 rounded-3xl bg-app-card border border-app-border text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-app-text">Account Not Found</h2>
          <p className="text-xs text-app-muted">{error || 'Unable to retrieve the requested account.'}</p>
          <Link
            href="/accounts"
            className="inline-block px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl"
          >
            Return to Accounts
          </Link>
        </div>
      </div>
    );
  }

  // Filtered transactions
  const transactions = (account.transactions || []).filter((tx: any) => {
    if (selectedType !== 'ALL' && tx.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchCat = (tx.category?.name || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/accounts"
          className="text-xs text-app-muted hover:text-brand flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Accounts</span>
        </Link>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setStatementBalance(account.currentBalance?.toString() || '0');
              setReconcileResult(null);
              setShowReconcileModal(true);
            }}
            className="py-2 px-3.5 bg-app-card hover:bg-app-card-hover text-app-text border border-app-border rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Reconcile with Statement"
          >
            <Scale className="w-3.5 h-3.5 text-brand" />
            <span>Audit / Reconcile</span>
          </button>
          <button
            onClick={() => {
              setFormError(null);
              setShowEditModal(true);
            }}
            className="py-2 px-3.5 bg-app-card hover:bg-app-card-hover text-app-text border border-app-border rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Edit Account"
          >
            <Edit2 className="w-3.5 h-3.5 text-app-muted" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="py-2 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            title="Delete Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Account Overview Header Card */}
      <div className="p-6 md:p-8 bg-app-card border border-app-border rounded-3xl space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                }}
              >
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-app-text tracking-tight">{account.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-app-bg text-app-muted font-medium border border-app-border">
                    {account.tier} &bull; {account.subtype}
                  </span>
                  {account.institution && (
                    <span className="text-xs text-app-muted flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      <span>{account.institution}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Number & Description if present */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-app-muted pt-1">
              {account.accountNumber && (
                <div className="flex items-center gap-1.5 font-mono bg-app-bg px-3 py-1 rounded-xl border border-app-border">
                  <Hash className="w-3.5 h-3.5 text-app-muted" />
                  <span>A/C: {account.accountNumber}</span>
                </div>
              )}
              {account.description && (
                <div className="flex items-center gap-1.5 bg-app-bg px-3 py-1 rounded-xl border border-app-border max-w-lg truncate">
                  <FileText className="w-3.5 h-3.5 text-app-muted shrink-0" />
                  <span className="truncate">{account.description}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-app-border">
            <div className="text-xs text-app-muted font-medium uppercase tracking-wider">Current Balance</div>
            <div className="text-3xl md:text-4xl font-black text-app-text tracking-tight mt-1">
              {formatCurrency(account.currentBalance, account.currency)}
            </div>
            <div className="text-xs text-app-muted mt-1">
              Opening Balance: {formatCurrency(account.openingBalance, account.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Linked Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-app-text flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand" />
              <span>Attached Cards ({account.cards?.length || 0})</span>
            </h2>
            <p className="text-xs text-app-muted">Physical and virtual cards linked to this account</p>
          </div>
          <button
            onClick={openAddCardModal}
            className="py-2 px-3.5 bg-brand hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        {account.cards && account.cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {account.cards.map((c: any) => (
              <BankCardVisual
                key={c.id}
                card={{
                  id: c.id,
                  accountId: account.id,
                  accountName: account.name,
                  accountTier: account.tier,
                  cardType: c.cardType,
                  cardName: c.cardName,
                  network: c.network,
                  cardNumberLast4: c.cardNumberLast4,
                  maskedNumber: `•••• •••• •••• ${c.cardNumberLast4}`,
                  cardholderName: c.cardholderName,
                  expiry: c.expiry,
                  color: c.color || 'indigo',
                  linkedAccountBalance: account.currentBalance,
                  creditLimit: c.creditLimit,
                  currentDebt: c.currentBalance,
                  availableCredit: (c.creditLimit || 0) - (c.currentBalance || 0),
                  utilizationRate: c.creditLimit ? Math.round(((c.currentBalance || 0) / c.creditLimit) * 100) : 0,
                  dueDay: c.dueDay,
                  statementDay: c.statementDay,
                  minPayment: c.minPayment,
                  apr: c.apr,
                  createdAt: c.createdAt,
                }}
                currency={account.currency}
                onEdit={() => openEditCardModal(c)}
                onDelete={() => handleDeleteCard(c.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-app-card border border-dashed border-app-border text-center space-y-2">
            <CreditCard className="w-6 h-6 text-app-muted mx-auto opacity-50" />
            <p className="text-xs text-app-muted">No debit or credit cards linked to this account.</p>
            <button
              onClick={openAddCardModal}
              className="text-xs text-brand font-semibold hover:underline"
            >
              + Link or issue a card
            </button>
          </div>
        )}
      </div>

      {/* Account Transaction History */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-app-text">Transaction History</h2>
            <p className="text-xs text-app-muted">Recent financial activity recorded in this account</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-app-card border border-app-border rounded-xl text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-brand w-44 sm:w-56"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-app-card border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expense Only</option>
            </select>
          </div>
        </div>

        <div className="bg-app-card border border-app-border rounded-3xl overflow-hidden shadow-sm">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-app-muted space-y-2">
              <Wallet className="w-8 h-8 text-app-muted mx-auto opacity-40" />
              <p>No transactions match your current filters for this account.</p>
            </div>
          ) : (
            <div className="divide-y divide-app-border">
              {transactions.map((tx: any) => {
                const isIncome = tx.type === 'INCOME';
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-app-card-hover transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-app-text truncate">
                          {tx.description || tx.category?.name || (isIncome ? 'Income' : 'Expense')}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[11px] text-app-muted">
                            {new Date(tx.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          {tx.category && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-bg text-app-muted border border-app-border flex items-center gap-1">
                              <CategoryIcon name={tx.category.icon} className="w-3 h-3" />
                              <span>{tx.category.name}</span>
                            </span>
                          )}
                          {tx.notes && (
                            <span className="text-[10px] text-app-muted/70 italic truncate max-w-[150px]">
                              "{tx.notes}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-black text-sm sm:text-base tracking-tight ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedCurrency(isIncome ? tx.amount : -tx.amount, account.currency)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Account Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-sm font-semibold text-app-text">Edit Account Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-app-muted hover:text-app-text rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Liquidity Tier</label>
                  <select
                    value={accTier}
                    onChange={(e) => setAccTier(e.target.value)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  >
                    <option value="LIQUID">Liquid (Cash/Wallet/Checking)</option>
                    <option value="LOCKED">Locked (FDR/DPS)</option>
                    <option value="GROWTH">Growth (Investments)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Subtype</label>
                  <select
                    value={accSubtype}
                    onChange={(e) => setAccSubtype(e.target.value)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Institution / Bank</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Account Number (Encrypted)</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-mono text-app-text focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading || !accName}
                className="w-full py-3 bg-brand hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 active:scale-95 mt-2"
              >
                {formLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-md mx-auto w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-text">Delete Account</h3>
                <p className="text-xs text-app-muted">Are you sure you want to delete {account.name}?</p>
              </div>
            </div>

            <p className="text-xs text-app-muted bg-app-bg p-3 rounded-xl border border-app-border">
              If this account has historical transactions, it will be securely archived to preserve your transaction ledger integrity.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-app-bg hover:bg-app-card-hover border border-app-border text-app-text rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={formLoading}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/20"
              >
                {formLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReconcileModal(false)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div>
                <h3 className="text-sm font-semibold text-app-text">Reconcile Account</h3>
                <p className="text-[11px] text-app-muted">{account.name}</p>
              </div>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="p-1 text-app-muted hover:text-app-text rounded-lg"
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
                    Difference: {formatCurrency(reconcileResult.log.difference, account.currency)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  className="w-full py-2.5 bg-app-bg hover:bg-app-card-hover text-app-text border border-app-border rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReconcile} className="space-y-3.5 text-xs">
                <div className="p-3 bg-app-bg rounded-xl border border-app-border flex items-center justify-between">
                  <span className="text-app-muted">Current App Balance:</span>
                  <span className="font-bold text-app-text">
                    {formatCurrency(account.currentBalance, account.currency)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">
                    Bank Statement Balance
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={statementBalance}
                    onChange={(e) => setStatementBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-base font-bold text-app-text focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">
                    Audit Notes (Encrypted)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified with monthly bank statement"
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading || !statementBalance}
                  className="w-full py-3 bg-brand hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 active:scale-95"
                >
                  {formLoading ? 'Auditing...' : 'Confirm Reconciliation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddCardModal(false)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-sm font-semibold text-app-text">
                {editingCard ? 'Edit Card Details' : `Attach Card to ${account.name}`}
              </h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="p-1 text-app-muted hover:text-app-text rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cardFormError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cardFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCard} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Card Type</label>
                  <select
                    value={cardType}
                    disabled={!!editingCard}
                    onChange={(e) => setCardType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand disabled:opacity-50"
                  >
                    <option value="DEBIT">Debit Card</option>
                    <option value="CREDIT">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Network</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="AMEX">American Express</option>
                    <option value="DISCOVER">Discover</option>
                    <option value="UNIONPAY">UnionPay</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Card Nickname *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Debit, Platinum Rewards"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">
                  Card Number (AES-256 Encrypted) {editingCard && '(Leave blank to keep unchanged)'}
                </label>
                <input
                  type="text"
                  required={!editingCard}
                  placeholder="•••• •••• •••• ••••"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-mono text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-mono text-app-text focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-medium text-app-muted mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-mono text-app-text focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Color Theme</label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-2 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  >
                    <option value="indigo">Indigo</option>
                    <option value="emerald">Emerald</option>
                    <option value="slate">Slate</option>
                    <option value="rose">Rose</option>
                    <option value="violet">Violet</option>
                    <option value="cyan">Cyan</option>
                    <option value="amber">Amber</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. JOHN DOE"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs uppercase text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              {cardType === 'CREDIT' && (
                <div className="p-3 bg-app-bg rounded-2xl border border-app-border space-y-3">
                  <div className="text-[11px] font-bold text-app-text">Credit Limit & Billing Setup</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-app-muted mb-1">Credit Limit</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="100000"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        className="w-full px-3 py-2 bg-app-card border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-app-muted mb-1">Current Debt / Balance</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={currentDebt}
                        onChange={(e) => setCurrentDebt(e.target.value)}
                        className="w-full px-3 py-2 bg-app-card border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-app-muted mb-1">Due Day of Month</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="15"
                        value={dueDay}
                        onChange={(e) => setDueDay(e.target.value)}
                        className="w-full px-3 py-2 bg-app-card border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-app-muted mb-1">Statement Day</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1"
                        value={statementDay}
                        onChange={(e) => setStatementDay(e.target.value)}
                        className="w-full px-3 py-2 bg-app-card border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={cardFormLoading || !cardName}
                className="w-full py-3 bg-brand hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 active:scale-95 mt-2"
              >
                {cardFormLoading ? 'Saving Card...' : editingCard ? 'Update Card' : 'Save & Link Card'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
