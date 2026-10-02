import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { Target, FileEdit, Award, ArrowLeft } from 'lucide-react';

export interface MyPerformanceSubViewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const MyGoalsPlaceholderView: React.FC<MyPerformanceSubViewProps> = ({
  onNavigate
}) => {
  return (
    <div className="my-performance-page animate-fade-in">
      <PageHeader
        title="My Goals"
        subtitle="Manage your performance goals and track your progress."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Performance', href: '#/performance/my-performance' },
          { label: 'Goals' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/my-performance')}
          >
            <ArrowLeft size={14} />
            <span>Back to My Performance</span>
          </button>
        }
      />

      <Card
        title="Active Performance Goals"
        subtitle="FY 2026–27 Annual Performance Review"
      >
        <EmptyPlaceholder
          icon={<Target size={28} />}
          title="My Goals Workspace"
          description="Manage your performance goals and track your progress. Goal progress update workflows and milestone evidence attachments will appear here."
          action={
            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Return to My Performance</span>
            </button>
          }
        />
      </Card>
    </div>
  );
};

export const SelfReviewPlaceholderView: React.FC<MyPerformanceSubViewProps> = ({
  onNavigate
}) => {
  return (
    <div className="my-performance-page animate-fade-in">
      <PageHeader
        title="Self Review"
        subtitle="Complete your performance self review for the current cycle."
        badge="Deadline: 30 Mar 2027"
        badgeVariant="warning"
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Performance', href: '#/performance/my-performance' },
          { label: 'Self Review' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/my-performance')}
          >
            <ArrowLeft size={14} />
            <span>Back to My Performance</span>
          </button>
        }
      />

      <Card
        title="Self-Assessment Questionnaire"
        subtitle="FY 2026–27 Annual Performance Review"
      >
        <EmptyPlaceholder
          icon={<FileEdit size={28} />}
          title="Self Review Questionnaire"
          description="Complete your performance self review for the current cycle. Goal achievements evaluation, competency self-ratings, and accomplishments narrative form will appear here."
          action={
            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Return to My Performance</span>
            </button>
          }
        />
      </Card>
    </div>
  );
};

export const FinalReviewPlaceholderView: React.FC<MyPerformanceSubViewProps> = ({
  onNavigate
}) => {
  return (
    <div className="my-performance-page animate-fade-in">
      <PageHeader
        title="Performance Review"
        subtitle="Your completed performance review and final rating will appear here."
        badge="Self Review Pending"
        badgeVariant="neutral"
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Performance', href: '#/performance/my-performance' },
          { label: 'Review' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/my-performance')}
          >
            <ArrowLeft size={14} />
            <span>Back to My Performance</span>
          </button>
        }
      />

      <Card
        title="Appraisal Summary & Rating"
        subtitle="FY 2026–27 Annual Performance Review"
      >
        <EmptyPlaceholder
          icon={<Award size={28} />}
          title="Performance Review & Final Rating"
          description="Your completed performance review and final rating will appear here after your manager review and HR calibration are completed."
          action={
            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Return to My Performance</span>
            </button>
          }
        />
      </Card>
    </div>
  );
};
