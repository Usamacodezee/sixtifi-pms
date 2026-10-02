import { DynamicQuestion, QuestionType, CompetencyConfig, MOCK_COMPETENCIES } from './selfReviewConfig';

export type { DynamicQuestion, QuestionType, CompetencyConfig };

export const RATING_LABELS = [
  'Needs Significant Improvement',
  'Needs Improvement',
  'Meets Expectations',
  'Exceeds Expectations',
  'Exceptional'
];

export const getRatingLabel = (rating: number): string =>
  rating >= 1 && rating <= RATING_LABELS.length ? RATING_LABELS[rating - 1] : '';

/**
 * Calculates a Specificity Score (0 to 7) for matching a target role (department, designation, jobLevel).
 * Handles wildcards ("All", "", "*", undefined) at any level.
 */
export const calculateRoleMatchScore = (
  specDept?: string,
  specDesig?: string,
  specLevel?: string,
  targetDept?: string,
  targetDesig?: string,
  targetLevel?: string
): { isMatch: boolean; score: number } => {
  const norm = (v?: string) => (v || '').trim().toLowerCase();
  const isWildcard = (v?: string) => !v || v === 'all' || v === '*';

  const tDept = norm(targetDept);
  const tDesig = norm(targetDesig);
  const tLevel = norm(targetLevel);

  const sDept = norm(specDept);
  const sDesig = norm(specDesig);
  const sLevel = norm(specLevel);

  // Department dimension check
  const deptMatch = isWildcard(sDept) || sDept === tDept;
  if (!deptMatch) return { isMatch: false, score: -1 };

  // Designation dimension check
  const desigMatch = isWildcard(sDesig) || sDesig === tDesig;
  if (!desigMatch) return { isMatch: false, score: -1 };

  // Level dimension check
  const levelMatch = isWildcard(sLevel) || sLevel === tLevel;
  if (!levelMatch) return { isMatch: false, score: -1 };

  // Calculate Specificity Score: Exact match gives higher weight per dimension
  let score = 0;
  if (!isWildcard(sDept) && sDept === tDept) score += 4;
  if (!isWildcard(sDesig) && sDesig === tDesig) score += 2;
  if (!isWildcard(sLevel) && sLevel === tLevel) score += 1;

  return { isMatch: true, score };
};

/**
 * Resolves the competency framework for a role using a fully generalized, hierarchical
 * wildcard engine. Seamlessly combines:
 * 1. Global / Company-Wide Competencies ("All" Departments, "All" Designations, "All" Levels)
 * 2. Department-Wide Competencies ("Department X", "All" Designations, "All" Levels)
 * 3. Level-Wide Competencies ("All" Departments, "All" Designations, "Job Level Y")
 * 4. Exact Role-Specific Competencies ("Department X", "Designation Z", "Job Level Y")
 */
export const getRelevantCompetencies = (
  department: string,
  designation: string,
  jobLevel: string,
  allCompetencies: CompetencyConfig[] = MOCK_COMPETENCIES
): CompetencyConfig[] => {
  const matched = allCompetencies
    .map((c) => {
      const match = calculateRoleMatchScore(
        c.department,
        c.designation,
        c.jobLevel,
        department,
        designation,
        jobLevel
      );
      return { competency: c, ...match };
    })
    .filter((res) => res.isMatch);

  // Sort by specificity score (Global base -> Dept general -> Level general -> Role specific)
  matched.sort((a, b) => a.score - b.score);

  // Deduplicate by competency name/ID, retaining the highest specificity version if duplicated
  const map = new Map<string, CompetencyConfig>();
  matched.forEach((res) => {
    map.set(res.competency.name.toLowerCase(), res.competency);
  });

  return Array.from(map.values());
};
