import React, { useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { UserRole, PerformanceCycle } from '../../types/performance';
import { FinalReviewDecision } from '../../data/mockFinalReview';
import { MyGoalItem } from '../../data/mockMyGoals';
import { EmployeeVisibilitySettings, ReviewFlowOption } from '../../data/mockSettings';
import { ManagerReviewResponses } from '../../data/mockManagerReview';
import { ToastType } from '../../components/ui/Toast';
import { getPerformancePermissions, canAccessPerformanceTab, PerformanceTab } from '../../utils/performancePermissions';
import { MyPerformanceMainView } from '../my-performance/MyPerformanceMainView';
import { MyTeamView } from '../my-team/MyTeamView';
import { OverallPerformanceView } from './OverallPerformanceView';
import { User, Users, BarChart3, Calendar } from 'lucide-react';
import '../goals/GoalsModule.css';

export interface PerformanceShellViewProps {
  activeTab: PerformanceTab;
  currentUserRole: UserRole;
  goals: MyGoalItem[];
  selfReviewStatus: 'Pending' | 'Completed';
  managerReviewIsDone?: boolean;
  finalReviewDecision?: FinalReviewDecision;
  employeeVisibility?: EmployeeVisibilitySettings;
  reviewFlow?: ReviewFlowOption;
  activeCycle?: PerformanceCycle;
  allCycles?: PerformanceCycle[];
  managerReviewResponses?: Record<string, ManagerReviewResponses>;
  onSelectCycleId?: (cycleId: string) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const TAB_META: Array<{
  id: PerformanceTab;
  label: string;
  icon: typeof User;
  route: string;
}> = [
  {
    id: 'my',
    label: 'My Performance',
    icon: User,
    route: '/performance/my-performance'
  },
  {
    id: 'team',
    label: 'Team Performance',
    icon: Users,
    route: '/performance/my-team'
  },
  {
    id: 'overall',
    label: 'Overall Performance',
    icon: BarChart3,
    route: '/performance/overall'
  }
];

export const PerformanceShellView: React.FC<PerformanceShellViewProps> = ({
  activeTab,
  currentUserRole,
  goals,
  selfReviewStatus,
  managerReviewIsDone,
  finalReviewDecision,
  employeeVisibility,
  reviewFlow,
  activeCycle,
  allCycles = [],
  managerReviewResponses = {},
  onSelectCycleId,
  onNavigate,
  onShowToast
}) => {
  const perms = getPerformancePermissions(currentUserRole);

  // Guard tab access based on permissions
  useEffect(() => {
    if (!canAccessPerformanceTab(activeTab, currentUserRole)) {
      onShowToast?.(
        'warning',
        'Access Restricted',
        `Your role (${currentUserRole}) does not have permission to view ${activeTab === 'team' ? 'Team Performance' : 'Overall Performance'}. Redirecting to My Performance.`
      );
      onNavigate('/performance/my-performance');
    }
  }, [activeTab, currentUserRole]);

  const visibleTabs = TAB_META.filter((t) => canAccessPerformanceTab(t.id, currentUserRole));

  return (
    <div className="goals-module-page is-simple animate-fade-in">
      {/* 1. Page Header with Cycle Switcher */}
      <PageHeader
        title="Performance"
        subtitle={
          activeCycle
            ? `${activeCycle.name} · Target Period: ${activeCycle.startDate} – ${activeCycle.endDate}`
            : 'Track employee reviews, team check-ins, and organization metrics'
        }
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance' },
          {
            label:
              activeTab === 'my'
                ? 'My Performance'
                : activeTab === 'team'
                ? 'Team Performance'
                : 'Overall Performance'
          }
        ]}
        actions={
          allCycles.length > 1 && onSelectCycleId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={15} color="var(--text-muted)" />
              <select
                className="goals-company-select compact"
                aria-label="Select Active Review Cycle"
                value={activeCycle?.id || allCycles[0]?.id}
                onChange={(e) => {
                  onSelectCycleId(e.target.value);
                  const cycle = allCycles.find((c) => c.id === e.target.value);
                  if (cycle) {
                    onShowToast?.(
                      'info',
                      'Active Cycle Switched',
                      `Switched context to ${cycle.name}.`
                    );
                  }
                }}
              >
                {allCycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          ) : undefined
        }
      />

      {/* 2. Structured 3-Tab Pill Navigation */}
      <div className="goals-pill-nav" role="tablist" aria-label="Performance views">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`goals-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate(tab.route)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Render Tab Content */}
      {activeTab === 'my' && (
        <MyPerformanceMainView
          onNavigate={onNavigate}
          goals={goals}
          selfReviewStatus={selfReviewStatus}
          managerReviewIsDone={managerReviewIsDone}
          finalReviewDecision={finalReviewDecision}
          employeeVisibility={employeeVisibility}
          reviewFlow={reviewFlow}
          activeCycle={activeCycle}
          allCycles={allCycles}
          onSelectCycleId={onSelectCycleId}
          onShowToast={onShowToast}
        />
      )}

      {activeTab === 'team' && perms.canViewTeamPerformance && (
        <MyTeamView
          managerReviewResponses={managerReviewResponses}
          onNavigate={onNavigate}
          onShowToast={onShowToast}
        />
      )}

      {activeTab === 'overall' && perms.canViewOverallPerformance && (
        <OverallPerformanceView
          managerReviewResponses={managerReviewResponses}
          onNavigate={onNavigate}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
