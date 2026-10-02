export type UserRole = 'Employee' | 'Manager' | 'HR/Admin';

export type PerformanceRoute =
  | '/performance'
  | '/performance/goals'
  | '/performance/my-performance'
  | '/performance/my-team'
  | '/performance/cycles'
  | '/performance/reviews'
  | '/performance/reports'
  | '/performance/settings';

export interface PerformanceSubmenuItem {
  id: string;
  route: PerformanceRoute;
  label: string;
  pageTitle: string;
  subtitle: string;
  allowedRoles: UserRole[];
}

export interface SidebarModule {
  id: string;
  label: string;
  icon: string;
  route?: string;
  isExpanded?: boolean;
  subItems?: PerformanceSubmenuItem[];
}

export type CycleStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';
export type CycleType = 'Annual' | 'Half-Yearly' | 'Quarterly' | 'Custom';

export type ReviewFlowOption = 'self_manager_admin' | 'manager_admin' | 'manager_only';

export interface PerformanceCycle {
  id: string;
  name: string;
  type: CycleType;
  startDate: string;
  endDate: string;
  duration: string;
  employeesCount: number;
  reviewProgress: number;
  status: CycleStatus;
  description?: string;
  /** Review workflow for this cycle. */
  reviewFlow?: ReviewFlowOption;
  goalsWeightage?: number;
  competenciesWeightage?: number;
  minGoalsPerEmployee?: number;
  maxGoalsPerEmployee?: number;
  requireGoalApproval?: boolean;
  /** Employees can log progress against goals during this cycle. */
  allowEmployeeGoalUpdates?: boolean;
  sendProgressReminders?: boolean;
  /** Employees can see their finalized rating for this cycle. */
  showFinalRatingToEmployee?: boolean;
  showFinalScoreToEmployee?: boolean;
  showManagerCommentsToEmployee?: boolean;
  showCompetencyScoresToEmployee?: boolean;
  selfReviewDeadlineDays?: number;
  selfReviewDeadline?: string;
  managerReviewDeadline?: string;
  finalReviewDeadline?: string;
  ratingMapping?: { id: string; minScore: number; maxScore: number; label: string; description: string }[];
}

export type EmployeeSelectionMode = 'all' | 'department' | 'designation' | 'specific';

export interface CreateCycleFormData {
  name: string;
  type: CycleType;
  startDate: string;
  endDate: string;
  description: string;
  selectionMode: EmployeeSelectionMode;
  selectedDepartments: string[];
  selectedDesignations: string[];
  selectedEmployeeIds: string[];
  goalsWeightage: number;
  competenciesWeightage: number;
  minGoalsPerEmployee: number;
  maxGoalsPerEmployee: number;
  reviewFlow: ReviewFlowOption;
  requireGoalApproval: boolean;
  allowEmployeeGoalUpdates: boolean;
  sendProgressReminders: boolean;
  showFinalRatingToEmployee: boolean;
  showFinalScoreToEmployee: boolean;
  showManagerCommentsToEmployee: boolean;
  showCompetencyScoresToEmployee: boolean;
  selfReviewDeadlineDays?: number;
  selfReviewDeadline: string;
  managerReviewDeadline: string;
  finalReviewDeadline: string;
  ratingMapping?: { id: string; minScore: number; maxScore: number; label: string; description: string }[];
}

export interface MockEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  designation: string;
  initials: string;
  avatarBg?: string;
}

export type ReviewStageStatus = 'Completed' | 'Pending' | 'Not Started' | 'Overdue';
export type CycleParticipationStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Overdue';

export interface CycleEmployeeParticipation {
  id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  manager: string;
  initials: string;
  avatarBg?: string;
  goalsUpdated: number;
  goalsTotal: number;
  selfReviewStatus: ReviewStageStatus;
  managerReviewStatus: ReviewStageStatus;
  managerReviewNote?: string;
  finalReviewStatus: ReviewStageStatus;
  overallStatus: CycleParticipationStatus;
  rating?: string;
}

export type GoalStatus = 'On Track' | 'At Risk' | 'Needs Attention' | 'Completed';

export interface GoalProgressHistoryItem {
  date: string;
  previousPercent: number;
  newPercent: number;
  comment?: string;
  updatedBy: string;
}

export interface CycleGoalItem {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  manager: string;
  initials: string;
  avatarBg?: string;
  target: string;
  currentAchievement: string;
  progress: number;
  weight: number;
  startDate: string;
  dueDate: string;
  status: GoalStatus;
  managerComment?: string;
  history?: GoalProgressHistoryItem[];
}

export type ReviewCurrentStage = 'Self Review' | 'Manager Review' | 'Final Review' | 'Completed';

export interface CycleReviewItem {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  manager: string;
  initials: string;
  avatarBg?: string;
  selfReviewStatus: ReviewStageStatus;
  selfReviewDate?: string;
  selfReviewComment?: string;
  managerReviewStatus: ReviewStageStatus;
  managerReviewDate?: string;
  managerReviewComment?: string;
  managerReviewNote?: string;
  finalReviewStatus: ReviewStageStatus;
  finalReviewDate?: string;
  finalReviewComment?: string;
  currentStage: ReviewCurrentStage;
  overallStatus: CycleParticipationStatus;
  goalsScore?: string;
  competencyScore?: string;
  overallRating?: string;
  ratingLabel?: string;
}

export type TeamMemberOverallStatus = 'In Progress' | 'At Risk' | 'Completed' | 'Overdue';

export interface TeamMemberGoal {
  id: string;
  title: string;
  target: string;
  weight: number;
  progress: number;
  status: GoalStatus;
}

export interface TeamMember {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  jobLevel: string;
  initials: string;
  avatarBg?: string;
  goalProgress: number;
  selfReviewStatus: ReviewStageStatus;
  managerReviewStatus: ReviewStageStatus;
  overallStatus: TeamMemberOverallStatus;
  goals: TeamMemberGoal[];
}
