import { UserRole } from '../types/performance';

export type PerformanceTab = 'my' | 'team' | 'overall';

export interface PerformancePermissions {
  canViewMyPerformance: boolean;
  canViewTeamPerformance: boolean;
  canViewOverallPerformance: boolean;
  canManageTeamReviews: boolean;
  canManageOverallCycles: boolean;
}

/**
 * Evaluates performance module permissions by user role.
 */
export const getPerformancePermissions = (role: UserRole): PerformancePermissions => {
  switch (role) {
    case 'HR/Admin':
      return {
        canViewMyPerformance: true,
        canViewTeamPerformance: true,
        canViewOverallPerformance: true,
        canManageTeamReviews: true,
        canManageOverallCycles: true
      };
    case 'Manager':
      return {
        canViewMyPerformance: true,
        canViewTeamPerformance: true,
        canViewOverallPerformance: true,
        canManageTeamReviews: true,
        canManageOverallCycles: false
      };
    case 'Employee':
    default:
      return {
        canViewMyPerformance: true,
        canViewTeamPerformance: false,
        canViewOverallPerformance: false,
        canManageTeamReviews: false,
        canManageOverallCycles: false
      };
  }
};

/**
 * Checks if user role can access a performance tab ('my' | 'team' | 'overall').
 */
export const canAccessPerformanceTab = (tab: PerformanceTab, role: UserRole): boolean => {
  const perms = getPerformancePermissions(role);
  if (tab === 'my') return perms.canViewMyPerformance;
  if (tab === 'team') return perms.canViewTeamPerformance;
  if (tab === 'overall') return perms.canViewOverallPerformance;
  return false;
};
