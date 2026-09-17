'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, DEFAULT_THEME_ID, ThemeId, ThemeConfig } from '@/config/theme.config';

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME_ID);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('myfin-theme') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        document.documentElement.setAttribute('data-theme', DEFAULT_THEME_ID);
      }
    } catch {
      document.documentElement.setAttribute('data-theme', DEFAULT_THEME_ID);
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    if (!THEMES[newTheme]) return;
    setThemeState(newTheme);
    try {
      localStorage.setItem('myfin-theme', newTheme);
    } catch {}
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const themeConfig = THEMES[theme] || THEMES[DEFAULT_THEME_ID];
  const availableThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: DEFAULT_THEME_ID,
      themeConfig: THEMES[DEFAULT_THEME_ID],
      setTheme: () => {},
      availableThemes: Object.values(THEMES),
    };
  }
  return context;
}
