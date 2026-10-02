import { TeamMember, TeamMemberGoal } from '../types/performance';
import { DynamicQuestion, CompetencyConfig } from './reviewEngine';

export interface ManagerReviewResponses {
  status: 'Pending' | 'Completed';
  submittedDate?: string;
  goals: {
    [goalId: string]: {
      rating: number; // 1-5
      comment: string;
    };
  };
  competencies: {
    [competencyId: string]: {
      rating: number; // 1-5
      comment: string;
    };
  };
  overall: {
    [questionId: string]: string; // answer string (Rating stored as stringified number)
  };
}

export const INITIAL_MANAGER_REVIEW: ManagerReviewResponses = {
  status: 'Pending',
  goals: {},
  competencies: {},
  overall: {}
};

// Reusable question templates applied to every goal in the Goal Review section.
export const MANAGER_GOAL_RATING_QUESTION: DynamicQuestion = {
  id: 'manager-goal-rating',
  section: 'goals',
  question: "How would you evaluate the employee's performance against this goal?",
  type: 'Rating',
  required: true
};

export const MANAGER_GOAL_COMMENT_QUESTION: DynamicQuestion = {
  id: 'manager-goal-comment',
  section: 'goals',
  question: 'Manager Comment',
  type: 'Long Text',
  required: false
};

// Reusable question templates applied to every competency in the Competency Review section.
export const MANAGER_COMPETENCY_RATING_QUESTION: DynamicQuestion = {
  id: 'manager-competency-rating',
  section: 'competency',
  question: 'Rating (1–5)',
  type: 'Rating',
  required: true
};

export const MANAGER_COMPETENCY_COMMENT_QUESTION: DynamicQuestion = {
  id: 'manager-competency-comment',
  section: 'competency',
  question: 'Manager Comment',
  type: 'Long Text',
  required: false
};

export const MANAGER_OVERALL_QUESTIONS: DynamicQuestion[] = [
  {
    id: 'overall-rating',
    section: 'overall',
    question: 'Overall Performance Rating',
    type: 'Rating',
    required: true
  },
  {
    id: 'key-strengths',
    section: 'overall',
    question: 'Key Strengths',
    type: 'Long Text',
    required: true
  },
  {
    id: 'areas-improvement',
    section: 'overall',
    question: 'Areas for Improvement',
    type: 'Long Text',
    required: true
  },
  {
    id: 'manager-summary',
    section: 'overall',
    question: 'Manager Summary',
    type: 'Long Text',
    required: true
  },
  {
    id: 'development-recommendations',
    section: 'overall',
    question: 'Development Recommendations',
    type: 'Long Text',
    required: false
  }
];

export interface ManagerReviewScores {
  goalScore: number;
  competencyScore: number;
  overallScore: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Goals weight 70% + Competencies weight 30%, per the mock scoring model. */
export const calculateManagerReviewScores = (
  response: ManagerReviewResponses,
  goals: TeamMemberGoal[],
  competencies: CompetencyConfig[]
): ManagerReviewScores => {
  const goalRatings = goals.map((g) => response.goals[g.id]?.rating || 0).filter((r) => r > 0);
  const compRatings = competencies.map((c) => response.competencies[c.id]?.rating || 0).filter((r) => r > 0);

  const goalScore = goalRatings.length > 0 ? round1(goalRatings.reduce((a, b) => a + b, 0) / goalRatings.length) : 0;
  const competencyScore =
    compRatings.length > 0 ? round1(compRatings.reduce((a, b) => a + b, 0) / compRatings.length) : 0;
  const overallScore = round1(goalScore * 0.7 + competencyScore * 0.3);

  return { goalScore, competencyScore, overallScore };
};

export interface SelfReviewReference {
  goals: {
    [goalId: string]: { achievementSummary: string; challengesRemarks: string };
  };
  competencies: {
    [competencyId: string]: { rating: number; comment: string };
  };
  overall: {
    keyAchievements: string;
    biggestChallenges: string;
    skillsToImprove: string;
    supportNeeded: string;
    prioritiesNext: string;
  };
}

const clampRating = (progress: number) => Math.min(5, Math.max(1, Math.round(progress / 20)));

const goalAchievementSummary = (goal: TeamMemberGoal): string => {
  if (goal.status === 'On Track' || goal.status === 'Completed') {
    return `Achieved ${goal.progress}% against the ${goal.target} target through consistent execution and steady follow-through.`;
  }
  if (goal.status === 'At Risk') {
    return `Reached ${goal.progress}% of the ${goal.target} target; pace slowed mid-cycle and needs renewed focus.`;
  }
  return `Only ${goal.progress}% progress against the ${goal.target} target so far; this goal needs urgent attention.`;
};

const goalChallengesRemarks = (goal: TeamMemberGoal): string => {
  if (goal.status === 'On Track' || goal.status === 'Completed') {
    return 'No major blockers this cycle; maintained steady momentum throughout.';
  }
  if (goal.status === 'At Risk') {
    return 'Faced delays coordinating with cross-functional stakeholders that slowed progress.';
  }
  return 'Encountered significant obstacles including resourcing constraints and shifting priorities.';
};

/**
 * Generates realistic mock "already submitted" self-review content for a
 * team member, so the Manager Review page always has something meaningful
 * to reference regardless of whether the Employee-role self-review demo
 * flow has been exercised in this session.
 */
export const buildSelfReviewReference = (
  member: TeamMember,
  competencies: CompetencyConfig[]
): SelfReviewReference => {
  const goals: SelfReviewReference['goals'] = {};
  member.goals.forEach((goal, idx) => {
    const isRahulRevenueGoal = member.id === 'tm-1' && idx === 0;
    goals[goal.id] = {
      achievementSummary: isRahulRevenueGoal
        ? 'Achieved strong revenue growth through enterprise client acquisition.'
        : goalAchievementSummary(goal),
      challengesRemarks: goalChallengesRemarks(goal)
    };
  });

  const competencyResponses: SelfReviewReference['competencies'] = {};
  competencies.forEach((c) => {
    const rating = clampRating(member.goalProgress);
    competencyResponses[c.id] = {
      rating,
      comment: `Consistently works on ${c.name.toLowerCase()} in day-to-day work, with room to keep building on this strength.`
    };
  });

  const topGoal = [...member.goals].sort((a, b) => b.progress - a.progress)[0];

  return {
    goals,
    competencies: competencyResponses,
    overall: {
      keyAchievements: `Made steady progress across ${member.goals.length} goals this cycle, with the strongest results in ${topGoal?.title || 'core deliverables'}.`,
      biggestChallenges: 'Balancing competing priorities during peak periods was the main challenge this cycle.',
      skillsToImprove: 'Looking to strengthen cross-functional collaboration and data-driven decision making.',
      supportNeeded: 'Additional enablement sessions and clearer account handoff processes would help.',
      prioritiesNext: 'Focus on sustaining goal momentum and supporting newer teammates next cycle.'
    }
  };
};

const goalManagerComment = (goal: TeamMemberGoal): string => {
  if (goal.status === 'On Track' || goal.status === 'Completed') {
    return 'Met expectations for this goal; consistent, reliable execution across the cycle.';
  }
  if (goal.status === 'At Risk') {
    return 'Fell short of expectations. Needs closer tracking and support to get back on pace next cycle.';
  }
  return 'Significantly underperformed against target. Requires a focused improvement plan.';
};

/**
 * Deterministically builds a plausible "already completed" manager review
 * for a team member whose static mock managerReviewStatus is Completed,
 * so the Manager Review page's Completed State renders correctly without
 * requiring every session to first submit a review by hand.
 */
const genericAnswerForQuestion = (question: DynamicQuestion, member: TeamMember, overallScore: number): string => {
  const text = question.question.toLowerCase();
  if (question.type === 'Rating') return String(Math.min(5, Math.max(1, Math.round(overallScore))));
  if (question.type === 'Yes/No') return 'Yes';
  if (question.type === 'Single Select') return question.options?.[0] || '';

  if (text.includes('strength')) return `${member.name} shows strong ownership and reliable execution against core goals this cycle.`;
  if (text.includes('improvement') || text.includes('improve')) {
    return 'Continue building depth in stakeholder communication and proactive risk flagging.';
  }
  if (text.includes('summary')) {
    return `Overall a solid Appraisal Cycle for ${member.name}, with a calculated score of ${overallScore.toFixed(1)} / 5 across goals and competencies.`;
  }
  if (text.includes('recommend') && question.type === 'Long Text') {
    return 'Consider enrolling in the advanced account management enablement track next cycle.';
  }
  return `${member.name} performed steadily against this area this cycle.`;
};

export const buildSeededCompletedReview = (
  member: TeamMember,
  competencies: CompetencyConfig[],
  overallQuestions: DynamicQuestion[] = MANAGER_OVERALL_QUESTIONS
): ManagerReviewResponses => {
  const goals: ManagerReviewResponses['goals'] = {};
  member.goals.forEach((goal) => {
    goals[goal.id] = {
      rating: clampRating(goal.progress),
      comment: goalManagerComment(goal)
    };
  });

  const competencyResponses: ManagerReviewResponses['competencies'] = {};
  competencies.forEach((c) => {
    competencyResponses[c.id] = {
      rating: clampRating(member.goalProgress),
      comment: `Demonstrates solid ${c.name.toLowerCase()} for their level; continue reinforcing this in upcoming initiatives.`
    };
  });

  const response: ManagerReviewResponses = {
    status: 'Completed',
    submittedDate: undefined,
    goals,
    competencies: competencyResponses,
    overall: {}
  };

  const { overallScore } = calculateManagerReviewScores(response, member.goals, competencies);

  const overall: ManagerReviewResponses['overall'] = {};
  overallQuestions.forEach((q) => {
    overall[q.id] = genericAnswerForQuestion(q, member, overallScore);
  });
  response.overall = overall;

  const dayOffset = 5 + (Number(member.id.replace('tm-', '')) % 10);
  response.submittedDate = `${String(dayOffset).padStart(2, '0')} Apr 2027`;

  return response;
};
