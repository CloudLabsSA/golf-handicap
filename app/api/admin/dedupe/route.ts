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

function getBaseTeeeName(teeName: string): string {
  // Remove gender suffixes: (w), (W), (Women), (women), - Ladies, etc
  return teeName
    .replace(/\s*\(w\)\s*/gi, '')
    .replace(/\s*\(women\)\s*/gi, '')
    .replace(/\s*-\s*ladies\s*/gi, '')
    .trim();
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

    // Now handle tee deduplication within courses
    let teesMerged = 0;
    let teesNormalized = 0;

    const allCourses2 = await db.select().from(courses);
    const allTees = await db.select().from(tees);

    for (const course of allCourses2) {
      const courseTees = allTees.filter((t) => t.courseId === course.id);

      // Group tees by base name and gender to find duplicates
      const teeMap = new Map<
        string,
        typeof courseTees
      >();

      for (const tee of courseTees) {
        const baseName = getBaseTeeeName(tee.teeName);
        const key = `${baseName}|${tee.gender || 'M'}`;

        if (!teeMap.has(key)) {
          teeMap.set(key, []);
        }
        teeMap.get(key)!.push(tee);
      }

      // Merge duplicate tees within this course
      for (const [key, teeGroup] of teeMap.entries()) {
        if (teeGroup.length > 1) {
          const keepTee = teeGroup[0];
          const baseName = getBaseTeeeName(keepTee.teeName);
          const cleanTeeName = toTitleCase(baseName);

          dedupeLog.push(
            `Merging ${teeGroup.length} tees in ${course.name}: ${cleanTeeName}`
          );

          for (let i = 1; i < teeGroup.length; i++) {
            const deleteTee = teeGroup[i];

            // Update rounds that reference this tee
            await db
              .update(rounds)
              .set({ teeTeeId: keepTee.id })
              .where(eq(rounds.teeTeeId, deleteTee.id));

            // Delete the duplicate tee
            await db.delete(tees).where(eq(tees.id, deleteTee.id));
            teesMerged++;
          }

          // Update the kept tee name to clean version
          if (keepTee.teeName !== cleanTeeName) {
            await db
              .update(tees)
              .set({ teeName: cleanTeeName })
              .where(eq(tees.id, keepTee.id));
            teesNormalized++;
          }
        } else if (teeGroup[0].teeName !== toTitleCase(getBaseTeeeName(teeGroup[0].teeName))) {
          // Normalize tee name even if not a duplicate
          const cleanName = toTitleCase(getBaseTeeeName(teeGroup[0].teeName));
          await db
            .update(tees)
            .set({ teeName: cleanName })
            .where(eq(tees.id, teeGroup[0].id));
          teesNormalized++;
        }
      }
    }

    const finalCount = await db.select().from(courses);

    return NextResponse.json({
      success: true,
      originalCount: allCourses.length,
      finalCount: finalCount.length,
      duplicatesCleaned: merged,
      namesNormalized: normalized,
      teesMerged,
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
