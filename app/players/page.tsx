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
    <div className="min-h-screen bg-amber-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-800 dark:from-teal-900 dark:to-teal-950 border-b-4 border-yellow-600">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Leaderboard
              </h1>
              <p className="text-teal-100 mt-1">
                Browse all golfers and their handicaps
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-yellow-300 hover:text-yellow-100 font-semibold transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading && (
          <div className="text-center text-slate-600 dark:text-slate-400">
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {!loading && players.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border-b-4 border-teal-700 shadow-lg p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
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
                  className="bg-white dark:bg-slate-800 rounded-lg border-b-4 border-teal-700 shadow-md hover:shadow-xl transition p-6"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 text-white flex items-center justify-center font-bold text-lg">
                          {idx + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {player.user.name}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 ml-13">
                        {player.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-amber-50 dark:from-teal-900/30 dark:to-amber-900/10 rounded p-4 mb-4">
                    <p className="text-xs font-bold text-teal-700 dark:text-teal-300 mb-2 uppercase tracking-wider">
                      Handicap Index
                    </p>
                    <p className="text-4xl font-bold text-teal-900 dark:text-teal-100" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {player.handicapIndex.toFixed(1)}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {player.roundCount} round{player.roundCount !== 1 ? 's' : ''} played
                  </p>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
