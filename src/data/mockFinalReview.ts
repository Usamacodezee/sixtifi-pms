import { getRatingLabel } from './reviewEngine';

export interface FinalReviewGoal {
  id: string;
  title: string;
  progress: number;
  weight: number;
  managerRating: number;
  managerComment: string;
  selfComment: string;
}

export interface FinalReviewCompetency {
  id: string;
  name: string;
  managerRating: number;
  managerComment: string;
  selfRating: number;
  selfComment: string;
}

export interface FinalReviewRecord {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  manager: string;
  cycleName: string;
  goals: FinalReviewGoal[];
  competencies: FinalReviewCompetency[];
  selfReviewOverall: {
    keyAchievements: string;
    biggestChallenges: string;
    skillsToImprove: string;
  };
  managerReviewOverall: {
    keyStrengths: string;
    areasForImprovement: string;
    managerSummary: string;
    developmentRecommendations: string;
  };
}

export const MOCK_FINAL_REVIEW_DATA: Record<string, FinalReviewRecord> = {
  'emp-1': {
    employeeId: 'emp-1',
    employeeName: 'Rahul Shah',
    designation: 'Sales Executive',
    department: 'Sales',
    manager: 'Vikram Patel',
    cycleName: 'FY 2026–27 Annual Performance Review',
    goals: [
      {
        id: 'fr-goal-1',
        title: 'Increase Sales Revenue',
        progress: 82,
        weight: 40,
        managerRating: 4.5,
        managerComment: 'Strong revenue performance.',
        selfComment: 'Achieved strong revenue growth through enterprise client acquisition.'
      },
      {
        id: 'fr-goal-2',
        title: 'Improve Client Retention',
        progress: 75,
        weight: 25,
        managerRating: 4.0,
        managerComment: 'Good customer retention.',
        selfComment: 'Renewed 12 key enterprise contracts ahead of the annual deadline.'
      },
      {
        id: 'fr-goal-3',
        title: 'New Customer Acquisition',
        progress: 55,
        weight: 20,
        managerRating: 3.5,
        managerComment: 'Needs improvement.',
        selfComment: 'Acquisition pace slowed mid-cycle; onboarded 2 additional beta accounts.'
      },
      {
        id: 'fr-goal-4',
        title: 'Product Knowledge',
        progress: 90,
        weight: 15,
        managerRating: 4.5,
        managerComment: 'Excellent development.',
        selfComment: 'Completed advanced platform certification with distinction.'
      }
    ],
    competencies: [
      {
        id: 'fr-comp-customer-focus',
        name: 'Customer Focus',
        managerRating: 4,
        managerComment: 'Consistently prioritizes client needs and builds lasting relationships.',
        selfRating: 4,
        selfComment: 'Stayed closely engaged with top accounts throughout the cycle.'
      },
      {
        id: 'fr-comp-communication',
        name: 'Communication',
        managerRating: 4,
        managerComment: 'Clear, confident communicator with clients and internal stakeholders.',
        selfRating: 3,
        selfComment: 'Could be more proactive in cross-functional updates.'
      },
      {
        id: 'fr-comp-ownership',
        name: 'Ownership',
        managerRating: 4,
        managerComment: 'Takes full accountability for goals and follows through reliably.',
        selfRating: 4,
        selfComment: 'Took ownership of the Q4 revenue push with minimal oversight.'
      },
      {
        id: 'fr-comp-problem-solving',
        name: 'Problem Solving',
        managerRating: 4,
        managerComment: 'Identifies practical solutions under time pressure.',
        selfRating: 4,
        selfComment: 'Resolved several account escalations without manager involvement.'
      }
    ],
    selfReviewOverall: {
      keyAchievements: 'Made steady progress across all 6 goals this cycle, with the strongest results in Increase Sales Revenue and Product Knowledge.',
      biggestChallenges: 'Balancing new customer acquisition with retention work during peak quarter was the main challenge.',
      skillsToImprove: 'Looking to strengthen cross-functional collaboration and proactive stakeholder communication.'
    },
    managerReviewOverall: {
      keyStrengths: 'Rahul shows strong ownership and reliable execution against core revenue goals this cycle.',
      areasForImprovement: 'Continue building depth in new customer acquisition and proactive risk flagging.',
      managerSummary: 'A solid Appraisal Cycle overall, with particularly strong results on revenue growth and product knowledge development.',
      developmentRecommendations: 'Recommend enrolling in the advanced account management enablement track next cycle.'
    }
  }
};

export type FinalReviewStatus = 'Pending' | 'Sent Back' | 'Completed';

export interface FinalReviewDecision {
  status: FinalReviewStatus;
  finalRating: number;
  finalReviewerComments: string;
  developmentRecommendations: string;
  nextCycleFocusAreas: string;
  completedDate?: string;
  sentBackDate?: string;
}

// finalRating: 0 means "not yet chosen" — the view defaults the control to
// Math.round(calculated score) the first time it renders for an employee.
export const INITIAL_FINAL_REVIEW_DECISION: FinalReviewDecision = {
  status: 'Pending',
  finalRating: 0,
  finalReviewerComments: '',
  developmentRecommendations: '',
  nextCycleFocusAreas: ''
};

export interface FinalReviewScores {
  goalScore: number;
  competencyScore: number;
  overallScore: number;
  overallLabel: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Goal Score = each goal's manager rating weighted by its own appraisal weight. Competency Score = simple average. Overall = Goal 70% + Competency 30%. */
export const calculateFinalReviewScores = (
  goals: FinalReviewGoal[],
  competencies: FinalReviewCompetency[]
): FinalReviewScores => {
  const totalWeight = goals.reduce((sum, g) => sum + g.weight, 0) || 1;
  const goalScore = round1(goals.reduce((sum, g) => sum + g.managerRating * g.weight, 0) / totalWeight);
  const competencyScore = round1(
    competencies.reduce((sum, c) => sum + c.managerRating, 0) / (competencies.length || 1)
  );
  const overallScore = round2(goalScore * 0.7 + competencyScore * 0.3);
  const overallLabel = getRatingLabel(Math.min(5, Math.max(1, Math.round(overallScore))));

  return { goalScore, competencyScore, overallScore, overallLabel };
};
