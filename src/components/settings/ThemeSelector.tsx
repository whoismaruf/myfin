'use client';

import React, { useState } from 'react';
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { ThemeId } from '@/config/theme.config';

export default function ThemeSelector() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [filterMode, setFilterMode] = useState<'all' | 'dark' | 'light'>('all');

  const filteredThemes = availableThemes.filter((t) => {
    if (filterMode === 'all') return true;
    return t.mode === filterMode;
  });

  return (
    <div className="p-6 bg-app-card border border-app-border rounded-3xl space-y-6 shadow-lg transition-colors duration-200">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-app-text flex items-center gap-2">
              Appearance & Theme Switcher
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20 font-semibold">
                Dynamic
              </span>
            </h2>
            <p className="text-xs text-app-muted mt-0.5">
              Choose from dark, modern, or high-contrast light & white themes
            </p>
          </div>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-app-bg border border-app-border rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'all'
                ? 'bg-brand text-brand-fg shadow-sm'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            All ({availableThemes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('dark')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'dark'
                ? 'bg-brand text-brand-fg shadow-sm'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('light')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'light'
                ? 'bg-brand text-brand-fg shadow-sm'
                : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        {filteredThemes.map((t) => {
          const isSelected = theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id as ThemeId)}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[130px] group ${
                isSelected
                  ? 'border-brand bg-brand/10 shadow-lg shadow-brand/10 ring-1 ring-brand'
                  : 'border-app-border bg-app-bg/50 hover:border-brand/40 hover:bg-app-bg/80'
              }`}
            >
              {/* Top Row: Name & Badge */}
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <span className="text-xs font-bold text-app-text">{t.name}</span>
                </div>
                {isSelected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand bg-brand/20 px-2.5 py-0.5 rounded-full border border-brand/30">
                    <Check className="w-3 h-3 stroke-[3]" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-app-muted bg-app-card px-2 py-0.5 rounded-full border border-app-border">
                    {t.badge}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-[11px] text-app-muted leading-snug line-clamp-2 mb-3">
                {t.description}
              </p>

              {/* Color Swatch Bar */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-app-border">
                <div
                  className="w-6 h-3.5 rounded-full shadow-inner border border-black/10"
                  title={`Primary: ${t.colors.primary}`}
                  style={{ backgroundColor: t.colors.primary }}
                />
                <div
                  className="w-6 h-3.5 rounded-full shadow-inner border border-black/10"
                  title={`Accent: ${t.colors.accent}`}
                  style={{ backgroundColor: t.colors.accent }}
                />
                <div
                  className="w-6 h-3.5 rounded-full shadow-inner border border-black/15"
                  title={`Card: ${t.colors.card}`}
                  style={{ backgroundColor: t.colors.card }}
                />
                <div
                  className="w-6 h-3.5 rounded-full shadow-inner border border-black/15"
                  title={`Background: ${t.colors.background}`}
                  style={{ backgroundColor: t.colors.background }}
                />
                <span className="text-[10px] font-medium text-app-muted ml-auto uppercase tracking-wider">
                  {t.mode}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 p-3 bg-app-bg rounded-2xl border border-app-border text-[11px] text-app-muted">
        <Sparkles className="w-4 h-4 text-brand shrink-0" />
        <span>
          Centralized configuration defined in <code className="text-brand font-mono text-[10px]">src/config/theme.config.ts</code>. All components, navigation, cards, and buttons dynamically adapt.
        </span>
      </div>
    </div>
  );
}
