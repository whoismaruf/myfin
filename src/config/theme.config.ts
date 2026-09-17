export type ThemeId =
  // ── DARK THEMES ──
  | 'sapphire'        // Modern Indigo / Electric Blue (Mercury / Linear style) - DEFAULT
  | 'emerald'         // Classic Wealth & Forest Emerald
  | 'obsidian'        // Luxury Titanium & Champagne Gold / Amber
  | 'cyber'           // Electric Cyan & Cyber Teal
  | 'amethyst'        // Royal Violet & Neon Purple
  | 'rose'            // Crimson Velvet & Sunset Rose
  // ── LIGHT / WHITE THEMES ──
  | 'snow'            // Pure Porcelain & Sapphire Blue Light
  | 'nordic-emerald'  // Fresh Ivory & Botanical Emerald Light
  | 'oat-amber'       // Warm Cream & Champagne Gold Light
  | 'lavender-light'; // Soft Lilac Mist & Purple Velvet Light

export type FontId = 'inter' | 'system' | 'geist' | 'plus-jakarta';

export interface ThemeColors {
  primary: string;            // Primary brand color (Hex)
  primaryRgb: string;         // 'R, G, B' for Tailwind alpha support
  primaryHover: string;       // Hover state color (Hex)
  primaryForeground: string;  // Text color on primary buttons (Hex)
  accent: string;             // Secondary accent color (Hex)
  accentRgb: string;          // 'R, G, B' for accent alpha
  background: string;         // Main background color (Hex)
  sidebar: string;            // Sidebar / header background (Hex)
  card: string;               // Card background (Hex)
  cardHover: string;          // Card hover background (Hex)
  border: string;             // Card / container border (CSS string)
  borderSubtle: string;       // Subtle divider border (CSS string)
  text: string;               // Main foreground text (Hex)
  textMuted: string;          // Secondary / muted text (Hex)
  brandGradientFrom: string;  // Logo & CTA gradient start
  brandGradientTo: string;    // Logo & CTA gradient end
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  mode: 'dark' | 'light';
  description: string;
  badge: string;
  colors: ThemeColors;
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CENTRALIZED THEME PRESETS
 * You can customize colors, add new themes, or change the default theme below.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const THEMES: Record<ThemeId, ThemeConfig> = {
  // ──────────────────────────────────────────
  // DARK PRESETS
  // ──────────────────────────────────────────
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Modern',
    mode: 'dark',
    description: 'Electric indigo & sapphire accents on deep slate',
    badge: 'DEFAULT',
    colors: {
      primary: '#6366F1',
      primaryRgb: '99, 102, 241',
      primaryHover: '#4F46E5',
      primaryForeground: '#FFFFFF',
      accent: '#38BDF8',
      accentRgb: '56, 189, 248',
      background: '#090D1A',
      sidebar: '#0D1322',
      card: '#121A2E',
      cardHover: '#18223C',
      border: 'rgba(99, 102, 241, 0.16)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      brandGradientFrom: '#6366F1',
      brandGradientTo: '#38BDF8',
    },
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Wealth',
    mode: 'dark',
    description: 'Vibrant jade & botanical teal with dark obsidian',
    badge: 'CLASSIC',
    colors: {
      primary: '#10B981',
      primaryRgb: '16, 185, 129',
      primaryHover: '#059669',
      primaryForeground: '#022C22',
      accent: '#14B8A6',
      accentRgb: '20, 184, 166',
      background: '#070C12',
      sidebar: '#0A121A',
      card: '#0F1A24',
      cardHover: '#152432',
      border: 'rgba(16, 185, 129, 0.18)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#F8FAFC',
      textMuted: '#94A3B8',
      brandGradientFrom: '#10B981',
      brandGradientTo: '#14B8A6',
    },
  },
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Gold',
    mode: 'dark',
    description: 'Pure titanium black & champagne amber gold',
    badge: 'LUXURY',
    colors: {
      primary: '#F59E0B',
      primaryRgb: '245, 158, 11',
      primaryHover: '#D97706',
      primaryForeground: '#180C02',
      accent: '#FBBF24',
      accentRgb: '251, 191, 36',
      background: '#09090B',
      sidebar: '#101014',
      card: '#18181C',
      cardHover: '#222228',
      border: 'rgba(245, 158, 11, 0.18)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
      brandGradientFrom: '#F59E0B',
      brandGradientTo: '#FBBF24',
    },
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Cyan',
    mode: 'dark',
    description: 'Neon electric cyan with high-contrast night background',
    badge: 'HIGH-TECH',
    colors: {
      primary: '#06B6D4',
      primaryRgb: '6, 182, 212',
      primaryHover: '#0891B2',
      primaryForeground: '#04272E',
      accent: '#3B82F6',
      accentRgb: '59, 130, 246',
      background: '#060B11',
      sidebar: '#0A111A',
      card: '#0E1924',
      cardHover: '#132333',
      border: 'rgba(6, 182, 212, 0.2)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#F0FDFA',
      textMuted: '#94A3B8',
      brandGradientFrom: '#06B6D4',
      brandGradientTo: '#3B82F6',
    },
  },
  amethyst: {
    id: 'amethyst',
    name: 'Royal Amethyst',
    mode: 'dark',
    description: 'Deep midnight violet & neon purple accents',
    badge: 'VIBRANT',
    colors: {
      primary: '#8B5CF6',
      primaryRgb: '139, 92, 246',
      primaryHover: '#7C3AED',
      primaryForeground: '#FFFFFF',
      accent: '#EC4899',
      accentRgb: '236, 72, 153',
      background: '#0A0714',
      sidebar: '#100C20',
      card: '#17122C',
      cardHover: '#201A3D',
      border: 'rgba(139, 92, 246, 0.2)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#FAF5FF',
      textMuted: '#A78BFA',
      brandGradientFrom: '#8B5CF6',
      brandGradientTo: '#EC4899',
    },
  },
  rose: {
    id: 'rose',
    name: 'Crimson Rose',
    mode: 'dark',
    description: 'Refined rose pink & warm slate charcoal',
    badge: 'ELEGANT',
    colors: {
      primary: '#F43F5E',
      primaryRgb: '244, 63, 94',
      primaryHover: '#E11D48',
      primaryForeground: '#FFFFFF',
      accent: '#FB7185',
      accentRgb: '251, 113, 133',
      background: '#0C080A',
      sidebar: '#140E11',
      card: '#1D1418',
      cardHover: '#291C22',
      border: 'rgba(244, 63, 94, 0.2)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
      text: '#FFF1F2',
      textMuted: '#FDA4AF',
      brandGradientFrom: '#F43F5E',
      brandGradientTo: '#FB7185',
    },
  },

  // ──────────────────────────────────────────
  // LIGHT / WHITE PRESETS
  // ──────────────────────────────────────────
  snow: {
    id: 'snow',
    name: 'Snow Minimalist (Light)',
    mode: 'light',
    description: 'Crisp porcelain white with modern sapphire indigo accents',
    badge: 'LIGHT',
    colors: {
      primary: '#4F46E5',
      primaryRgb: '79, 70, 229',
      primaryHover: '#4338CA',
      primaryForeground: '#FFFFFF',
      accent: '#0284C7',
      accentRgb: '2, 132, 199',
      background: '#F8FAFC',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#F1F5F9',
      border: '#E2E8F0',
      borderSubtle: '#F1F5F9',
      text: '#0F172A',
      textMuted: '#64748B',
      brandGradientFrom: '#4F46E5',
      brandGradientTo: '#0284C7',
    },
  },
  'nordic-emerald': {
    id: 'nordic-emerald',
    name: 'Nordic Sage (Light)',
    mode: 'light',
    description: 'Fresh ivory & botanical jade with clean forest contrast',
    badge: 'LIGHT',
    colors: {
      primary: '#059669',
      primaryRgb: '5, 150, 105',
      primaryHover: '#047857',
      primaryForeground: '#FFFFFF',
      accent: '#0D9488',
      accentRgb: '13, 148, 136',
      background: '#F6FAF8',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#EEF7F2',
      border: '#D1E7DD',
      borderSubtle: '#E6F4ED',
      text: '#064E3B',
      textMuted: '#52796F',
      brandGradientFrom: '#059669',
      brandGradientTo: '#0D9488',
    },
  },
  'oat-amber': {
    id: 'oat-amber',
    name: 'Oat & Champagne (Light)',
    mode: 'light',
    description: 'Warm cream alabaster with rich gold & espresso typography',
    badge: 'LIGHT',
    colors: {
      primary: '#D97706',
      primaryRgb: '217, 119, 6',
      primaryHover: '#B45309',
      primaryForeground: '#FFFFFF',
      accent: '#EA580C',
      accentRgb: '234, 88, 12',
      background: '#FAF8F5',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#F5EFEB',
      border: '#EAE2D8',
      borderSubtle: '#F4ECE4',
      text: '#1C1917',
      textMuted: '#78716C',
      brandGradientFrom: '#D97706',
      brandGradientTo: '#F59E0B',
    },
  },
  'lavender-light': {
    id: 'lavender-light',
    name: 'Lavender Mist (Light)',
    mode: 'light',
    description: 'Soft pastel porcelain with vibrant royal purple & magenta highlights',
    badge: 'LIGHT',
    colors: {
      primary: '#7C3AED',
      primaryRgb: '124, 58, 237',
      primaryHover: '#6D28D9',
      primaryForeground: '#FFFFFF',
      accent: '#DB2777',
      accentRgb: '219, 39, 119',
      background: '#FBF8FF',
      sidebar: '#FFFFFF',
      card: '#FFFFFF',
      cardHover: '#F3ECFC',
      border: '#E9DDF8',
      borderSubtle: '#F3EAFA',
      text: '#1E1B4B',
      textMuted: '#6B7280',
      brandGradientFrom: '#7C3AED',
      brandGradientTo: '#DB2777',
    },
  },
};

/**
 * Change this to any ThemeId above to switch the default theme!
 */
export const DEFAULT_THEME_ID: ThemeId = 'sapphire';
