import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { FinalReviewDecision, MOCK_FINAL_REVIEW_DATA, calculateFinalReviewScores } from '../../data/mockFinalReview';
import { MyGoalItem } from '../../data/mockMyGoals';
import { PerformanceCycle } from '../../types/performance';
import {
  EmployeeVisibilitySettings,
  DEFAULT_EMPLOYEE_VISIBILITY,
  ReviewFlowOption,
  reviewFlowIncludesSelf,
  reviewFlowIncludesAdmin,
  getReviewFlowMeta
} from '../../data/mockSettings';
import {
  Target,
  TrendingUp,
  Clock,
  Award,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import './MyPerformanceStyles.css';

export interface MyPerformanceMainViewProps {
  onNavigate: (route: string) => void;
  goals: MyGoalItem[];
  selfReviewStatus: 'Pending' | 'Completed';
  managerReviewIsDone?: boolean;
  finalReviewDecision?: FinalReviewDecision;
  employeeVisibility?: EmployeeVisibilitySettings;
  reviewFlow?: ReviewFlowOption;
  activeCycle?: PerformanceCycle;
  allCycles?: PerformanceCycle[];
  onSelectCycleId?: (cycleId: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

const goalBadgeVariant = (status: string) => {
  switch (status) {
    case 'On Track':
    case 'Completed':
      return 'badge-success';
    case 'At Risk':
      return 'badge-warning';
    case 'Needs Attention':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};

const goalBarVariant = (status: string) => {
  switch (status) {
    case 'On Track':
      return 'primary';
    case 'Completed':
      return 'complete';
    case 'At Risk':
      return 'warning';
    case 'Needs Attention':
      return 'danger';
    default:
      return 'primary';
  }
};

export const MyPerformanceMainView: React.FC<MyPerformanceMainViewProps> = ({
  onNavigate,
  goals,
  selfReviewStatus,
  managerReviewIsDone = false,
  finalReviewDecision,
  employeeVisibility = DEFAULT_EMPLOYEE_VISIBILITY,
  reviewFlow = 'self_manager_admin',
  activeCycle,
  allCycles = [],
  onSelectCycleId,
  onShowToast
}) => {
  const currentFlow = activeCycle?.reviewFlow || reviewFlow;
  const includesSelf = reviewFlowIncludesSelf(currentFlow);
  const includesAdmin = reviewFlowIncludesAdmin(currentFlow);
  const flowMeta = getReviewFlowMeta(currentFlow);

  const goalsWeight = activeCycle?.goalsWeightage ?? 70;
  const compWeight = activeCycle?.competenciesWeightage ?? 30;

  const isFinalReviewCompleted = includesAdmin && finalReviewDecision?.status === 'Completed';
  const finalReviewRecord = MOCK_FINAL_REVIEW_DATA['emp-1'];
  const finalScores = calculateFinalReviewScores(finalReviewRecord.goals, finalReviewRecord.competencies);
  const previewGoals = goals.slice(0, 4);
  const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;

  const topGoal = goals[0];
  const recentActivities = [
    topGoal
      ? { text: `You updated "${topGoal.title}" to ${topGoal.progress}%`, time: 'Today' }
      : { text: 'No recent goal updates yet.', time: 'Today' },
    { text: 'Your manager approved "Improve Client Retention"', time: '3 days ago' },
    { text: `Appraisal Cycle "${activeCycle?.name || 'FY 2026–27 Annual'}" started`, time: '2 weeks ago' },
    { text: 'You added a progress update to "New Customer Acquisition"', time: '15 days ago' }
  ];

  const isSelfReviewDone = selfReviewStatus === 'Completed';
  // Skip self stage when the selected flow does not include it.
  // Once HR/Admin finalizes (when admin stage exists), upstream stages are done.
  const effectiveSelfReviewDone =
    !includesSelf || isSelfReviewDone || isFinalReviewCompleted;
  const isManagerReviewDone = isFinalReviewCompleted || managerReviewIsDone;
  const cycleComplete = includesAdmin ? isFinalReviewCompleted : isManagerReviewDone;

  const showFinalScore = employeeVisibility.showFinalScore;
  const showFinalRating = employeeVisibility.showFinalRating;
  const showManagerComments = employeeVisibility.showManagerComments;
  const showCompetencyScores = employeeVisibility.showCompetencyScores;
  const hasVisibleFinalResult = showFinalScore || showFinalRating;

  return (
    <div className="my-performance-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="My Performance"
        subtitle="Track your goals, performance progress, and review status."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Performance' }
        ]}
      />

      {/* 2. Active Appraisal Cycle Banner with Cycle Switcher */}
      <div className="active-cycle-banner">
        <div className="cycle-banner-left">
          <div className="cycle-banner-icon">
            <Calendar size={20} />
          </div>
          <div className="cycle-banner-title-col">
            <div className="cycle-banner-name" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              {allCycles && allCycles.length > 1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Active Cycle:</span>
                  <select
                    className="emp-filter-select"
                    style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369A1', backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', padding: '4px 10px', borderRadius: 6 }}
                    value={activeCycle?.id || ''}
                    onChange={(e) => onSelectCycleId?.(e.target.value)}
                  >
                    {allCycles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type} • {c.status})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span>{activeCycle?.name || 'FY 2026–27 Annual Performance Review'}</span>
              )}
              <span className={`pms-badge ${activeCycle?.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                {cycleComplete ? 'Completed' : activeCycle?.status || 'Active'}
              </span>
              <span className="pms-badge badge-info">{flowMeta.shortLabel}</span>
            </div>
            <div className="cycle-banner-meta">
              <span>Period: {activeCycle?.duration || '01 Apr 2026 – 31 Mar 2027'}</span>
              <span> • </span>
              <span>
                Review Progress:{' '}
                <strong>
                  {cycleComplete
                    ? 'Review Completed'
                    : isManagerReviewDone && includesAdmin
                    ? 'Awaiting Admin Review'
                    : !effectiveSelfReviewDone
                    ? 'Self Review Pending'
                    : 'Manager Review Pending'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <div className="cycle-banner-right">
          <div className="current-stage-indicator">
            <span>Current Stage:</span>
            <strong>
              {cycleComplete
                ? 'Completed'
                : isManagerReviewDone && includesAdmin
                ? 'Admin Review'
                : effectiveSelfReviewDone
                ? 'Manager Review'
                : 'Self Review'}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Summary Cards (4 Compact Cards) */}
      <div className="my-perf-summary-grid">
        <div className="my-perf-stat-card is-primary">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">My Goals</span>
            <span className="my-perf-stat-val">{goals.length} Total</span>
          </div>
          <div className="my-perf-stat-icon blue">
            <Target size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-info">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Goal Progress</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-info-text)' }}>{avgGoalProgress}%</span>
          </div>
          <div className="my-perf-stat-icon cyan">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card inline-flex container my-perf-stat-card-self-review" style={{ display: 'flex' }}>
          <div
            className={`my-perf-stat-card ${
              includesSelf
                ? effectiveSelfReviewDone
                  ? 'is-success'
                  : 'is-warning'
                : isManagerReviewDone
                ? 'is-success'
                : 'is-warning'
            }`}
            style={{ border: 'none', padding: 0, width: '100%', boxShadow: 'none' }}
          >
            <div className="my-perf-stat-left">
              <span className="my-perf-stat-label">{includesSelf ? 'Self Review' : 'Manager Review'}</span>
              <span
                className="my-perf-stat-val"
                style={{
                  color:
                    (includesSelf ? effectiveSelfReviewDone : isManagerReviewDone)
                      ? 'var(--color-success-text)'
                      : 'var(--color-warning-text)'
                }}
              >
                {includesSelf
                  ? effectiveSelfReviewDone
                    ? 'Completed'
                    : 'Pending'
                  : isManagerReviewDone
                  ? 'Completed'
                  : 'Pending'}
              </span>
            </div>
            <div
              className={`my-perf-stat-icon ${
                (includesSelf ? effectiveSelfReviewDone : isManagerReviewDone) ? 'green' : 'amber'
              }`}
            >
              <Clock size={18} />
            </div>
          </div>
        </div>

        <div className="my-perf-stat-card inline-flex container my-perf-stat-card-rating" style={{ display: 'flex' }}>
          <div className={`my-perf-stat-card ${cycleComplete ? 'is-success' : 'is-primary'}`} style={{ border: 'none', padding: 0, width: '100%', boxShadow: 'none' }}>
            <div className="my-perf-stat-left">
              <span className="my-perf-stat-label">Current Rating</span>
              {isFinalReviewCompleted && hasVisibleFinalResult ? (
                <>
                  {showFinalScore && (
                    <span className="my-perf-stat-val" style={{ color: 'var(--color-success-text)' }}>
                      {finalScores.overallScore.toFixed(2)} / 5
                    </span>
                  )}
                  {showFinalRating && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-success-text)', fontWeight: 600 }}>
                      {finalScores.overallLabel}
                    </span>
                  )}
                </>
              ) : (
                <span className="my-perf-stat-val" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  Not Available Yet
                </span>
              )}
            </div>
            <div className="my-perf-stat-icon purple">
              <Award size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Final Review Result Banner (shown only after HR/Admin finalizes, respecting visibility settings) */}
      {isFinalReviewCompleted && (
        <div className="active-cycle-banner" style={{ borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }}>
          <div className="cycle-banner-left">
            <div className="cycle-banner-icon" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              <Award size={20} />
            </div>
            <div className="cycle-banner-title-col">
              <div className="cycle-banner-name">
                <span>Performance Review Completed</span>
                <span className="pms-badge badge-success">Status: Completed</span>
              </div>
              <div className="cycle-banner-meta">
                {hasVisibleFinalResult ? (
                  <>
                    {showFinalScore && <span>Overall Score: <strong>{finalScores.overallScore.toFixed(2)} / 5</strong></span>}
                    {showFinalScore && showFinalRating && <span> • </span>}
                    {showFinalRating && <span>Rating: <strong>{finalScores.overallLabel}</strong></span>}
                    {showCompetencyScores && (
                      <>
                        <span> • </span>
                        <span>Competency Score: <strong>{finalScores.competencyScore.toFixed(1)} / 5</strong></span>
                      </>
                    )}
                  </>
                ) : (
                  <span>Your result has been finalized. Detailed scores are not enabled for employee visibility.</span>
                )}
              </div>
              {showManagerComments && finalReviewRecord.managerReviewOverall.managerSummary && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '6px 0 0 0', maxWidth: 560 }}>
                  <strong>Manager Comment:</strong> {finalReviewRecord.managerReviewOverall.managerSummary}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Your Pending Actions (High Visibility Section) */}
      {!cycleComplete && (
      <div className="pending-actions-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Zap size={16} color="#0284C7" />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
            Your Pending Actions
          </span>
        </div>

        <div className="pending-actions-grid">
          {/* Action 1: Complete Self Review (only when flow includes self) */}
          {includesSelf && (!isSelfReviewDone ? (
            <div className="action-card-item is-urgent">
              <div className="action-card-top">
                <div className="action-card-title-row">
                  <span className="action-card-title">Complete Self Review</span>
                  <span className="pms-badge badge-warning" style={{ fontSize: '0.65rem' }}>Pending</span>
                </div>
                <p className="action-card-desc">
                  Your self review questionnaire is open for submission.
                </p>
                <div className="action-card-deadline">
                  <Clock size={12} />
                  <span>Deadline: 30 Mar 2027</span>
                </div>
              </div>
              <div className="action-card-footer">
                <button
                  type="button"
                  className="pms-btn pms-btn-primary"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.75rem', gap: 4 }}
                  onClick={() => onNavigate('/performance/my-performance/self-review')}
                >
                  <span>Start Review</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="action-card-item" style={{ borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }}>
              <div className="action-card-top">
                <div className="action-card-title-row">
                  <span className="action-card-title" style={{ color: '#065F46' }}>Self Review Submitted</span>
                  <span className="pms-badge badge-success" style={{ fontSize: '0.65rem' }}>Completed</span>
                </div>
                <p className="action-card-desc" style={{ color: '#047857' }}>
                  You have completed and submitted your self assessment questionnaire.
                </p>
                <div className="action-card-deadline" style={{ color: '#059669' }}>
                  <CheckCircle2 size={12} />
                  <span>Submitted: 28 Mar 2027</span>
                </div>
              </div>
              <div className="action-card-footer">
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.75rem', borderColor: '#A7F3D0', color: '#047857' }}
                  onClick={() => onNavigate('/performance/my-performance/self-review')}
                >
                  View Submitted Review
                </button>
              </div>
            </div>
          ))}

          {/* Action 2: Update Goal Progress */}
          <div className="action-card-item">
            <div className="action-card-top">
              <div className="action-card-title-row">
                <span className="action-card-title">Update Goal Progress</span>
                <span className="pms-badge badge-info" style={{ fontSize: '0.65rem' }}>{goals.length} Goals</span>
              </div>
              <p className="action-card-desc">
                Keep your goal progress current so your manager sees an accurate picture.
              </p>
            </div>
            <div className="action-card-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ width: '100%', padding: '6px 12px', fontSize: '0.75rem' }}
                onClick={() => onNavigate('/performance/goals/my')}
              >
                Update Goals
              </button>
            </div>
          </div>

          {/* Action 3: Manager Review — Locked / Pending / Completed */}
          <div
            className={`action-card-item ${!effectiveSelfReviewDone ? 'is-locked' : ''}`}
            style={
              isManagerReviewDone
                ? { border: '1px solid #A7F3D0', backgroundColor: '#F0FDF4' }
                : effectiveSelfReviewDone
                ? { border: '1px solid #FEF3C7', backgroundColor: '#FFFBEB' }
                : {}
            }
          >
            <div className="action-card-top">
              <div className="action-card-title-row">
                <span
                  className="action-card-title"
                  style={{ color: isManagerReviewDone ? '#065F46' : !effectiveSelfReviewDone ? 'var(--text-secondary)' : '#B45309' }}
                >
                  Manager Review
                </span>
                <span
                  className={`pms-badge ${
                    isManagerReviewDone ? 'badge-success' : !effectiveSelfReviewDone ? 'badge-neutral' : 'badge-warning'
                  }`}
                  style={{ fontSize: '0.65rem', gap: 3 }}
                >
                  {isManagerReviewDone ? <CheckCircle2 size={10} /> : !effectiveSelfReviewDone ? <Lock size={10} /> : <Clock size={10} />}
                  <span>{isManagerReviewDone ? 'Completed' : !effectiveSelfReviewDone ? 'Locked' : 'Pending'}</span>
                </span>
              </div>
              <p
                className="action-card-desc"
                style={{ color: isManagerReviewDone ? '#047857' : !effectiveSelfReviewDone ? 'var(--text-muted)' : '#D97706' }}
              >
                {isManagerReviewDone
                  ? includesAdmin
                    ? 'Your manager has completed this review. Admin review is pending.'
                    : 'Your manager has completed this review.'
                  : !effectiveSelfReviewDone
                  ? 'Available after you complete and submit your self review.'
                  : 'Vikram Patel is reviewing your goals and core competencies.'}
              </p>
            </div>
            <div className="action-card-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                disabled={!effectiveSelfReviewDone}
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  opacity: !effectiveSelfReviewDone ? 0.5 : 1,
                  cursor: !effectiveSelfReviewDone ? 'not-allowed' : 'pointer'
                }}
              >
                {!effectiveSelfReviewDone ? 'Awaiting Self Review' : 'View Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 5. Two-Column Dashboard (My Goals + Performance Breakdown / Review Journey) */}
      <div className="my-perf-two-col-grid">
        {/* Left Column: My Goals Overview */}
        <Card
          title="My Goals"
          subtitle="Active performance goals for FY 2026–27"
          action={
            <button
              className="pms-btn-link"
              onClick={() => onNavigate('/performance/goals/my')}
            >
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
                  <span className={`pms-badge ${goalBadgeVariant(goal.status)}`} style={{ fontSize: '0.65rem' }}>
                    {goal.status}
                  </span>
                </div>

                <div className="goal-row-progress-line">
                  <div className="sixtifi-progress-bar-bg" style={{ flex: 1, height: '6px' }}>
                    <div
                      className={`sixtifi-progress-bar-fill ${goalBarVariant(goal.status)}`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="goal-row-progress-text">{goal.progress}%</span>
                </div>

                <div className="goal-row-meta">
                  <span>Appraisal Weight: {goal.weight}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>Due {goal.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Performance Breakdown & Review Journey */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Performance Breakdown */}
          <Card
            title="Performance Breakdown"
            subtitle="Current cycle evaluation weights"
          >
            <div className="perf-breakdown-stack">
              <div className="breakdown-row-box">
                <div className="breakdown-row-header">
                  <span className="breakdown-row-title">Goals / KPI</span>
                  <span className="breakdown-row-weight">Weight: {goalsWeight}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Progress:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284C7' }}>{avgGoalProgress}%</span>
                </div>
                <div className="sixtifi-progress-bar-bg" style={{ height: '5px' }}>
                  <div className="sixtifi-progress-bar-fill primary" style={{ width: `${avgGoalProgress}%` }} />
                </div>
              </div>

              <div className="breakdown-row-box">
                <div className="breakdown-row-header">
                  <span className="breakdown-row-title">Competencies</span>
                  <span className="breakdown-row-weight">Weight: {compWeight}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Review:</span>
                  {isFinalReviewCompleted && showCompetencyScores ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7C3AED' }}>
                      {finalScores.competencyScore.toFixed(1)} / 5
                    </span>
                  ) : (
                    <span className="pms-badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {isFinalReviewCompleted ? 'Not Available' : 'Not Started'}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '8px 10px', backgroundColor: isFinalReviewCompleted ? '#F0FDF4' : 'var(--bg-subtle)', borderRadius: 6, border: `1px solid ${isFinalReviewCompleted ? '#A7F3D0' : 'var(--border-subtle)'}` }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Overall Performance:{' '}
                  {isFinalReviewCompleted && hasVisibleFinalResult ? (
                    <span style={{ color: '#047857', fontWeight: 700 }}>
                      {showFinalScore && `${finalScores.overallScore.toFixed(2)} / 5`}
                      {showFinalScore && showFinalRating && ' — '}
                      {showFinalRating && finalScores.overallLabel}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Not Available</span>
                  )}
                </div>
                {!isFinalReviewCompleted && (
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Your overall performance rating will be available after your review is completed.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Review Journey */}
          <Card
            title="Review Journey"
            subtitle="Progression steps for active review cycle"
          >
            <div className="review-journey-timeline">
              {includesSelf && (
              <div className={`journey-step-row ${!effectiveSelfReviewDone ? 'is-current' : 'is-completed'}`}>
                <div className="journey-node-circle" style={effectiveSelfReviewDone ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' } : {}}>
                  {effectiveSelfReviewDone ? '✓' : '1'}
                </div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Self Review</span>
                    <span className={`pms-badge ${effectiveSelfReviewDone ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {effectiveSelfReviewDone ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <span className="journey-step-desc">
                    {effectiveSelfReviewDone
                      ? 'Completed and submitted on 28 Mar 2027.'
                      : 'Complete your self review to move to the next stage.'}
                  </span>
                </div>
              </div>
              )}

              <div className={`journey-step-row ${effectiveSelfReviewDone && !isManagerReviewDone ? 'is-current' : isManagerReviewDone ? 'is-completed' : ''}`}>
                <div className="journey-node-circle" style={isManagerReviewDone ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' } : {}}>
                  {isManagerReviewDone ? '✓' : includesSelf ? '2' : '1'}
                </div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Manager Review</span>
                    <span
                      className={`pms-badge ${
                        isManagerReviewDone ? 'badge-success' : effectiveSelfReviewDone ? 'badge-warning' : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {isManagerReviewDone ? 'Completed' : effectiveSelfReviewDone ? 'Pending' : 'Locked'}
                    </span>
                  </div>
                  <span className="journey-step-desc">
                    Manager evaluates goals and core competencies.
                  </span>
                </div>
              </div>

              {includesAdmin && (
              <div className={`journey-step-row ${isManagerReviewDone && !isFinalReviewCompleted ? 'is-current' : isFinalReviewCompleted ? 'is-completed' : ''}`}>
                <div className="journey-node-circle" style={isFinalReviewCompleted ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' } : {}}>
                  {isFinalReviewCompleted ? '✓' : includesSelf ? '3' : '2'}
                </div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Admin Review</span>
                    <span
                      className={`pms-badge ${
                        isFinalReviewCompleted ? 'badge-success' : isManagerReviewDone ? 'badge-warning' : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {isFinalReviewCompleted ? 'Completed' : isManagerReviewDone ? 'Pending' : 'Locked'}
                    </span>
                  </div>
                  <span className="journey-step-desc">
                    {isFinalReviewCompleted
                      ? `Finalized on ${finalReviewDecision?.completedDate || '31 Mar 2027'}.`
                      : isManagerReviewDone
                      ? 'Awaiting HR calibration and final rating release.'
                      : 'HR/Admin calibration and final rating release.'}
                  </span>
                </div>
              </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 6. Recent Activity Section */}
      <Card
        title="Recent Activity"
        subtitle="Your latest milestones and progress updates"
      >
        <div className="activity-stream-list">
          {recentActivities.map((act, idx) => (
            <div key={idx} className="activity-stream-item">
              <div className="activity-dot-pin" />
              <div className="activity-item-content">
                <span className="activity-item-text">{act.text}</span>
                <span className="activity-item-time">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
