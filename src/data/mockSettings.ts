import { DynamicQuestion, QuestionType, QuestionCategory, MOCK_OVERALL_QUESTIONS } from './selfReviewConfig';
import { MANAGER_OVERALL_QUESTIONS } from './mockManagerReview';
import { calculateRoleMatchScore } from './reviewEngine';
import { ReviewFlowOption } from '../types/performance';

export type { ReviewFlowOption };
export type CycleTypeOption = 'Annual' | 'Half-Yearly' | 'Quarterly' | 'Custom';

/**
 * Company review workflow presets.
 * Admin Review = HR/Admin finalization (previously labeled Final Review).
 */

export interface ReviewFlowOptionMeta {
  id: ReviewFlowOption;
  label: string;
  shortLabel: string;
  description: string;
  stages: string[];
}

export const REVIEW_FLOW_OPTIONS: ReviewFlowOptionMeta[] = [
  {
    id: 'self_manager_admin',
    label: 'Self + Manager + Admin Review',
    shortLabel: 'Self → Manager → Admin',
    description:
      'Employee completes a self review, manager reviews next, then HR/Admin finalizes.',
    stages: ['Self Review', 'Manager Review', 'Admin Review']
  },
  {
    id: 'manager_admin',
    label: 'Manager + Admin Review',
    shortLabel: 'Manager → Admin',
    description:
      'Skip self review. Manager evaluates the employee, then HR/Admin finalizes.',
    stages: ['Manager Review', 'Admin Review']
  },
  {
    id: 'manager_only',
    label: 'Manager Review Only',
    shortLabel: 'Manager only',
    description:
      'Manager completes the review. No self assessment and no admin finalization step.',
    stages: ['Manager Review']
  }
];

export const getReviewFlowMeta = (flow: ReviewFlowOption): ReviewFlowOptionMeta =>
  REVIEW_FLOW_OPTIONS.find((o) => o.id === flow) ?? REVIEW_FLOW_OPTIONS[0];

export const reviewFlowIncludesSelf = (flow: ReviewFlowOption): boolean =>
  flow === 'self_manager_admin';

export const reviewFlowIncludesAdmin = (flow: ReviewFlowOption): boolean =>
  flow !== 'manager_only';

export interface GoalSettings {
  minGoalsPerEmployee: number;
  maxGoalsPerEmployee: number;
  requireManagerApprovalForGoals: boolean;
  allowGoalEditsAfterCycleStart: boolean;
  sendProgressReminders: boolean;
}

export const DEFAULT_GOAL_SETTINGS: GoalSettings = {
  minGoalsPerEmployee: 3,
  maxGoalsPerEmployee: 8,
  requireManagerApprovalForGoals: true,
  allowGoalEditsAfterCycleStart: false,
  sendProgressReminders: true
};

// The targeting chain this PMS is built around — reusable for any
// organization's own department / designation / grade structure.
export type TargetingScope = 'All Employees' | 'Specific Department' | 'Specific Designation' | 'Specific Grade' | 'Specific Job Level';

export const GRADE_OPTIONS = ['Individual Contributor', 'Team Lead', 'Manager', 'Senior Manager', 'Director'];
export const JOB_LEVEL_OPTIONS = GRADE_OPTIONS;

export const COMPETENCY_CATEGORIES = ['Behavioral', 'Functional', 'Leadership', 'Technical', 'Core Value'];

export const DEFAULT_LEVEL_LABELS = ['Developing', 'Basic', 'Proficient', 'Advanced', 'Expert'];

export interface CompetencyLevel {
  level: number; // 1-5
  label: string;
  description: string;
}

export const buildDefaultLevels = (): CompetencyLevel[] =>
  DEFAULT_LEVEL_LABELS.map((label, idx) => ({ level: idx + 1, label, description: '' }));

// Proficiency level = capability/skill expectation at each level (1-5).
// This is intentionally kept separate from the 1-5 final performance rating
// used elsewhere in the PMS (Self/Manager/Final Review) — a rating is an
// overall judgement of performance; a level is a competency benchmark.
export interface CompetencyApplicability {
  scopes: TargetingScope[]; // multiple scopes can be selected together
  departments: string[];
  designations: string[];
  jobLevels: string[];
}

export const EMPTY_APPLICABILITY: CompetencyApplicability = {
  scopes: ['All Employees'],
  departments: [],
  designations: [],
  jobLevels: []
};

export interface SettingsCompetency {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'Active' | 'Inactive';
  usedInRoles: number;
  levels: CompetencyLevel[];
  applicability: CompetencyApplicability;
}

export const applicabilitySummary = (a: CompetencyApplicability): string => {
  if (!a || a.scopes.length === 0 || a.scopes.includes('All Employees')) return 'All Employees';
  const parts: string[] = [];
  if (a.scopes.includes('Specific Department') && a.departments.length > 0) parts.push(a.departments.join(', '));
  if (a.scopes.includes('Specific Designation') && a.designations.length > 0) parts.push(a.designations.join(', '));
  if ((a.scopes.includes('Specific Grade') || a.scopes.includes('Specific Job Level')) && a.jobLevels.length > 0) parts.push(a.jobLevels.join(', '));
  return parts.length > 0 ? parts.join(' • ') : 'All Employees';
};

export const MOCK_SETTINGS_COMPETENCIES: SettingsCompetency[] = [
  {
    id: 'cfg-comp-1',
    name: 'Customer Focus',
    description: 'Focuses on understanding and meeting customer needs.',
    category: 'Behavioral',
    status: 'Active',
    usedInRoles: 8,
    applicability: { scopes: ['All Employees'], departments: [], designations: [], jobLevels: [] },
    levels: [
      { level: 1, label: 'Developing', description: 'Needs guidance to recognize and respond to customer needs.' },
      { level: 2, label: 'Basic', description: 'Responds to routine customer requests with occasional support.' },
      { level: 3, label: 'Proficient', description: 'Consistently understands and meets customer needs independently.' },
      { level: 4, label: 'Advanced', description: 'Anticipates customer needs and proactively improves their experience.' },
      { level: 5, label: 'Expert', description: 'Shapes customer strategy and mentors others in customer-centric practice.' }
    ]
  },
  {
    id: 'cfg-comp-2',
    name: 'Communication',
    description: 'Communicates clearly with internal and external stakeholders.',
    category: 'Behavioral',
    status: 'Active',
    usedInRoles: 12,
    applicability: { scopes: ['All Employees'], departments: [], designations: [], jobLevels: [] },
    levels: [
      { level: 1, label: 'Developing', description: 'Requires significant support to communicate effectively.' },
      { level: 2, label: 'Basic', description: 'Communicates routine information clearly with some guidance.' },
      { level: 3, label: 'Proficient', description: 'Communicates clearly and effectively in normal work situations.' },
      { level: 4, label: 'Advanced', description: 'Adapts communication style to different audiences with confidence.' },
      { level: 5, label: 'Expert', description: 'Communicates complex ideas effectively and influences stakeholders.' }
    ]
  },
  {
    id: 'cfg-comp-3',
    name: 'Leadership',
    description: 'Leads teams and drives effective execution.',
    category: 'Leadership',
    status: 'Active',
    usedInRoles: 4,
    applicability: {
      scopes: ['Specific Designation', 'Specific Job Level'],
      departments: [],
      designations: ['Manager'],
      jobLevels: ['Manager']
    },
    levels: [
      { level: 1, label: 'Developing', description: 'Needs support to guide even small groups toward a goal.' },
      { level: 2, label: 'Basic', description: 'Leads day-to-day tasks for a small team with direction from above.' },
      { level: 3, label: 'Proficient', description: 'Leads a team reliably and drives execution against plans.' },
      { level: 4, label: 'Advanced', description: 'Inspires and aligns teams toward broader strategic goals.' },
      { level: 5, label: 'Expert', description: 'Shapes organizational direction and develops other leaders.' }
    ]
  },
  {
    id: 'cfg-comp-4',
    name: 'Problem Solving',
    description: 'Identifies issues and develops practical solutions.',
    category: 'Behavioral',
    status: 'Active',
    usedInRoles: 10,
    applicability: { scopes: ['All Employees'], departments: [], designations: [], jobLevels: [] },
    levels: [
      { level: 1, label: 'Developing', description: 'Needs guidance to identify the root cause of routine issues.' },
      { level: 2, label: 'Basic', description: 'Resolves familiar problems using established approaches.' },
      { level: 3, label: 'Proficient', description: 'Identifies issues and develops practical solutions independently.' },
      { level: 4, label: 'Advanced', description: 'Solves complex, ambiguous problems with limited precedent.' },
      { level: 5, label: 'Expert', description: 'Anticipates systemic issues and designs scalable solutions.' }
    ]
  },
  {
    id: 'cfg-comp-5',
    name: 'Technical Expertise',
    description: 'Demonstrates role-specific technical knowledge.',
    category: 'Functional',
    status: 'Active',
    usedInRoles: 6,
    applicability: {
      scopes: ['Specific Department', 'Specific Designation', 'Specific Job Level'],
      departments: ['Engineering'],
      designations: ['Software Engineer'],
      jobLevels: ['Individual Contributor']
    },
    levels: [
      { level: 1, label: 'Developing', description: 'Building foundational knowledge of core tools and systems.' },
      { level: 2, label: 'Basic', description: 'Applies role-specific knowledge to routine tasks with support.' },
      { level: 3, label: 'Proficient', description: 'Demonstrates solid role-specific technical knowledge day-to-day.' },
      { level: 4, label: 'Advanced', description: 'Solves difficult technical problems and reviews others’ work.' },
      { level: 5, label: 'Expert', description: 'Recognized technical authority who sets standards for the team.' }
    ]
  },
  {
    id: 'cfg-comp-6',
    name: 'Ownership',
    description: 'Takes personal accountability for goals and commitments.',
    category: 'Behavioral',
    status: 'Active',
    usedInRoles: 7,
    applicability: { scopes: ['All Employees'], departments: [], designations: [], jobLevels: [] },
    levels: [
      { level: 1, label: 'Developing', description: 'Needs reminders to follow through on commitments.' },
      { level: 2, label: 'Basic', description: 'Completes assigned tasks with occasional follow-up.' },
      { level: 3, label: 'Proficient', description: 'Takes personal accountability for goals and commitments.' },
      { level: 4, label: 'Advanced', description: 'Proactively owns outcomes beyond their direct responsibilities.' },
      { level: 5, label: 'Expert', description: 'Sets the standard for accountability and ownership across teams.' }
    ]
  },
  {
    id: 'cfg-comp-7',
    name: 'Collaboration',
    description: 'Works effectively across teams to achieve shared goals.',
    category: 'Behavioral',
    status: 'Active',
    usedInRoles: 5,
    applicability: {
      scopes: ['Specific Department'],
      departments: ['Engineering'],
      designations: [],
      jobLevels: []
    },
    levels: [
      { level: 1, label: 'Developing', description: 'Works well within their immediate team with guidance.' },
      { level: 2, label: 'Basic', description: 'Participates constructively in cross-team activities.' },
      { level: 3, label: 'Proficient', description: 'Works effectively across teams to achieve shared goals.' },
      { level: 4, label: 'Advanced', description: 'Builds strong cross-functional partnerships that unblock others.' },
      { level: 5, label: 'Expert', description: 'Drives org-wide collaboration and resolves cross-team conflict.' }
    ]
  },
  {
    id: 'cfg-comp-8',
    name: 'Team Development',
    description: 'Mentors staff and guides career growth paths.',
    category: 'Leadership',
    status: 'Active',
    usedInRoles: 4,
    applicability: {
      scopes: ['Specific Designation', 'Specific Job Level'],
      departments: [],
      designations: ['Manager'],
      jobLevels: ['Manager']
    },
    levels: [
      { level: 1, label: 'Developing', description: 'Provides basic feedback when prompted.' },
      { level: 2, label: 'Basic', description: 'Offers regular feedback and check-ins to direct reports.' },
      { level: 3, label: 'Proficient', description: 'Mentors staff and guides career growth paths effectively.' },
      { level: 4, label: 'Advanced', description: 'Builds development plans that grow future leaders.' },
      { level: 5, label: 'Expert', description: 'Builds a talent pipeline and coaches other managers on people growth.' }
    ]
  }
];

export interface CompetencyMapping {
  id: string;
  department: string;
  designation: string;
  jobLevel: string;
  competencyIds: string[];
  status: 'Active' | 'Inactive';
}

export const MOCK_COMPETENCY_MAPPINGS: CompetencyMapping[] = [
  {
    id: 'map-role-all',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    competencyIds: ['cfg-comp-1', 'cfg-comp-2'],
    status: 'Active'
  },
  {
    id: 'map-role-mgr-all',
    department: 'All',
    designation: 'All',
    jobLevel: 'Manager',
    competencyIds: ['cfg-comp-3', 'cfg-comp-8'],
    status: 'Active'
  },
  {
    id: 'map-role-1',
    department: 'Sales',
    designation: 'Sales Executive',
    jobLevel: 'Individual Contributor',
    competencyIds: ['cfg-comp-1', 'cfg-comp-2', 'cfg-comp-6'],
    status: 'Active'
  },
  {
    id: 'map-role-2',
    department: 'Sales',
    designation: 'Sales Manager',
    jobLevel: 'Manager',
    competencyIds: ['cfg-comp-3', 'cfg-comp-1', 'cfg-comp-2'],
    status: 'Active'
  },
  {
    id: 'map-role-3',
    department: 'Engineering',
    designation: 'Software Engineer',
    jobLevel: 'Individual Contributor',
    competencyIds: ['cfg-comp-5', 'cfg-comp-4', 'cfg-comp-7'],
    status: 'Active'
  },
  {
    id: 'map-role-4',
    department: 'Engineering',
    designation: 'Engineering Manager',
    jobLevel: 'Manager',
    competencyIds: ['cfg-comp-3', 'cfg-comp-5', 'cfg-comp-8'],
    status: 'Active'
  },
  {
    id: 'map-role-5',
    department: 'HR',
    designation: 'HR Executive',
    jobLevel: 'Individual Contributor',
    competencyIds: ['cfg-comp-2', 'cfg-comp-6', 'cfg-comp-4'],
    status: 'Active'
  }
];

/**
 * Frontend competency resolution lookup: collects competencies matching
 * department, designation, and job level (including "All" wildcards), as well as
 * company-wide global competencies.
 */
export const getCompetenciesForRole = (
  mappings: CompetencyMapping[],
  competencies: SettingsCompetency[],
  department: string,
  designation: string,
  jobLevel: string
): SettingsCompetency[] => {
  const norm = (v?: string) => (v || '').trim().toLowerCase();
  const isWildcard = (v?: string) => !v || norm(v) === 'all' || norm(v).startsWith('all ');

  const tDept = norm(department);
  const tDesig = norm(designation);
  const tLevel = norm(jobLevel);

  // Find all active mappings that match the target role (exact or wildcard)
  const matchedMappings = mappings.filter((m) => {
    if (m.status !== 'Active') return false;

    const mDept = norm(m.department);
    const mDesig = norm(m.designation);
    const mLevel = norm(m.jobLevel);

    const deptOk = isWildcard(mDept) || mDept === tDept;
    const desigOk = isWildcard(mDesig) || mDesig === tDesig;
    const levelOk = isWildcard(mLevel) || mLevel === tLevel;

    return deptOk && desigOk && levelOk;
  });

  // Collect all competency IDs from matched mappings
  const mappedCompetencyIds = new Set<string>();
  matchedMappings.forEach((m) => {
    m.competencyIds.forEach((id) => mappedCompetencyIds.add(id));
  });

  // Also include active competencies that apply to All Employees via scope
  const globalCompetencies = competencies.filter(
    (c) => c.status === 'Active' && c.applicability?.scopes?.includes('All Employees')
  );

  const resultSet = new Map<string, SettingsCompetency>();

  // Add global competencies first
  globalCompetencies.forEach((c) => resultSet.set(c.id, c));

  // Add mapped competencies
  mappedCompetencyIds.forEach((id) => {
    const comp = competencies.find((c) => c.id === id && c.status === 'Active');
    if (comp) {
      resultSet.set(comp.id, comp);
    }
  });

  return Array.from(resultSet.values());
};

// Question Templates reuse the exact same DynamicQuestion shape/rendering
// engine as Self Review and Manager Review (see reviewEngine.ts /
// DynamicQuestionField.tsx) — there is only ever one question architecture.
export type ReviewTypeOption = 'Self Review' | 'Manager Review' | 'Final Review';

export interface QuestionTemplate {
  id: string;
  name: string;
  reviewType: ReviewTypeOption;
  department: string; // 'All' or a specific department
  departments?: string[]; // array of selected departments for multi-select support
  designation: string; // 'All' or a specific designation
  jobLevel: string; // 'All' or a specific job level
  status: 'Active' | 'Inactive';
  questions: DynamicQuestion[];
}

let tplQuestionCounter = 0;
const tq = (
  text: string,
  type: QuestionType,
  category: QuestionCategory,
  required: boolean,
  extra?: Partial<DynamicQuestion>
): DynamicQuestion => ({
  id: `tpl-q-${++tplQuestionCounter}`,
  section: category === 'Goal' ? 'goals' : category === 'Competency' ? 'competency' : 'overall',
  question: text,
  type,
  required,
  category,
  ...extra
});

const DEFAULT_SELF_REVIEW_TEMPLATE_ID = 'cfg-tpl-default-self';
const DEFAULT_MANAGER_REVIEW_TEMPLATE_ID = 'cfg-tpl-default-manager';
const DEFAULT_FINAL_REVIEW_TEMPLATE_ID = 'cfg-tpl-default-final';

export const MOCK_QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'cfg-tpl-global-self',
    name: 'Company-Wide General Self Review',
    reviewType: 'Self Review',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    status: 'Active',
    questions: [
      tq('What are your key achievements during this Appraisal Cycle?', 'Long Text', 'General', true),
      tq('What challenges or blockers impacted your productivity?', 'Long Text', 'Self Assessment', true),
      tq('How effectively did you embody company core values?', 'Rating', 'Competency', true),
      tq('What support or development opportunities do you need next cycle?', 'Long Text', 'Development', false)
    ]
  },
  {
    id: 'cfg-tpl-global-manager',
    name: 'Company-Wide General Manager Review',
    reviewType: 'Manager Review',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    status: 'Active',
    questions: [
      tq('Key Strengths & High-Impact Contributions', 'Long Text', 'General', true),
      tq('Areas for Growth & Focus Points', 'Long Text', 'Development', true),
      tq('Overall Performance Rating', 'Rating', 'General', true),
      tq('Manager Summary', 'Long Text', 'General', true)
    ]
  },
  {
    id: 'cfg-tpl-1',
    name: 'Sales Executive Self Review',
    reviewType: 'Self Review',
    department: 'Sales',
    designation: 'Sales Executive',
    jobLevel: 'Individual Contributor',
    status: 'Active',
    questions: [
      tq('What were your key achievements this cycle?', 'Long Text', 'General', true),
      tq('How would you rate your communication?', 'Rating', 'Competency', true),
      tq('What challenges affected your performance?', 'Long Text', 'Self Assessment', true),
      tq('What skills would you like to improve?', 'Long Text', 'Development', true),
      tq('Did you meet your primary revenue goal this cycle?', 'Yes/No', 'Goal', true),
      tq('How would you rate your collaboration?', 'Single Select', 'Competency', true, {
        options: ['Needs Improvement', 'Meets Expectations', 'Exceeds Expectations']
      })
    ]
  },
  {
    id: 'cfg-tpl-1b',
    name: 'Sales Executive Manager Review',
    reviewType: 'Manager Review',
    department: 'Sales',
    designation: 'Sales Executive',
    jobLevel: 'Individual Contributor',
    status: 'Active',
    questions: [
      tq('Key Strengths', 'Long Text', 'General', true),
      tq('Areas for Improvement', 'Long Text', 'Development', true),
      tq('Manager Summary', 'Long Text', 'General', true),
      tq('Overall Performance Rating', 'Rating', 'General', true),
      tq('Would you recommend this employee for a merit increase?', 'Yes/No', 'General', false)
    ]
  },
  {
    id: 'cfg-tpl-2',
    name: 'Sales Manager Review',
    reviewType: 'Manager Review',
    department: 'Sales',
    designation: 'Sales Manager',
    jobLevel: 'Manager',
    status: 'Active',
    questions: [
      tq('Key Strengths', 'Long Text', 'General', true),
      tq('Areas for Improvement', 'Long Text', 'Development', true),
      tq('How would you rate their team leadership?', 'Rating', 'Competency', true),
      tq('Manager Summary', 'Long Text', 'General', true),
      tq('Overall Performance Rating', 'Rating', 'General', true)
    ]
  },
  {
    id: 'cfg-tpl-3',
    name: 'Engineering Self Review',
    reviewType: 'Self Review',
    department: 'Engineering',
    designation: 'Software Engineer',
    jobLevel: 'Individual Contributor',
    status: 'Active',
    questions: [
      tq('What were your key achievements this cycle?', 'Long Text', 'General', true),
      tq('How would you rate your code quality?', 'Rating', 'Competency', true),
      tq('What challenges affected your performance?', 'Long Text', 'Self Assessment', true),
      tq('What skills would you like to improve?', 'Long Text', 'Development', true),
      tq('What technical growth areas are you focused on?', 'Short Text', 'Development', false)
    ]
  },
  {
    id: 'cfg-tpl-4',
    name: 'Engineering Manager Review',
    reviewType: 'Manager Review',
    department: 'Engineering',
    designation: 'Engineering Manager',
    jobLevel: 'Manager',
    status: 'Active',
    questions: [
      tq('Key Strengths', 'Long Text', 'General', true),
      tq('Areas for Improvement', 'Long Text', 'Development', true),
      tq('Manager Summary', 'Long Text', 'General', true),
      tq('Overall Performance Rating', 'Rating', 'General', true),
      tq('Ready for tech lead responsibilities?', 'Yes/No', 'Development', false)
    ]
  },
  {
    id: 'cfg-tpl-5',
    name: 'HR Self Review',
    reviewType: 'Self Review',
    department: 'HR',
    designation: 'HR Executive',
    jobLevel: 'Individual Contributor',
    status: 'Active',
    questions: [
      tq('What were your key achievements this cycle?', 'Long Text', 'General', true),
      tq('How would you rate your stakeholder communication?', 'Rating', 'Competency', true),
      tq('What challenges affected your performance?', 'Long Text', 'Self Assessment', true),
      tq('What skills would you like to improve?', 'Long Text', 'Development', true)
    ]
  },
  {
    id: 'cfg-tpl-6',
    name: 'HR Manager Review',
    reviewType: 'Manager Review',
    department: 'HR',
    designation: 'HR Executive',
    jobLevel: 'Individual Contributor',
    status: 'Active',
    questions: [
      tq('Key Strengths', 'Long Text', 'General', true),
      tq('Areas for Improvement', 'Long Text', 'Development', true),
      tq('Manager Summary', 'Long Text', 'General', true),
      tq('Overall Performance Rating', 'Rating', 'General', true)
    ]
  },
  {
    id: DEFAULT_SELF_REVIEW_TEMPLATE_ID,
    name: 'Default Self Review',
    reviewType: 'Self Review',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    status: 'Active',
    questions: MOCK_OVERALL_QUESTIONS.map((q) => ({ ...q, category: 'General' as QuestionCategory }))
  },
  {
    id: DEFAULT_MANAGER_REVIEW_TEMPLATE_ID,
    name: 'Default Manager Review',
    reviewType: 'Manager Review',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    status: 'Active',
    questions: MANAGER_OVERALL_QUESTIONS.map((q) => ({ ...q, category: 'General' as QuestionCategory }))
  },
  {
    id: DEFAULT_FINAL_REVIEW_TEMPLATE_ID,
    name: 'Default Final Review',
    reviewType: 'Final Review',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    status: 'Active',
    questions: [
      tq('Overall Performance Rating', 'Rating', 'General', true),
      tq('Final Reviewer Comments', 'Long Text', 'General', true),
      tq('Development Recommendations', 'Long Text', 'Development', false),
      tq('Next Cycle Focus Areas', 'Long Text', 'General', false)
    ]
  }
];

export const DEFAULT_TEMPLATE_IDS: Record<ReviewTypeOption, string> = {
  'Self Review': DEFAULT_SELF_REVIEW_TEMPLATE_ID,
  'Manager Review': DEFAULT_MANAGER_REVIEW_TEMPLATE_ID,
  'Final Review': DEFAULT_FINAL_REVIEW_TEMPLATE_ID
};

export interface QuestionMapping {
  id: string;
  department: string;
  designation: string;
  jobLevel: string;
  selfReviewTemplateId: string | null;
  managerReviewTemplateId: string | null;
  finalReviewTemplateId: string | null;
  status: 'Active' | 'Inactive';
}

export const MOCK_QUESTION_MAPPINGS: QuestionMapping[] = [
  {
    id: 'qmap-global',
    department: 'All',
    designation: 'All',
    jobLevel: 'All',
    selfReviewTemplateId: 'cfg-tpl-global-self',
    managerReviewTemplateId: 'cfg-tpl-global-manager',
    finalReviewTemplateId: DEFAULT_FINAL_REVIEW_TEMPLATE_ID,
    status: 'Active'
  },
  {
    id: 'qmap-1',
    department: 'Sales',
    designation: 'Sales Executive',
    jobLevel: 'Individual Contributor',
    selfReviewTemplateId: 'cfg-tpl-1',
    managerReviewTemplateId: 'cfg-tpl-1b',
    finalReviewTemplateId: DEFAULT_FINAL_REVIEW_TEMPLATE_ID,
    status: 'Active'
  },
  {
    id: 'qmap-2',
    department: 'Engineering',
    designation: 'Software Engineer',
    jobLevel: 'Individual Contributor',
    selfReviewTemplateId: 'cfg-tpl-3',
    managerReviewTemplateId: 'cfg-tpl-4',
    finalReviewTemplateId: DEFAULT_FINAL_REVIEW_TEMPLATE_ID,
    status: 'Active'
  },
  {
    id: 'qmap-3',
    department: 'HR',
    designation: 'HR Executive',
    jobLevel: 'Individual Contributor',
    selfReviewTemplateId: 'cfg-tpl-5',
    managerReviewTemplateId: 'cfg-tpl-6',
    finalReviewTemplateId: DEFAULT_FINAL_REVIEW_TEMPLATE_ID,
    status: 'Active'
  }
];

/**
 * Question Selection Priority: Specific Role Configuration (exact
 * department + designation + job level) → Designation Configuration →
 * Department Configuration → Company Default. The most specific active
 * mapping wins. Simple frontend-only lookup, no calibration/rule engine.
 */
export const getTemplateIdForRole = (
  mappings: QuestionMapping[],
  department: string,
  designation: string,
  jobLevel: string,
  reviewType: ReviewTypeOption
): string => {
  const active = mappings.filter((m) => m.status === 'Active');
  const fieldFor = (m: QuestionMapping) =>
    reviewType === 'Self Review'
      ? m.selfReviewTemplateId
      : reviewType === 'Manager Review'
      ? m.managerReviewTemplateId
      : m.finalReviewTemplateId;

  const matched = active
    .map((m) => {
      const match = calculateRoleMatchScore(
        m.department,
        m.designation,
        m.jobLevel,
        department,
        designation,
        jobLevel
      );
      return { mapping: m, templateId: fieldFor(m), ...match };
    })
    .filter((res) => res.isMatch && !!res.templateId);

  // Highest specificity score wins
  matched.sort((a, b) => b.score - a.score);

  if (matched.length > 0) return matched[0].templateId!;

  return DEFAULT_TEMPLATE_IDS[reviewType];
};

/**
 * Resolves questions for an employee role using generalized hierarchical wildcard matching.
 * Checks active templates directly by specificity score, falling back to Question Mapping rows if needed.
 */
export const getQuestionsForRole = (
  mappings: QuestionMapping[],
  templates: QuestionTemplate[],
  department: string,
  designation: string,
  jobLevel: string,
  reviewType: ReviewTypeOption
): DynamicQuestion[] => {
  // 1. Direct active QuestionTemplate hierarchical lookup
  const activeTemplates = templates.filter((t) => t.status === 'Active' && t.reviewType === reviewType);

  const matchedTemplates = activeTemplates
    .map((t) => {
      const match = calculateRoleMatchScore(
        t.department,
        t.designation,
        t.jobLevel,
        department,
        designation,
        jobLevel
      );
      return { template: t, ...match };
    })
    .filter((res) => res.isMatch);

  // Highest specificity score wins
  matchedTemplates.sort((a, b) => b.score - a.score);

  if (matchedTemplates.length > 0) {
    const primaryTemplate = matchedTemplates[0].template;

    // Check if there's a global base template ('All'/'All'/'All') to merge general questions from
    const globalTemplate = activeTemplates.find(
      (t) =>
        (!t.department || t.department === 'All') &&
        (!t.designation || t.designation === 'All') &&
        (!t.jobLevel || t.jobLevel === 'All') &&
        t.id !== primaryTemplate.id
    );

    if (globalTemplate && globalTemplate.questions.length > 0) {
      const primaryQTexts = new Set(primaryTemplate.questions.map((q) => q.question.toLowerCase().trim()));
      const extraGlobalQs = globalTemplate.questions.filter((q) => !primaryQTexts.has(q.question.toLowerCase().trim()));
      return [...primaryTemplate.questions, ...extraGlobalQs];
    }

    return primaryTemplate.questions;
  }

  // 2. QuestionMapping fallback
  const templateId = getTemplateIdForRole(mappings, department, designation, jobLevel, reviewType);
  const template = templates.find((t) => t.id === templateId && t.status === 'Active');
  return template ? template.questions : [];
};

export const applicableToChain = (t: { department: string; designation: string; jobLevel: string }): string => {
  const isAllDept = !t.department || t.department === 'All';
  const isAllDesig = !t.designation || t.designation === 'All';
  const isAllLevel = !t.jobLevel || t.jobLevel === 'All';

  if (isAllDept && isAllDesig && isAllLevel) return 'All Employees (Company-Wide)';
  if (!isAllDept && isAllDesig && isAllLevel) return `${t.department} Department (All Roles)`;
  if (isAllDept && isAllDesig && !isAllLevel) return `All ${t.jobLevel}s (Company-Wide)`;

  return [t.department, t.designation, t.jobLevel].filter((v) => v && v !== 'All').join(' → ') || 'All Employees';
};

export interface RatingLabelConfig {
  value: number;
  label: string;
}

export const DEFAULT_RATING_LABELS: RatingLabelConfig[] = [
  { value: 1, label: 'Needs Significant Improvement' },
  { value: 2, label: 'Needs Improvement' },
  { value: 3, label: 'Meets Expectations' },
  { value: 4, label: 'Exceeds Expectations' },
  { value: 5, label: 'Exceptional' }
];

export interface FinalRatingMappingRow {
  id: string;
  minScore: number;
  maxScore: number;
  label: string;
  description: string;
}

export const DEFAULT_FINAL_RATING_MAPPING: FinalRatingMappingRow[] = [
  { id: 'map-1', minScore: 1.0, maxScore: 1.9, label: 'Needs Significant Improvement', description: 'Performance requires significant improvement.' },
  { id: 'map-2', minScore: 2.0, maxScore: 2.9, label: 'Needs Improvement', description: 'Performance is below expectations.' },
  { id: 'map-3', minScore: 3.0, maxScore: 3.9, label: 'Meets Expectations', description: 'Performance meets role expectations.' },
  { id: 'map-4', minScore: 4.0, maxScore: 4.4, label: 'Exceeds Expectations', description: 'Performance exceeds expectations.' },
  { id: 'map-5', minScore: 4.5, maxScore: 5.0, label: 'Exceptional', description: 'Performance is exceptional.' }
];

export interface ReviewStageConfig {
  id: 'self-review' | 'manager-review' | 'final-review';
  name: string;
  required: boolean;
  enabled: boolean;
}

export const stagesFromReviewFlow = (flow: ReviewFlowOption): ReviewStageConfig[] => {
  const hasSelf = reviewFlowIncludesSelf(flow);
  const hasAdmin = reviewFlowIncludesAdmin(flow);
  return [
    { id: 'self-review', name: 'Self Review', required: hasSelf, enabled: hasSelf },
    { id: 'manager-review', name: 'Manager Review', required: true, enabled: true },
    { id: 'final-review', name: 'Admin Review', required: hasAdmin, enabled: hasAdmin }
  ];
};

export const DEFAULT_REVIEW_STAGES: ReviewStageConfig[] = stagesFromReviewFlow('self_manager_admin');

export const reviewFlowFromStages = (stages: ReviewStageConfig[]): ReviewFlowOption => {
  const selfOn = stages.find((s) => s.id === 'self-review')?.enabled ?? false;
  const adminOn = stages.find((s) => s.id === 'final-review')?.enabled ?? false;
  if (selfOn && adminOn) return 'self_manager_admin';
  if (!selfOn && adminOn) return 'manager_admin';
  return 'manager_only';
};

export interface EmployeeVisibilitySettings {
  showFinalRating: boolean;
  showFinalScore: boolean;
  showManagerComments: boolean;
  showCompetencyScores: boolean;
}

export const DEFAULT_EMPLOYEE_VISIBILITY: EmployeeVisibilitySettings = {
  showFinalRating: true,
  showFinalScore: true,
  showManagerComments: true,
  showCompetencyScores: true
};

export interface ReviewDeadlineSettings {
  selfReviewDays: number;
  managerReviewDays: number;
  finalReviewDays: number;
}

export const DEFAULT_REVIEW_DEADLINES: ReviewDeadlineSettings = {
  selfReviewDays: 7,
  managerReviewDays: 7,
  finalReviewDays: 5
};

/**
 * Performance weightage (Goals vs. Competencies weightage) is managed per cycle in Appraisal Cycles, not in global settings.
 */
export interface ReviewRatingSettings {
  mapping: FinalRatingMappingRow[];
  employeeVisibility: EmployeeVisibilitySettings;
  deadlines: ReviewDeadlineSettings;
}

export const DEFAULT_REVIEW_RATING_SETTINGS: ReviewRatingSettings = {
  mapping: DEFAULT_FINAL_RATING_MAPPING,
  employeeVisibility: DEFAULT_EMPLOYEE_VISIBILITY,
  deadlines: DEFAULT_REVIEW_DEADLINES
};


/** Finds which mapping row a score falls into, for the Rating Preview section. */
export const resolveRatingForScore = (score: number, mapping: FinalRatingMappingRow[]): FinalRatingMappingRow | undefined =>
  mapping.find((m) => score >= m.minScore && score <= m.maxScore);
