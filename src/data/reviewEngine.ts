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
 * Resolves the competency framework based on department (including "All" company-wide competencies).
 */
export const getRelevantCompetencies = (
  department: string,
  _designation?: string,
  _jobLevel?: string,
  allCompetencies: CompetencyConfig[] = MOCK_COMPETENCIES
): CompetencyConfig[] => {
  const norm = (v?: string) => (v || '').trim().toLowerCase();
  const targetDept = norm(department);

  const matched = allCompetencies.filter((c) => {
    const d = norm(c.department);
    return !d || d === 'all' || d === targetDept;
  });

  // Deduplicate by competency name/ID
  const map = new Map<string, CompetencyConfig>();
  matched.forEach((c) => {
    map.set(c.name.toLowerCase(), c);
  });

  return Array.from(map.values());
};
