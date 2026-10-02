import { UserRole } from '../types/performance';

export type GoalCategory = 'my' | 'team' | 'overall';

export interface GoalPermissions {
  canViewMyGoals: boolean;
  canViewTeamGoals: boolean;
  canViewOverallGoals: boolean;
  canEditMyGoals: boolean;
  canEditTeamGoals: boolean;
  canEditOverallGoals: boolean;
  canReviewTeamGoals: boolean;
  canReviewOverallGoals: boolean;
  cycleAllowsGoalUpdates: boolean;
}

/**
 * Evaluates whether current cycle status permits employee goal progress updates.
 */
export const isCycleGoalUpdateAllowed = (cycleStatus?: string): boolean => {
  if (!cycleStatus) return true; // Default allowed if unspecified
  const normalized = cycleStatus.toLowerCase();
  return normalized === 'active' || normalized === 'published' || normalized === 'in progress';
};

/**
 * Returns structured permission matrix for Goals based on User Role & Cycle Configuration.
 */
export const getGoalPermissions = (
  role: UserRole,
  cycleStatus: string = 'Active'
): GoalPermissions => {
  const cycleAllows = isCycleGoalUpdateAllowed(cycleStatus);

  switch (role) {
    case 'HR/Admin':
      return {
        canViewMyGoals: true,
        canViewTeamGoals: true,
        canViewOverallGoals: true,
        canEditMyGoals: cycleAllows,
        canEditTeamGoals: true,
        canEditOverallGoals: true,
        canReviewTeamGoals: true,
        canReviewOverallGoals: true,
        cycleAllowsGoalUpdates: cycleAllows
      };
    case 'Manager':
      return {
        canViewMyGoals: true,
        canViewTeamGoals: true,
        canViewOverallGoals: true,
        canEditMyGoals: cycleAllows,
        canEditTeamGoals: true,
        canEditOverallGoals: false,
        canReviewTeamGoals: true,
        canReviewOverallGoals: false,
        cycleAllowsGoalUpdates: cycleAllows
      };
    case 'Employee':
    default:
      return {
        canViewMyGoals: true,
        canViewTeamGoals: false,
        canViewOverallGoals: false,
        canEditMyGoals: cycleAllows,
        canEditTeamGoals: false,
        canEditOverallGoals: false,
        canReviewTeamGoals: false,
        canReviewOverallGoals: false,
        cycleAllowsGoalUpdates: cycleAllows
      };
  }
};

/**
 * Checks if user role has access to view a given goals tab ('my' | 'team' | 'overall').
 */
export const canAccessGoalsTab = (tab: GoalCategory, role: UserRole): boolean => {
  const perms = getGoalPermissions(role);
  if (tab === 'my') return perms.canViewMyGoals;
  if (tab === 'team') return perms.canViewTeamGoals;
  if (tab === 'overall') return perms.canViewOverallGoals;
  return false;
};

/**
 * Checks if user role can view a specific goal based on its category/type.
 */
export const canAccessGoalDetail = (
  category: GoalCategory,
  role: UserRole
): boolean => {
  const perms = getGoalPermissions(role);
  if (category === 'my') return perms.canViewMyGoals;
  if (category === 'team') return perms.canViewTeamGoals;
  if (category === 'overall') return perms.canViewOverallGoals;
  return false;
};
