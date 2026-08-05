import type { Metadata } from 'next';
import './globals.css';
import { PWARegister } from './pwa-register';

export const metadata: Metadata = {
  title: 'Golf Handicap Tracker',
  description: 'Track golf scores and calculate handicaps using SAGA rules',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Golf Handicap',
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
        <meta name="theme-color" content="#155e75" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-amber-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
