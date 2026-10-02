import { GoalStatus, GoalProgressHistoryItem } from '../types/performance';
import { calculateGoalStatus, MyGoalItem, MOCK_MY_GOALS } from './mockMyGoals';
import { TEAM_MEMBERS } from './mockMyTeam';
import { DEFAULT_COMPANY_ID } from './mockCompanies';

export type GoalLevel = 'individual' | 'team' | 'overall';

export interface OverallGoal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  owner: string;
  ownerRole: string;
  target: string;
  currentAchievement: string;
  progress: number;
  weight: number;
  startDate: string;
  dueDate: string;
  status: GoalStatus;
  linkedTeamGoalIds: string[];
  history: GoalProgressHistoryItem[];
}

export interface TeamGoal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  teamName: string;
  department: string;
  owner: string;
  ownerRole: string;
  parentOverallGoalId?: string;
  target: string;
  currentAchievement: string;
  progress: number;
  weight: number;
  startDate: string;
  dueDate: string;
  status: GoalStatus;
  memberCount: number;
  history: GoalProgressHistoryItem[];
}

/** Flattened row for the Team Goals people table (individual goals of reports). */
export interface TeamMemberGoalRow {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  designation: string;
  department: string;
  initials: string;
  avatarBg?: string;
  goalTitle: string;
  target: string;
  progress: number;
  weight: number;
  status: GoalStatus;
}

export const MOCK_OVERALL_GOALS: OverallGoal[] = [
  {
    id: 'og-1',
    companyId: 'co-sixtifi',
    title: 'Grow ARR to ₹48 Cr',
    description: 'Expand enterprise ARR across India and Middle East through new logos and expansion revenue.',
    owner: 'Ananya Mehta',
    ownerRole: 'CEO',
    target: '₹48 Cr',
    currentAchievement: '₹39.2 Cr',
    progress: 82,
    weight: 35,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    linkedTeamGoalIds: ['tg-1', 'tg-2'],
    history: [
      {
        date: '01 Mar 2027',
        previousPercent: 74,
        newPercent: 82,
        comment: 'Strong Q4 enterprise renewals closed.',
        updatedBy: 'Ananya Mehta'
      }
    ]
  },
  {
    id: 'og-2',
    companyId: 'co-sixtifi',
    title: 'Improve Net Revenue Retention to 115%',
    description: 'Lift NRR via customer success playbooks, expansion motions, and reduced logo churn.',
    owner: 'Vikram Patel',
    ownerRole: 'VP of Sales',
    target: '115%',
    currentAchievement: '108%',
    progress: 70,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    linkedTeamGoalIds: ['tg-2'],
    history: []
  },
  {
    id: 'og-3',
    companyId: 'co-sixtifi',
    title: 'Ship PMS v2 to 100% of active tenants',
    description: 'Complete Goals, Reviews, and Competency modules and migrate all active customers.',
    owner: 'Sneha Iyer',
    ownerRole: 'VP of Product',
    target: '100% tenants',
    currentAchievement: '68%',
    progress: 68,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '31 Dec 2026',
    status: 'At Risk',
    linkedTeamGoalIds: ['tg-3'],
    history: []
  },
  {
    id: 'og-4',
    companyId: 'co-sixtifi',
    title: 'Raise eNPS above +45',
    description: 'Strengthen engagement, manager enablement, and career pathways across the company.',
    owner: 'Karan Desai',
    ownerRole: 'CHRO',
    target: '+45 eNPS',
    currentAchievement: '+38 eNPS',
    progress: 76,
    weight: 15,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    linkedTeamGoalIds: ['tg-4'],
    history: []
  },
  {
    id: 'og-ns-1',
    companyId: 'co-northstar',
    title: 'Increase Same-Store Sales by 12%',
    description: 'Drive footfall and basket size across 40 company-owned stores.',
    owner: 'Meera Kapoor',
    ownerRole: 'COO',
    target: '12%',
    currentAchievement: '7.5%',
    progress: 63,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    linkedTeamGoalIds: ['tg-ns-1'],
    history: []
  },
  {
    id: 'og-ns-2',
    companyId: 'co-northstar',
    title: 'Grow Online Channel to 30% of GMV',
    description: 'Scale marketplace and D2C contribution to overall GMV.',
    owner: 'Arjun Sethi',
    ownerRole: 'CDO',
    target: '30% GMV',
    currentAchievement: '22% GMV',
    progress: 73,
    weight: 35,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    linkedTeamGoalIds: ['tg-ns-2'],
    history: []
  },
  {
    id: 'og-ns-3',
    companyId: 'co-northstar',
    title: 'Reduce Inventory Days to 45',
    description: 'Tighten supply planning and markdown discipline across categories.',
    owner: 'Ritu Malhotra',
    ownerRole: 'CFO',
    target: '45 days',
    currentAchievement: '58 days',
    progress: 55,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'Needs Attention',
    linkedTeamGoalIds: [],
    history: []
  }
];

export const MOCK_TEAM_GOALS: TeamGoal[] = [
  {
    id: 'tg-1',
    companyId: 'co-sixtifi',
    title: 'Western Region Revenue of ₹12 Cr',
    description: 'Own enterprise new business and expansion targets for Western India.',
    teamName: 'Sales – West',
    department: 'Sales',
    owner: 'Vikram Patel',
    ownerRole: 'VP of Sales',
    parentOverallGoalId: 'og-1',
    target: '₹12 Cr',
    currentAchievement: '₹9.8 Cr',
    progress: 82,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    memberCount: 6,
    history: []
  },
  {
    id: 'tg-2',
    companyId: 'co-sixtifi',
    title: 'Client Retention above 92%',
    description: 'Protect logo churn and expand wallet share for strategic accounts.',
    teamName: 'Customer Success',
    department: 'Customer Success',
    owner: 'Neha Kulkarni',
    ownerRole: 'Head of CS',
    parentOverallGoalId: 'og-2',
    target: '92%',
    currentAchievement: '89%',
    progress: 78,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    memberCount: 4,
    history: []
  },
  {
    id: 'tg-3',
    companyId: 'co-sixtifi',
    title: 'Release Goals + Reviews modules',
    description: 'Ship Goals (My / Team / Overall) and complete review workflow hardening.',
    teamName: 'Product Engineering',
    department: 'Engineering',
    owner: 'Sneha Iyer',
    ownerRole: 'VP of Product',
    parentOverallGoalId: 'og-3',
    target: '2 modules GA',
    currentAchievement: '1 module GA',
    progress: 55,
    weight: 35,
    startDate: '01 Apr 2026',
    dueDate: '31 Dec 2026',
    status: 'At Risk',
    memberCount: 8,
    history: []
  },
  {
    id: 'tg-4',
    companyId: 'co-sixtifi',
    title: 'Complete mid-year talent reviews',
    description: 'Run calibration and development plans for all people managers.',
    teamName: 'People Ops',
    department: 'HR',
    owner: 'Karan Desai',
    ownerRole: 'CHRO',
    parentOverallGoalId: 'og-4',
    target: '100% managers',
    currentAchievement: '80%',
    progress: 80,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '30 Sep 2026',
    status: 'On Track',
    memberCount: 3,
    history: []
  },
  {
    id: 'tg-ns-1',
    companyId: 'co-northstar',
    title: 'West Zone store productivity +10%',
    description: 'Improve conversion and average ticket across West Zone stores.',
    teamName: 'Retail – West Zone',
    department: 'Retail Ops',
    owner: 'Dev Malhotra',
    ownerRole: 'Zonal Head',
    parentOverallGoalId: 'og-ns-1',
    target: '+10%',
    currentAchievement: '+6%',
    progress: 60,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    memberCount: 12,
    history: []
  },
  {
    id: 'tg-ns-2',
    companyId: 'co-northstar',
    title: 'Marketplace GMV ₹18 Cr',
    description: 'Grow marketplace contribution through assortment and promotions.',
    teamName: 'Digital Commerce',
    department: 'E-Commerce',
    owner: 'Pooja Nair',
    ownerRole: 'Head of Digital',
    parentOverallGoalId: 'og-ns-2',
    target: '₹18 Cr',
    currentAchievement: '₹13.1 Cr',
    progress: 73,
    weight: 35,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    memberCount: 7,
    history: []
  }
];

/** Seed individual goals for the active demo company from existing My Goals. */
export const seedIndividualGoalsForCompany = (companyId: string = DEFAULT_COMPANY_ID): MyGoalItem[] =>
  MOCK_MY_GOALS.map((g) => ({ ...g, companyId }));

/** Individual goals belonging to Northstar (demo second company). */
export const MOCK_NORTHSTAR_MY_GOALS: MyGoalItem[] = [
  {
    id: 'ns-my-goal-1',
    companyId: 'co-northstar',
    title: 'Increase Store Conversion Rate',
    description: 'Improve walk-in to bill conversion across assigned stores.',
    target: '28%',
    currentAchievement: '24%',
    progress: 70,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    manager: 'Dev Malhotra',
    managerRole: 'Zonal Head',
    history: []
  },
  {
    id: 'ns-my-goal-2',
    companyId: 'co-northstar',
    title: 'Grow Private-Label Mix',
    description: 'Raise private-label contribution in category sales.',
    target: '18%',
    currentAchievement: '11%',
    progress: 55,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    manager: 'Dev Malhotra',
    managerRole: 'Zonal Head',
    history: []
  },
  {
    id: 'ns-my-goal-3',
    companyId: 'co-northstar',
    title: 'Complete Visual Merchandising Certification',
    description: 'Finish VM standards training for all seasonal campaigns.',
    target: '100%',
    currentAchievement: '100%',
    progress: 100,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '30 Sep 2026',
    status: 'Completed',
    manager: 'Dev Malhotra',
    managerRole: 'Zonal Head',
    history: []
  }
];

export const ALL_INDIVIDUAL_GOALS_SEED: MyGoalItem[] = [
  ...seedIndividualGoalsForCompany('co-sixtifi'),
  ...MOCK_NORTHSTAR_MY_GOALS
];

export const getOverallGoalsForCompany = (goals: OverallGoal[], companyId: string): OverallGoal[] =>
  goals.filter((g) => g.companyId === companyId);

export const getTeamGoalsForCompany = (goals: TeamGoal[], companyId: string): TeamGoal[] =>
  goals.filter((g) => g.companyId === companyId);

export const getIndividualGoalsForCompany = (goals: MyGoalItem[], companyId: string): MyGoalItem[] =>
  goals.filter((g) => (g.companyId || DEFAULT_COMPANY_ID) === companyId);

/** Build team-member goal rows for the active company (Sixtifi demo team). */
export interface AssignableEmployee {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  initials: string;
  avatarBg?: string;
}

export const getAssignableEmployees = (companyId: string): AssignableEmployee[] => {
  if (companyId === 'co-northstar') {
    return [
      {
        id: 'ns-emp-1',
        name: 'Aisha Khan',
        employeeCode: 'NSR-1102',
        designation: 'Store Manager',
        department: 'Retail Ops',
        initials: 'AK',
        avatarBg: '#FEF3C7'
      },
      {
        id: 'ns-emp-2',
        name: 'Rohan Mehta',
        employeeCode: 'NSR-1108',
        designation: 'Assistant Store Manager',
        department: 'Retail Ops',
        initials: 'RM',
        avatarBg: '#E0F2FE'
      }
    ];
  }

  return TEAM_MEMBERS.map((m) => ({
    id: m.id,
    name: m.name,
    employeeCode: m.employeeCode,
    designation: m.designation,
    department: m.department,
    initials: m.initials,
    avatarBg: m.avatarBg
  }));
};

export const buildTeamMemberGoalRows = (companyId: string): TeamMemberGoalRow[] => {
  if (companyId !== 'co-sixtifi') {
    // Northstar: lighter stub team rows derived from individual goals
    return MOCK_NORTHSTAR_MY_GOALS.map((g, idx) => ({
      id: `ns-row-${idx + 1}`,
      companyId: 'co-northstar',
      employeeId: 'ns-emp-1',
      employeeName: 'Aisha Khan',
      employeeCode: 'NSR-1102',
      designation: 'Store Manager',
      department: 'Retail Ops',
      initials: 'AK',
      avatarBg: '#FEF3C7',
      goalTitle: g.title,
      target: g.target,
      progress: g.progress,
      weight: g.weight,
      status: g.status
    }));
  }

  return TEAM_MEMBERS.flatMap((member) =>
    member.goals.map((goal) => ({
      id: goal.id,
      companyId: 'co-sixtifi',
      employeeId: member.id,
      employeeName: member.name,
      employeeCode: member.employeeCode,
      designation: member.designation,
      department: member.department,
      initials: member.initials,
      avatarBg: member.avatarBg,
      goalTitle: goal.title,
      target: goal.target,
      progress: goal.progress,
      weight: goal.weight,
      status: goal.status
    }))
  );
};

/** Seed all company team member goal rows for session state. */
export const ALL_TEAM_MEMBER_GOAL_ROWS_SEED: TeamMemberGoalRow[] = [
  ...buildTeamMemberGoalRows('co-sixtifi'),
  ...buildTeamMemberGoalRows('co-northstar')
];

export const summarizeGoalStats = <T extends { status: GoalStatus; progress: number }>(items: T[]) => {
  const total = items.length;
  const onTrack = items.filter((g) => g.status === 'On Track').length;
  const atRisk = items.filter((g) => g.status === 'At Risk').length;
  const needsAttention = items.filter((g) => g.status === 'Needs Attention').length;
  const completed = items.filter((g) => g.status === 'Completed').length;
  const avgProgress =
    total > 0 ? Math.round(items.reduce((sum, g) => sum + g.progress, 0) / total) : 0;
  return { total, onTrack, atRisk, needsAttention, completed, avgProgress };
};

export { calculateGoalStatus };
