'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Settings, ShieldCheck } from 'lucide-react';
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
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
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

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5 pb-28">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Center FAB Quick Add Sheet */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
