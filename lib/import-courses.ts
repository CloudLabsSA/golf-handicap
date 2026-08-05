import { db, courses, tees } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface Tee {
  tee: string;
  gender: string;
  published: boolean;
  effective_date: string;
  front_9: { rating: number; slope: number };
  back_9: { rating: number; slope: number };
  total: { rating: number; slope: number };
  length: number;
  par: number;
}

export interface CourseData {
  course: string;
  tees: Tee[];
}

export interface CourseInFacility {
  course: string | null;
  tees: Tee[];
}

export interface FacilityData {
  facility: string;
  multi_course: boolean;
  courses: CourseInFacility[];
  course_count: number;
}

export interface ImportResult {
  success: boolean;
  coursesAdded: number;
  teesAdded: number;
  errors: string[];
}

function getMensWhiteTee(teesArray: Tee[]): Tee | undefined {
  return (
    teesArray.find((t) => t.gender === 'M' && t.tee === 'White') ||
    teesArray.find((t) => t.gender === 'M' && t.tee === 'Blue') ||
    teesArray.find((t) => t.gender === 'M')
  );
}

export async function importCoursesFromSAGA(
  coursesList: CourseData[]
): Promise<ImportResult> {
  let coursesAdded = 0;
  let teesAdded = 0;
  const errors: string[] = [];

  for (const courseData of coursesList) {
    try {
      const courseName = courseData.course.trim();
      const defaultTee = getMensWhiteTee(courseData.tees);

      if (!defaultTee) {
        errors.push(`${courseName}: No men's tee found`);
        continue;
      }

      const courseId = `course_${uuidv4()}`;

      await db.insert(courses).values({
        id: courseId,
        name: courseName,
        location: '',
        par: defaultTee.par,
        courseRating: defaultTee.total.rating,
        slopeRating: defaultTee.total.slope,
        holes: 18,
      });
      coursesAdded++;

      for (const teeData of courseData.tees) {
        if (!teeData.published) continue;

        await db.insert(tees).values({
          id: `tee_${uuidv4()}`,
          courseId,
          teeName: teeData.tee,
          gender: teeData.gender,
          rating: teeData.total.rating,
          slope: teeData.total.slope,
          front9Rating: teeData.front_9.rating,
          front9Slope: teeData.front_9.slope,
          back9Rating: teeData.back_9.rating,
          back9Slope: teeData.back_9.slope,
          length: teeData.length,
          par: teeData.par,
          published: teeData.published,
          effectiveDate: new Date(teeData.effective_date),
        });
        teesAdded++;
      }
    } catch (e) {
      errors.push(
        `${courseData.course}: ${e instanceof Error ? e.message : 'Unknown error'}`
      );
    }
  }

  return {
    success: errors.length === 0,
    coursesAdded,
    teesAdded,
    errors,
  };
}

export async function importFacilitiesFromSAGA(
  facilitiesList: FacilityData[]
): Promise<ImportResult> {
  let coursesAdded = 0;
  let teesAdded = 0;
  const errors: string[] = [];

  for (const facility of facilitiesList) {
    for (const courseInFacility of facility.courses) {
      try {
        // Build course name: use facility name, optionally add course name if multi-course
        let courseName = facility.facility;
        if (facility.multi_course && courseInFacility.course) {
          courseName = `${facility.facility} - ${courseInFacility.course}`;
        }

        const defaultTee = getMensWhiteTee(courseInFacility.tees);

        if (!defaultTee) {
          errors.push(`${courseName}: No men's tee found`);
          continue;
        }

        const courseId = `course_${uuidv4()}`;

        await db.insert(courses).values({
          id: courseId,
          name: courseName,
          location: '',
          par: defaultTee.par,
          courseRating: defaultTee.total.rating,
          slopeRating: defaultTee.total.slope,
          holes: 18,
        });
        coursesAdded++;

        for (const teeData of courseInFacility.tees) {
          if (!teeData.published) continue;

          await db.insert(tees).values({
            id: `tee_${uuidv4()}`,
            courseId,
            teeName: teeData.tee,
            gender: teeData.gender,
            rating: teeData.total.rating,
            slope: teeData.total.slope,
            front9Rating: teeData.front_9.rating,
            front9Slope: teeData.front_9.slope,
            back9Rating: teeData.back_9.rating,
            back9Slope: teeData.back_9.slope,
            length: teeData.length,
            par: teeData.par,
            published: teeData.published,
            effectiveDate: new Date(teeData.effective_date),
          });
          teesAdded++;
        }
      } catch (e) {
        const courseName = facility.multi_course
          ? `${facility.facility} - ${courseInFacility.course}`
          : facility.facility;
        errors.push(
          `${courseName}: ${e instanceof Error ? e.message : 'Unknown error'}`
        );
      }
    }
  }

  return {
    success: errors.length === 0,
    coursesAdded,
    teesAdded,
    errors,
  };
}
