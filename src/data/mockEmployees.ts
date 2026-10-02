import { MockEmployee } from '../types/performance';

export interface DepartmentOption {
  id: string;
  name: string;
  count: number;
}

export interface DesignationOption {
  id: string;
  name: string;
  count: number;
  department?: string;
}

export const MOCK_DEPARTMENTS: DepartmentOption[] = [
  { id: 'sales', name: 'Sales', count: 42 },
  { id: 'engineering', name: 'Engineering', count: 58 },
  { id: 'operations', name: 'Operations', count: 46 },
  { id: 'hr', name: 'HR', count: 18 },
  { id: 'finance', name: 'Finance', count: 22 },
  { id: 'marketing', name: 'Marketing', count: 16 },
  { id: 'customer_support', name: 'Customer Support', count: 31 },
  { id: 'administration', name: 'Administration', count: 15 }
];

export const MOCK_DESIGNATIONS: DesignationOption[] = [
  { id: 'sales_exec', name: 'Sales Executive', count: 28, department: 'Sales' },
  { id: 'sales_mgr', name: 'Sales Manager', count: 14, department: 'Sales' },
  { id: 'swe', name: 'Software Engineer', count: 36, department: 'Engineering' },
  { id: 'sr_swe', name: 'Senior Software Engineer', count: 22, department: 'Engineering' },
  { id: 'hr_exec', name: 'HR Executive', count: 12, department: 'HR' },
  { id: 'hr_mgr', name: 'HR Manager', count: 6, department: 'HR' },
  { id: 'ops_mgr', name: 'Operations Manager', count: 18, department: 'Operations' },
  { id: 'ops_assoc', name: 'Operations Associate', count: 28, department: 'Operations' },
  { id: 'fin_analyst', name: 'Financial Analyst', count: 16, department: 'Finance' },
  { id: 'fin_lead', name: 'Finance Lead', count: 6, department: 'Finance' },
  { id: 'mkt_spec', name: 'Marketing Specialist', count: 16, department: 'Marketing' },
  { id: 'cs_spec', name: 'Customer Support Specialist', count: 31, department: 'Customer Support' },
  { id: 'admin_exec', name: 'Administration Executive', count: 15, department: 'Administration' }
];

export const MOCK_EMPLOYEES_LIST: MockEmployee[] = [
  {
    id: 'emp-1',
    name: 'Rahul Shah',
    employeeId: 'EMP-1001',
    department: 'HR',
    designation: 'HR Manager',
    initials: 'RS',
    avatarBg: '#E0F2FE'
  },
  {
    id: 'emp-2',
    name: 'Priya Sharma',
    employeeId: 'EMP-1002',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    initials: 'PS',
    avatarBg: '#ECFDF5'
  },
  {
    id: 'emp-3',
    name: 'Amit Kumar',
    employeeId: 'EMP-1003',
    department: 'Sales',
    designation: 'Sales Executive',
    initials: 'AK',
    avatarBg: '#FEF3C7'
  },
  {
    id: 'emp-4',
    name: 'Neha Mehta',
    employeeId: 'EMP-1004',
    department: 'Engineering',
    designation: 'Software Engineer',
    initials: 'NM',
    avatarBg: '#F5F3FF'
  },
  {
    id: 'emp-5',
    name: 'Rajesh Patel',
    employeeId: 'EMP-1005',
    department: 'Operations',
    designation: 'Operations Manager',
    initials: 'RP',
    avatarBg: '#E0F2FE'
  },
  {
    id: 'emp-6',
    name: 'Sneha Verma',
    employeeId: 'EMP-1006',
    department: 'Finance',
    designation: 'Financial Analyst',
    initials: 'SV',
    avatarBg: '#ECFDF5'
  },
  {
    id: 'emp-7',
    name: 'Vikram Malhotra',
    employeeId: 'EMP-1007',
    department: 'Sales',
    designation: 'Sales Manager',
    initials: 'VM',
    avatarBg: '#FEF3C7'
  },
  {
    id: 'emp-8',
    name: 'Ananya Das',
    employeeId: 'EMP-1008',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    initials: 'AD',
    avatarBg: '#F5F3FF'
  },
  {
    id: 'emp-9',
    name: 'Rohit Joshi',
    employeeId: 'EMP-1009',
    department: 'Customer Support',
    designation: 'Customer Support Specialist',
    initials: 'RJ',
    avatarBg: '#E0F2FE'
  },
  {
    id: 'emp-10',
    name: 'Pooja Nair',
    employeeId: 'EMP-1010',
    department: 'Engineering',
    designation: 'Software Engineer',
    initials: 'PN',
    avatarBg: '#ECFDF5'
  },
  {
    id: 'emp-11',
    name: 'Alkesh Dave',
    employeeId: 'EMP-1011',
    department: 'HR',
    designation: 'HR Executive',
    initials: 'AD',
    avatarBg: '#FEF3C7'
  },
  {
    id: 'emp-12',
    name: 'Ritu Singhania',
    employeeId: 'EMP-1012',
    department: 'Administration',
    designation: 'Administration Executive',
    initials: 'RS',
    avatarBg: '#F5F3FF'
  }
];
