import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { UserRole } from '../types/performance';
import { EmployeeOverview } from './overview/EmployeeOverview';
import { ManagerOverview } from './overview/ManagerOverview';
import { HrAdminOverview } from './overview/HrAdminOverview';

export interface PerformanceOverviewViewProps {
  currentUserRole: UserRole;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const PerformanceOverviewView: React.FC<PerformanceOverviewViewProps> = ({
  currentUserRole,
  onNavigate,
  onShowToast
}) => {
  const renderRoleDashboard = () => {
    switch (currentUserRole) {
      case 'Employee':
        return <EmployeeOverview onNavigate={onNavigate} onShowToast={onShowToast} />;

      case 'Manager':
        return <ManagerOverview onNavigate={onNavigate} onShowToast={onShowToast} />;

      case 'HR/Admin':
      default:
        return <HrAdminOverview onNavigate={onNavigate} onShowToast={onShowToast} />;
    }
  };

  return (
    <div className="performance-view-container">
      {/* 1. Common Page Header */}
      <PageHeader
        title="Performance Dashboard"
        subtitle="Live view of cycle health, goal progress, ratings, and actions for your role."
        badge="Active Module"
        badgeVariant="primary"
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Dashboard' }
        ]}
      />

      {/* 2. Role-Based Overview Dashboard */}
      {renderRoleDashboard()}
    </div>
  );
};
