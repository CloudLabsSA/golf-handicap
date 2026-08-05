import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

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

    // Get original counts
    const originalCourseCount = (
      await db.execute(sql`SELECT COUNT(*) as count FROM courses`)
    ).rows[0].count;

    // Step 1: Normalize course names
    const courseUpdates = await db.execute(sql`
      UPDATE courses
      SET name = INITCAP(LOWER(name))
      WHERE name IS NOT NULL
    `);
    dedupeLog.push(`Normalized ${courseUpdates.rowCount} course names`);

    // Step 2: Normalize tee names (clean gender suffixes first, then title case)
    const teeUpdates = await db.execute(sql`
      UPDATE tees
      SET "teeName" = INITCAP(LOWER(
        REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE("teeName", '\(w\)', '', 'gi'),
            '\(women\)', '', 'gi'
          ),
          '- ladies', '', 'gi'
        )
      ))
      WHERE "teeName" IS NOT NULL
    `);
    dedupeLog.push(`Normalized ${teeUpdates.rowCount} tee names`);

    // Step 3: Delete duplicate tees (keep first by ID, delete rest with same name in same course)
    const teeDeleteResult = await db.execute(sql`
      DELETE FROM tees
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
            ROW_NUMBER() OVER (PARTITION BY "courseId", "teeName" ORDER BY id) as rn
          FROM tees
        ) t
        WHERE rn > 1
      )
    `);
    dedupeLog.push(`Deleted ${teeDeleteResult.rowCount} duplicate tees`);

    // Step 4: Delete duplicate courses (keep first by ID, delete rest with same name)
    const courseDeleteResult = await db.execute(sql`
      DELETE FROM courses
      WHERE id IN (
        SELECT id FROM (
          SELECT id,
            ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
          FROM courses
        ) c
        WHERE rn > 1
      )
    `);
    dedupeLog.push(`Deleted ${courseDeleteResult.rowCount} duplicate courses`);

    // Get final counts
    const finalCourseCount = (
      await db.execute(sql`SELECT COUNT(*) as count FROM courses`)
    ).rows[0].count;

    return NextResponse.json({
      success: true,
      originalCount: originalCourseCount,
      finalCount: finalCourseCount,
      duplicatesCleaned: courseDeleteResult.rowCount,
      teesMerged: teeDeleteResult.rowCount,
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
