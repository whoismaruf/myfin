'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Wallet, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { themeConfig } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/onboarding/status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.isOnboarded === false) {
          router.replace('/onboarding');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-8 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-md flex flex-col justify-between min-h-[540px] sm:min-h-0 sm:bg-app-card/60 sm:border sm:border-app-border sm:rounded-3xl sm:p-8 sm:shadow-2xl gap-8 backdrop-blur-md">
        <div className="space-y-8 my-auto">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
                boxShadow: `0 12px 28px -4px ${themeConfig.colors.primary}40`,
              }}
            >
              <Wallet className="w-7 h-7 font-bold" style={{ color: themeConfig.colors.primaryForeground }} />
            </div>
            <div>
              <h1 className="text-3xl font-normal text-app-text tracking-[0.16em] font-display">MYFIN</h1>
              <p className="text-xs text-app-muted mt-0.5">Personal Finance & Wealth OS</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand hover:bg-brand-hover disabled:opacity-50 text-brand-fg font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] mt-2"
              style={{
                boxShadow: `0 10px 24px -4px ${themeConfig.colors.primary}40`,
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-fg border-t-transparent rounded-full animate-spin" />
                  Unlocking...
                </span>
              ) : (
                <>
                  <span>Unlock myfin OS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-center text-xs text-app-muted pt-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Single-owner instance. Sign-ups disabled.</span>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-600">
          Encrypted at rest with AES-256-GCM
        </div>
      </div>
    </div>
  );
}
