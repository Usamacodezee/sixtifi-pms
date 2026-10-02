import { PerformanceCycle } from '../types/performance';

export const MOCK_PERFORMANCE_CYCLES: PerformanceCycle[] = [
  {
    id: 'cycle-1',
    name: 'FY 2026–27 Annual Performance Review',
    type: 'Annual',
    startDate: '01 Apr 2026',
    endDate: '31 Mar 2027',
    duration: '01 Apr 2026 – 31 Mar 2027',
    employeesCount: 248,
    reviewProgress: 68,
    status: 'Active',
    reviewFlow: 'self_manager_admin',
    goalsWeightage: 70,
    competenciesWeightage: 30,
    minGoalsPerEmployee: 3,
    maxGoalsPerEmployee: 8,
    requireGoalApproval: true,
    allowEmployeeGoalUpdates: true,
    sendProgressReminders: true,
    showFinalRatingToEmployee: true
  },
  {
    id: 'cycle-sales-eng',
    name: 'Q3 Sales & Engineering Target Review',
    type: 'Quarterly',
    startDate: '01 Jul 2026',
    endDate: '30 Sep 2026',
    duration: '01 Jul 2026 – 30 Sep 2026',
    employeesCount: 100,
    reviewProgress: 42,
    status: 'Active',
    reviewFlow: 'self_manager_admin',
    goalsWeightage: 80,
    competenciesWeightage: 20,
    minGoalsPerEmployee: 2,
    maxGoalsPerEmployee: 6,
    requireGoalApproval: true,
    allowEmployeeGoalUpdates: true,
    sendProgressReminders: true,
    showFinalRatingToEmployee: true
  },
  {
    id: 'cycle-2',
    name: 'H1 2026 Performance Review',
    type: 'Half-Yearly',
    startDate: '01 Jan 2026',
    endDate: '30 Jun 2026',
    duration: '01 Jan 2026 – 30 Jun 2026',
    employeesCount: 212,
    reviewProgress: 100,
    status: 'Completed',
    reviewFlow: 'manager_admin'
  },
  {
    id: 'cycle-3',
    name: 'Q4 2025 Performance Review',
    type: 'Quarterly',
    startDate: '01 Oct 2025',
    endDate: '31 Dec 2025',
    duration: '01 Oct 2025 – 31 Dec 2025',
    employeesCount: 198,
    reviewProgress: 100,
    status: 'Completed',
    reviewFlow: 'manager_only'
  },
  {
    id: 'cycle-4',
    name: 'FY 2025–26 Annual Performance Review',
    type: 'Annual',
    startDate: '01 Apr 2025',
    endDate: '31 Mar 2026',
    duration: '01 Apr 2025 – 31 Mar 2026',
    employeesCount: 235,
    reviewProgress: 100,
    status: 'Completed',
    reviewFlow: 'self_manager_admin'
  },
  {
    id: 'cycle-5',
    name: 'Q3 2026 Performance Review',
    type: 'Quarterly',
    startDate: '01 Jul 2026',
    endDate: '30 Sep 2026',
    duration: '01 Jul 2026 – 30 Sep 2026',
    employeesCount: 0,
    reviewProgress: 0,
    status: 'Draft',
    reviewFlow: 'self_manager_admin'
  }
];

export const CYCLES_SUMMARY_METRICS = {
  totalCycles: 8,
  active: 2,
  draft: 1,
  completed: 5
};
