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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Players
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Browse all golfers and their handicaps
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center text-slate-600 dark:text-slate-400">
            Loading players...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && players.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No players yet. Be the first!
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
                  className="bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {player.user.name}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {player.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/30 rounded p-4 mb-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Handicap Index
                    </p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                      {player.handicapIndex.toFixed(1)}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
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
