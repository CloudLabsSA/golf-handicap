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
        const response = await fetch('/api/me');
        if (!response.ok) {
          router.push('/auth/login');
          return;
        }

        const { email } = await response.json();
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
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 p-4">
        <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-200">
          <p>{error || 'Failed to load user data'}</p>
          <Link href="/auth/login" className="text-red-700 dark:text-red-300 hover:underline">
            Try logging in again
          </Link>
        </div>
      </div>
    );
  }

  const avgScore = user.roundCount > 0
    ? (user.rounds.reduce((sum, r) => sum + r.score, 0) / user.roundCount).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Bandicap
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Welcome back, {user.user.name}
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/rounds/new"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Add Round
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Handicap Index */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Handicap Index
            </p>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white">
              {user.handicapIndex.toFixed(1)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              {user.roundCount} round{user.roundCount !== 1 ? 's' : ''} recorded
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Average Score
            </p>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white">
              {avgScore}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Across all rounds
            </p>
          </div>

          {/* Rounds Played */}
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-6 border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">
              Total Rounds
            </p>
            <h2 className="text-5xl font-bold text-slate-900 dark:text-white">
              {user.roundCount}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Rounds completed
            </p>
          </div>
        </div>

        {/* Recent Rounds */}
        <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent Rounds
            </h3>
          </div>

          {user.rounds.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No rounds recorded yet.
              </p>
              <Link
                href="/rounds/new"
                className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
              >
                Record First Round
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[...user.rounds]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .slice(0, 10)
                .map((round) => {
                  const strokeDiff = round.score - round.coursePar;
                  const isUnder = strokeDiff < 0;

                  return (
                    <div
                      key={round.id}
                      className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {round.courseName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {new Date(round.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                          {round.score}
                        </p>
                        <p className={`text-sm font-medium ${
                          isUnder
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          Par {round.coursePar} {isUnder ? '−' : '+'}{Math.abs(strokeDiff)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
