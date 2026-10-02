import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { TEAM_MEMBERS } from '../../data/mockMyTeam';
import { TeamMemberOverallStatus } from '../../types/performance';
import { getRelevantCompetencies } from '../../data/reviewEngine';
import {
  ManagerReviewResponses,
  calculateManagerReviewScores,
  buildSeededCompletedReview
} from '../../data/mockManagerReview';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Calendar
} from 'lucide-react';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';
import '../my-performance/MyPerformanceStyles.css';

export type TeamMemberDetailTab = 'overview' | 'goals';

export interface TeamMemberDetailViewProps {
  employeeId: string;
  initialTab?: TeamMemberDetailTab;
  managerReviewResponses?: Record<string, ManagerReviewResponses>;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const TeamMemberDetailView: React.FC<TeamMemberDetailViewProps> = ({
  employeeId,
  initialTab = 'overview',
  managerReviewResponses = {},
  onNavigate,
  onShowToast
}) => {
  const [currentTab, setCurrentTab] = useState<TeamMemberDetailTab>(initialTab);

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  const member = TEAM_MEMBERS.find(
    (m) => m.id === employeeId || m.employeeCode.toLowerCase() === employeeId.toLowerCase()
  ) || TEAM_MEMBERS[0];
  const competencies = getRelevantCompetencies(member.department, member.designation, member.jobLevel);

  const handleTabChange = (tab: TeamMemberDetailTab) => {
    setCurrentTab(tab);
    if (tab === 'overview') {
      onNavigate(`/performance/my-team/${member.id}`);
    } else {
      onNavigate(`/performance/my-team/${member.id}/${tab}`);
    }
  };

  const getOverallBadgeVariant = (status: TeamMemberOverallStatus) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'At Risk':
        return 'warning';
      case 'Overdue':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const isHealthy = (status: string) => status === 'On Track' || status === 'Completed';
  const onTrackGoals = member.goals.filter((g) => isHealthy(g.status)).length;
  const atRiskGoals = member.goals.length - onTrackGoals;
  const previewGoals = member.goals.slice(0, 4);

  // Live submitted review (this session) overrides the static mock status.
  const liveResponse = managerReviewResponses[member.id];
  const isLiveCompleted = liveResponse?.status === 'Completed';
  const effectiveManagerReviewStatus = isLiveCompleted ? 'Completed' : member.managerReviewStatus;
  const effectiveOverallStatus: TeamMemberOverallStatus = isLiveCompleted ? 'Completed' : member.overallStatus;

  const resolvedResponse = isLiveCompleted
    ? liveResponse
    : member.managerReviewStatus === 'Completed'
      ? buildSeededCompletedReview(member, competencies)
      : null;
  const overallRatingDisplay = resolvedResponse
    ? `${calculateManagerReviewScores(resolvedResponse, member.goals, competencies).overallScore.toFixed(1)} / 5`
    : 'Pending';

  const reviewIsOverdue = effectiveManagerReviewStatus === 'Overdue';
  const reviewIsDone = effectiveManagerReviewStatus === 'Completed';

  return (
    <div className="emp-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={member.name}
        subtitle={`${member.designation} • ${member.department} Department`}
        badge={effectiveOverallStatus}
        badgeVariant={getOverallBadgeVariant(effectiveOverallStatus)}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Team', href: '#/performance/my-team' },
          { label: member.name }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/my-team')}
          >
            <ArrowLeft size={14} />
            <span>Back to My Team</span>
          </button>
        }
      />

      {/* 2. Current Cycle Strip */}
      <div className="active-cycle-banner">
        <div className="cycle-banner-left">
          <div className="cycle-banner-icon">
            <Calendar size={20} />
          </div>
          <div className="cycle-banner-title-col">
            <div className="cycle-banner-name">
              <span>Current Cycle</span>
            </div>
            <div className="cycle-banner-meta">
              <strong style={{ color: 'var(--text-primary)' }}>
                FY 2026–27 Annual Performance Review
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Performance Summary */}
      <div className="emp-performance-summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Goal Progress</span>
          <span className="perf-metric-val" style={{ color: '#0284C7' }}>
            {member.goalProgress}%
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Self Review</span>
          <span className="perf-metric-val">
            <span className={`pms-badge ${member.selfReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
              {member.selfReviewStatus}
            </span>
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Manager Review</span>
          <span className="perf-metric-val">
            <span
              className={`pms-badge ${reviewIsDone ? 'badge-success' : reviewIsOverdue ? 'badge-danger' : 'badge-info'
                }`}
            >
              {effectiveManagerReviewStatus}
            </span>
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Overall Rating</span>
          <span className="perf-metric-val" style={{ color: reviewIsDone ? '#047857' : 'var(--text-muted)' }}>
            {overallRatingDisplay}
          </span>
        </div>
      </div>

      {/* 4. Tabs */}
      <div className="cycle-detail-tabs-bar">
        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'goals' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('goals')}
        >
          <span>Goals</span>
          <span className="tab-badge-pill">{member.goals.length}</span>
        </button>

        <button
          type="button"
          className="detail-tab-btn"
          onClick={() => onNavigate(`/performance/my-team/${member.id}/review`)}
        >
          <span>Review</span>
          {reviewIsDone && <CheckCircle2 size={13} color="#059669" />}
        </button>
      </div>

      {/* 5. Overview Tab */}
      {currentTab === 'overview' && (
        <div className="overview-tab-content">
          <div className="overview-two-col-grid">
            <Card title="Goal Progress" subtitle={`${member.goals.length} Goals for this cycle`}>
              <div className="review-progress-breakdown-list">
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">Total Goals</span>
                    <span className="stage-box-count">
                      <strong>{member.goals.length}</strong> Goals
                    </span>
                  </div>
                </div>
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">On Track</span>
                    <span className="pms-badge badge-success">{onTrackGoals}</span>
                  </div>
                </div>
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">At Risk</span>
                    <span className="pms-badge badge-warning">{atRiskGoals}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Performance Components" subtitle="Evaluation weight breakdown">
              <div className="perf-breakdown-stack">
                <div className="breakdown-row-box">
                  <div className="breakdown-row-header">
                    <span className="breakdown-row-title">Goals / KPI</span>
                    <span className="breakdown-row-weight">Weight: 70%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Progress:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7' }}>
                      {member.goalProgress}%
                    </span>
                  </div>
                  <div className="sixtifi-progress-bar-bg" style={{ height: '5px' }}>
                    <div className="sixtifi-progress-bar-fill primary" style={{ width: `${member.goalProgress}%` }} />
                  </div>
                </div>

                <div className="breakdown-row-box">
                  <div className="breakdown-row-header">
                    <span className="breakdown-row-title">Competencies</span>
                    <span className="breakdown-row-weight">Weight: 30%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Review:</span>
                    {reviewIsDone && resolvedResponse ? (
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7C3AED' }}>
                        {calculateManagerReviewScores(resolvedResponse, member.goals, competencies).competencyScore.toFixed(1)} / 5
                      </span>
                    ) : (
                      <span className="pms-badge badge-neutral">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="overview-two-col-grid">
            <Card title="Review Journey" subtitle="Progression through this cycle's review stages">
              <div className="review-journey-timeline">
                <div className="journey-step-row is-completed">
                  <div className="journey-node-circle" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>
                    ✓
                  </div>
                  <div className="journey-step-content">
                    <div className="journey-step-title-row">
                      <span className="journey-step-title">Self Review</span>
                      <span className="pms-badge badge-success">Completed</span>
                    </div>
                    <span className="journey-step-desc">Employee has submitted their self assessment.</span>
                  </div>
                </div>

                <div className={`journey-step-row ${!reviewIsDone ? 'is-current' : ''}`}>
                  <div className="journey-node-circle" style={reviewIsDone ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' } : {}}>
                    {reviewIsDone ? '✓' : '2'}
                  </div>
                  <div className="journey-step-content">
                    <div className="journey-step-title-row">
                      <span className="journey-step-title">Manager Review</span>
                      <span
                        className={`pms-badge ${reviewIsDone ? 'badge-success' : reviewIsOverdue ? 'badge-danger' : 'badge-warning'
                          }`}
                      >
                        {effectiveManagerReviewStatus}
                      </span>
                    </div>
                    <span className="journey-step-desc">
                      {reviewIsDone
                        ? 'You have completed this employee’s manager review.'
                        : 'Evaluate goals and provide manager feedback.'}
                    </span>
                  </div>
                </div>

                <div className="journey-step-row">
                  <div className="journey-node-circle">
                    {reviewIsDone ? '3' : <Lock size={11} />}
                  </div>
                  <div className="journey-step-content">
                    <div className="journey-step-title-row">
                      <span className="journey-step-title">Final Review</span>
                      <span className={`pms-badge ${reviewIsDone ? 'badge-warning' : 'badge-neutral'}`}>
                        {reviewIsDone ? 'Pending' : 'Locked'}
                      </span>
                    </div>
                    <span className="journey-step-desc">
                      {reviewIsDone ? 'Awaiting HR calibration and final rating release.' : 'HR calibration and final rating release.'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Attention" subtitle="What needs your input">
              <div className="attention-card-list">
                <div className="attention-row-card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-3)' }}>
                  <div className="attention-left-box">
                    <div className={`attention-icon-box ${reviewIsOverdue ? 'red' : reviewIsDone ? 'blue' : 'amber'}`}>
                      {reviewIsDone ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="attention-text-col">
                      <span className="attention-title">
                        {reviewIsDone
                          ? 'Manager review completed.'
                          : reviewIsOverdue
                            ? 'Manager review is overdue.'
                            : 'Manager review is pending.'}
                      </span>
                      <span className="attention-sub">
                        {reviewIsDone
                          ? 'You have already submitted your review for this employee.'
                          : 'Complete your review of goals and core competencies for this employee.'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="pms-btn pms-btn-primary"
                    style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', gap: 6 }}
                    onClick={() => onNavigate(`/performance/my-team/${member.id}/review`)}
                  >
                    <span>{reviewIsDone ? 'View Manager Review' : 'Start Manager Review'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* 10. Employee Goals Preview */}
          <Card
            title="Goals"
            subtitle={`Showing ${previewGoals.length} of ${member.goals.length} goals`}
            action={
              <button className="pms-btn-link" onClick={() => handleTabChange('goals')}>
                View All Goals &rarr;
              </button>
            }
          >
            <div className="my-goals-stack">
              {previewGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="goal-item-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate(`/performance/goals/${goal.id}`)}
                >
                  <div className="goal-row-top">
                    <span className="goal-row-title">{goal.title}</span>
                    <span
                      className={`pms-badge ${isHealthy(goal.status) ? 'badge-success' : 'badge-warning'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="goal-row-progress-line">
                    <div className="sixtifi-progress-bar-bg" style={{ flex: 1, height: '6px' }}>
                      <div
                        className={`sixtifi-progress-bar-fill ${isHealthy(goal.status) ? 'primary' : 'warning'}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span className="goal-row-progress-text">{goal.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 6. Goals Tab (placeholder) */}
      {currentTab === 'goals' && (
        <div className="tab-placeholder-card animate-fade-in">
          <div className="tab-placeholder-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' }}>
            <Target size={28} />
          </div>
          <h3 className="empty-title" style={{ fontSize: '1.15rem' }}>{member.name}&apos;s Goals</h3>
          <p className="empty-description" style={{ maxWidth: '480px' }}>
            Detailed goal targets, progress history, and goal approval workflow for <strong>{member.name}</strong> will appear here.
          </p>
          <button className="pms-btn pms-btn-secondary" onClick={() => handleTabChange('overview')}>
            &larr; Back to Overview
          </button>
        </div>
      )}
    </div>
  );
};
