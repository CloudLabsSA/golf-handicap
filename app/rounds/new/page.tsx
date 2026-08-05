'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  location: string;
  par: number;
  courseRating: number | null;
  slopeRating: number | null;
}

export default function NewRoundPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [holes, setHoles] = useState<9 | 18>(18);
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/courses/list');
        if (!response.ok) throw new Error('Failed to load courses');
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setCoursesLoading(false);
      }
    }
    loadCourses();
  }, []);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !score) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: selectedCourse!.name,
          coursePar: selectedCourse!.par,
          holes,
          score: parseInt(score),
          date,
          courseRating: selectedCourse!.courseRating,
          slopeRating: selectedCourse!.slopeRating,
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
              Course
            </label>
            {coursesLoading ? (
              <div className="text-slate-500">Loading courses...</div>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.location}) - Par {course.par}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Course Rating & Slope Info */}
          {selectedCourse && (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Course Rating</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedCourse.courseRating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Slope Rating</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedCourse.slopeRating?.toFixed(0) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Holes Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Holes Played
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="holes"
                  value="9"
                  checked={holes === 9}
                  onChange={() => setHoles(9)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">9 Holes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="holes"
                  value="18"
                  checked={holes === 18}
                  onChange={() => setHoles(18)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">18 Holes</span>
              </label>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Score
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g., 78"
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
              disabled={loading || !selectedCourseId || !score}
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
