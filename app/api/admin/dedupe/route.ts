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
    let coursesMerged = 0;
    let coursesNormalized = 0;
    let teesNormalized = 0;
    let teesMerged = 0;

    const originalCourseCount = (await db.select().from(courses)).length;

    // Step 1: Normalize all course names
    const allCourses = await db.select().from(courses);
    for (const course of allCourses) {
      const normalizedName = toTitleCase(course.name);
      if (course.name !== normalizedName) {
        await db
          .update(courses)
          .set({ name: normalizedName })
          .where(eq(courses.id, course.id));
        coursesNormalized++;
      }
    }

    // Step 2: Normalize all tee names
    const allTees = await db.select().from(tees);
    for (const tee of allTees) {
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

    // Step 3: Merge duplicate tees within each course
    const freshTees = await db.select().from(tees);
    const freshCourses = await db.select().from(courses);

    for (const course of freshCourses) {
      const courseTees = freshTees.filter((t) => t.courseId === course.id);
      const teeMap = new Map<string, typeof courseTees>();

      for (const tee of courseTees) {
        if (!teeMap.has(tee.teeName)) {
          teeMap.set(tee.teeName, []);
        }
        teeMap.get(tee.teeName)!.push(tee);
      }

      for (const [teeName, teeGroup] of teeMap.entries()) {
        if (teeGroup.length > 1) {
          const keepTee = teeGroup[0];
          dedupeLog.push(
            `Merged ${teeGroup.length} ${teeName} tees in ${course.name}`
          );

          for (let i = 1; i < teeGroup.length; i++) {
            const deleteTee = teeGroup[i];
            await db
              .update(rounds)
              .set({ teeTeeId: keepTee.id })
              .where(eq(rounds.teeTeeId, deleteTee.id));

            await db.delete(tees).where(eq(tees.id, deleteTee.id));
            teesMerged++;
          }
        }
      }
    }

    // Step 4: Merge duplicate courses
    const finalCourses = await db.select().from(courses);
    const courseMap = new Map<string, typeof finalCourses>();

    for (const course of finalCourses) {
      if (!courseMap.has(course.name)) {
        courseMap.set(course.name, []);
      }
      courseMap.get(course.name)!.push(course);
    }

    for (const [courseName, courseGroup] of courseMap.entries()) {
      if (courseGroup.length > 1) {
        const keepCourse = courseGroup[0];
        dedupeLog.push(`Merged ${courseGroup.length} courses: ${courseName}`);

        for (let i = 1; i < courseGroup.length; i++) {
          const deleteCourse = courseGroup[i];
          await db
            .update(tees)
            .set({ courseId: keepCourse.id })
            .where(eq(tees.courseId, deleteCourse.id));

          await db
            .update(rounds)
            .set({ courseId: keepCourse.id })
            .where(eq(rounds.courseId, deleteCourse.id));

          await db.delete(courses).where(eq(courses.id, deleteCourse.id));
          coursesMerged++;
        }
      }
    }

    const finalCount = (await db.select().from(courses)).length;

    return NextResponse.json({
      success: true,
      originalCount: originalCourseCount,
      finalCount,
      duplicatesCleaned: coursesMerged,
      namesNormalized: coursesNormalized,
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
