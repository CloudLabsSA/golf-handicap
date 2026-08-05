import { NextResponse } from 'next/server';
import { db, courses, tees, rounds } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      // Handle hyphenated words
      const parts = word.split('-');
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    })
    .join(' ')
    // Handle special cases
    .replace(/\bGc\b/gi, 'GC')
    .replace(/\bLc\b/gi, 'LC');
}

export async function POST() {
  try {
    // Get all courses
    const allCourses = await db.select().from(courses);

    // Group by normalized name to find duplicates
    const courseMap = new Map<string, typeof allCourses>();
    for (const course of allCourses) {
      const normalized = toTitleCase(course.name);
      if (!courseMap.has(normalized)) {
        courseMap.set(normalized, []);
      }
      courseMap.get(normalized)!.push(course);
    }

    // Find duplicates and merge
    const dedupeLog: string[] = [];
    let merged = 0;
    let normalized = 0;

    for (const [normalizedName, courseGroup] of courseMap.entries()) {
      if (courseGroup.length > 1) {
        // Keep the first course, merge others into it
        const keepCourse = courseGroup[0];
        dedupeLog.push(`Merging ${courseGroup.length} courses into: ${normalizedName}`);

        for (let i = 1; i < courseGroup.length; i++) {
          const deleteCourse = courseGroup[i];

          // Move tees from duplicate course to main course
          await db
            .update(tees)
            .set({ courseId: keepCourse.id })
            .where(eq(tees.courseId, deleteCourse.id));

          // Move rounds from duplicate course to main course
          await db
            .update(rounds)
            .set({ courseId: keepCourse.id })
            .where(eq(rounds.courseId, deleteCourse.id));

          // Delete the duplicate course
          await db.delete(courses).where(eq(courses.id, deleteCourse.id));
          merged++;
        }

        // Update the kept course name to title case
        if (keepCourse.name !== normalizedName) {
          await db
            .update(courses)
            .set({ name: normalizedName })
            .where(eq(courses.id, keepCourse.id));
          normalized++;
        }
      } else if (courseGroup[0].name !== normalizedName) {
        // Normalize course name even if not a duplicate
        await db
          .update(courses)
          .set({ name: normalizedName })
          .where(eq(courses.id, courseGroup[0].id));
        normalized++;
      }
    }

    const finalCount = await db.select().from(courses);

    return NextResponse.json({
      success: true,
      originalCount: allCourses.length,
      finalCount: finalCount.length,
      duplicatesCleaned: merged,
      namesNormalized: normalized,
      log: dedupeLog,
    });
  } catch (error) {
    console.error('Dedupe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Dedupe failed' },
      { status: 500 }
    );
  }
}
