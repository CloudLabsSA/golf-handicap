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

  const avgScore = user.roundCount > 0
    ? (user.rounds.reduce((sum, r) => sum + r.score, 0) / user.roundCount).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              ⛳ Bandicap
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back, {user.user.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/players"
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition"
            >
              Leaderboard
            </Link>
            <Link
              href="/rounds/new"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
            >
              + Add Round
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ↪ Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Handicap Index */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-2">
              Handicap Index
            </p>
            <h2 className="text-5xl font-bold text-emerald-700 dark:text-emerald-300">
              {user.handicapIndex.toFixed(1)}
            </h2>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">
              {user.roundCount} round{user.roundCount !== 1 ? 's' : ''} played
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
              Average Score
            </p>
            <h2 className="text-5xl font-bold text-blue-700 dark:text-blue-300">
              {avgScore}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
              Across all rounds
            </p>
          </div>

          {/* Rounds Played */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-2">
              Total Rounds
            </p>
            <h2 className="text-5xl font-bold text-purple-700 dark:text-purple-300">
              {user.roundCount}
            </h2>
            <p className="text-purple-600 dark:text-purple-400 text-sm mt-2">
              Games recorded
            </p>
          </div>
        </div>

        {/* Recent Rounds */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              📊 Recent Rounds
            </h3>
          </div>

          {user.rounds.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No rounds yet. Time to hit the course!
              </p>
              <Link
                href="/rounds/new"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Record Your First Round
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
