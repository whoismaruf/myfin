'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Wallet, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'BDT' | 'USD' | 'GBP'>('BDT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Check if the system is already onboarded
    fetch('/api/onboarding/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isOnboarded) {
          router.replace('/login');
        } else {
          setCheckingStatus(false);
        }
      })
      .catch(() => setCheckingStatus(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, currency }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to initialize account');
      }

      // Automatically sign in with the new credentials
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Redirect to login if auto-login had any issue
        router.push('/login');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verifying system state...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 sm:px-6">
      <div className="w-full max-w-md flex flex-col justify-between min-h-[600px] sm:min-h-0 sm:bg-slate-900/40 sm:border sm:border-slate-800/80 sm:rounded-3xl sm:p-8 sm:shadow-2xl sm:shadow-emerald-950/10 gap-6">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wallet className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                myfin
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">Personal Finance & Wealth OS</p>
            </div>
          </div>

          {/* Welcome Notice */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Single-Owner Encrypted Instance</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Welcome to your private financial OS. Set up your master account credentials below.
              Once created, registration is locked and only this account can access the system.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Onboarding Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Owner Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maruf Khan"
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Master Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Master Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Minimum 6 characters. Hashed with bcrypt (12 rounds).</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Base Currency <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { code: 'BDT', symbol: '৳', label: 'Taka' },
                  { code: 'USD', symbol: '$', label: 'Dollar' },
                  { code: 'GBP', symbol: '£', label: 'Pound' },
                ].map((item) => {
                  const isSelected = currency === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setCurrency(item.code as any)}
                      className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl font-bold leading-tight">{item.symbol}</span>
                      <span className="text-[11px] font-semibold tracking-wider mt-0.5">{item.code}</span>
                      <span className="text-[9px] text-slate-500">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 text-[11px] text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes default starter accounts & expense categories</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.99] mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Initializing myfin...
                </span>
              ) : (
                <>
                  <span>Initialize myfin OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pt-8 text-center text-[11px] text-slate-500">
          🔒 Hardware-accelerated AES-256-GCM data encryption enabled
        </div>
      </div>
    </div>
  );
}
