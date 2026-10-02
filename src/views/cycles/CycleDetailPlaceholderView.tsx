import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import { CalendarClock, ArrowLeft, Users, CheckCircle2 } from 'lucide-react';

import { PerformanceCycle } from '../../types/performance';

export interface CycleDetailPlaceholderViewProps {
  cycleId: string;
  cycles?: PerformanceCycle[];
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const CycleDetailPlaceholderView: React.FC<CycleDetailPlaceholderViewProps> = ({
  cycleId,
  cycles = MOCK_PERFORMANCE_CYCLES,
  onNavigate
}) => {
  const matchedCycle = cycles.find((c) => c.id === cycleId);
  const cycleName = matchedCycle ? matchedCycle.name : 'Appraisal Cycle Detail';
  const duration = matchedCycle ? matchedCycle.duration : 'FY 2026–27';
  const status = matchedCycle ? matchedCycle.status : 'Active';

  return (
    <div className="cycles-page-container animate-fade-in">
      <PageHeader
        title={cycleName}
        subtitle={`Detailed breakdown, timeline stages, participant list, and review calibrations for ${duration}.`}
        badge={status}
        badgeVariant={status === 'Active' ? 'success' : status === 'Completed' ? 'primary' : 'warning'}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: cycleName }
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
        title="Cycle Dashboard & Review Stages"
        subtitle={`Status: ${status} • Enrolled: ${matchedCycle ? matchedCycle.employeesCount : 248} Employees`}
      >
        <EmptyPlaceholder
          icon={<CalendarClock size={28} />}
          title={`${cycleName} Workspace`}
          description="Detailed participant rosters, department progress trackers, stage-by-stage review calibration tables, and rating distribution graphs for this Appraisal Cycle will appear here."
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
