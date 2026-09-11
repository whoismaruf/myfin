'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Wallet,
  Settings,
  ShieldCheck,
  Home,
  Receipt,
  Landmark,
  Calendar,
  Lock,
  TrendingUp,
  BarChart3,
  CreditCard,
  Tag,
  Plus,
  LogOut,
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import QuickAddModal from '@/components/modals/QuickAddModal';

interface DashboardShellProps {
  user: {
    id: string;
    email: string;
    name?: string;
    currency?: string;
  };
  children: React.ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'Transaction Ledger', href: '/ledger', icon: Receipt },
    { label: 'Accounts & Reserves', href: '/accounts', icon: Landmark },
    { label: 'Cards & Credit Debt', href: '/cards', icon: CreditCard },
    { label: 'Categories', href: '/categories', icon: Tag },
    { label: 'Recurring & Forecast', href: '/recurring', icon: Calendar },
    { label: 'Fixed Deposits (FDR)', href: '/fixed-deposits', icon: Lock },
    { label: 'Investments & Assets', href: '/investments', icon: TrendingUp },
    { label: 'Reports & Cash Flow', href: '/reports', icon: BarChart3 },
    { label: 'System Settings', href: '/settings', icon: Settings },
  ];

  const isNavActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (visible on md screens and above)
         ───────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between z-30">
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* App Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                myfin
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {user.currency || 'BDT'}
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Wealth & Cash-Flow OS</div>
            </div>
          </Link>

          {/* Primary Quick Action Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Entry / Transfer</span>
          </button>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Sign Out (Sidebar Footer) */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {user.name || 'Owner'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Responsive)
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Hidden on md screens) */}
        <header className="md:hidden sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                myfin
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {user.currency || 'BDT'}
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 py-1 px-2.5 rounded-xl border border-slate-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[120px] truncate">{user.name || user.email.split('@')[0]}</span>
            </div>

            <Link
              href="/settings"
              className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Desktop Top Header Bar (Greeting & Fast Action) */}
        <header className="hidden md:flex sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-8 py-3.5 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-300">
              Personal Finance & Wealth OS
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AES-256 Encrypted</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Quick Action</span>
            </button>
            <div className="text-xs text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-28 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile-Only Bottom Navigation */}
      <BottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Center / Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
