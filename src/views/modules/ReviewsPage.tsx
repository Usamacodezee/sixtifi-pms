import React from 'react';
import { ToastType } from '../../components/ui/Toast';
import { MOCK_REVIEWS_LIST, ReviewListItem } from '../../data/mockPerformanceModules';
import { CatalogRow, PerformanceCatalogView } from './PerformanceCatalogView';

export interface ReviewsPageProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate, onShowToast }) => (
  <PerformanceCatalogView
    title="Reviews"
    subtitle="Multi-rater review queue across self, manager, peer, and HR stages for active cycles."
    breadcrumb="Reviews"
    stats={[
      { label: 'Total', value: MOCK_REVIEWS_LIST.length },
      { label: 'In progress', value: MOCK_REVIEWS_LIST.filter((r) => r.status === 'In Progress').length },
      { label: 'Pending', value: MOCK_REVIEWS_LIST.filter((r) => r.status === 'Pending').length },
      { label: 'Completed', value: MOCK_REVIEWS_LIST.filter((r) => r.status === 'Completed').length }
    ]}
    columns={[
      { key: 'employeeName', label: 'Employee' },
      { key: 'department', label: 'Department', width: '130px' },
      { key: 'manager', label: 'Manager', width: '130px' },
      { key: 'cycleName', label: 'Cycle', width: '150px' },
      { key: 'stage', label: 'Stage', width: '100px' },
      { key: 'status', label: 'Status', width: '110px' },
      { key: 'overallRating', label: 'Rating', width: '100px' }
    ]}
    rows={MOCK_REVIEWS_LIST as unknown as CatalogRow[]}
    searchKeys={['employeeName', 'employeeCode', 'department', 'manager', 'cycleName']}
    statusKey="status"
    statusOptions={['Not Started', 'In Progress', 'Pending', 'Completed', 'Overdue']}
    primaryActionLabel="Send reminders"
    onPrimaryAction={() =>
      onShowToast?.('success', 'Reminders queued', 'Pending reviewers will be notified (demo).')
    }
    rowActionLabel="Open review"
    onRowAction={(row) => {
      const r = row as unknown as ReviewListItem;
      onNavigate(r.deepLink);
    }}
    detailRenderer={(row) => {
      const r = row as unknown as ReviewListItem;
      return (
        <>
          <div className="perf-module-detail-title">
            {r.employeeName} · {r.employeeCode}
          </div>
          <div className="perf-module-detail-meta">
            <span>Stage: {r.stage}</span>
            <span>·</span>
            <span>{r.cycleName}</span>
            <span>·</span>
            <span>Manager {r.manager}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Demo actions available from the review workspace: remind, reassign, return, lock/unlock.
          </p>
        </>
      );
    }}
    onNavigate={onNavigate}
    onShowToast={onShowToast}
  />
);
