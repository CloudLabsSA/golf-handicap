import type { Metadata } from 'next';
import './globals.css';
import { PWARegister } from './pwa-register';

export const metadata: Metadata = {
  title: 'Bandicap',
  description: 'Golf handicap tracking using SAGA-based calculations',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bandicap',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1f2937" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
