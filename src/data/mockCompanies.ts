/**
 * Company context for multi-tenant PMS demos.
 * All Goals module data is scoped to an active company.
 */

export interface Company {
  id: string;
  name: string;
  code: string;
  industry: string;
  cycleLabel: string;
  cyclePeriod: string;
}

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'co-sixtifi',
    name: 'Sixtifi Technologies',
    code: 'SIX',
    industry: 'SaaS / HR Tech',
    cycleLabel: 'FY 2026–27 Annual Performance Review',
    cyclePeriod: '01 Apr 2026 – 31 Mar 2027'
  },
  {
    id: 'co-northstar',
    name: 'Northstar Retail Pvt Ltd',
    code: 'NSR',
    industry: 'Retail / Omnichannel',
    cycleLabel: 'FY 2026–27 Annual Performance Review',
    cyclePeriod: '01 Apr 2026 – 31 Mar 2027'
  }
];

export const DEFAULT_COMPANY_ID = 'co-sixtifi';

export const getCompanyById = (companyId: string): Company =>
  MOCK_COMPANIES.find((c) => c.id === companyId) ?? MOCK_COMPANIES[0];
