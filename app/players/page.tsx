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
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Failed to fetch players');
        const data = await response.json();
        setPlayers(data.players || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Leaderboard
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center text-slate-600 dark:text-slate-400">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && players.length === 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded p-12 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400">
              No players yet.
            </p>
          </div>
        )}

        {!loading && players.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players
              .sort((a, b) => a.handicapIndex - b.handicapIndex)
              .map((player, idx) => (
                <Link
                  key={player.user.email}
                  href={`/players/${encodeURIComponent(player.user.email)}`}
                  className="bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {player.user.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {player.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                      Handicap
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {player.handicapIndex.toFixed(1)}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">
                    {player.roundCount} round{player.roundCount !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
