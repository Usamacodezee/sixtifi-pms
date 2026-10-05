import { GoalStatus, GoalProgressHistoryItem } from '../types/performance';

export interface MyGoalItem {
  id: string;
  /** Owning company — Goals module is always company-scoped. */
  companyId?: string;
  /** Performance cycle ID & Name for cycle identification. */
  cycleId?: string;
  cycleName?: string;
  title: string;
  description: string;
  target: string;
  currentAchievement: string;
  progress: number;
  weight: number;
  startDate: string;
  dueDate: string;
  status: GoalStatus;
  manager: string;
  managerRole?: string;
  managerComment?: string;
  evidencePlaceholder?: string;
  history: GoalProgressHistoryItem[];
}

export const calculateGoalStatus = (progress: number): GoalStatus => {
  if (progress >= 100) return 'Completed';
  if (progress >= 70) return 'On Track';
  if (progress >= 50) return 'At Risk';
  return 'Needs Attention';
};

export const MOCK_MY_GOALS: MyGoalItem[] = [
  {
    id: 'my-goal-1',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-1',
    cycleName: 'FY 2026–27 Annual Performance Review',
    title: 'Increase Sales Revenue',
    description: 'Accelerate quarterly recurring revenue across corporate accounts in Western region through upselling and expansion.',
    target: '₹1 Crore',
    currentAchievement: '₹82 Lakh',
    progress: 82,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '15 Sep 2026',
    status: 'On Track',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Strong Q3 momentum. Keep driving enterprise client conversion during the remaining quarter.',
    evidencePlaceholder: 'Q3_Western_Region_Sales_Report.pdf',
    history: [
      {
        date: '15 Sep 2026',
        previousPercent: 75,
        newPercent: 82,
        comment: 'Closed Q2 corporate renewals.',
        updatedBy: 'Rahul Shah'
      },
      {
        date: '15 Aug 2026',
        previousPercent: 60,
        newPercent: 75,
        comment: 'Mid-quarter pipeline conversion closed 2 major corporate accounts.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'my-goal-2',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-1',
    cycleName: 'FY 2026–27 Annual Performance Review',
    title: 'Improve Client Retention',
    description: 'Maintain renewal rates above 90% through proactive customer success checkpoints and quarterly business reviews.',
    target: '90%',
    currentAchievement: '75%',
    progress: 75,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Customer engagement has improved significantly; keep monitoring key high-value accounts.',
    evidencePlaceholder: 'Q3_Client_Health_Scorecard.xlsx',
    history: [
      {
        date: '20 Sep 2026',
        previousPercent: 65,
        newPercent: 75,
        comment: 'Renewed 12 key enterprise contracts ahead of annual deadline.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'my-goal-3',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-sales-eng',
    cycleName: 'Q3 Sales & Engineering Target Review',
    title: 'New Customer Acquisition',
    description: 'Partner with inbound marketing and partner channels to acquire 20 new enterprise tier-1 customers.',
    target: '20',
    currentAchievement: '11 Customers',
    progress: 55,
    weight: 20,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Acquisition velocity is lagging slightly this quarter. Let us review the outbound demo strategy with marketing.',
    evidencePlaceholder: 'Tier1_Acquisition_Pipeline.pdf',
    history: [
      {
        date: '10 Sep 2026',
        previousPercent: 45,
        newPercent: 55,
        comment: 'Onboarded 2 additional fintech beta clients into tier-1 pilot.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'my-goal-4',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-1',
    cycleName: 'FY 2026–27 Annual Performance Review',
    title: 'Product Knowledge Improvement',
    description: 'Complete advanced certification in platform architecture, cloud workflows, and technical demo presentation.',
    target: '100%',
    currentAchievement: '90%',
    progress: 90,
    weight: 15,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Excellent execution on technical certifications and lead architecture training.',
    evidencePlaceholder: 'Sixtifi_Architect_Certification.pdf',
    history: [
      {
        date: '25 Sep 2026',
        previousPercent: 70,
        newPercent: 90,
        comment: 'Passed Level 3 Enterprise Demo Certification with distinction.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'my-goal-5',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-2',
    cycleName: 'H1 2026 Performance Review',
    title: 'Key Account Satisfaction & NPS',
    description: 'Elevate Net Promoter Score across dedicated strategic portfolio clients above 75 points.',
    target: '75 NPS',
    currentAchievement: '78 NPS',
    progress: 100,
    weight: 10,
    startDate: '01 Apr 2026',
    dueDate: '15 Jul 2026',
    status: 'Completed',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Exceptional NPS milestone achieved across top 5 strategic accounts. Goal fully completed!',
    evidencePlaceholder: 'Annual_NPS_Survey_Results.pdf',
    history: [
      {
        date: '15 Jul 2026',
        previousPercent: 80,
        newPercent: 100,
        comment: 'Annual client survey closed with average NPS of 78.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'my-goal-6',
    companyId: 'co-sixtifi',
    cycleId: 'cycle-1',
    cycleName: 'FY 2026–27 Annual Performance Review',
    title: 'Cross-functional Collaboration & Enablement',
    description: 'Deliver 12 internal enablement sessions and mentor junior account executives on enterprise deals.',
    target: '12 Sessions',
    currentAchievement: '10 Sessions',
    progress: 85,
    weight: 10,
    startDate: '01 Apr 2026',
    dueDate: '31 Aug 2026',
    status: 'On Track',
    manager: 'Vikram Patel',
    managerRole: 'VP of Sales',
    managerComment: 'Great peer feedback on mentoring and sales enablement workshops.',
    evidencePlaceholder: 'Sales_Workshop_Signoff.pdf',
    history: [
      {
        date: '31 Aug 2026',
        previousPercent: 65,
        newPercent: 85,
        comment: 'Conducted sales pitch coaching sessions for new reps.',
        updatedBy: 'Rahul Shah'
      }
    ]
  }
];
