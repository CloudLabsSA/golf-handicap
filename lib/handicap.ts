interface RoundData {
  score: number;
  coursePar: number;
  courseRating?: number;
  slopeRating?: number;
}

export function calculateHandicapIndex(rounds: RoundData[]): number {
  if (rounds.length === 0) return 0;

  // Take last 20 rounds, or all if less than 20
  const recentRounds = rounds.slice(-20);

  // Calculate score differentials (simplified version without slope initially)
  const differentials = recentRounds.map((round) => {
    if (round.courseRating) {
      // Full calculation with course rating
      // Differential = (Score - Course Rating) * 113 / Slope Rating
      const slopeRating = round.slopeRating || 113;
      return ((round.score - round.courseRating) * 113) / slopeRating;
    } else {
      // Simple version: just use strokes over par
      return round.score - round.coursePar;
    }
  });

  // Sort differentials in ascending order (best scores first)
  differentials.sort((a, b) => a - b);

  // Number of scores to use based on total rounds
  let scoresToUse = 1;
  if (recentRounds.length >= 5) scoresToUse = 1;
  if (recentRounds.length >= 6) scoresToUse = 2;
  if (recentRounds.length >= 7) scoresToUse = 2;
  if (recentRounds.length >= 8) scoresToUse = 3;
  if (recentRounds.length >= 9) scoresToUse = 3;
  if (recentRounds.length >= 10) scoresToUse = 3;
  if (recentRounds.length >= 11) scoresToUse = 4;
  if (recentRounds.length >= 12) scoresToUse = 4;
  if (recentRounds.length >= 13) scoresToUse = 4;
  if (recentRounds.length >= 14) scoresToUse = 5;
  if (recentRounds.length >= 15) scoresToUse = 5;
  if (recentRounds.length >= 16) scoresToUse = 6;
  if (recentRounds.length >= 17) scoresToUse = 6;
  if (recentRounds.length >= 18) scoresToUse = 7;
  if (recentRounds.length >= 19) scoresToUse = 7;
  if (recentRounds.length >= 20) scoresToUse = 8;

  // Take the best scores
  const bestScores = differentials.slice(0, scoresToUse);

  // Calculate average
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
