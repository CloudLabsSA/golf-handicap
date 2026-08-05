import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import Link from 'next/link';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  const payload = token ? verifyJWT(token) : null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bandicap</h1>
          {payload ? (
            <Link
              href="/dashboard"
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-24">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Golf Handicap Tracking
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
            Track your rounds and maintain your handicap using official SAGA calculations. Accurate, reliable, always available.
          </p>

          {payload ? (
            <Link
              href="/dashboard"
              className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Score Recording
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Quickly record your rounds with course ratings and slope data. Supports 9 and 18 hole scoring.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              SAGA Compliant
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Official South African Golf Association handicap calculations based on your best performances.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Course Database
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Access South African courses with official ratings and slope ratings for accurate scoring.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Offline Support
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Install as an app on your phone. Works offline, syncs when connected.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      {!payload && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Get Started
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Sign in to start tracking your handicap.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
