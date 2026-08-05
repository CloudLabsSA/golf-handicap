'use client';

import { useState } from 'react';

interface ImportResponse {
  success: boolean;
  coursesAdded: number;
  teesAdded: number;
  errors?: string[];
}

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  async function handleImport() {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const parsed = JSON.parse(jsonInput);

      const response = await fetch('/api/courses/import-saga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setJsonInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Import SAGA Courses
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Paste SAGA JSON chunk data to import courses and tees
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              JSON Input
            </h2>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='Paste SAGA JSON here (should have "courses" array)...'
              className="w-full h-96 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <button
              onClick={handleImport}
              disabled={loading || !jsonInput.trim()}
              className="mt-4 w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Importing...' : 'Import Courses'}
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Results
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Courses Added
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {result.coursesAdded}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Tees Added
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {result.teesAdded}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    {result.success ? (
                      <p className="text-green-700 dark:text-green-400 font-semibold">
                        ✓ Import successful
                      </p>
                    ) : (
                      <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                        ⚠ Import completed with errors
                      </p>
                    )}
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                      Errors ({result.errors.length}):
                    </p>
                    <ul className="space-y-1">
                      {result.errors.map((err, i) => (
                        <li
                          key={i}
                          className="text-xs text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded"
                        >
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!result && !error && (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400 text-center">
                  Results will appear here after import
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
