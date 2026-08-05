'use client';

import { useEffect, useState } from 'react';

export function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
          console.log('Service Worker registered');

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SKIP_WAITING') {
          setUpdateAvailable(true);
        }
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

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    // Reload after a short delay to let service worker update
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 right-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded shadow-lg p-4 max-w-xs z-50">
        <p className="text-sm font-medium mb-3">Update Available</p>
        <p className="text-xs text-slate-200 dark:text-slate-700 mb-4">
          A new version is ready
        </p>
        <button
          onClick={handleUpdate}
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium px-3 py-2 rounded hover:opacity-90 transition"
        >
          Reload Now
        </button>
      </div>
    );
  }

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
