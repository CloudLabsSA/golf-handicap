'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

interface UserData {
  handicapIndex: number;
}

export default function CourseHandicapPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tees, setTees] = useState<Tee[]>([]);
  const [selectedTeeId, setSelectedTeeId] = useState('');
  const [holes, setHoles] = useState<9 | 18>(18);
  const [nineHolesType, setNineHolesType] = useState<'front' | 'back'>('front');
  const [user, setUser] = useState<UserData | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const coursesResponse = await fetch('/api/courses/list');
        if (!coursesResponse.ok) throw new Error('Failed to load courses');
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        const userResponse = await fetch('/api/me');
        if (userResponse.ok) {
          const { email } = await userResponse.json();
          const userDataResponse = await fetch(`/api/users/${encodeURIComponent(email)}`);
          if (userDataResponse.ok) {
            const userData = await userDataResponse.json();
            setUser(userData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setCoursesLoading(false);
      }
    }
    loadData();
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

  const calculateCourseHandicap = (): number | null => {
    if (!user || !selectedCourse || !selectedTee) return null;

    const rating = getCurrentRating();
    const slope = getCurrentSlope();

    if (!rating || !slope || !selectedCourse.par) return null;

    const courseHandicap = (user.handicapIndex * (slope / 113)) + (rating - selectedCourse.par);
    return Math.round(courseHandicap);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setSearchInput(course.name);
    setShowSuggestions(false);
    setSelectedTeeId('');
    loadTeesForCourse(course.id);
  };

  const loadTeesForCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/tees`);
      if (!response.ok) throw new Error('Failed to load tees');
      const teesData = await response.json();
      setTees(teesData);
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Course Handicap Calculator
            </h1>
            <Link
              href="/dashboard"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-slate-50 dark:bg-slate-900 rounded p-6 space-y-6 mb-8">
          {/* Course Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  placeholder="Search course..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {showSuggestions && filteredCourses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded shadow-lg z-10 max-h-64 overflow-y-auto">
                    {filteredCourses.slice(0, 10).map((course) => (
                      <button
                        key={course.id}
                        onClick={() => handleSelectCourse(course)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {course.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Par {course.par}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tee Selection */}
          {selectedCourse && tees.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tee
              </label>
              <select
                value={selectedTeeId}
                onChange={(e) => setSelectedTeeId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">Select a tee</option>
                {tees.map((tee) => (
                  <option key={tee.id} value={tee.id}>
                    {getTeeLabel(tee)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Holes Selection */}
          {selectedCourse && selectedTee && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Holes
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="9"
                    checked={holes === 9}
                    onChange={() => setHoles(9)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">9 Holes</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="18"
                    checked={holes === 18}
                    onChange={() => setHoles(18)}
                    className="w-4 h-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300">18 Holes</span>
                </label>
              </div>
            </div>
          )}

          {/* Front/Back 9 Selection */}
          {selectedCourse && selectedTee && holes === 9 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Which 9?
              </label>
              <select
                value={nineHolesType}
                onChange={(e) => setNineHolesType(e.target.value as 'front' | 'back')}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="front">Front 9</option>
                <option value="back">Back 9</option>
              </select>
            </div>
          )}
        </div>

        {/* Course Handicap Result */}
        {selectedCourse && selectedTee && user && (
          <div className="bg-slate-900 dark:bg-white rounded p-8 text-center">
            <p className="text-sm font-semibold text-slate-300 dark:text-slate-600 uppercase tracking-wide mb-4">
              Course Handicap
            </p>
            <p className="text-6xl font-bold text-white dark:text-slate-900 mb-6">
              {calculateCourseHandicap() ?? 'N/A'}
            </p>
            <div className="space-y-2 text-sm text-slate-400 dark:text-slate-600">
              <p>Handicap Index: {user.handicapIndex.toFixed(1)}</p>
              <p>Slope Rating: {getCurrentSlope()?.toFixed(0) || 'N/A'}</p>
              <p>Course Rating: {getCurrentRating()?.toFixed(1) || 'N/A'}</p>
              <p>Par: {selectedCourse.par}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 pt-4">
                Formula: (HI × Slope / 113) + (Rating - Par)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
