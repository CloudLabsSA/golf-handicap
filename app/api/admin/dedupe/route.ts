import { NextResponse } from 'next/server';
import { db, courses, tees } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';

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

function cleanTeeName(name: string): string {
  return name
    .replace(/\s*\(w\)\s*/gi, '')
    .replace(/\s*\(women\)\s*/gi, '')
    .replace(/\s*-\s*ladies\s*/gi, '')
    .trim();
}

export async function POST() {
  try {
    const originalCourseCount = (await db.select().from(courses)).length;
    const dedupeLog: string[] = [];
    let teesDeleted = 0;
    let coursesDeleted = 0;

    // Step 1: Get all data
    const allCourses = await db.select().from(courses);
    const allTees = await db.select().from(tees);

    // Step 2: Normalize course names
    for (const course of allCourses) {
      const normalized = toTitleCase(course.name);
      if (course.name !== normalized) {
        await db
          .update(courses)
          .set({ name: normalized })
          .where(eq(courses.id, course.id));
      }
    }
    dedupeLog.push(`Normalized course names`);

    // Step 3: Normalize tee names and delete duplicates
    const freshTees = await db.select().from(tees);
    const seenTees = new Map<string, string>();

    for (const tee of freshTees) {
      const cleaned = cleanTeeName(tee.teeName);
      const normalized = toTitleCase(cleaned);
      const key = `${tee.courseId}|${normalized}`;

      if (seenTees.has(key)) {
        // Delete this duplicate tee
        await db.delete(tees).where(eq(tees.id, tee.id));
        teesDeleted++;
      } else {
        // Keep this tee, update name if needed
        seenTees.set(key, tee.id);
        if (tee.teeName !== normalized) {
          await db
            .update(tees)
            .set({ teeName: normalized })
            .where(eq(tees.id, tee.id));
        }
      }
    }
    dedupeLog.push(`Deleted ${teesDeleted} duplicate tees`);

    // Step 4: Delete duplicate courses
    const freshCourses = await db.select().from(courses);
    const seenCourses = new Map<string, string>();

    for (const course of freshCourses) {
      if (seenCourses.has(course.name)) {
        // Delete this duplicate course
        await db.delete(courses).where(eq(courses.id, course.id));
        coursesDeleted++;
      } else {
        seenCourses.set(course.name, course.id);
      }
    }
    dedupeLog.push(`Deleted ${coursesDeleted} duplicate courses`);

    const finalCourseCount = (await db.select().from(courses)).length;

    return NextResponse.json({
      success: true,
      originalCount: originalCourseCount,
      finalCount: finalCourseCount,
      duplicatesCleaned: coursesDeleted,
      teesMerged: teesDeleted,
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
