'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PlayerProfile {
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

export default function PlayerProfilePage({
  params,
}: {
  params: { email: string };
}) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const email = decodeURIComponent(params.email);
        const response = await fetch(`/api/users/${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Player not found');
        const data = await response.json();
        setPlayer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, [params.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-300">Loading...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link
              href="/players"
              className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              ← Back to Players
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-8 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          <p>{error || 'Player not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/players"
            className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 mb-4 inline-block"
          >
            ← Back to Players
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {player.user.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{player.user.email}</p>
        </div>
      </header>

      {/* Profile */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Handicap Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 mb-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-2">Handicap Index</p>
          <h2 className="text-6xl font-bold text-green-700 mb-4">
            {player.handicapIndex.toFixed(1)}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Based on {player.roundCount} rounds
          </p>
        </div>

        {/* Rounds */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Recent Rounds
            </h3>
          </div>

          {player.rounds.length === 0 ? (
            <div className="p-6 text-center text-slate-600 dark:text-slate-400">
              No rounds recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[...player.rounds]
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
