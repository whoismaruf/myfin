import type { Metadata, Viewport } from 'next';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'myfin — Personal Finance & Wealth OS',
  description: 'Unified personal wealth, multi-tier liquidity, and cash-flow management system.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#090d16',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-white">
        <SessionProvider>
          <div className="mx-auto min-h-screen max-w-lg bg-slate-900 border-x border-slate-800/60 shadow-2xl relative flex flex-col">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
