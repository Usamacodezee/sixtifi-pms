import { PerformanceRoute, PerformanceSubmenuItem, UserRole } from '../types/performance';

export const PERFORMANCE_SUBMENU_ITEMS: PerformanceSubmenuItem[] = [
  {
    id: 'overview',
    route: '/performance',
    label: 'Dashboard',
    pageTitle: 'Performance Dashboard',
    subtitle: 'Active cycles, pending reviews, goals, completion, and open tasks at a glance.',
    allowedRoles: ['Employee', 'Manager', 'HR/Admin']
  },
  {
    id: 'my-performance',
    route: '/performance/my-performance',
    label: 'My Performance',
    pageTitle: 'My Performance',
    subtitle: 'Employee workspace: goals, reviews, and appraisal status.',
    allowedRoles: ['Employee', 'Manager', 'HR/Admin']
  },
  {
    id: 'my-team',
    route: '/performance/my-team',
    label: 'Team Performance',
    pageTitle: 'Team Performance',
    subtitle: 'Manager workspace for direct reports, check-ins, and team reviews.',
    allowedRoles: ['Manager', 'HR/Admin']
  },
  {
    id: 'goals',
    route: '/performance/goals',
    label: 'Goals',
    pageTitle: 'Goals',
    subtitle: 'Your goals, your team, and company priorities — in one place.',
    allowedRoles: ['Employee', 'Manager', 'HR/Admin']
  },
  {
    id: 'cycles',
    route: '/performance/cycles',
    label: 'Appraisal Cycle',
    pageTitle: 'Appraisal Cycle',
    subtitle: 'Set up and run appraisal periods from draft through completion.',
    allowedRoles: ['HR/Admin']
  },
  {
    id: 'reviews',
    route: '/performance/reviews',
    label: 'Performance Reviews',
    pageTitle: 'Performance Reviews',
    subtitle: 'Track self, manager, and admin reviews for the active cycle.',
    allowedRoles: ['Employee', 'Manager', 'HR/Admin']
  },
  {
    id: 'reports',
    route: '/performance/reports',
    label: 'Reports',
    pageTitle: 'Performance Reports',
    subtitle: 'See completion progress, ratings, and team outcomes.',
    allowedRoles: ['HR/Admin']
  },
  {
    id: 'settings',
    route: '/performance/settings',
    label: 'Settings',
    pageTitle: 'Performance Settings',
    subtitle: 'Configure rating scales, forms, competencies, and defaults.',
    allowedRoles: ['HR/Admin']
  }
];

export const getVisiblePerformanceSubmenu = (role: UserRole): PerformanceSubmenuItem[] => {
  return PERFORMANCE_SUBMENU_ITEMS.filter((item) => item.allowedRoles.includes(role));
};

export const getPageInfoForRoute = (route: string): { pageTitle: string; subtitle: string } => {
  const matches = PERFORMANCE_SUBMENU_ITEMS.filter(
    (item) =>
      item.route === route ||
      (item.route !== '/performance' && route.startsWith(`${item.route}/`)) ||
      (item.route !== '/performance' && route.startsWith(item.route))
  ).sort((a, b) => b.route.length - a.route.length);

  const matchedItem = matches[0];
  if (matchedItem) {
    return { pageTitle: matchedItem.pageTitle, subtitle: matchedItem.subtitle };
  }
  if (route.startsWith('/performance')) {
    return { pageTitle: 'Performance Dashboard', subtitle: 'High-level snapshot of performance milestones.' };
  }
  return { pageTitle: 'Sixtifi Platform', subtitle: 'Workforce Management System' };
};

export const ALL_PERFORMANCE_ROUTES: PerformanceRoute[] = PERFORMANCE_SUBMENU_ITEMS.map(
  (item) => item.route
);
