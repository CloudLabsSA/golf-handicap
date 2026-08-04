import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? verifyJWT(token) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="mb-2 text-emerald-100">⛳</div>
          <h1 className="text-6xl font-bold mb-4">Bandicap</h1>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            Track your golf scores and calculate your handicap using official SAGA rules. Simple, accurate, and always with you.
          </p>

          {payload ? (
            <Link
              href="/dashboard"
              className="inline-block bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-lg font-semibold transition shadow-lg"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-3 rounded-lg font-semibold transition shadow-lg"
            >
              Get Started →
            </Link>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:shadow-lg transition">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Track Scores
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Record your rounds in seconds. Supports 9 and 18 hole games.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:shadow-lg transition">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              SAGA Handicaps
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Official South African handicap calculations. Always accurate.
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-8 hover:shadow-lg transition">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Leaderboard
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              See how you stack up against other players.
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      {!payload && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to track your game?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign up now and start building your handicap record.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
