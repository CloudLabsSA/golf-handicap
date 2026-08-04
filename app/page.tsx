import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? verifyJWT(token) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Golf Handicap Tracker
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Track your scores and calculate your handicap using SAGA rules
          </p>

          {payload ? (
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/login"
                className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">📊 Track Scores</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Record all your golf rounds with ease
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">🏌️ Calculate Handicap</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Automatic SAGA-compliant handicap calculation
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">👥 View Players</h3>
            <p className="text-slate-600 dark:text-slate-300">
              See other players' handicaps and rounds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
