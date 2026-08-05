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
    const dedupeLog: string[] = [];
    let coursesNormalized = 0;
    let teesNormalized = 0;

    // Step 1: Normalize course names only (no deletion)
    const allCourses = await db.select().from(courses);
    for (const course of allCourses) {
      const normalized = toTitleCase(course.name);
      if (course.name !== normalized) {
        await db
          .update(courses)
          .set({ name: normalized })
          .where(eq(courses.id, course.id));
        coursesNormalized++;
      }
    }
    dedupeLog.push(`Normalized ${coursesNormalized} course names to title case`);

    // Step 2: Normalize tee names only (no deletion)
    const allTees = await db.select().from(tees);
    for (const tee of allTees) {
      const cleaned = cleanTeeName(tee.teeName);
      const normalized = toTitleCase(cleaned);
      if (tee.teeName !== normalized) {
        await db
          .update(tees)
          .set({ teeName: normalized })
          .where(eq(tees.id, tee.id));
        teesNormalized++;
      }
    }
    dedupeLog.push(`Normalized ${teesNormalized} tee names to title case`);

    return NextResponse.json({
      success: true,
      coursesNormalized,
      teesNormalized,
      log: dedupeLog,
    });
  } catch (error) {
    console.error('Normalize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Normalization failed' },
      { status: 500 }
    );
  }
}
