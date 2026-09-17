import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { DEFAULT_THEME_ID } from '@/config/theme.config';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-brand-display',
});

export const metadata: Metadata = {
  title: 'myfin — Personal Finance & Wealth OS',
  description: 'Unified personal wealth, multi-tier liquidity, and cash-flow management system.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#090D1A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable}`} data-theme={DEFAULT_THEME_ID} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('myfin-theme')||'${DEFAULT_THEME_ID}';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-app-bg text-app-text min-h-screen antialiased transition-colors duration-200">
        <SessionProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-app-bg flex flex-col transition-colors duration-200">
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
