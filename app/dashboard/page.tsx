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
      <div className="min-h-screen bg-amber-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-slate-900 p-4">
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
    <div className="min-h-screen bg-amber-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 dark:from-teal-900 dark:to-teal-950 border-b-4 border-yellow-600">
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              ⛳ BANDICAP
            </h1>
            <p className="text-teal-100 mt-1">
              Welcome back, {user.user.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/players"
              className="text-teal-50 hover:text-yellow-300 font-medium transition"
            >
              Leaderboard
            </Link>
            <Link
              href="/rounds/new"
              className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 px-6 py-2 rounded font-semibold transition shadow-lg"
            >
              + Add Round
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/');
              }}
              className="text-teal-100 hover:text-yellow-300 font-medium transition"
            >
              ↪ Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Handicap Index */}
          <div className="bg-white dark:bg-slate-800 border-l-4 border-teal-700 rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <p className="text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-3">
              Handicap Index
            </p>
            <h2 className="text-6xl font-bold text-teal-900 dark:text-teal-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              {user.handicapIndex.toFixed(1)}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
              {user.roundCount} round{user.roundCount !== 1 ? 's' : ''} recorded
            </p>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-slate-800 border-l-4 border-yellow-600 rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <p className="text-yellow-700 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
              Average Score
            </p>
            <h2 className="text-6xl font-bold text-yellow-900 dark:text-yellow-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              {avgScore}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
              Across all rounds
            </p>
          </div>

          {/* Rounds Played */}
          <div className="bg-white dark:bg-slate-800 border-l-4 border-teal-600 rounded-lg p-8 shadow-md hover:shadow-lg transition">
            <p className="text-teal-600 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
              Total Rounds
            </p>
            <h2 className="text-6xl font-bold text-teal-800 dark:text-teal-200" style={{ fontFamily: "'Playfair Display', serif" }}>
              {user.roundCount}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">
              Rounds completed
            </p>
          </div>
        </div>

        {/* Recent Rounds */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-b-4 border-teal-700 shadow-lg overflow-hidden">
          <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-50 to-amber-50 dark:from-slate-700 dark:to-slate-800">
            <h3 className="text-2xl font-bold text-teal-900 dark:text-teal-100" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Rounds
            </h3>
          </div>

          {user.rounds.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                No rounds yet. Time to hit the course!
              </p>
              <Link
                href="/rounds/new"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-slate-900 px-8 py-3 rounded font-semibold transition shadow-lg"
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
