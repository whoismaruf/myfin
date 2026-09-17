import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-brand-display)", "Space Grotesk", "Outfit", "sans-serif"],
      },
      colors: {
        // Dynamic Centralized Brand Theme Tokens
        brand: {
          DEFAULT: "rgb(var(--theme-primary-rgb) / <alpha-value>)",
          hover: "var(--theme-primary-hover)",
          fg: "var(--theme-primary-fg)",
          accent: "rgb(var(--theme-accent-rgb) / <alpha-value>)",
        },
        // Dynamic Surface & Background Tokens
        app: {
          bg: "var(--theme-bg)",
          sidebar: "var(--theme-sidebar)",
          card: "var(--theme-card)",
          "card-hover": "var(--theme-card-hover)",
          border: "var(--theme-border)",
          "border-subtle": "var(--theme-border-subtle)",
          text: "var(--theme-text)",
          muted: "var(--theme-text-muted)",
        },
        // Static Financial Tier Anchors
        liquid: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#065F46",
        },
        locked: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#1E40AF",
        },
        growth: {
          DEFAULT: "#8B5CF6",
          light: "#EDE9FE",
          dark: "#5B21B6",
        },
        expense: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#991B1B",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
