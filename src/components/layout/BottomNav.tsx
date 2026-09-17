'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Receipt,
  Plus,
  Landmark,
  Menu,
  Calendar,
  Lock,
  TrendingUp,
  BarChart3,
  CreditCard,
  Tag,
  Settings,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export default function BottomNav({ onOpenQuickAdd }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { themeConfig } = useTheme();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const isMoreActive =
    pathname.startsWith('/recurring') ||
    pathname.startsWith('/fixed-deposits') ||
    pathname.startsWith('/investments') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');

  return (
    <div className="md:hidden">
      {/* More Menu Bottom Drawer */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative z-50 bg-app-sidebar border-t border-app-border rounded-t-3xl p-6 shadow-2xl space-y-4 max-w-lg mx-auto w-full transition-colors duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-app-border">
              <h3 className="text-sm font-semibold text-white">More Modules</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/recurring"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/recurring')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Recurring & Bills</div>
                  <div className="text-[10px] text-app-muted">Commitments & Forecast</div>
                </div>
              </Link>

              <Link
                href="/fixed-deposits"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/fixed-deposits')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Fixed Deposits</div>
                  <div className="text-[10px] text-app-muted">FDR & Term Savings</div>
                </div>
              </Link>

              <Link
                href="/investments"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/investments')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Investments</div>
                  <div className="text-[10px] text-app-muted">Equities & Portfolios</div>
                </div>
              </Link>

              <Link
                href="/reports"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/reports')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Reports & Flow</div>
                  <div className="text-[10px] text-app-muted">Analytics & Breakdown</div>
                </div>
              </Link>

              <Link
                href="/cards"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/cards')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Cards & Debt</div>
                  <div className="text-[10px] text-app-muted">Limits & Utilization</div>
                </div>
              </Link>

              <Link
                href="/categories"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/categories')
                    ? 'bg-brand/15 border-transparent text-brand'
                    : 'bg-white/5 border-white/10 text-app-text hover:bg-white/10'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Categories</div>
                  <div className="text-[10px] text-app-muted">Taxonomy & Subcategories</div>
                </div>
              </Link>
            </div>

            <Link
              href="/settings"
              onClick={() => setShowMoreMenu(false)}
              className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings & Themes</span>
              </div>
              <span className="text-[10px] text-app-muted">View</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="w-full max-w-lg bg-app-sidebar/95 backdrop-blur-md border-t border-app-border px-4 py-2 pointer-events-auto flex items-center justify-between shadow-2xl transition-colors duration-200">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/') ? 'text-brand font-medium' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>

          {/* Ledger */}
          <Link
            href="/ledger"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/ledger') ? 'text-brand font-medium' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px]">Ledger</span>
          </Link>

          {/* Center (+) FAB */}
          <div className="relative -top-5">
            <button
              onClick={onOpenQuickAdd}
              className="w-12 h-12 rounded-full text-brand-fg flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border-4 font-bold"
              style={{
                background: `linear-gradient(135deg, ${themeConfig.colors.brandGradientFrom}, ${themeConfig.colors.brandGradientTo})`,
                borderColor: themeConfig.colors.sidebar,
                boxShadow: `0 8px 24px -2px ${themeConfig.colors.primary}50`,
              }}
              aria-label="Quick Add"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Accounts */}
          <Link
            href="/accounts"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/accounts') ? 'text-brand font-medium' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px]">Accounts</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isMoreActive ? 'text-brand font-medium' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
