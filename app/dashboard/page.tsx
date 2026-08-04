'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
  user: {
    email: string;
    name: string;
  };
  handicapIndex: number;
  roundCount: number;
  rounds: Array<{
    id: string;
    score: number;
    date: string;
    courseName: string;
    coursePar: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        // First get current user email from session
        const response = await fetch('/api/me');
        if (!response.ok) {
          router.push('/auth/login');
          return;
        }

        const { email } = await response.json();

        // Then fetch full user data
        const userData = await fetch(`/api/users/${encodeURIComponent(email)}`);
        if (!userData.ok) throw new Error('Failed to fetch user');

        const data = await userData.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          <p>{error || 'Failed to load user data'}</p>
          <Link href="/auth/login" className="text-red-700 dark:text-red-300 hover:underline">
            Try logging in again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome, {user.user.name}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/players"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition"
            >
              Players
            </Link>
            <Link
              href="/rounds/new"
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Add Round
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Handicap Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
          <div className="text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-2">Your Handicap Index</p>
            <h2 className="text-6xl font-bold text-green-700">
              {user.handicapIndex.toFixed(1)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Based on {user.roundCount} rounds
            </p>
          </div>
        </div>

        {/* Rounds */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Rounds
            </h3>
          </div>

          {user.rounds.length === 0 ? (
            <div className="p-6 text-center text-slate-600 dark:text-slate-400">
              <p>No rounds yet.</p>
              <Link
                href="/rounds/new"
                className="text-green-700 dark:text-green-400 hover:underline mt-2 inline-block"
              >
                Add your first round
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[...user.rounds]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((round) => (
                  <div
                    key={round.id}
                    className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {round.courseName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(round.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">
                        {round.score}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Par {round.coursePar} ({round.score - round.coursePar > 0 ? '+' : ''}
                        {round.score - round.coursePar})
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
