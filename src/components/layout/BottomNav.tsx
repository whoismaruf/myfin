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

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export default function BottomNav({ onOpenQuickAdd }: BottomNavProps) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 shadow-2xl space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
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
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Recurring & Bills</div>
                  <div className="text-[10px] text-slate-500">Commitments & Forecast</div>
                </div>
              </Link>

              <Link
                href="/fixed-deposits"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/fixed-deposits')
                    ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Fixed Deposits</div>
                  <div className="text-[10px] text-slate-500">FDR & Term Savings</div>
                </div>
              </Link>

              <Link
                href="/investments"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/investments')
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Investments</div>
                  <div className="text-[10px] text-slate-500">Equities & Portfolios</div>
                </div>
              </Link>

              <Link
                href="/reports"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/reports')
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Reports & Flow</div>
                  <div className="text-[10px] text-slate-500">Analytics & Breakdown</div>
                </div>
              </Link>

              <Link
                href="/cards"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/cards')
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Cards & Debt</div>
                  <div className="text-[10px] text-slate-500">Limits & Utilization</div>
                </div>
              </Link>

              <Link
                href="/categories"
                onClick={() => setShowMoreMenu(false)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  pathname.startsWith('/categories')
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Categories</div>
                  <div className="text-[10px] text-slate-500">Taxonomy & Subcategories</div>
                </div>
              </Link>
            </div>

            <Link
              href="/settings"
              onClick={() => setShowMoreMenu(false)}
              className="w-full p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings & Profile</span>
              </div>
              <span className="text-[10px] text-slate-500">View</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="w-full max-w-lg bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-2 pointer-events-auto flex items-center justify-between shadow-2xl">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>

          {/* Ledger */}
          <Link
            href="/ledger"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/ledger') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span className="text-[10px]">Ledger</span>
          </Link>

          {/* Center (+) FAB */}
          <div className="relative -top-5">
            <button
              onClick={onOpenQuickAdd}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all border-4 border-slate-900 font-bold"
              aria-label="Quick Add"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Accounts */}
          <Link
            href="/accounts"
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isActive('/accounts') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Landmark className="w-5 h-5" />
            <span className="text-[10px]">Accounts</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-colors ${
              isMoreActive ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
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
