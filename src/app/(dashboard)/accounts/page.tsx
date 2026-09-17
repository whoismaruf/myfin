'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Wallet,
  Lock,
  TrendingUp,
  Scale,
  X,
  CreditCard,
  Edit2,
  Trash2,
  ChevronRight,
  Building,
  FileText,
  Hash,
  AlertCircle,
  Banknote,
  Smartphone,
  Landmark,
  PiggyBank,
  Vault,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/money';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<any | null>(null);
  const [reconcileAccount, setReconcileAccount] = useState<any | null>(null);

  // Form states for Add / Edit
  const [accName, setAccName] = useState('');
  const [accTier, setAccTier] = useState<'LIQUID' | 'LOCKED' | 'GROWTH'>('LIQUID');
  const [accSubtype, setAccSubtype] = useState('CHECKING');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  const openAddModal = () => {
    setAccName('');
    setAccTier('LIQUID');
    setAccSubtype('CHECKING');
    setInstitution('');
    setAccountNumber('');
    setDescription('');
    setOpeningBalance('0');
    setFormError(null);
    setEditingAccount(null);
    setShowAddModal(true);
  };

  const openEditModal = (acc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingAccount(acc);
    setAccName(acc.name || '');
    setAccTier(acc.tier || 'LIQUID');
    setAccSubtype(acc.subtype || 'CHECKING');
    setInstitution(acc.institution || '');
    setAccountNumber(acc.accountNumber || '');
    setDescription(acc.description || '');
    setOpeningBalance(acc.openingBalance?.toString() || '0');
    setFormError(null);
    setShowAddModal(true);
  };

  const openDeleteModal = (acc: any, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeletingAccount(acc);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (editingAccount) {
        // Edit Account
        const res = await fetch(`/api/accounts/${editingAccount.id}`, {
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
          setShowAddModal(false);
          setEditingAccount(null);
          fetchAccounts();
        } else {
          const err = await res.json();
          setFormError(err.error?.message || 'Failed to update account');
        }
      } else {
        // Create Account
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: accName,
            tier: accTier,
            subtype: accSubtype,
            institution,
            accountNumber,
            description,
            openingBalance: parseFloat(openingBalance) || 0,
          }),
        });

        if (res.ok) {
          setShowAddModal(false);
          fetchAccounts();
        } else {
          const err = await res.json();
          setFormError(err.error?.message || 'Failed to create account');
        }
      }
    } catch (e: any) {
      setFormError(e.message || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccount) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/accounts/${deletingAccount.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeletingAccount(null);
        fetchAccounts();
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

  const { themeConfig } = useTheme();
  const [activeTierFilter, setActiveTierFilter] = useState<'ALL' | 'LIQUID' | 'LOCKED' | 'GROWTH'>('ALL');

  const tiers = [
    {
      key: 'LIQUID',
      label: 'Liquid Reserves',
      icon: Wallet,
      desc: 'Day-to-day checking, mobile wallets, and cash',
      badge: 'Immediate Access',
      accentColor: '#10B981',
      bgGlow: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
    },
    {
      key: 'LOCKED',
      label: 'Locked & Term Savings',
      icon: Lock,
      desc: 'Fixed Deposits (FDR), DPS, and guaranteed returns',
      badge: 'Time-Locked Yield',
      accentColor: '#3B82F6',
      bgGlow: 'from-blue-500/10 via-blue-500/5 to-transparent',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400',
    },
    {
      key: 'GROWTH',
      label: 'Invested & Growth Capital',
      icon: TrendingUp,
      desc: 'Stocks, equities, mutual funds, and assets',
      badge: 'Capital Appreciation',
      accentColor: '#8B5CF6',
      bgGlow: 'from-purple-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-400',
    },
  ];

  const getAccountIcon = (subtype: string, tier: string) => {
    switch (subtype) {
      case 'CASH':
        return Banknote;
      case 'WALLET':
        return Smartphone;
      case 'CHECKING':
        return Landmark;
      case 'SAVINGS':
        return PiggyBank;
      case 'FDR':
      case 'DPS':
      case 'CERTIFICATE_OF_DEPOSIT':
        return Vault;
      case 'EQUITY':
      case 'MUTUAL_FUND':
      case 'INDEX':
      case 'COMMODITY':
        return ArrowUpRight;
      default:
        return tier === 'LIQUID' ? Wallet : tier === 'LOCKED' ? Lock : TrendingUp;
    }
  };

  const getSubtypeBadgeStyle = (subtype: string) => {
    switch (subtype) {
      case 'CASH':
        return { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'WALLET':
        return { bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'CHECKING':
        return { bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'SAVINGS':
        return { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'FDR':
      case 'DPS':
        return { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      default:
        return { bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
    }
  };

  const totalNetWorth = accounts.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
  const baseCurrency = accounts[0]?.currency || 'BDT';

  const visibleTiers = activeTierFilter === 'ALL'
    ? tiers
    : tiers.filter((t) => t.key === activeTierFilter);

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER & PROMINENT CTA
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-app-border/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-app-text tracking-tight">Accounts & Reserves</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand/10 text-brand font-bold border border-brand/20">
              {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Three-tier liquidity architecture: Liquid cash, Locked deposits & Growth investments
          </p>
        </div>

        {/* High-Contrast Always-Vibrant + Add Account Button */}
        <button
          onClick={openAddModal}
          className="group px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 shrink-0"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
            color: '#ffffff',
            boxShadow: `0 6px 20px -2px ${themeConfig.colors.primary}60`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 10px 28px -2px ${themeConfig.colors.primary}90`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 6px 20px -2px ${themeConfig.colors.primary}60`;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:rotate-90">
            <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
          </div>
          <span className="tracking-wide">Add Account</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. THREE TIERS SHOWCASE CARDS (Visual Representation)
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t) => {
          const tierAccs = accounts.filter((a) => a.tier === t.key);
          const subtotal = tierAccs.reduce((sum, a) => sum + (Number(a.currentBalance) || 0), 0);
          const percent = totalNetWorth > 0 ? Math.round((subtotal / totalNetWorth) * 100) : 0;
          const TierIcon = t.icon;
          const isSelected = activeTierFilter === t.key;

          return (
            <div
              key={t.key}
              onClick={() => setActiveTierFilter((prev) => (prev === t.key ? 'ALL' : (t.key as any)))}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 group ${
                isSelected
                  ? 'bg-app-card border-brand shadow-md ring-2 ring-brand/30'
                  : 'bg-app-card/80 hover:bg-app-card border-app-border hover:border-brand/40 shadow-sm'
              }`}
            >
              {/* Subtle Ambient Glow */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${t.bgGlow} rounded-full blur-2xl pointer-events-none -mr-10 -mt-10`}
              />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner border"
                    style={{
                      backgroundColor: `${t.accentColor}18`,
                      borderColor: `${t.accentColor}35`,
                      color: t.accentColor,
                    }}
                  >
                    <TierIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-app-text flex items-center gap-2">
                      <span>{t.label}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80" style={{ color: t.accentColor }}>
                      {t.badge}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-app-bg border border-app-border text-app-muted">
                  {tierAccs.length}
                </span>
              </div>

              {/* Subtotal & Percentage Bar */}
              <div className="space-y-2 relative z-10 pt-2 border-t border-app-border/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] text-app-muted font-medium">Allocated Capital</span>
                  <span className="text-lg font-black text-app-text tracking-tight">
                    {formatCurrency(subtotal, baseCurrency)}
                  </span>
                </div>

                {/* Progress ratio bar */}
                <div className="w-full bg-app-bg rounded-full h-1.5 overflow-hidden border border-app-border/40">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, percent)}%`,
                      backgroundColor: t.accentColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-app-muted">
                  <span>{t.desc}</span>
                  <span className="font-semibold" style={{ color: t.accentColor }}>{percent}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FILTER BAR (All vs Specific Tier)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 bg-app-card border border-app-border rounded-2xl">
          <button
            onClick={() => setActiveTierFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTierFilter === 'ALL'
                ? 'bg-brand text-white shadow-sm'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            All Accounts ({accounts.length})
          </button>
          {tiers.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTierFilter(t.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTierFilter === t.key
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <span>{t.label.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">
                ({accounts.filter((a) => a.tier === t.key).length})
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs text-app-muted hidden sm:block">
          Net Valuation: <strong className="text-app-text font-bold">{formatCurrency(totalNetWorth, baseCurrency)}</strong>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ACCOUNTS GRID GROUPED BY TIERS
         ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 bg-app-card border border-app-border rounded-3xl" />
          <div className="h-44 bg-app-card border border-app-border rounded-3xl" />
        </div>
      ) : (
        <div className="space-y-8">
          {visibleTiers.map((tier) => {
            const tierAccounts = accounts.filter((a) => a.tier === tier.key);
            const tierSubtotal = tierAccounts.reduce(
              (sum, a) => sum + (Number(a.currentBalance) || 0),
              0
            );
            const currency = tierAccounts[0]?.currency || 'BDT';
            const Icon = tier.icon;

            return (
              <div key={tier.key} className="space-y-4">
                {/* Tier Section Title Bar */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl border flex items-center justify-center"
                      style={{
                        backgroundColor: `${tier.accentColor}15`,
                        borderColor: `${tier.accentColor}30`,
                        color: tier.accentColor,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-app-text flex items-center gap-2">
                        <span>{tier.label}</span>
                        <span className="text-xs text-app-muted font-normal hidden sm:inline">
                          &bull; {tier.desc}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-app-text">
                      {formatCurrency(tierSubtotal, currency)}
                    </span>
                  </div>
                </div>

                {tierAccounts.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-app-card/40 border border-dashed border-app-border text-center text-xs text-app-muted space-y-2">
                    <p>No accounts created under {tier.label}.</p>
                    <button
                      onClick={openAddModal}
                      className="text-xs font-semibold text-brand hover:underline"
                    >
                      + Create an account in this tier
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tierAccounts.map((acc) => {
                      const SubtypeIcon = getAccountIcon(acc.subtype, acc.tier);
                      const badgeStyle = getSubtypeBadgeStyle(acc.subtype);

                      return (
                        <div
                          key={acc.id}
                          className="p-5 md:p-6 bg-app-card border border-app-border hover:border-brand/50 rounded-3xl flex flex-col justify-between hover:bg-app-card-hover transition-all duration-200 shadow-sm hover:shadow-lg space-y-5 group relative"
                        >
                          {/* Top Row: Subtype Icon, Title, Actions */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                              {/* Subtype Visual Icon */}
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${badgeStyle.bg} shadow-sm group-hover:scale-105 transition-transform duration-200`}
                              >
                                <SubtypeIcon className="w-6 h-6" />
                              </div>

                              <Link
                                href={`/accounts/${acc.id}`}
                                className="min-w-0 flex-1 group-hover:text-brand transition-colors"
                              >
                                <div className="font-bold text-app-text text-base tracking-tight flex items-center gap-1.5 truncate">
                                  <span className="truncate">{acc.name}</span>
                                  <ChevronRight className="w-4 h-4 text-app-muted shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <span
                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${badgeStyle.bg}`}
                                  >
                                    {acc.subtype}
                                  </span>
                                  {acc.institution && (
                                    <span className="text-xs text-app-muted flex items-center gap-1 truncate max-w-[140px]">
                                      <Building className="w-3 h-3 shrink-0 opacity-70" />
                                      <span className="truncate">{acc.institution}</span>
                                    </span>
                                  )}
                                </div>
                              </Link>
                            </div>

                            {/* Action Buttons: Reconcile, Edit, Delete */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReconcileAccount(acc);
                                  setStatementBalance(acc.currentBalance.toString());
                                  setReconcileResult(null);
                                }}
                                className="p-2 rounded-xl bg-app-bg hover:bg-brand/10 text-app-muted hover:text-brand border border-app-border transition-colors cursor-pointer"
                                title="Audit statement balance"
                              >
                                <Scale className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => openEditModal(acc, e)}
                                className="p-2 rounded-xl bg-app-bg hover:bg-brand/10 text-app-muted hover:text-brand border border-app-border transition-colors cursor-pointer"
                                title="Edit account details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => openDeleteModal(acc, e)}
                                className="p-2 rounded-xl bg-app-bg hover:bg-rose-500/10 text-app-muted hover:text-rose-400 border border-app-border transition-colors cursor-pointer"
                                title="Delete account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Account Info Pill Box (Account Number & Description) */}
                          {(acc.accountNumber || acc.description) && (
                            <div className="text-[11px] text-app-muted space-y-1.5 bg-app-bg/60 p-3 rounded-2xl border border-app-border/70">
                              {acc.accountNumber && (
                                <div className="flex items-center gap-2 font-mono">
                                  <Hash className="w-3.5 h-3.5 text-app-muted shrink-0" />
                                  <span className="font-semibold text-app-text">A/C: {acc.accountNumber}</span>
                                </div>
                              )}
                              {acc.description && (
                                <div className="flex items-center gap-2 text-app-muted">
                                  <FileText className="w-3.5 h-3.5 shrink-0 text-app-muted/80" />
                                  <span className="truncate">{acc.description}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bottom Row: Balance & Details Link */}
                          <div className="pt-3 border-t border-app-border flex items-end justify-between">
                            <div>
                              <span className="text-[11px] text-app-muted font-medium block">Current Balance</span>
                              <Link
                                href={`/accounts/${acc.id}`}
                                className="text-xs font-semibold text-brand hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>View Details & Ledger</span>
                                <span>&rarr;</span>
                              </Link>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-app-text text-xl tracking-tight">
                                {formatCurrency(acc.currentBalance, acc.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <h3 className="text-sm font-semibold text-app-text">
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Chartered Checking, Main Cash"
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
                    onChange={(e) => setAccTier(e.target.value as any)}
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
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Institution / Bank (Encrypted)</label>
                  <input
                    type="text"
                    placeholder="e.g. BRAC Bank, HSBC, bKash"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Account Number (Encrypted)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1501204899201"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs font-mono text-app-text focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-app-muted mb-1">Description / Notes (Encrypted)</label>
                <input
                  type="text"
                  placeholder="e.g. Primary salary account and emergency reserve"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-xs text-app-text focus:outline-none focus:border-brand"
                />
              </div>

              {!editingAccount && (
                <div>
                  <label className="block text-[11px] font-medium text-app-muted mb-1">Opening Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-app-bg border border-app-border rounded-xl text-base font-bold text-app-text focus:outline-none focus:border-brand"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading || !accName}
                className="w-full py-3 bg-brand hover:brightness-110 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-brand/20 active:scale-95 mt-2"
              >
                {formLoading ? 'Saving...' : editingAccount ? 'Update Account' : 'Save Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeletingAccount(null)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-md mx-auto w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-text">Delete Account</h3>
                <p className="text-xs text-app-muted">Are you sure you want to delete this account?</p>
              </div>
            </div>

            <div className="p-3 bg-app-bg rounded-xl border border-app-border text-xs text-app-muted space-y-1">
              <div><strong className="text-app-text">Account:</strong> {deletingAccount.name}</div>
              <div><strong className="text-app-text">Balance:</strong> {formatCurrency(deletingAccount.currentBalance, deletingAccount.currency)}</div>
              <div className="text-[11px] text-amber-400/90 pt-1">
                Note: If this account has recorded transactions, it will be safely archived to preserve financial records.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAccount(null)}
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

      {/* Statement Reconciliation Modal */}
      {reconcileAccount && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setReconcileAccount(null)}
          />
          <div className="relative z-50 bg-app-card border border-app-border rounded-t-3xl md:rounded-3xl p-6 shadow-2xl max-w-lg mx-auto w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div>
                <h3 className="text-sm font-semibold text-app-text">Reconcile Account</h3>
                <p className="text-[11px] text-app-muted">{reconcileAccount.name}</p>
              </div>
              <button
                onClick={() => setReconcileAccount(null)}
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
                    Difference: {formatCurrency(reconcileResult.log.difference, reconcileAccount.currency)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReconcileAccount(null)}
                  className="w-full py-2.5 bg-app-bg hover:bg-app-card-hover text-app-text border border-app-border rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReconcile} className="space-y-3.5 text-xs">
                <div className="p-3 bg-app-bg rounded-xl border border-app-border flex items-center justify-between">
                  <span className="text-app-muted">Current App Ledger:</span>
                  <span className="font-bold text-app-text">
                    {formatCurrency(reconcileAccount.currentBalance, reconcileAccount.currency)}
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
                    placeholder="e.g. Audited against monthly PDF statement"
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
    </div>
  );
}
