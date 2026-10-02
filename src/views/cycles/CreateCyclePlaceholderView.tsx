import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { PlusCircle, ArrowLeft } from 'lucide-react';

export interface CreateCyclePlaceholderViewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const CreateCyclePlaceholderView: React.FC<CreateCyclePlaceholderViewProps> = ({
  onNavigate
}) => {
  return (
    <div className="cycles-page-container animate-fade-in">
      <PageHeader
        title="Create Appraisal Cycle"
        subtitle="Set up a new Appraisal Cycle for your employees."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: 'Create' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/cycles')}
          >
            <ArrowLeft size={14} />
            <span>Back to Cycles</span>
          </button>
        }
      />

      <Card
        title="Cycle Setup Wizard"
        subtitle="Define cycle timeframe, participant cohorts, review stages, and rating criteria"
      >
        <EmptyPlaceholder
          icon={<PlusCircle size={28} />}
          title="Appraisal Cycle Creation Setup"
          description="The interactive step-by-step cycle creation wizard (Basic Details, Timeline & Stages, Eligibility Rules, Evaluation Forms, and Reviewers Calibration) will be designed in the next step."
          action={
            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/cycles')}
            >
              <ArrowLeft size={14} />
              <span>Return to Appraisal Cycles</span>
            </button>
          }
        />
      </Card>
    </div>
  );
};
