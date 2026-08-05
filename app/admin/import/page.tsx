'use client';

import { useState } from 'react';

interface ImportResponse {
  success: boolean;
  coursesAdded: number;
  teesAdded: number;
  errors?: string[];
}

interface DedupeResponse {
  success: boolean;
  originalCount: number;
  finalCount: number;
  duplicatesCleaned: number;
  namesNormalized: number;
  teesMerged?: number;
  teesNormalized?: number;
  log: string[];
}

interface ManualTee {
  teeName: string;
  gender: string;
  rating: number;
  slope: number;
  length?: number;
  par?: number;
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'manual' | 'cleanup'>(
    'import'
  );

  // Import tab state
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  // Manual entry tab state
  const [courseName, setCourseName] = useState('');
  const [courseLocation, setCourseLocation] = useState('');
  const [coursePar, setCoursePar] = useState('72');
  const [courseRating, setCourseRating] = useState('');
  const [courseSlope, setCourseSlope] = useState('');
  const [tees, setTees] = useState<ManualTee[]>([]);
  const [newTee, setNewTee] = useState<ManualTee>({
    teeName: '',
    gender: 'M',
    rating: 0,
    slope: 113,
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSuccess, setManualSuccess] = useState('');

  // Dedupe tab state
  const [dedupeResult, setDedupeResult] = useState<DedupeResponse | null>(null);
  const [deduping, setDeduping] = useState(false);

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

  function addTee() {
    if (!newTee.teeName || !newTee.rating || !newTee.slope) {
      setError('Tee name, rating, and slope are required');
      return;
    }
    setTees([...tees, { ...newTee }]);
    setNewTee({
      teeName: '',
      gender: 'M',
      rating: 0,
      slope: 113,
    });
  }

  function removeTee(index: number) {
    setTees(tees.filter((_, i) => i !== index));
  }

  async function handleManualEntry() {
    if (!courseName || !coursePar) {
      setError('Course name and par are required');
      return;
    }

    setManualLoading(true);
    setError('');
    setManualSuccess('');

    try {
      const response = await fetch('/api/courses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: courseName,
          location: courseLocation || undefined,
          par: parseInt(coursePar),
          courseRating: courseRating ? parseFloat(courseRating) : undefined,
          slopeRating: courseSlope ? parseFloat(courseSlope) : undefined,
          tees: tees.length > 0 ? tees : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create course: ${response.statusText}`);
      }

      const data = await response.json();
      setManualSuccess(
        `✓ Created "${courseName}" with ${data.teesAdded || 0} tees`
      );

      // Reset form
      setCourseName('');
      setCourseLocation('');
      setCoursePar('72');
      setCourseRating('');
      setCourseSlope('');
      setTees([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setManualLoading(false);
    }
  }

  async function handleDedupe() {
    setDeduping(true);
    setError('');
    setDedupeResult(null);

    try {
      const response = await fetch('/api/admin/dedupe', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Dedupe failed: ${response.statusText}`);
      }

      const data = await response.json();
      setDedupeResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dedupe failed');
    } finally {
      setDeduping(false);
    }
  }

  const tabClass = (tab: typeof activeTab) =>
    `px-4 py-2 font-semibold rounded-t-lg transition ${
      activeTab === tab
        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Course Management
          </h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('import')}
            className={tabClass('import')}
          >
            Bulk Import
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={tabClass('manual')}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('cleanup')}
            className={tabClass('cleanup')}
          >
            Cleanup
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                JSON Input
              </h2>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='Paste SAGA JSON here (should have "courses" or "facilities" array)...'
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

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Results
              </h2>

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

              {!result && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400 text-center">
                    Results will appear here after import
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Add Course Manually
            </h2>

            {manualSuccess && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                {manualSuccess}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., Pebble Beach"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={courseLocation}
                  onChange={(e) => setCourseLocation(e.target.value)}
                  placeholder="e.g., California"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Par *
                  </label>
                  <input
                    type="text"
                    value={coursePar}
                    onChange={(e) => setCoursePar(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Course Rating
                  </label>
                  <input
                    type="text"
                    value={courseRating}
                    onChange={(e) => setCourseRating(e.target.value)}
                    placeholder="e.g., 73.5"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Slope Rating
                  </label>
                  <input
                    type="text"
                    value={courseSlope}
                    onChange={(e) => setCourseSlope(e.target.value)}
                    placeholder="e.g., 142"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Tees Section */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                Tees (Optional)
              </h3>

              {tees.length > 0 && (
                <div className="mb-4 space-y-2">
                  {tees.map((tee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded"
                    >
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {tee.teeName} ({tee.gender})
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Rating: {tee.rating} | Slope: {tee.slope}
                          {tee.length && ` | ${tee.length}m`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeTee(idx)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tee Name
                    </label>
                    <input
                      type="text"
                      value={newTee.teeName}
                      onChange={(e) =>
                        setNewTee({ ...newTee, teeName: e.target.value })
                      }
                      placeholder="e.g., White"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={newTee.gender}
                      onChange={(e) =>
                        setNewTee({ ...newTee, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="M">Men</option>
                      <option value="W">Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rating
                    </label>
                    <input
                      type="text"
                      value={newTee.rating}
                      onChange={(e) =>
                        setNewTee({
                          ...newTee,
                          rating: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 73.5"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Slope
                    </label>
                    <input
                      type="text"
                      value={newTee.slope}
                      onChange={(e) =>
                        setNewTee({
                          ...newTee,
                          slope: parseFloat(e.target.value) || 113,
                        })
                      }
                      placeholder="e.g., 142"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <button
                  onClick={addTee}
                  className="w-full px-3 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white font-semibold rounded text-sm transition"
                >
                  Add Tee
                </button>
              </div>
            </div>

            <button
              onClick={handleManualEntry}
              disabled={manualLoading || !courseName || !coursePar}
              className="mt-6 w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {manualLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        )}

        {/* Cleanup Tab */}
        {activeTab === 'cleanup' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Cleanup
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Remove duplicate courses and normalize names to title case
            </p>
            <button
              onClick={handleDedupe}
              disabled={deduping}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {deduping ? 'Deduping...' : 'Run Dedupe & Normalize'}
            </button>

            {dedupeResult && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Courses Original
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dedupeResult.originalCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Courses Final
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dedupeResult.finalCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Courses Merged
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dedupeResult.duplicatesCleaned}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Names Normalized
                      </p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {dedupeResult.namesNormalized}
                      </p>
                    </div>
                    {dedupeResult.teesMerged !== undefined && (
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Tees Merged
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {dedupeResult.teesMerged}
                        </p>
                      </div>
                    )}
                    {dedupeResult.teesNormalized !== undefined && (
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Tees Normalized
                        </p>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {dedupeResult.teesNormalized}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    {dedupeResult.success ? (
                      <p className="text-green-700 dark:text-green-400 font-semibold">
                        ✓ Dedupe successful
                      </p>
                    ) : (
                      <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                        ⚠ Dedupe completed
                      </p>
                    )}
                  </div>
                </div>

                {dedupeResult.log && dedupeResult.log.length > 0 && (
                  <div className="max-h-40 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      Log:
                    </p>
                    <ul className="space-y-1">
                      {dedupeResult.log.map((line, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 dark:text-slate-400 p-1"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
