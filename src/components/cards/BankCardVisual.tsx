'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Wifi,
  Eye,
  EyeOff,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { CardSummaryDTO } from '@/lib/services/card.service';

interface BankCardVisualProps {
  card: CardSummaryDTO;
  currency?: string;
  onPay?: (card: CardSummaryDTO) => void;
  onEdit?: (card: CardSummaryDTO) => void;
  onDelete?: (cardId: string) => void;
}

const THEMES: Record<string, { bg: string; text: string; chip: string; border: string }> = {
  indigo: {
    bg: 'from-indigo-900 via-indigo-950 to-slate-950',
    text: 'text-indigo-200',
    chip: 'bg-amber-400/80 border-amber-300',
    border: 'border-indigo-500/30',
  },
  emerald: {
    bg: 'from-emerald-900 via-teal-950 to-slate-950',
    text: 'text-emerald-200',
    chip: 'bg-amber-400/80 border-amber-300',
    border: 'border-emerald-500/30',
  },
  slate: {
    bg: 'from-slate-800 via-slate-900 to-black',
    text: 'text-slate-300',
    chip: 'bg-amber-300/80 border-amber-200',
    border: 'border-slate-700/60',
  },
  rose: {
    bg: 'from-rose-950 via-pink-950 to-slate-950',
    text: 'text-rose-200',
    chip: 'bg-amber-400/80 border-amber-300',
    border: 'border-rose-500/30',
  },
  amber: {
    bg: 'from-amber-950 via-yellow-950 to-slate-950',
    text: 'text-amber-200',
    chip: 'bg-amber-300/80 border-amber-200',
    border: 'border-amber-500/30',
  },
  violet: {
    bg: 'from-purple-950 via-violet-950 to-slate-950',
    text: 'text-purple-200',
    chip: 'bg-amber-400/80 border-amber-300',
    border: 'border-purple-500/30',
  },
  cyan: {
    bg: 'from-cyan-950 via-sky-950 to-slate-950',
    text: 'text-cyan-200',
    chip: 'bg-amber-400/80 border-amber-300',
    border: 'border-cyan-500/30',
  },
};

export default function BankCardVisual({
  card,
  currency = 'BDT',
  onPay,
  onEdit,
  onDelete,
}: BankCardVisualProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [fullNumber, setFullNumber] = useState<string | null>(null);
  const [fullCvv, setFullCvv] = useState<string | null>(null);
  const [fullExpiry, setFullExpiry] = useState<string | null>(null);
  const [loadingReveal, setLoadingReveal] = useState(false);
  const [copied, setCopied] = useState(false);

  const theme = THEMES[card.color] || THEMES.indigo;
  const isCredit = card.cardType === 'CREDIT';

  const toggleReveal = async () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    setLoadingReveal(true);
    try {
      const res = await fetch(`/api/cards/${card.id}?reveal=true`);
      const data = await res.json();
      if (res.ok && data.card) {
        setFullNumber(data.card.cardNumber);
        setFullCvv(data.card.cvv);
        setFullExpiry(data.card.expiry);
        setIsRevealed(true);
      }
    } catch (err) {
      console.error('Failed to reveal card', err);
    } finally {
      setLoadingReveal(false);
    }
  };

  const handleCopyNumber = () => {
    const numToCopy = fullNumber ? fullNumber.replace(/\s+/g, '') : `••••••••••••${card.cardNumberLast4}`;
    navigator.clipboard.writeText(numToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Utilization color
  const util = card.utilizationRate || 0;
  const utilColor =
    util > 70
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      : util > 30
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

  const utilBarColor = util > 70 ? 'bg-rose-500' : util > 30 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-5 md:p-6 space-y-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      {/* ─────────────────────────────────────────────────────────────
          1. REALISTIC CARD SURFACE
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${theme.bg} border ${theme.border} shadow-2xl flex flex-col justify-between overflow-hidden group transition-all`}
      >
        {/* Subtle holographic sheen overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Row: Bank / Account & Card Type Badge */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold truncate max-w-[180px]">
              {card.accountName}
            </div>
            <div className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[220px]">
              {card.cardName}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isCredit
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-teal-500/10 text-teal-300 border-teal-500/30'
              }`}
            >
              {card.cardType}
            </span>
            <Wifi className="w-4 h-4 text-slate-300 rotate-90" />
          </div>
        </div>

        {/* EMV Chip & Contactless Graphic */}
        <div className="relative z-10 flex items-center justify-between my-auto">
          <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-300 shadow-inner flex flex-col justify-around p-1">
            <div className="w-full h-0.5 bg-amber-600/60 rounded" />
            <div className="w-full h-0.5 bg-amber-600/60 rounded" />
          </div>

          {/* Network Logo Graphic */}
          <div className="text-right font-black italic tracking-tighter text-base text-white/90">
            {card.network === 'VISA' && <span className="tracking-widest font-serif font-extrabold text-lg text-blue-200">VISA</span>}
            {card.network === 'MASTERCARD' && (
              <div className="flex items-center -space-x-2">
                <div className="w-6 h-6 rounded-full bg-rose-500/90" />
                <div className="w-6 h-6 rounded-full bg-amber-500/80" />
              </div>
            )}
            {card.network === 'AMEX' && (
              <span className="text-xs px-2 py-1 bg-sky-600 text-white font-mono font-bold rounded">AMEX</span>
            )}
            {card.network !== 'VISA' && card.network !== 'MASTERCARD' && card.network !== 'AMEX' && (
              <span className="text-xs text-slate-300 font-mono">{card.network}</span>
            )}
          </div>
        </div>

        {/* Card Number & Reveal Action */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-mono text-sm sm:text-base md:text-lg font-semibold tracking-[0.16em] text-white drop-shadow">
              {isRevealed && fullNumber ? fullNumber : card.maskedNumber}
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={toggleReveal}
                disabled={loadingReveal}
                title={isRevealed ? 'Hide Details' : 'Reveal Encrypted Card Number'}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {loadingReveal ? (
                  <span className="text-[10px] animate-pulse">...</span>
                ) : isRevealed ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopyNumber}
                title="Copy Card Number"
                className="text-slate-300 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Bottom Card Row: Cardholder & Expiry / CVV */}
          <div className="flex items-end justify-between text-xs">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Cardholder</div>
              <div className="font-semibold text-white tracking-wider uppercase truncate max-w-[180px]">
                {card.cardholderName || 'CARD MEMBER'}
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Expires</div>
                <div className="font-mono font-semibold text-white">
                  {isRevealed && fullExpiry ? fullExpiry : card.expiry || '••/••'}
                </div>
              </div>

              {isRevealed && fullCvv && (
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-amber-300 font-medium">CVV</div>
                  <div className="font-mono font-bold text-amber-300">{fullCvv}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CARD FINANCIAL STATUS / DEBT BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
        {isCredit ? (
          <>
            {/* Credit Utilization & Balance Header */}
            <div className="flex items-center justify-between text-xs">
              <div className="text-slate-400">
                Current Debt:{' '}
                <span className="font-bold text-rose-400">
                  {currency} {(card.currentDebt || 0).toLocaleString()}
                </span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${utilColor}`}>
                {card.utilizationRate}% Utilized
              </span>
            </div>

            {/* Utilization Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${utilBarColor} transition-all duration-500 rounded-full`}
                style={{ width: `${Math.min(100, Math.max(0, card.utilizationRate || 0))}%` }}
              />
            </div>

            {/* Available & Limit Info */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>
                Available: <strong className="text-slate-200">{currency} {(card.availableCredit || 0).toLocaleString()}</strong>
              </span>
              <span>
                Limit: <strong className="text-slate-200">{currency} {(card.creditLimit || 0).toLocaleString()}</strong>
              </span>
            </div>

            {/* Billing Due & Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {card.dueDay ? `Due on ${card.dueDay}th of month` : 'No due date set'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onPay && (
                  <button
                    type="button"
                    onClick={() => onPay(card)}
                    className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <span>Pay Bill</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Edit Card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(card.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* DEBIT CARD DETAILS */
          <>
            <div className="flex items-center justify-between text-xs">
              <div className="text-slate-400">
                Available Balance:{' '}
                <span className="font-bold text-emerald-400">
                  {currency} {(card.linkedAccountBalance || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Direct Account Link
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400">
                Shares {card.accountName} liquidity
              </span>

              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    title="Edit Card"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(card.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
