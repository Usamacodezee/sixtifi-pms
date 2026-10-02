import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../components/ui/Card';
import { LayoutGrid } from 'lucide-react';

export interface GenericPlaceholderViewProps {
  moduleName: string;
  onNavigateToPerformance: () => void;
}

export const GenericPlaceholderView: React.FC<GenericPlaceholderViewProps> = ({
  moduleName,
  onNavigateToPerformance
}) => {
  return (
    <div className="generic-view-container">
      <PageHeader
        title={moduleName}
        subtitle="Sixtifi Workforce Management Platform module"
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: moduleName }
        ]}
      />

      <Card title={`${moduleName} Module`}>
        <EmptyPlaceholder
          icon={<LayoutGrid size={26} />}
          title={`${moduleName} Workspace`}
          description={`You are viewing the ${moduleName} module. Click below to navigate back to the Performance Management Module.`}
          action={
            <button
              className="role-pill-btn is-active"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={onNavigateToPerformance}
            >
              Open Performance Module
            </button>
          }
        />
      </Card>
    </div>
  );
};
