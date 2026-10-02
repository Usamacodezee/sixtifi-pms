export const REPORT_SUMMARY = {
  employees: 248,
  goals: 1124,
  reviewsCompletedPercent: 68,
  avgPerformanceScore: 3.9
};

export const REVIEW_COMPLETION = [
  { stage: 'Self Review', percent: 82 },
  { stage: 'Manager Review', percent: 68 },
  { stage: 'Final Review', percent: 42 }
];

// Goal health (On Track / At Risk / Needs Attention) is one distribution that
// sums to 100%; "Completed" is a separate, overlapping stat (goals that have
// already reached 100% progress) shown alongside it — not a fourth slice of
// the same pie.
export const GOAL_PERFORMANCE = {
  onTrack: 70,
  atRisk: 19,
  needsAttention: 11,
  completed: 38
};

export interface RatingDistributionItem {
  label: string;
  percent: number;
  color: string;
}

export const RATING_DISTRIBUTION: RatingDistributionItem[] = [
  { label: 'Needs Significant Improvement', percent: 8, color: '#EF4444' },
  { label: 'Needs Improvement', percent: 15, color: '#F59E0B' },
  { label: 'Meets Expectations', percent: 42, color: '#0284C7' },
  { label: 'Exceeds Expectations', percent: 28, color: '#10B981' },
  { label: 'Exceptional', percent: 7, color: '#7C3AED' }
];

export interface DepartmentPerformanceRow {
  department: string;
  employees: number;
  goalProgress: number;
  reviewCompletion: number;
  avgScore: number;
}

export const DEPARTMENT_PERFORMANCE: DepartmentPerformanceRow[] = [
  { department: 'Sales', employees: 52, goalProgress: 78, reviewCompletion: 72, avgScore: 4.1 },
  { department: 'Engineering', employees: 68, goalProgress: 81, reviewCompletion: 69, avgScore: 4.0 },
  { department: 'Operations', employees: 45, goalProgress: 71, reviewCompletion: 64, avgScore: 3.7 },
  { department: 'HR', employees: 18, goalProgress: 84, reviewCompletion: 78, avgScore: 4.2 },
  { department: 'Finance', employees: 25, goalProgress: 73, reviewCompletion: 70, avgScore: 3.8 }
];

export interface AttentionReportItem {
  id: string;
  label: string;
  count: number;
  route: string;
}

export const ATTENTION_REPORT_ITEMS: AttentionReportItem[] = [
  { id: 'overdue-reviews', label: 'Employees with overdue reviews', count: 18, route: '/performance/cycles/cycle-1/reviews' },
  { id: 'low-goal-progress', label: 'Employees with low goal progress', count: 24, route: '/performance/cycles/cycle-1/employees' },
  { id: 'at-risk-goals', label: 'Goals marked At Risk', count: 214, route: '/performance/cycles/cycle-1/goals' },
  { id: 'pending-manager-reviews', label: 'Pending manager reviews', count: 79, route: '/performance/cycles/cycle-1/reviews' }
];

export type ReportReviewStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Overdue';

export interface EmployeePerformanceReportRow {
  id: string;
  name: string;
  initials: string;
  avatarBg?: string;
  department: string;
  jobLevel: string;
  goalProgress: number;
  finalScore: number;
  rating: string;
  reviewStatus: ReportReviewStatus;
}

export const EMPLOYEE_PERFORMANCE_REPORT: EmployeePerformanceReportRow[] = [
  { id: 'rpt-1', name: 'Rahul Shah', initials: 'RS', avatarBg: '#E0F2FE', department: 'Sales', jobLevel: 'Individual Contributor', goalProgress: 81, finalScore: 4.2, rating: 'Exceeds Expectations', reviewStatus: 'Completed' },
  { id: 'rpt-2', name: 'Priya Patel', initials: 'PP', avatarBg: '#ECFDF5', department: 'Engineering', jobLevel: 'Individual Contributor', goalProgress: 91, finalScore: 4.5, rating: 'Exceptional', reviewStatus: 'Completed' },
  { id: 'rpt-3', name: 'Amit Kumar', initials: 'AK', avatarBg: '#FEF3C7', department: 'Operations', jobLevel: 'Individual Contributor', goalProgress: 61, finalScore: 3.1, rating: 'Meets Expectations', reviewStatus: 'In Progress' },
  { id: 'rpt-4', name: 'Neha Mehta', initials: 'NM', avatarBg: '#F5F3FF', department: 'HR', jobLevel: 'Individual Contributor', goalProgress: 87, finalScore: 4.3, rating: 'Exceeds Expectations', reviewStatus: 'Completed' },
  { id: 'rpt-5', name: 'Karan Desai', initials: 'KD', avatarBg: '#FEE2E2', department: 'Sales', jobLevel: 'Individual Contributor', goalProgress: 62, finalScore: 2.8, rating: 'Needs Improvement', reviewStatus: 'Overdue' },
  { id: 'rpt-6', name: 'Sneha Verma', initials: 'SV', avatarBg: '#ECFDF5', department: 'Finance', jobLevel: 'Individual Contributor', goalProgress: 90, finalScore: 4.4, rating: 'Exceeds Expectations', reviewStatus: 'Completed' },
  { id: 'rpt-7', name: 'Vikram Malhotra', initials: 'VM', avatarBg: '#E0F2FE', department: 'Sales', jobLevel: 'Manager', goalProgress: 95, finalScore: 4.4, rating: 'Exceeds Expectations', reviewStatus: 'Completed' },
  { id: 'rpt-8', name: 'Ananya Das', initials: 'AD', avatarBg: '#F5F3FF', department: 'Engineering', jobLevel: 'Individual Contributor', goalProgress: 52, finalScore: 3.9, rating: 'Meets Expectations', reviewStatus: 'In Progress' },
  { id: 'rpt-9', name: 'Rohit Joshi', initials: 'RJ', avatarBg: '#FEF3C7', department: 'Operations', jobLevel: 'Individual Contributor', goalProgress: 38, finalScore: 2.4, rating: 'Needs Improvement', reviewStatus: 'Not Started' },
  { id: 'rpt-10', name: 'Pooja Nair', initials: 'PN', avatarBg: '#FEE2E2', department: 'Engineering', jobLevel: 'Individual Contributor', goalProgress: 68, finalScore: 3.8, rating: 'Meets Expectations', reviewStatus: 'Overdue' },
  { id: 'rpt-11', name: 'Rajesh Iyer', initials: 'RI', avatarBg: '#E0F2FE', department: 'Finance', jobLevel: 'Manager', goalProgress: 84, finalScore: 4.1, rating: 'Exceeds Expectations', reviewStatus: 'Completed' },
  { id: 'rpt-12', name: 'Meera Krishnan', initials: 'MK', avatarBg: '#F5F3FF', department: 'HR', jobLevel: 'Manager', goalProgress: 79, finalScore: 4.0, rating: 'Meets Expectations', reviewStatus: 'In Progress' }
];
