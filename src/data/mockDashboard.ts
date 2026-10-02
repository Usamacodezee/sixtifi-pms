/** Chart-ready mock data for Performance Dashboard (role-based). */

export const CHART_COLORS = {
  cyan: '#0284C7',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
  purple: '#7C3AED',
  slate: '#94A3B8',
  teal: '#14B8A6'
};

/** HR: review pipeline completion by stage */
export const HR_STAGE_COMPLETION = [
  { stage: 'Goals Setup', completed: 248, pending: 0 },
  { stage: 'Self Review', completed: 203, pending: 45 },
  { stage: 'Manager Review', completed: 169, pending: 79 },
  { stage: 'Admin Review', completed: 104, pending: 144 }
];

/** HR: monthly cycle completion trend */
export const HR_COMPLETION_TREND = [
  { month: 'Oct', completion: 28 },
  { month: 'Nov', completion: 36 },
  { month: 'Dec', completion: 44 },
  { month: 'Jan', completion: 52 },
  { month: 'Feb', completion: 61 },
  { month: 'Mar', completion: 68 }
];

/** HR: department completion + avg score */
export const HR_DEPT_CHART = [
  { department: 'Sales', reviewCompletion: 78, goalProgress: 74, avgScore: 4.1 },
  { department: 'Engineering', reviewCompletion: 72, goalProgress: 81, avgScore: 4.0 },
  { department: 'HR', reviewCompletion: 92, goalProgress: 84, avgScore: 4.2 },
  { department: 'Operations', reviewCompletion: 61, goalProgress: 71, avgScore: 3.7 },
  { department: 'Finance', reviewCompletion: 69, goalProgress: 73, avgScore: 3.8 }
];

/** HR / Reports: rating distribution */
export const HR_RATING_DISTRIBUTION = [
  { name: 'Needs Significant Improvement', value: 8, fill: CHART_COLORS.red },
  { name: 'Needs Improvement', value: 15, fill: CHART_COLORS.amber },
  { name: 'Meets Expectations', value: 42, fill: CHART_COLORS.cyan },
  { name: 'Exceeds Expectations', value: 28, fill: CHART_COLORS.green },
  { name: 'Exceptional', value: 7, fill: CHART_COLORS.purple }
];

/** HR: goal health */
export const HR_GOAL_HEALTH = [
  { name: 'On Track', value: 70, fill: CHART_COLORS.green },
  { name: 'At Risk', value: 19, fill: CHART_COLORS.amber },
  { name: 'Needs Attention', value: 11, fill: CHART_COLORS.red }
];

/** Manager: team member goal/rating bars */
export const MGR_TEAM_BARS = [
  { name: 'Rahul', goalProgress: 82, rating: 4.2 },
  { name: 'Priya', goalProgress: 75, rating: 4.0 },
  { name: 'Amit', goalProgress: 48, rating: 3.1 },
  { name: 'Neha', goalProgress: 91, rating: 4.5 },
  { name: 'Karan', goalProgress: 62, rating: 3.4 },
  { name: 'Sneha', goalProgress: 70, rating: 3.8 }
];

/** Manager: review status mix */
export const MGR_REVIEW_STATUS = [
  { name: 'Completed', value: 4, fill: CHART_COLORS.green },
  { name: 'Pending me', value: 5, fill: CHART_COLORS.amber },
  { name: 'Self pending', value: 2, fill: CHART_COLORS.cyan },
  { name: 'Overdue', value: 1, fill: CHART_COLORS.red }
];

/** Manager: goal health of team */
export const MGR_GOAL_HEALTH = [
  { name: 'On Track', value: 8, fill: CHART_COLORS.green },
  { name: 'At Risk', value: 3, fill: CHART_COLORS.amber },
  { name: 'Needs Attention', value: 1, fill: CHART_COLORS.red }
];

/** Employee: my goals for bar chart */
export const EMP_MY_GOALS = [
  { name: 'Sales Revenue', progress: 82, fill: CHART_COLORS.green },
  { name: 'Client Retention', progress: 75, fill: CHART_COLORS.cyan },
  { name: 'New Customers', progress: 55, fill: CHART_COLORS.amber },
  { name: 'Product Knowledge', progress: 90, fill: CHART_COLORS.green }
];

/** Employee: monthly personal progress */
export const EMP_PROGRESS_TREND = [
  { month: 'Oct', progress: 40 },
  { month: 'Nov', progress: 48 },
  { month: 'Dec', progress: 55 },
  { month: 'Jan', progress: 62 },
  { month: 'Feb', progress: 68 },
  { month: 'Mar', progress: 72 }
];

/** Employee: score breakdown radar-like as bars */
export const EMP_SCORE_BREAKDOWN = [
  { name: 'Goals', score: 4.3 },
  { name: 'Competencies', score: 4.0 },
  { name: 'Overall', score: 4.2 }
];
