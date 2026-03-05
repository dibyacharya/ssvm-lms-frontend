/**
 * Assessment Calculation Utilities
 *
 * Provides scaling and aggregation functions for continuous assessment marks.
 * Used by both the Gradebook and Assessment Summary components.
 */

/**
 * Scale a raw score to configured marks.
 * Formula: scaledScore = (rawObtained / rawMax) * configuredMarks
 *
 * @param {number} rawObtained - The raw score obtained by the student
 * @param {number} rawMax - The maximum possible raw score (totalPoints of the assignment)
 * @param {number} configuredMarks - The configured marks per assessment (eachMarks from CA plan)
 * @returns {number} The scaled score, rounded to 2 decimal places
 */
export function scaleScore(rawObtained, rawMax, configuredMarks) {
  if (!rawMax || rawMax === 0 || !configuredMarks) return 0;
  if (rawObtained == null) return 0;
  const scaled = (rawObtained / rawMax) * configuredMarks;
  return Math.round(scaled * 100) / 100;
}

/**
 * Aggregate scaled scores using the specified calculation method.
 *
 * Supports 4 methods:
 * - "Sum of all": Sum all scaled scores
 * - "Average of all": Sum / numberOfAssessments
 * - "Sum of the Best 'n'": Sort desc, sum top n
 * - "Average of the Best 'n'": Sort desc, sum top n / n
 *
 * @param {number[]} scaledScores - Array of scaled scores for each assignment
 * @param {string} calculationMethod - One of the 4 calculation methods
 * @param {number} n - The 'n' value for best-of-n methods
 * @param {number} numberOfAssessments - Total number of assessments in the category
 * @returns {number} The aggregated category total, rounded to 2 decimal places
 */
export function calculateCategoryMarks(scaledScores, calculationMethod, n, numberOfAssessments) {
  if (!scaledScores || scaledScores.length === 0) return 0;

  const sorted = [...scaledScores].sort((a, b) => b - a);
  let result = 0;

  switch (calculationMethod) {
    case "Sum of all":
      result = sorted.reduce((sum, s) => sum + s, 0);
      break;
    case "Average of all":
      result = numberOfAssessments > 0
        ? sorted.reduce((sum, s) => sum + s, 0) / numberOfAssessments
        : 0;
      break;
    case "Sum of the Best 'n'":
    case "Average of Best of n": {
      const bestN = n || numberOfAssessments;
      result = sorted.slice(0, bestN).reduce((sum, s) => sum + s, 0);
      break;
    }
    case "Average of the Best 'n'": {
      const bestN = n || numberOfAssessments;
      result = bestN > 0
        ? sorted.slice(0, bestN).reduce((sum, s) => sum + s, 0) / bestN
        : 0;
      break;
    }
    default:
      result = sorted.reduce((sum, s) => sum + s, 0);
  }

  return Math.round(result * 100) / 100;
}
