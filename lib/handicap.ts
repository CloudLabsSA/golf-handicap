interface RoundData {
  score: number;
  courseRating: number;
  slopeRating: number;
}

export function calculateHandicapIndex(rounds: RoundData[]): number {
  if (rounds.length === 0) return 0;

  // Take last 20 rounds, or all if less than 20
  const recentRounds = rounds.slice(-20);

  // Calculate score differentials using SAGA methodology
  // Differential = (Score - Course Rating) × 113 / Slope Rating
  const differentials = recentRounds.map((round) => {
    return ((round.score - round.courseRating) * 113) / round.slopeRating;
  });

  // Sort differentials in ascending order (best/lowest first)
  differentials.sort((a, b) => a - b);

  // Determine number of scores to count based on total rounds
  // SAGA uses: 1 from 5, 2 from 6-7, 3 from 8-10, 4 from 11-13, 5 from 14-15,
  //           6 from 16-17, 7 from 18-19, 8 from 20
  let scoresToUse = 1;
  if (recentRounds.length >= 6) scoresToUse = 2;
  if (recentRounds.length >= 8) scoresToUse = 3;
  if (recentRounds.length >= 11) scoresToUse = 4;
  if (recentRounds.length >= 14) scoresToUse = 5;
  if (recentRounds.length >= 16) scoresToUse = 6;
  if (recentRounds.length >= 18) scoresToUse = 7;
  if (recentRounds.length >= 20) scoresToUse = 8;

  // Take the best (lowest) scores
  const bestScores = differentials.slice(0, scoresToUse);

  // Calculate average of best scores
  const average = bestScores.reduce((a, b) => a + b, 0) / scoresToUse;

  // Apply 96% factor and round to nearest 0.1
  const handicapIndex = Math.round(average * 0.96 * 10) / 10;

  return Math.max(0, handicapIndex); // Handicap can't be negative
}

export function calculateCourseHandicap(
  handicapIndex: number,
  courseRating: number,
  par: number,
  slopeRating: number = 113
): number {
  // Course Handicap = Handicap Index * (Slope Rating / 113) + (Course Rating - Par)
  const courseHandicap =
    handicapIndex * (slopeRating / 113) + (courseRating - par);
  return Math.round(courseHandicap);
}

export function calculateNetScore(
  score: number,
  handicapIndex: number,
  courseRating: number,
  par: number,
  slopeRating: number = 113
): number {
  const courseHandicap = calculateCourseHandicap(
    handicapIndex,
    courseRating,
    par,
    slopeRating
  );
  return score - courseHandicap;
}
