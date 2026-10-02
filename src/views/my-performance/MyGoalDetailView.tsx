import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { MyGoalItem } from '../../data/mockMyGoals';
import { GoalStatus } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import { UpdateProgressModal } from './UpdateProgressModal';
import {
  ArrowLeft,
  Target,
  Clock,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Lock,
  Edit3,
  FileText,
  User,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import './MyGoalsStyles.css';

export interface MyGoalDetailViewProps {
  goalId: string;
  goals: MyGoalItem[];
  onUpdateGoal: (goalId: string, updatedFields: {
    progress: number;
    currentAchievement: string;
    comment?: string;
    attachmentName?: string;
  }) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  /** List route used for breadcrumbs / back navigation. */
  listBasePath?: string;
}

export const MyGoalDetailView: React.FC<MyGoalDetailViewProps> = ({
  goalId,
  goals,
  onUpdateGoal,
  onNavigate,
  onShowToast,
  listBasePath = '/performance/my-performance/goals'
}) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const matchedGoal = goals.find((g) => g.id === goalId) || goals[0];

  const handleSaveProgress = (
    id: string,
    updatedFields: {
      progress: number;
      currentAchievement: string;
      comment?: string;
      attachmentName?: string;
    }
  ) => {
    onUpdateGoal(id, updatedFields);
    setIsUpdateModalOpen(false);
    if (onShowToast) {
      onShowToast(
        'success',
        'Goal progress updated successfully.',
        `Goal is now at ${updatedFields.progress}% (${updatedFields.currentAchievement}).`
      );
    }
  };

  const renderStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case 'On Track':
        return <span className="pms-badge badge-success">On Track</span>;
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'At Risk':
        return <span className="pms-badge badge-warning">At Risk</span>;
      case 'Needs Attention':
        return <span className="pms-badge badge-danger">Needs Attention</span>;
      default:
        return <span className="pms-badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="my-goal-detail-page">
      {/* 1. Page Header */}
      <PageHeader
        title={matchedGoal.title}
        subtitle={`Annual Goal • Target: ${matchedGoal.target} • Reporting Manager: ${matchedGoal.manager}`}
        badge={matchedGoal.status}
        badgeVariant={
          matchedGoal.status === 'On Track' || matchedGoal.status === 'Completed'
            ? 'success'
            : matchedGoal.status === 'At Risk'
            ? 'warning'
            : 'danger'
        }
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Goals', href: `#${listBasePath}` },
          { label: matchedGoal.title }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate(listBasePath)}
            >
              <ArrowLeft size={14} />
              <span>Back to My Goals</span>
            </button>

            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => setIsUpdateModalOpen(true)}
            >
              <Edit3 size={14} />
              <span>Update Progress</span>
            </button>
          </div>
        }
      />

      {/* 2. Hero Goal Performance & Progress Card */}
      <div className="my-goal-hero-card">
        <div className="my-goal-hero-top">
          <div className="my-goal-hero-title-area">
            <span className="my-goal-hero-label">Performance Objective</span>
            <h2 className="my-goal-hero-title">{matchedGoal.title}</h2>
            <p className="my-goal-hero-desc">{matchedGoal.description}</p>
          </div>
          <div className="my-goal-hero-badges">
            <span className="pms-badge badge-info">Appraisal Weight: {matchedGoal.weight}%</span>
            {renderStatusBadge(matchedGoal.status)}
          </div>
        </div>

        {/* Progress Big Section */}
        <div className="my-goal-progress-section">
          <div className="my-goal-progress-top-row">
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                Overall Goal Progress
              </span>
              <div className="my-goal-progress-big-num">
                {matchedGoal.progress}% Complete
              </div>
            </div>
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 5 }}
              onClick={() => setIsUpdateModalOpen(true)}
            >
              <Edit3 size={13} />
              <span>Log Milestone Update</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="sixtifi-progress-bar-bg" style={{ height: '10px' }}>
            <div
              className={`sixtifi-progress-bar-fill ${
                matchedGoal.status === 'Completed' || matchedGoal.progress === 100
                  ? 'complete'
                  : matchedGoal.status === 'On Track'
                  ? 'primary'
                  : matchedGoal.status === 'At Risk'
                  ? 'warning'
                  : 'danger'
              }`}
              style={{ width: `${matchedGoal.progress}%` }}
            />
          </div>
        </div>

        {/* Key Metrics 4-Box Grid */}
        <div className="my-goal-metrics-grid">
          {/* Target */}
          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Target</span>
            <span className="my-goal-metric-val">{matchedGoal.target}</span>
          </div>

          {/* Current Achievement */}
          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Current Achievement</span>
            <span className="my-goal-metric-val" style={{ color: '#0284C7' }}>
              {matchedGoal.currentAchievement}
            </span>
          </div>

          {/* Start Date */}
          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Start Date</span>
            <span className="my-goal-metric-val" style={{ fontSize: '0.85rem' }}>
              {matchedGoal.startDate}
            </span>
          </div>

          {/* Due Date */}
          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Due Date</span>
            <span className="my-goal-metric-val" style={{ fontSize: '0.85rem' }}>
              {matchedGoal.dueDate}
            </span>
          </div>
        </div>

        {/* Manager-Controlled Policy Note */}
        <div className="manager-controlled-notice">
          <Lock size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span>
            <strong>Manager Controlled:</strong> Goal title, appraisal weight ({matchedGoal.weight}%), target ({matchedGoal.target}), and due date ({matchedGoal.dueDate}) are fixed by your reporting manager ({matchedGoal.manager}). You can update your progress percentage and milestone achievements anytime.
          </span>
        </div>
      </div>

      {/* 3. Two-Column Grid: Manager Comments & Metadata */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'var(--space-4)' }}>
        {/* Left: Manager Comments Section */}
        <Card
          title="Manager Evaluation & Feedback"
          subtitle="Supervisory review checkpoints and guidance"
        >
          {matchedGoal.managerComment || (matchedGoal as any).managerRating ? (
            <div className="my-goal-manager-feedback-box">
              <div className="my-goal-manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={15} color="#0284C7" />
                  <span>Feedback from {matchedGoal.manager} ({matchedGoal.managerRole || 'Manager'})</span>
                </div>
                {(matchedGoal as any).managerRating && (
                  <span className="pms-badge badge-success" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                    ★ {(matchedGoal as any).managerRating}.0 / 5
                  </span>
                )}
              </div>
              {matchedGoal.managerComment && (
                <p className="my-goal-manager-quote">
                  &ldquo;{matchedGoal.managerComment}&rdquo;
                </p>
              )}
              <div className="my-goal-manager-sub">
                Recorded during performance checkpoint • Cycle: FY 2026–27
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Lock size={18} style={{ margin: '0 auto 6px', display: 'block', color: 'var(--text-muted)' }} />
              <span>Manager evaluation will take place after the target due date (<strong>{matchedGoal.dueDate}</strong>) or upon completion.</span>
            </div>
          )}
        </Card>

        {/* Right: Goal Parameters Summary */}
        <Card
          title="Goal Configuration"
          subtitle="Objective parameters established for FY 2026–27"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Employee:</span>
              <span style={{ fontWeight: 600 }}>Rahul Shah (EMP-1001)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <span style={{ fontWeight: 600 }}>Sales</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Supervising Manager:</span>
              <span style={{ fontWeight: 600 }}>{matchedGoal.manager}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Review Cycle:</span>
              <span style={{ fontWeight: 600 }}>FY 2026–27 Annual Performance Review</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status Tier:</span>
              <span>{renderStatusBadge(matchedGoal.status)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Section: Progress History Timeline */}
      <Card
        title="Progress History"
        subtitle="Chronological audit log of employee metric updates and evidence"
        action={
          <button
            className="pms-btn pms-btn-primary"
            style={{ padding: '4px 10px', fontSize: '0.72rem', gap: 4 }}
            onClick={() => setIsUpdateModalOpen(true)}
          >
            <Edit3 size={11} />
            <span>Add Update</span>
          </button>
        }
      >
        {matchedGoal.history && matchedGoal.history.length > 0 ? (
          <div className="my-goal-history-timeline">
            {matchedGoal.history.map((hist, idx) => (
              <div key={idx} className="my-goal-history-item">
                <div className="my-goal-history-dot" />
                <div className="my-goal-history-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} />
                    <span>{hist.date}</span>
                    <span>•</span>
                    <span>Updated by {hist.updatedBy}</span>
                  </div>
                  <span className="pms-badge badge-info" style={{ fontSize: '0.65rem' }}>
                    {hist.previousPercent}% &rarr; {hist.newPercent}%
                  </span>
                </div>

                <div className="my-goal-history-desc">
                  Progress updated to {hist.newPercent}%
                </div>

                {hist.comment && (
                  <div className="my-goal-history-note">
                    <strong>Note:</strong> {hist.comment}
                  </div>
                )}

                {idx === 0 && matchedGoal.evidencePlaceholder && (
                  <div className="my-goal-history-attachment">
                    <FileText size={12} />
                    <span>Attached Evidence: {matchedGoal.evidencePlaceholder}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No progression history recorded yet. Use the &quot;Update Progress&quot; button to record your first milestone!
          </div>
        )}
      </Card>

      {/* Update Progress Modal */}
      {isUpdateModalOpen && (
        <UpdateProgressModal
          goal={matchedGoal}
          isOpen={true}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={handleSaveProgress}
        />
      )}
    </div>
  );
};
