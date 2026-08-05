'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send login link');
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-teal-50 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-teal-900 dark:text-teal-100 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            ⛳ BANDICAP
          </h1>
          <p className="text-teal-700 dark:text-teal-300 font-medium">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-b-4 border-teal-700 shadow-xl p-8">
          {sent ? (
            <div className="space-y-4">
              <div className="bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-700 rounded p-4">
                <p className="font-semibold text-teal-900 dark:text-teal-100 mb-2">
                  ✓ Check your email
                </p>
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  We've sent a sign-in link to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Click the link in your email to sign in. The link expires in 24 hours.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                className="w-full text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 font-medium transition"
              >
                ← Sign in with different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-600 rounded p-4 text-red-800 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-teal-900 dark:text-teal-100 mb-3 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded transition duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Sending link...' : 'Send Sign-In Link'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:text-teal-700 dark:hover:text-teal-300 font-medium transition">
            ← Back to home
          </Link>
        </div>

        {/* Info */}
        {!sent && (
          <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/20 rounded border-l-4 border-teal-700">
            <p className="text-xs text-teal-800 dark:text-teal-200 text-center font-medium">
              🔐 We'll send you a secure link to sign in. No password needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
