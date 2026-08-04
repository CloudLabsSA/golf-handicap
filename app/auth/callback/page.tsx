'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (!token) {
      router.push('/auth/login?error=missing_token');
      return;
    }

    // Call the API callback route
    fetch(`/api/auth/callback?token=${token}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Callback failed');
        }
        // API will set the cookie and redirect
        // We just need to wait a moment for it to process
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      })
      .catch((err) => {
        router.push(`/auth/login?error=callback_failed`);
      });
  }, [token, error, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Signing you in...</p>
      </div>
    </div>
  );
}
