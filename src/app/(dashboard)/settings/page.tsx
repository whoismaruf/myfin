'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ShieldCheck, Lock, LogOut, Database, User, KeyRound } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div>
        <h1 className="text-lg font-bold text-white">System Settings</h1>
        <p className="text-[11px] text-slate-400">Security preferences & instance management</p>
      </div>

      {/* Owner Profile Card */}
      <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-3xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {user?.name?.[0]?.toUpperCase() || 'M'}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{user?.name || 'Owner'}</div>
            <div className="text-xs text-slate-400">{user?.email || 'owner@myfin.local'}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
              Base Currency: {user?.currency || 'BDT'}
            </div>
          </div>
        </div>
      </div>

      {/* Security & Cryptographic Status */}
      <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & Protection Status</span>
        </div>

        <div className="space-y-2.5 pt-1 text-slate-300">
          <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256-GCM Field Encryption</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Single-Owner Registration Lock</span>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              ENFORCED
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/40">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Database Engine</span>
            </div>
            <span className="text-[10px] font-bold text-purple-300">
              PostgreSQL 18 (Alpine)
            </span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="pt-4">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock OS & Sign Out</span>
        </button>
      </div>
    </div>
  );
}
