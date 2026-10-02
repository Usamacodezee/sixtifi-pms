import { CycleGoalItem } from '../types/performance';

export const MOCK_CYCLE_GOALS: CycleGoalItem[] = [
  {
    id: 'goal-1',
    title: 'Increase Sales Revenue',
    description: 'Accelerate quarterly recurring revenue across corporate accounts in Western region.',
    employeeId: 'emp-1',
    employeeName: 'Rahul Shah',
    employeeCode: 'EMP-1001',
    department: 'Sales',
    manager: 'Vikram Patel',
    initials: 'RS',
    avatarBg: '#E0F2FE',
    target: '₹1 Crore',
    currentAchievement: '₹82 Lakh',
    progress: 82,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '15 Sep 2026',
    status: 'On Track',
    managerComment: 'Good progress. Focus on improving enterprise client conversion during the remaining period.',
    history: [
      {
        date: '15 Sep 2026',
        previousPercent: 75,
        newPercent: 82,
        comment: 'Closed Q2 corporate account renewals.',
        updatedBy: 'Rahul Shah'
      },
      {
        date: '15 Aug 2026',
        previousPercent: 60,
        newPercent: 75,
        comment: 'Mid-quarter pipeline conversion closed 3 major clients.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'goal-2',
    title: 'Improve Client Retention',
    description: 'Maintain renewal rates above 90% through proactive customer success checkpoints.',
    employeeId: 'emp-1',
    employeeName: 'Rahul Shah',
    employeeCode: 'EMP-1001',
    department: 'Sales',
    manager: 'Vikram Patel',
    initials: 'RS',
    avatarBg: '#E0F2FE',
    target: '90%',
    currentAchievement: '75%',
    progress: 75,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    managerComment: 'Customer engagement has improved; keep monitoring high-value clients.',
    history: [
      {
        date: '20 Sep 2026',
        previousPercent: 65,
        newPercent: 75,
        comment: 'Renewed 12 key enterprise contracts ahead of deadline.',
        updatedBy: 'Rahul Shah'
      }
    ]
  },
  {
    id: 'goal-3',
    title: 'New Customer Acquisition',
    description: 'Partner with product teams to onboard 20 tier-1 beta customers for new platform features.',
    employeeId: 'emp-2',
    employeeName: 'Priya Patel',
    employeeCode: 'EMP-1002',
    department: 'Engineering',
    manager: 'Ankit Mehta',
    initials: 'PP',
    avatarBg: '#ECFDF5',
    target: '20 Accounts',
    currentAchievement: '11 Accounts',
    progress: 55,
    weight: 20,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    managerComment: 'Beta recruitment is slowing down. We need direct outreach assistance from Marketing.',
    history: [
      {
        date: '10 Sep 2026',
        previousPercent: 45,
        newPercent: 55,
        comment: 'Onboarded 2 additional fintech beta customers.',
        updatedBy: 'Priya Patel'
      }
    ]
  },
  {
    id: 'goal-4',
    title: 'Improve Team Productivity',
    description: 'Streamline customer fulfillment ticket resolution speed across operational dispatch units.',
    employeeId: 'emp-3',
    employeeName: 'Amit Kumar',
    employeeCode: 'EMP-1003',
    department: 'Operations',
    manager: 'Rajesh Shah',
    initials: 'AK',
    avatarBg: '#FEF3C7',
    target: '95%',
    currentAchievement: '42%',
    progress: 42,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '31 Aug 2026',
    status: 'Needs Attention',
    managerComment: 'Turnaround time has lagged this quarter due to dispatch system migration. Action plan needed.',
    history: [
      {
        date: '31 Aug 2026',
        previousPercent: 35,
        newPercent: 42,
        comment: 'Standardized tier-1 dispatch SOP across shifts.',
        updatedBy: 'Amit Kumar'
      }
    ]
  },
  {
    id: 'goal-5',
    title: 'Complete Leadership Development',
    description: 'Undergo executive coaching modules and obtain organizational leadership certification.',
    employeeId: 'emp-4',
    employeeName: 'Neha Mehta',
    employeeCode: 'EMP-1004',
    department: 'HR',
    manager: 'Rahul Shah',
    initials: 'NM',
    avatarBg: '#F5F3FF',
    target: '100%',
    currentAchievement: '90%',
    progress: 90,
    weight: 15,
    startDate: '01 Apr 2026',
    dueDate: '30 Jun 2026',
    status: 'On Track',
    managerComment: 'Excellent execution on leadership workshops and peer mentoring.',
    history: [
      {
        date: '30 Jun 2026',
        previousPercent: 70,
        newPercent: 90,
        comment: 'Completed final capstone presentation.',
        updatedBy: 'Neha Mehta'
      }
    ]
  },
  {
    id: 'goal-6',
    title: 'Enterprise Client Expansion',
    description: 'Expand upsell contracts and cross-tier service packages within Fortune 500 accounts.',
    employeeId: 'emp-5',
    employeeName: 'Karan Desai',
    employeeCode: 'EMP-1005',
    department: 'Sales',
    manager: 'Vikram Patel',
    initials: 'KD',
    avatarBg: '#FEE2E2',
    target: '15 Accounts',
    currentAchievement: '6 Accounts',
    progress: 40,
    weight: 35,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'At Risk',
    managerComment: 'Enterprise budgets have been delayed; require executive sponsor alignment.',
    history: [
      {
        date: '12 Sep 2026',
        previousPercent: 30,
        newPercent: 40,
        comment: 'Negotiated renewal expansion for 2 accounts.',
        updatedBy: 'Karan Desai'
      }
    ]
  },
  {
    id: 'goal-7',
    title: 'Financial Audit Compliance',
    description: 'Deliver flawless year-end statutory audit reconciliations with 0 non-compliance flags.',
    employeeId: 'emp-6',
    employeeName: 'Sneha Verma',
    employeeCode: 'EMP-1006',
    department: 'Finance',
    manager: 'Rajesh Shah',
    initials: 'SV',
    avatarBg: '#ECFDF5',
    target: '100%',
    currentAchievement: '100%',
    progress: 100,
    weight: 25,
    startDate: '01 Apr 2026',
    dueDate: '15 Jul 2026',
    status: 'Completed',
    managerComment: 'Outstanding precision and timely closure of external audit requirements.',
    history: [
      {
        date: '15 Jul 2026',
        previousPercent: 85,
        newPercent: 100,
        comment: 'Audit clearance received from external auditor.',
        updatedBy: 'Sneha Verma'
      }
    ]
  },
  {
    id: 'goal-8',
    title: 'Quarterly Territory Revenue',
    description: 'Achieve direct territory quota targets for FY 2026–27 in Northern regions.',
    employeeId: 'emp-7',
    employeeName: 'Vikram Malhotra',
    employeeCode: 'EMP-1007',
    department: 'Sales',
    manager: 'Vikram Patel',
    initials: 'VM',
    avatarBg: '#E0F2FE',
    target: '₹1.5 Crore',
    currentAchievement: '₹1.42 Crore',
    progress: 95,
    weight: 40,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'On Track',
    managerComment: 'Consistent performance; well on track to exceed the annual quota.',
    history: [
      {
        date: '28 Sep 2026',
        previousPercent: 88,
        newPercent: 95,
        comment: 'Closed Q2 mid-tier enterprise deals.',
        updatedBy: 'Vikram Malhotra'
      }
    ]
  },
  {
    id: 'goal-9',
    title: 'Content Marketing ROI',
    description: 'Generate 50,000 qualified inbound leads via SEO content campaigns and webinars.',
    employeeId: 'emp-8',
    employeeName: 'Ananya Das',
    employeeCode: 'EMP-1008',
    department: 'Marketing',
    manager: 'Rahul Shah',
    initials: 'AD',
    avatarBg: '#F5F3FF',
    target: '50K Leads',
    currentAchievement: '26K Leads',
    progress: 52,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '15 Aug 2026',
    status: 'At Risk',
    managerComment: 'Search algorithm changes impacted organic traffic. Shift budget to targeted paid webinars.',
    history: [
      {
        date: '15 Aug 2026',
        previousPercent: 40,
        newPercent: 52,
        comment: 'Launched Q2 lead-gen webinar series.',
        updatedBy: 'Ananya Das'
      }
    ]
  },
  {
    id: 'goal-10',
    title: 'Core API Latency Optimization',
    description: 'Refactor database query indexing to achieve sub-120ms P95 API response times.',
    employeeId: 'emp-10',
    employeeName: 'Pooja Nair',
    employeeCode: 'EMP-1010',
    department: 'Engineering',
    manager: 'Ankit Mehta',
    initials: 'PN',
    avatarBg: '#FEE2E2',
    target: '< 120ms',
    currentAchievement: '185ms',
    progress: 38,
    weight: 30,
    startDate: '01 Apr 2026',
    dueDate: '31 Mar 2027',
    status: 'Needs Attention',
    managerComment: 'Query caching is proving complex on legacy tables. Allocated senior backend engineer to assist.',
    history: [
      {
        date: '08 Sep 2026',
        previousPercent: 25,
        newPercent: 38,
        comment: 'Optimized user session authentication middleware.',
        updatedBy: 'Pooja Nair'
      }
    ]
  }
];

export const CYCLE_GOALS_SUMMARY = {
  totalGoals: 1124,
  onTrack: 786,
  atRisk: 214,
  needsAttention: 124,
  distribution: {
    onTrackPercent: 70,
    atRiskPercent: 19,
    needsAttentionPercent: 11
  }
};
