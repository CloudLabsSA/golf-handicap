import { NextResponse } from 'next/server';
import { db, courses, tees, rounds } from '@/lib/db';
import { eq } from 'drizzle-orm';

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      const parts = word.split('-');
      return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    })
    .join(' ')
    .replace(/\bGc\b/gi, 'GC')
    .replace(/\bLc\b/gi, 'LC');
}

export async function POST() {
  try {
    const dedupeLog: string[] = [];
    let merged = 0;
    let normalized = 0;
    let teesNormalized = 0;

    // Step 1: Normalize all course names to title case
    const allCourses = await db.select().from(courses);
    for (const course of allCourses) {
      const normalizedName = toTitleCase(course.name);
      if (course.name !== normalizedName) {
        await db
          .update(courses)
          .set({ name: normalizedName })
          .where(eq(courses.id, course.id));
        normalized++;
      }
    }

    // Step 2: Normalize all tee names to title case
    const allTees = await db.select().from(tees);
    for (const tee of allTees) {
      // Clean the tee name: remove gender suffixes and title case
      const cleanName = tee.teeName
        .replace(/\s*\(w\)\s*/gi, '')
        .replace(/\s*\(women\)\s*/gi, '')
        .replace(/\s*-\s*ladies\s*/gi, '')
        .trim();

      const normalizedName = toTitleCase(cleanName);
      if (tee.teeName !== normalizedName) {
        await db
          .update(tees)
          .set({ teeName: normalizedName })
          .where(eq(tees.id, tee.id));
        teesNormalized++;
      }
    }

    // Step 3: Find and merge duplicate courses (by normalized name)
    const updatedCourses = await db.select().from(courses);
    const courseMap = new Map<string, string[]>();

    for (const course of updatedCourses) {
      if (!courseMap.has(course.name)) {
        courseMap.set(course.name, []);
      }
      courseMap.get(course.name)!.push(course.id);
    }

    for (const [courseName, courseIds] of courseMap.entries()) {
      if (courseIds.length > 1) {
        const keepId = courseIds[0];
        dedupeLog.push(`Merging ${courseIds.length} duplicate courses: ${courseName}`);

        for (let i = 1; i < courseIds.length; i++) {
          const deleteId = courseIds[i];

          // Move tees
          await db
            .update(tees)
            .set({ courseId: keepId })
            .where(eq(tees.courseId, deleteId));

          // Move rounds
          await db
            .update(rounds)
            .set({ courseId: keepId })
            .where(eq(rounds.courseId, deleteId));

          // Delete course
          await db.delete(courses).where(eq(courses.id, deleteId));
          merged++;
        }
      }
    }

    const finalCourses = await db.select().from(courses);

    return NextResponse.json({
      success: true,
      originalCount: allCourses.length,
      finalCount: finalCourses.length,
      duplicatesCleaned: merged,
      namesNormalized: normalized,
      teesNormalized,
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
