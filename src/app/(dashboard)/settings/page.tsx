'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ShieldCheck, Lock, LogOut, Database, KeyRound } from 'lucide-react';
import ThemeSelector from '@/components/settings/ThemeSelector';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-app-muted mt-0.5">Appearance, security preferences & instance architecture</p>
      </div>

      {/* Centralized Theme Customizer */}
      <ThemeSelector />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Profile Card */}
        <div className="p-6 bg-app-card border border-app-border rounded-3xl space-y-4 shadow-md flex flex-col justify-between transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold text-xl shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <div className="font-bold text-white text-base">{user?.name || 'Owner'}</div>
              <div className="text-xs text-app-muted mt-0.5">{user?.email || 'owner@myfin.local'}</div>
              <div className="text-xs text-brand mt-1 font-semibold">
                Base Currency: {user?.currency || 'BDT'}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock OS & Sign Out</span>
            </button>
          </div>
        </div>

        {/* Security & Cryptographic Status */}
        <div className="p-6 bg-app-card border border-app-border rounded-3xl space-y-4 shadow-md text-xs transition-colors duration-200">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <ShieldCheck className="w-5 h-5 text-brand" />
            <span>Hardware Encryption & Isolation</span>
          </div>

          <div className="space-y-3 pt-1 text-slate-300">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-brand" />
                <div>
                  <div className="font-medium text-white">AES-256-GCM Field Encryption</div>
                  <div className="text-[10px] text-app-muted">Authenticated ciphertext at rest</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-full border border-brand/20">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium text-white">Single-Owner Registration Lock</div>
                  <div className="text-[10px] text-app-muted">Sign-ups strictly disabled</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                ENFORCED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-medium text-white">Database Engine</div>
                  <div className="text-[10px] text-app-muted">External PostgreSQL (Neon SSL Pooler)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                PostgreSQL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
