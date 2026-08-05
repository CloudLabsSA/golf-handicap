import { db, courses, tees } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface CreateCourseInput {
  name: string;
  location?: string;
  par: number;
  courseRating?: number;
  slopeRating?: number;
}

export interface CreateTeeInput {
  teeName: string;
  gender?: string; // M or W
  rating: number;
  slope: number;
  front9Rating?: number;
  front9Slope?: number;
  back9Rating?: number;
  back9Slope?: number;
  length?: number;
  par?: number;
  published?: boolean;
  effectiveDate?: Date;
}

export interface CourseWithTees extends CreateCourseInput {
  id: string;
  tees?: CreateTeeInput[];
}

export async function addCourse(
  courseInput: CreateCourseInput,
  teesList?: CreateTeeInput[]
): Promise<{ courseId: string; teesAdded: number }> {
  const courseId = `course_${uuidv4()}`;

  await db.insert(courses).values({
    id: courseId,
    name: courseInput.name.trim(),
    location: courseInput.location || '',
    par: courseInput.par,
    courseRating: courseInput.courseRating,
    slopeRating: courseInput.slopeRating,
    holes: 18,
  });

  let teesAdded = 0;

  if (teesList && teesList.length > 0) {
    for (const teeData of teesList) {
      await db.insert(tees).values({
        id: `tee_${uuidv4()}`,
        courseId,
        teeName: teeData.teeName,
        gender: teeData.gender,
        rating: teeData.rating,
        slope: teeData.slope,
        front9Rating: teeData.front9Rating,
        front9Slope: teeData.front9Slope,
        back9Rating: teeData.back9Rating,
        back9Slope: teeData.back9Slope,
        length: teeData.length,
        par: teeData.par,
        published: teeData.published ?? true,
        effectiveDate: teeData.effectiveDate ?? new Date(),
      });
      teesAdded++;
    }
  }

  return { courseId, teesAdded };
}

export async function addTeeToExistingCourse(
  courseId: string,
  teeData: CreateTeeInput
): Promise<{ teeId: string }> {
  const teeId = `tee_${uuidv4()}`;

  await db.insert(tees).values({
    id: teeId,
    courseId,
    teeName: teeData.teeName,
    gender: teeData.gender,
    rating: teeData.rating,
    slope: teeData.slope,
    front9Rating: teeData.front9Rating,
    front9Slope: teeData.front9Slope,
    back9Rating: teeData.back9Rating,
    back9Slope: teeData.back9Slope,
    length: teeData.length,
    par: teeData.par,
    published: teeData.published ?? true,
    effectiveDate: teeData.effectiveDate ?? new Date(),
  });

  return { teeId };
}
