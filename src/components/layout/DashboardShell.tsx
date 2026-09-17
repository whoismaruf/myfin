'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Wallet,
  Settings,
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
  Search,
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import QuickAddModal from '@/components/modals/QuickAddModal';
import { useTheme } from '@/components/providers/ThemeProvider';

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
  const { themeConfig } = useTheme();

  // Keyboard shortcut (Ctrl+K / Cmd+K) to open Quick Add modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const getPageTitle = () => {
    const item = navItems.find((n) => (n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)));
    return item?.label || 'Overview';
  };

  return (
    <div className="flex min-h-screen bg-app-bg text-app-text transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (visible on md screens and above)
         ───────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-app-sidebar border-r border-app-border shrink-0 sticky top-0 h-screen justify-between z-30 transition-colors duration-200">
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* App Logo & Clean Uppercase "MYFIN" Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
                boxShadow: `0 8px 20px -4px ${themeConfig.colors.primary}50`,
              }}
            >
              <Wallet className="w-6 h-6 font-bold" style={{ color: themeConfig.colors.primaryForeground }} />
            </div>
            <span className="text-[25px] font-normal text-app-text leading-none select-none tracking-[0.16em] font-display">
              MYFIN
            </span>
          </Link>

          {/* 🌟 Always-Colored Glowing Action Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-full py-3 px-4 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
              boxShadow: `0 6px 20px -2px ${themeConfig.colors.primary}60`,
              color: '#ffffff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 10px 30px 0px ${themeConfig.colors.primary}95`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = `0 6px 20px -2px ${themeConfig.colors.primary}60`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus className="w-5 h-5 stroke-[3] transition-transform group-hover:rotate-90 duration-200" />
            <span>New Entry / Transfer</span>
          </button>

          {/* Nav Links (Medium readable font size & Explicit Theme Color on Active) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={
                    active
                      ? {
                          backgroundColor: `${themeConfig.colors.primary}18`,
                          color: themeConfig.colors.primary,
                        }
                      : undefined
                  }
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    active
                      ? 'font-bold'
                      : 'font-medium text-app-muted hover:text-app-text hover:bg-brand/5'
                  }`}
                >
                  <Icon
                    className="w-5 h-5 shrink-0 transition-colors"
                    style={{
                      color: active ? themeConfig.colors.primary : undefined,
                      strokeWidth: active ? 2.5 : 2,
                    }}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-5 border-t border-app-border bg-black/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border"
                style={{
                  backgroundColor: `${themeConfig.colors.primary}15`,
                  borderColor: `${themeConfig.colors.primary}30`,
                  color: themeConfig.colors.primary,
                }}
              >
                {user.name?.[0]?.toUpperCase() || 'M'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-app-text truncate max-w-[130px]">
                  {user.name || 'Owner'}
                </div>
                <div className="text-[10px] text-app-muted truncate max-w-[130px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-xl text-app-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
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
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-app-sidebar/95 backdrop-blur-md border-b border-app-border px-4 py-3 flex items-center justify-between transition-colors duration-200">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
              }}
            >
              <Wallet className="w-5 h-5 font-bold" style={{ color: themeConfig.colors.primaryForeground }} />
            </div>
            <span className="text-xl font-normal text-app-text tracking-[0.16em] font-display">
              MYFIN
            </span>
          </Link>

          {/* Mobile Top Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all text-white"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
                boxShadow: `0 4px 14px -2px ${themeConfig.colors.primary}60`,
                color: '#ffffff',
              }}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>New Entry</span>
            </button>

            <Link
              href="/settings"
              className="p-2 rounded-xl bg-app-card border border-app-border text-app-muted hover:text-app-text transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* 🌟 Ultra-Minimalist Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-20 bg-app-bg/85 backdrop-blur-md border-b border-app-border px-8 py-4 items-center justify-between transition-colors duration-200">
          {/* Left: Active Page Identity & Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-app-muted/60">myfin</span>
            <span className="text-xs text-app-muted/30">/</span>
            <h2 className="text-sm font-bold text-app-text tracking-tight">{getPageTitle()}</h2>
          </div>

          {/* Right: Current Date */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-app-muted bg-app-card border border-app-border px-3.5 py-1.5 rounded-xl shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-app-muted shrink-0" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-16">
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
