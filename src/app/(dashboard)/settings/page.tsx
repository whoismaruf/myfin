'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { ShieldCheck, Lock, LogOut, Database, User, KeyRound, Server } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Security preferences & instance architecture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Profile Card */}
        <div className="p-6 bg-slate-800/50 border border-slate-700/60 rounded-3xl space-y-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'M'}
            </div>
            <div>
              <div className="font-bold text-white text-base">{user?.name || 'Owner'}</div>
              <div className="text-xs text-slate-400 mt-0.5">{user?.email || 'owner@myfin.local'}</div>
              <div className="text-xs text-emerald-400 mt-1 font-semibold">
                Base Currency: {user?.currency || 'BDT'}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/50">
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
        <div className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl space-y-4 shadow-md text-xs">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Hardware Encryption & Isolation</span>
          </div>

          <div className="space-y-3 pt-1 text-slate-300">
            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-medium text-white">AES-256-GCM Field Encryption</div>
                  <div className="text-[10px] text-slate-400">Authenticated ciphertext at rest</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-medium text-white">Single-Owner Registration Lock</div>
                  <div className="text-[10px] text-slate-400">Sign-ups strictly disabled</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                ENFORCED
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-medium text-white">Database Engine</div>
                  <div className="text-[10px] text-slate-400">Internal network only (Port 5432 unexposed)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                PostgreSQL 18
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
