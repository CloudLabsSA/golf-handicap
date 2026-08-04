'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  location?: string;
  par: number;
  courseRating?: number;
  holes?: number;
}

export default function NewRoundPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedHoles, setSelectedHoles] = useState<9 | 18>(18);
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCourseList, setShowCourseList] = useState(false);

  useEffect(() => {
    // Load all courses on mount
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const response = await fetch(`/api/courses/search?q=a`);
      if (!response.ok) throw new Error('Failed to load courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Load error:', err);
    }
  }

  function filterCourses(query: string) {
    if (!query) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.location?.toLowerCase().includes(query.toLowerCase())
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse || !score) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          score: parseInt(score),
          date,
          holes: selectedHoles,
        }),
      });

      if (!response.ok) throw new Error('Failed to save round');

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = filterCourses(search);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Add New Round
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Course
            </label>

            {!selectedCourse ? (
              <div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowCourseList(true)}
                  placeholder="Search for a course..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {showCourseList && (
                  <div className="mt-2 max-h-96 overflow-y-auto bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowCourseList(false);
                            setSearch('');
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                        >
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {course.name}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Par {course.par} • {course.location}
                            {course.courseRating && ` • Rating ${course.courseRating}`}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        No courses found
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {selectedCourse.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {selectedCourse.location}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Par {selectedCourse.par}
                      {selectedCourse.courseRating && ` • Rating ${selectedCourse.courseRating}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourse(null);
                      setSearch('');
                    }}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Holes Selection */}
          {selectedCourse && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Holes Played
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="9"
                    checked={selectedHoles === 9}
                    onChange={() => setSelectedHoles(9)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">9 Holes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="18"
                    checked={selectedHoles === 18}
                    onChange={() => setSelectedHoles(18)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">18 Holes</span>
                </label>
              </div>
            </div>
          )}

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Score
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Your total score"
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Date Played
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !selectedCourse || !score}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Saving...' : 'Save Round'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
