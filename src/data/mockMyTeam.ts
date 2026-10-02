import { TeamMember, TeamMemberGoal } from '../types/performance';
import { MOCK_MY_GOALS, calculateGoalStatus } from './mockMyGoals';

const GOAL_TITLES = [
  'Increase Sales Revenue',
  'Improve Client Retention',
  'New Customer Acquisition',
  'Product Knowledge',
  'Key Account Satisfaction & NPS',
  'Cross-functional Collaboration & Enablement'
];

// Standardized team-wide KPI targets & appraisal weights for the 6 template goals.
const GOAL_TARGETS = ['₹1 Crore', '90%', '20', '100%', '75 NPS', '12 Sessions'];
const GOAL_WEIGHTS = [40, 25, 20, 15, 10, 10];

const buildGoals = (employeeId: string, values: number[]): TeamMemberGoal[] =>
  values.map((progress, idx) => ({
    id: `${employeeId}-goal-${idx + 1}`,
    title: GOAL_TITLES[idx],
    target: GOAL_TARGETS[idx],
    weight: GOAL_WEIGHTS[idx],
    progress,
    status: calculateGoalStatus(progress)
  }));

const rahulGoals: TeamMemberGoal[] = MOCK_MY_GOALS.map((g, idx) => ({
  id: `tm-1-goal-${idx + 1}`,
  title: g.title === 'Product Knowledge Improvement' ? 'Product Knowledge' : g.title,
  target: g.target,
  weight: g.weight,
  progress: g.progress,
  status: g.status
}));

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Rahul Shah',
    employeeCode: 'EMP-2001',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'RS',
    avatarBg: '#E0F2FE',
    goalProgress: 81,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Pending',
    overallStatus: 'In Progress',
    goals: rahulGoals
  },
  {
    id: 'tm-2',
    name: 'Priya Patel',
    employeeCode: 'EMP-2002',
    designation: 'Senior Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'PP',
    avatarBg: '#ECFDF5',
    goalProgress: 91,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Pending',
    overallStatus: 'In Progress',
    goals: buildGoals('tm-2', [95, 92, 88, 90, 96, 85])
  },
  {
    id: 'tm-3',
    name: 'Amit Kumar',
    employeeCode: 'EMP-2003',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'AK',
    avatarBg: '#FEF3C7',
    goalProgress: 48,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Pending',
    overallStatus: 'At Risk',
    goals: buildGoals('tm-3', [45, 52, 38, 60, 40, 53])
  },
  {
    id: 'tm-4',
    name: 'Neha Mehta',
    employeeCode: 'EMP-2004',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'NM',
    avatarBg: '#F5F3FF',
    goalProgress: 87,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'Completed',
    goals: buildGoals('tm-4', [90, 85, 80, 92, 88, 87])
  },
  {
    id: 'tm-5',
    name: 'Karan Desai',
    employeeCode: 'EMP-2005',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'KD',
    avatarBg: '#FEE2E2',
    goalProgress: 62,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Overdue',
    overallStatus: 'Overdue',
    goals: buildGoals('tm-5', [58, 65, 72, 55, 60, 62])
  },
  {
    id: 'tm-6',
    name: 'Meera Iyer',
    employeeCode: 'EMP-2006',
    designation: 'Sales Associate',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'MI',
    avatarBg: '#E0F2FE',
    goalProgress: 88,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'Completed',
    goals: buildGoals('tm-6', [90, 86, 88, 92, 84, 88])
  },
  {
    id: 'tm-7',
    name: 'Arjun Nair',
    employeeCode: 'EMP-2007',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'AN',
    avatarBg: '#ECFDF5',
    goalProgress: 95,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'Completed',
    goals: buildGoals('tm-7', [96, 94, 98, 92, 95, 95])
  },
  {
    id: 'tm-8',
    name: 'Sanya Kapoor',
    employeeCode: 'EMP-2008',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'SK',
    avatarBg: '#FEF3C7',
    goalProgress: 80,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Pending',
    overallStatus: 'In Progress',
    goals: buildGoals('tm-8', [82, 78, 85, 75, 80, 80])
  },
  {
    id: 'tm-9',
    name: 'Rohan Gupta',
    employeeCode: 'EMP-2009',
    designation: 'Senior Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'RG',
    avatarBg: '#F5F3FF',
    goalProgress: 68,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'Completed',
    goals: buildGoals('tm-9', [65, 70, 72, 60, 68, 73])
  },
  {
    id: 'tm-10',
    name: 'Divya Shah',
    employeeCode: 'EMP-2010',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'DS',
    avatarBg: '#FEE2E2',
    goalProgress: 80,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'Completed',
    goals: buildGoals('tm-10', [82, 78, 80, 84, 76, 80])
  },
  {
    id: 'tm-11',
    name: 'Kunal Verma',
    employeeCode: 'EMP-2011',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'KV',
    avatarBg: '#E0F2FE',
    goalProgress: 55,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Completed',
    overallStatus: 'At Risk',
    goals: buildGoals('tm-11', [50, 58, 60, 52, 54, 56])
  },
  {
    id: 'tm-12',
    name: 'Ishita Joshi',
    employeeCode: 'EMP-2012',
    designation: 'Sales Executive',
    department: 'Sales',
    jobLevel: 'Individual Contributor',
    initials: 'IJ',
    avatarBg: '#ECFDF5',
    goalProgress: 76,
    selfReviewStatus: 'Completed',
    managerReviewStatus: 'Pending',
    overallStatus: 'In Progress',
    goals: buildGoals('tm-12', [78, 74, 80, 72, 76, 76])
  }
];

export const TEAM_MEMBERS_COUNT = TEAM_MEMBERS.length;

export const GOALS_ON_TRACK_COUNT = TEAM_MEMBERS.filter(
  (m) => calculateGoalStatus(m.goalProgress) === 'On Track'
).length;

export const GOALS_AT_RISK_COUNT = TEAM_MEMBERS.filter(
  (m) => calculateGoalStatus(m.goalProgress) === 'At Risk'
).length;

export const GOALS_NEEDS_ATTENTION_COUNT = TEAM_MEMBERS.filter(
  (m) => calculateGoalStatus(m.goalProgress) === 'Needs Attention'
).length;

export const REVIEWS_PENDING_COUNT = TEAM_MEMBERS.filter(
  (m) => m.managerReviewStatus === 'Pending'
).length;

export const REVIEWS_OVERDUE_COUNT = TEAM_MEMBERS.filter(
  (m) => m.managerReviewStatus === 'Overdue'
).length;

export const TEAM_AVERAGE_PROGRESS = Math.round(
  TEAM_MEMBERS.reduce((sum, m) => sum + m.goalProgress, 0) / TEAM_MEMBERS.length
);

// Static mock count — goal approval workflow is not modeled in this frontend-only build.
export const GOALS_AWAITING_APPROVAL_COUNT = 3;
