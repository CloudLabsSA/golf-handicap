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

interface Tee {
  id: string;
  courseId: string;
  teeName: string;
  gender: string;
  rating: number | null;
  slope: number | null;
  front9Rating: number | null;
  front9Slope: number | null;
  back9Rating: number | null;
  back9Slope: number | null;
  length: number | null;
  par: number | null;
}

export default function NewRoundPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tees, setTees] = useState<Tee[]>([]);
  const [selectedTeeId, setSelectedTeeId] = useState('');
  const [holes, setHoles] = useState<9 | 18>(18);
  const [nineHolesType, setNineHolesType] = useState<'front' | 'back'>('front');
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
  const selectedTee = tees.find((t) => t.id === selectedTeeId);

  const getCurrentRating = () => {
    if (!selectedTee) return null;
    if (holes === 9) {
      if (nineHolesType === 'back') {
        return selectedTee.back9Rating ?? selectedTee.rating;
      }
      return selectedTee.front9Rating ?? selectedTee.rating;
    }
    return selectedTee.rating;
  };

  const getCurrentSlope = () => {
    if (!selectedTee) return null;
    if (holes === 9) {
      if (nineHolesType === 'back') {
        return selectedTee.back9Slope ?? selectedTee.slope;
      }
      return selectedTee.front9Slope ?? selectedTee.slope;
    }
    return selectedTee.slope;
  };

  const getTeeLabel = (tee: Tee): string => {
    if (tee.gender === 'W') {
      return `${tee.teeName.replace(/\s*\(w\)\s*|\s*\(Women\)\s*/gi, '')} - Ladies`;
    }
    return tee.teeName;
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setSearchInput(course.name);
    setShowSuggestions(false);
    setSelectedTeeId(''); // Reset tee selection
    loadTeesForCourse(course.id);
  };

  const loadTeesForCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/tees`);
      if (!response.ok) throw new Error('Failed to load tees');
      const teesData = await response.json();
      setTees(teesData);
      // Auto-select men's white tee if available
      const mensWhite = teesData.find(
        (t: Tee) => t.gender === 'M' && t.teeName === 'White'
      );
      if (mensWhite) {
        setSelectedTeeId(mensWhite.id);
      } else if (teesData.length > 0) {
        setSelectedTeeId(teesData[0].id);
      }
    } catch (err) {
      console.error('Error loading tees:', err);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (value.length > 0) {
      const filtered = courses.filter((c) =>
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCourses(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCourses([]);
      setShowSuggestions(false);
    }
  };


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId || !selectedTeeId || !score) return;

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
          courseRating: getCurrentRating(),
          slopeRating: getCurrentSlope(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save round');
      }

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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Course
              </label>
              {coursesLoading ? (
                <div className="text-slate-500">Loading courses...</div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchInput && setShowSuggestions(true)}
                    placeholder="Search or type course name..."
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {showSuggestions && filteredCourses.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredCourses.map((course) => (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleSelectCourse(course)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 border-b border-slate-200 dark:border-slate-600 last:border-b-0 text-slate-900 dark:text-white"
                        >
                          <div className="font-medium">{course.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Par {course.par}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tee Selection */}
            {selectedCourse && tees.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tee
                </label>
                <select
                  value={selectedTeeId}
                  onChange={(e) => setSelectedTeeId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a tee...</option>
                  {tees.map((tee) => (
                    <option key={tee.id} value={tee.id}>
                      {getTeeLabel(tee)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Course Rating & Slope Info */}
          {selectedCourse && selectedTee && (
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Course Rating
                    {holes === 9 && ` (${nineHolesType === 'front' ? 'Front' : 'Back'} 9)`}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getCurrentRating()?.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1">
                    Slope Rating
                    {holes === 9 && ` (${nineHolesType === 'front' ? 'Front' : 'Back'} 9)`}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {getCurrentSlope()?.toFixed(0) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Holes Selection */}
          <div className="space-y-3">
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

            {/* Front/Back 9 Selection */}
            {holes === 9 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Which 9?
                </label>
                <select
                  value={nineHolesType}
                  onChange={(e) => setNineHolesType(e.target.value as 'front' | 'back')}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="front">Front 9</option>
                  <option value="back">Back 9</option>
                </select>
              </div>
            )}
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
              disabled={loading || !selectedCourseId || !selectedTeeId || !score}
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
