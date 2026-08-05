'use client';

import { useEffect, useState } from 'react';

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('Service Worker registered');
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already installed
    if ((window.navigator as any).standalone === true) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  if (installed || !installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded shadow-lg p-4 max-w-xs z-50">
      <p className="text-sm font-medium mb-3">Install Bandicap</p>
      <p className="text-xs text-slate-200 dark:text-slate-700 mb-4">
        Add to your home screen for quick access
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium px-3 py-2 rounded hover:opacity-90 transition"
        >
          Install
        </button>
        <button
          onClick={() => setInstallPrompt(null)}
          className="flex-1 text-slate-300 dark:text-slate-600 text-sm font-medium px-3 py-2 hover:text-white dark:hover:text-slate-400 transition"
        >
          Later
        </button>
      </div>
    </div>
  );
}
