/**
 * Keep progress % and current achievement in sync.
 * Prefer scaling from the existing Current value (same units),
 * then fall back to Target when needed.
 */

export const extractLeadingNumber = (value: string): number | null => {
  if (!value) return null;
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
};

/** Replace the first number in a template string, preserving units/currency text. */
export const replaceLeadingNumber = (template: string, nextValue: number): string => {
  const rounded = Number.isInteger(nextValue)
    ? String(nextValue)
    : String(Math.round(nextValue * 10) / 10);
  if (!template || extractLeadingNumber(template) === null) {
    return rounded;
  }
  return template.replace(/-?\d+(\.\d+)?/, rounded);
};

export const clampProgress = (value: number): number =>
  Math.min(100, Math.max(0, Math.round(value)));

/**
 * Derive current achievement from progress %.
 * Scales the previous Current by progress ratio when possible (keeps Lakh/Crore/% units).
 */
export const achievementFromProgress = (
  progress: number,
  target: string,
  previousAchievement?: string,
  previousProgress?: number
): string => {
  const next = clampProgress(progress);
  const prevNum = previousAchievement ? extractLeadingNumber(previousAchievement) : null;
  const prevProg = previousProgress ?? null;

  if (prevNum !== null && previousAchievement && prevProg !== null && prevProg > 0) {
    const scaled = (prevNum * next) / prevProg;
    return replaceLeadingNumber(previousAchievement, scaled);
  }

  const targetNum = extractLeadingNumber(target);
  if (targetNum === null || targetNum === 0) {
    return `${next}% Complete`;
  }
  const achieved = (targetNum * next) / 100;
  const template =
    previousAchievement && extractLeadingNumber(previousAchievement) !== null
      ? previousAchievement
      : target;
  return replaceLeadingNumber(template, achieved);
};

/**
 * Derive progress % from a numeric Current value.
 * Scales from previous Current↔Progress pair when available.
 */
export const progressFromAchievement = (
  currentAchievement: string,
  target: string,
  previousAchievement?: string,
  previousProgress?: number
): number | null => {
  const currentNum = extractLeadingNumber(currentAchievement);
  if (currentNum === null) return null;

  const prevNum = previousAchievement ? extractLeadingNumber(previousAchievement) : null;
  if (prevNum !== null && prevNum !== 0 && previousProgress != null) {
    return clampProgress((currentNum / prevNum) * previousProgress);
  }

  const targetNum = extractLeadingNumber(target);
  if (targetNum === null || targetNum === 0) return null;
  return clampProgress((currentNum / targetNum) * 100);
};
