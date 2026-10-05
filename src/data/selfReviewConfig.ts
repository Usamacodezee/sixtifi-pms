import { GoalStatus } from '../types/performance';

export type QuestionType = 'Short Text' | 'Long Text' | 'Rating' | 'Yes/No' | 'Single Select';

// Groups a question belongs to for review-form layout purposes.
export type QuestionSection = 'goals' | 'competency' | 'overall';

// Free-form categorization used by the Question Template builder (distinct
// from `section`, which drives where a question renders in the review UI).
export type QuestionCategory = 'Goal' | 'Competency' | 'Self Assessment' | 'Development' | 'General';

export interface DynamicQuestion {
  id: string;
  section: QuestionSection;
  question: string;
  type: QuestionType;
  required: boolean;
  department?: string;
  designation?: string;
  jobLevel?: string;
  options?: string[]; // choices for Single Select
  category?: QuestionCategory;
  order?: number;
  ratingLabels?: string[]; // optional custom 1-5 labels for Rating questions
}

export interface CompetencyConfig {
  id: string;
  name: string;
  description: string;
  department: string;
  designation?: string;
  jobLevel?: string;
}

export interface SelfReviewResponses {
  status: 'Pending' | 'Completed';
  submittedDate?: string;
  goals: {
    [goalId: string]: {
      achievementSummary: string;
      challengesRemarks: string;
      attachmentName?: string;
    };
  };
  competencies: {
    [competencyId: string]: {
      rating: number; // 1-5
      comment: string;
    };
  };
  overall: {
    [questionId: string]: string; // answer string
  };
}

export const MOCK_COMPETENCIES: CompetencyConfig[] = [
  // 1. General Company-Wide Competencies (Applies to All Departments)
  {
    id: 'gen-integrity',
    name: 'Integrity & Ethics',
    description: 'Upholds organizational values, acts ethically, and fosters transparency in all workplace interactions.',
    department: 'All'
  },
  {
    id: 'gen-ownership',
    name: 'Accountability & Drive',
    description: 'Takes personal ownership of outcomes, meets deadlines reliably, and continuously strives for high quality.',
    department: 'All'
  },

  // 2. Department-Wide Competencies
  {
    id: 'dept-sales-customer',
    name: 'Client Empathy & Market Orientation',
    description: 'Understands customer pain points and represents company value proposition effectively across accounts.',
    department: 'Sales'
  },
  {
    id: 'customer-focus',
    name: 'Customer Focus',
    description: 'Builds strong customer relationships and delivers customer-centric solutions.',
    department: 'Sales'
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Effective written and verbal dialogue across internal stakeholders and customers.',
    department: 'Sales'
  },
  {
    id: 'dept-eng-excellence',
    name: 'Technical Excellence & Operational Reliability',
    description: 'Prioritizes robust engineering design, security practices, and system uptime across products.',
    department: 'Engineering'
  },
  {
    id: 'tech-expertise',
    name: 'Technical Expertise',
    description: 'Demonstrates deep knowledge of codebases, software designs, and standards.',
    department: 'Engineering'
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Writes clean, tested, maintainable, and highly efficient algorithms.',
    department: 'Engineering'
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Works seamlessly in multi-disciplinary squads to ship sprint commits.',
    department: 'Engineering'
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Motivates, inspires, and aligns teams towards long term strategic roadmaps.',
    department: 'Management'
  },
  {
    id: 'team-dev',
    name: 'Team Development',
    description: 'Mentors staff, guides career growth paths, and calibrates performance objectives.',
    department: 'Management'
  }
];

export const MOCK_OVERALL_QUESTIONS: DynamicQuestion[] = [
  {
    id: 'key-achievements',
    section: 'overall',
    question: 'What are your key achievements during this Appraisal Cycle?',
    type: 'Long Text',
    required: true
  },
  {
    id: 'biggest-challenges',
    section: 'overall',
    question: 'What were your biggest challenges?',
    type: 'Long Text',
    required: true
  },
  {
    id: 'skills-to-improve',
    section: 'overall',
    question: 'What skills or areas would you like to improve?',
    type: 'Long Text',
    required: true
  },
  {
    id: 'support-needed',
    section: 'overall',
    question: 'What support would help you perform better?',
    type: 'Long Text',
    required: false
  },
  {
    id: 'priorities-next',
    section: 'overall',
    question: 'What are your key priorities for the next Appraisal Cycle?',
    type: 'Long Text',
    required: false
  }
];

export const INITIAL_SELF_REVIEW_RESPONSES: SelfReviewResponses = {
  status: 'Pending',
  goals: {},
  competencies: {},
  overall: {}
};
