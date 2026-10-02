/** Demo seed data for Reviews, KRAs, and KPIs. */

export interface KraItem {
  id: string;
  name: string;
  code: string;
  department: string;
  departments?: string[];
  description: string;
  linkedKpis: number;
  weightHint: number;
  status: 'Active' | 'Draft' | 'Archived';
}

export interface KpiItem {
  id: string;
  name: string;
  code: string;
  kraId: string;
  kraName: string;
  unit: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  direction: 'Higher is better' | 'Lower is better' | 'Target band';
  status: 'Active' | 'Draft' | 'Archived';
}

export const MOCK_KRAS: KraItem[] = [
  {
    id: 'kra-1',
    name: 'Revenue Growth',
    code: 'KRA-REV',
    department: 'Sales, Marketing',
    departments: ['Sales', 'Marketing'],
    description: 'Drive top-line growth across enterprise and mid-market segments.',
    linkedKpis: 3,
    weightHint: 30,
    status: 'Active'
  },
  {
    id: 'kra-2',
    name: 'Product Delivery Excellence',
    code: 'KRA-PDE',
    department: 'Engineering, Operations',
    departments: ['Engineering', 'Operations'],
    description: 'Ship reliable releases on schedule with high quality.',
    linkedKpis: 4,
    weightHint: 35,
    status: 'Active'
  },
  {
    id: 'kra-3',
    name: 'Customer Retention',
    code: 'KRA-RET',
    department: 'Customer Success, Sales',
    departments: ['Customer Success', 'Sales'],
    description: 'Protect NRR and reduce churn in strategic accounts.',
    linkedKpis: 2,
    weightHint: 25,
    status: 'Active'
  },
  {
    id: 'kra-4',
    name: 'People Leadership',
    code: 'KRA-PL',
    department: 'All',
    departments: ['All'],
    description: 'Build team capability, engagement, and succession depth.',
    linkedKpis: 2,
    weightHint: 20,
    status: 'Draft'
  }
];

export type KraStatus = KraItem['status'];
export type KpiFrequency = KpiItem['frequency'];
export type KpiDirection = KpiItem['direction'];
export type KpiStatus = KpiItem['status'];

export const KRA_STATUSES: KraStatus[] = ['Active', 'Draft', 'Archived'];
export const KPI_FREQUENCIES: KpiFrequency[] = ['Monthly', 'Quarterly', 'Annual'];
export const KPI_DIRECTIONS: KpiDirection[] = [
  'Higher is better',
  'Lower is better',
  'Target band'
];
export const KPI_STATUSES: KpiStatus[] = ['Active', 'Draft', 'Archived'];
export const KPI_UNITS: string[] = [
  '%',
  'Count',
  '₹ Crore',
  'USD',
  'Score / 5',
  'Score / 10',
  'Number',
  'Days',
  'Hours'
];

export const KRA_DEPARTMENT_OPTIONS = [
  'All',
  'Sales',
  'Engineering',
  'Customer Success',
  'Operations',
  'HR',
  'Finance',
  'Marketing'
];

export const countMetricsForKra = (metrics: KpiItem[], kraId: string): number =>
  metrics.filter((m) => m.kraId === kraId).length;

/** Keep Result Area linked-metric counts in sync with Metrics list. */
export const withLinkedMetricCounts = (kras: KraItem[], metrics: KpiItem[]): KraItem[] =>
  kras.map((k) => ({ ...k, linkedKpis: countMetricsForKra(metrics, k.id) }));

export const MOCK_KPIS: KpiItem[] = [
  {
    id: 'kpi-1',
    name: 'New ARR',
    code: 'KPI-ARR',
    kraId: 'kra-1',
    kraName: 'Revenue Growth',
    unit: '₹ Crore',
    frequency: 'Quarterly',
    direction: 'Higher is better',
    status: 'Active'
  },
  {
    id: 'kpi-2',
    name: 'Win Rate',
    code: 'KPI-WIN',
    kraId: 'kra-1',
    kraName: 'Revenue Growth',
    unit: '%',
    frequency: 'Monthly',
    direction: 'Higher is better',
    status: 'Active'
  },
  {
    id: 'kpi-3',
    name: 'Sprint Predictability',
    code: 'KPI-SPR',
    kraId: 'kra-2',
    kraName: 'Product Delivery Excellence',
    unit: '%',
    frequency: 'Monthly',
    direction: 'Target band',
    status: 'Active'
  },
  {
    id: 'kpi-4',
    name: 'Production Incidents',
    code: 'KPI-INC',
    kraId: 'kra-2',
    kraName: 'Product Delivery Excellence',
    unit: 'Count',
    frequency: 'Monthly',
    direction: 'Lower is better',
    status: 'Active'
  },
  {
    id: 'kpi-5',
    name: 'Logo Churn',
    code: 'KPI-CHURN',
    kraId: 'kra-3',
    kraName: 'Customer Retention',
    unit: '%',
    frequency: 'Quarterly',
    direction: 'Lower is better',
    status: 'Active'
  },
  {
    id: 'kpi-6',
    name: 'Team Engagement Score',
    code: 'KPI-ENG',
    kraId: 'kra-4',
    kraName: 'People Leadership',
    unit: 'Score / 5',
    frequency: 'Annual',
    direction: 'Higher is better',
    status: 'Draft'
  }
];

export interface ReviewListItem {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  manager: string;
  cycleName: string;
  stage: 'Self' | 'Manager' | 'Peer' | 'HR' | 'Completed';
  status: 'Not Started' | 'In Progress' | 'Pending' | 'Completed' | 'Overdue';
  overallRating: string;
  deepLink: string;
}

export const MOCK_REVIEWS_LIST: ReviewListItem[] = [
  {
    id: 'rl-1',
    employeeName: 'Rahul Mehta',
    employeeCode: 'EMP1001',
    department: 'Engineering',
    manager: 'Priya Sharma',
    cycleName: 'H1 2025 Review',
    stage: 'Manager',
    status: 'In Progress',
    overallRating: '—',
    deepLink: '/performance/my-performance/self-review'
  },
  {
    id: 'rl-2',
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP1004',
    department: 'Engineering',
    manager: 'Priya Sharma',
    cycleName: 'H1 2025 Review',
    stage: 'Self',
    status: 'Pending',
    overallRating: '—',
    deepLink: '/performance/my-team'
  },
  {
    id: 'rl-3',
    employeeName: 'Vikram Shah',
    employeeCode: 'EMP1005',
    department: 'Engineering',
    manager: 'Priya Sharma',
    cycleName: 'H1 2025 Review',
    stage: 'Peer',
    status: 'In Progress',
    overallRating: '—',
    deepLink: '/performance/my-team'
  },
  {
    id: 'rl-4',
    employeeName: 'Amit Joshi',
    employeeCode: 'EMP1002',
    department: 'Sales',
    manager: 'Neha Kapoor',
    cycleName: 'H1 2025 Review',
    stage: 'HR',
    status: 'Pending',
    overallRating: '3.8 / 5',
    deepLink: '/performance/cycles/cycle-1/reviews/rev-2'
  },
  {
    id: 'rl-5',
    employeeName: 'Rahul Shah',
    employeeCode: 'EMP-1001',
    department: 'Sales',
    manager: 'Vikram Patel',
    cycleName: 'FY 2026–27 Annual',
    stage: 'Completed',
    status: 'Completed',
    overallRating: '4.2 / 5',
    deepLink: '/performance/cycles/cycle-1/reviews/rev-1'
  }
];
