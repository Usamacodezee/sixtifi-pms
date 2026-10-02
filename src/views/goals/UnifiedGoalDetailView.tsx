import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { UserRole, GoalStatus } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import { MyGoalItem } from '../../data/mockMyGoals';
import { OverallGoal, TeamGoal, TeamMemberGoalRow } from '../../data/mockGoalsModule';
import { getGoalPermissions, canAccessGoalDetail, GoalCategory } from '../../utils/goalPermissions';
import { UpdateProgressModal } from '../my-performance/UpdateProgressModal';
import { RatingScale } from '../../components/reviews/RatingScale';
import {
  ArrowLeft,
  Target,
  Clock,
  MessageSquare,
  Award,
  Star,
  CheckCircle2,
  X,
  Edit3,
  Lock,
  AlertTriangle,
  ShieldAlert,
  Building2,
  Users,
  Paperclip,
  FileText
} from 'lucide-react';
import '../my-performance/MyGoalsStyles.css';
import '../cycles/CycleGoalsTab.css';
import './GoalsModule.css';

export interface UnifiedGoalDetailViewProps {
  goalId: string;
  currentUserRole: UserRole;
  activeCycleStatus?: string;
  individualGoals: MyGoalItem[];
  overallGoals: OverallGoal[];
  teamGoals: TeamGoal[];
  teamMemberGoals: TeamMemberGoalRow[];
  onUpdateIndividualGoal: (
    goalId: string,
    updatedFields: {
      progress: number;
      currentAchievement: string;
      comment?: string;
      attachmentName?: string;
    }
  ) => void;
  onUpdateTeamMemberGoal?: (
    rowId: string,
    updatedFields: { progress?: number; status?: GoalStatus; managerRating?: number; managerComment?: string }
  ) => void;
  onUpdateOverallGoal?: (
    goalId: string,
    updatedFields: { progress?: number; status?: GoalStatus; managerComment?: string }
  ) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  listBasePath?: string;
}

export const isGoalDueDatePassed = (dueDateStr?: string, status?: GoalStatus): boolean => {
  if (status === 'Completed') return true;
  if (!dueDateStr) return false;

  const parsedDueDate = new Date(dueDateStr);
  if (isNaN(parsedDueDate.getTime())) return false;

  // Demo current date reference context (Oct 2026)
  const currentDemoDate = new Date('2026-10-01');
  return parsedDueDate.getTime() <= currentDemoDate.getTime();
};

export const UnifiedGoalDetailView: React.FC<UnifiedGoalDetailViewProps> = ({
  goalId,
  currentUserRole,
  activeCycleStatus = 'Active',
  individualGoals,
  overallGoals,
  teamGoals,
  teamMemberGoals,
  onUpdateIndividualGoal,
  onUpdateTeamMemberGoal,
  onUpdateOverallGoal,
  onNavigate,
  onShowToast,
  listBasePath = '/performance/goals/my'
}) => {
  const perms = getGoalPermissions(currentUserRole, activeCycleStatus);

  // 1. Resolve Goal from state pools
  const myGoal = individualGoals.find((g) => g.id === goalId);
  const teamMemberGoal = teamMemberGoals.find((r) => r.id === goalId);
  const teamGoal = teamGoals.find((t) => t.id === goalId);
  const overallGoal = overallGoals.find((o) => o.id === goalId);

  // Determine Category & Model
  let category: GoalCategory = 'my';
  let title = 'Goal Details';
  let description = '';
  let ownerName = 'Rahul Shah';
  let ownerRole = 'Employee';
  let department = 'Sales';
  let manager = 'Vikram Patel';
  let target = '100%';
  let currentAchievement = '0%';
  let progress = 0;
  let weight = 20;
  let startDate = '01 Apr 2026';
  let dueDate = '31 Mar 2027';
  let status: GoalStatus = 'On Track';
  let managerComment: string | undefined = undefined;
  let managerRating: number | undefined = undefined;
  let attachmentName: string | undefined = undefined;
  let history: any[] = [];

  if (myGoal) {
    category = 'my';
    title = myGoal.title;
    description = myGoal.description || '';
    ownerName = 'Rahul Shah';
    ownerRole = 'Sales Executive';
    department = 'Sales';
    manager = myGoal.manager;
    target = myGoal.target;
    currentAchievement = myGoal.currentAchievement;
    progress = myGoal.progress;
    weight = myGoal.weight;
    startDate = myGoal.startDate;
    dueDate = myGoal.dueDate;
    status = myGoal.status;
    managerComment = myGoal.managerComment;
    managerRating = (myGoal as any).managerRating;
    attachmentName = myGoal.evidencePlaceholder || (myGoal as any).attachmentName;
    history = myGoal.history || [];
  } else if (teamMemberGoal) {
    category = 'team';
    title = teamMemberGoal.goalTitle;
    description = `Direct report performance objective assigned to ${teamMemberGoal.employeeName}.`;
    ownerName = teamMemberGoal.employeeName;
    ownerRole = teamMemberGoal.designation;
    department = teamMemberGoal.department;
    manager = 'Current Manager';
    target = teamMemberGoal.target;
    currentAchievement = `${teamMemberGoal.progress}% achieved`;
    progress = teamMemberGoal.progress;
    weight = teamMemberGoal.weight;
    startDate = '01 Apr 2026';
    dueDate = '31 Mar 2027';
    status = teamMemberGoal.status;
    managerComment = (teamMemberGoal as any).managerComment;
    managerRating = (teamMemberGoal as any).managerRating;
    attachmentName = (teamMemberGoal as any).attachmentName;
    history = [];
  } else if (teamGoal) {
    category = 'team';
    title = teamGoal.title;
    description = teamGoal.description;
    ownerName = teamGoal.owner;
    ownerRole = teamGoal.ownerRole;
    department = teamGoal.department;
    manager = 'Department Head';
    target = teamGoal.target;
    currentAchievement = teamGoal.currentAchievement;
    progress = teamGoal.progress;
    weight = teamGoal.weight;
    startDate = teamGoal.startDate;
    dueDate = teamGoal.dueDate;
    status = teamGoal.status;
    managerComment = (teamGoal as any).managerComment;
    managerRating = (teamGoal as any).managerRating;
    attachmentName = (teamGoal as any).attachmentName;
    history = teamGoal.history || [];
  } else if (overallGoal) {
    category = 'overall';
    title = overallGoal.title;
    description = overallGoal.description;
    ownerName = overallGoal.owner;
    ownerRole = overallGoal.ownerRole;
    department = 'Company Wide';
    manager = 'Executive Leadership';
    target = overallGoal.target;
    currentAchievement = overallGoal.currentAchievement;
    progress = overallGoal.progress;
    weight = overallGoal.weight;
    startDate = overallGoal.startDate;
    dueDate = overallGoal.dueDate;
    status = overallGoal.status;
    managerComment = (overallGoal as any).managerComment;
    managerRating = (overallGoal as any).managerRating;
    attachmentName = (overallGoal as any).attachmentName;
    history = overallGoal.history || [];
  } else {
    category = 'my';
    const fallback = individualGoals[0];
    if (fallback) {
      title = fallback.title;
      target = fallback.target;
      currentAchievement = fallback.currentAchievement;
      progress = fallback.progress;
      weight = fallback.weight;
      status = fallback.status;
    }
  }

  // Check Permission Access
  const isAuthorized = canAccessGoalDetail(category, currentUserRole);

  // Check Due Date Passed Rule for Review
  const dueDatePassed = isGoalDueDatePassed(dueDate, status);

  // Modals state
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review modal form state
  const [reviewRating, setReviewRating] = useState<number>(managerRating || 4);
  const [reviewCommentText, setReviewCommentText] = useState<string>(managerComment || '');
  const [reviewStatus, setReviewStatus] = useState<GoalStatus>(status);

  if (!isAuthorized) {
    return (
      <div className="goals-module-page animate-fade-in">
        <PageHeader
          title="Access Restricted"
          subtitle="Insufficient permissions to view this goal"
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'Goals', href: '#/performance/goals' },
            { label: 'Restricted' }
          ]}
        />
        <div style={{ padding: '40px 20px', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#DC2626' }}>
            <ShieldAlert size={28} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            Permission Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 20px' }}>
            You do not have permission to view {category === 'team' ? 'Team Goals' : 'Overall Goals'}. Your role ({currentUserRole}) grants access to personal goals.
          </p>
          <button
            type="button"
            className="pms-btn pms-btn-primary"
            onClick={() => onNavigate('/performance/goals/my')}
          >
            <ArrowLeft size={14} />
            <span>Go to My Goals</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSaveProgressUpdate = (
    id: string,
    fields: { progress: number; currentAchievement: string; comment?: string; attachmentName?: string }
  ) => {
    onUpdateIndividualGoal(id, fields);
    setIsUpdateProgressOpen(false);
    onShowToast?.(
      'success',
      'Progress updated',
      `Goal progress recorded at ${fields.progress}%.`
    );
  };

  const handleOpenReviewClick = () => {
    if (!dueDatePassed && !managerRating) {
      onShowToast?.(
        'warning',
        'Review Locked Until Due Date',
        `Goal review & rating is only applicable after the target due date (${dueDate}) has passed or when the goal is marked as Completed.`
      );
      return;
    }
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (category === 'team' && teamMemberGoal && onUpdateTeamMemberGoal) {
      onUpdateTeamMemberGoal(teamMemberGoal.id, {
        status: reviewStatus,
        managerRating: reviewRating,
        managerComment: reviewCommentText
      });
    } else if (category === 'overall' && overallGoal && onUpdateOverallGoal) {
      onUpdateOverallGoal(overallGoal.id, {
        status: reviewStatus,
        managerComment: reviewCommentText
      });
    }

    setIsReviewModalOpen(false);
    onShowToast?.(
      'success',
      'Goal Review Saved',
      `Review and status for "${title}" have been updated.`
    );
  };

  const renderStatusBadge = (s: GoalStatus) => {
    switch (s) {
      case 'On Track':
      case 'Completed':
        return <span className="pms-badge badge-success">{s}</span>;
      case 'At Risk':
        return <span className="pms-badge badge-warning">{s}</span>;
      case 'Needs Attention':
        return <span className="pms-badge badge-danger">{s}</span>;
      default:
        return <span className="pms-badge badge-neutral">{s}</span>;
    }
  };

  const canEditCurrentGoal =
    category === 'my'
      ? perms.canEditMyGoals
      : category === 'team'
      ? perms.canEditTeamGoals
      : perms.canEditOverallGoals;

  // Active goal fallback object for UpdateProgressModal
  const activeGoalForModal: MyGoalItem = myGoal || {
    id: goalId,
    companyId: 'co-sixtifi',
    title: title,
    description: description,
    target: target,
    currentAchievement: currentAchievement,
    progress: progress,
    weight: weight,
    startDate: startDate,
    dueDate: dueDate,
    status: status,
    manager: manager,
    history: history
  };

  return (
    <div className="my-goal-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={title}
        subtitle={`${category.toUpperCase()} GOAL • Owner: ${ownerName} (${ownerRole}) • Target: ${target}`}
        badge={status}
        badgeVariant={
          status === 'On Track' || status === 'Completed'
            ? 'success'
            : status === 'At Risk'
            ? 'warning'
            : 'danger'
        }
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Goals', href: `#${listBasePath}` },
          { label: title }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate(listBasePath)}
            >
              <ArrowLeft size={14} />
              <span>Back to Goals</span>
            </button>

            {/* Prominent Update Progress Button */}
            <button
              type="button"
              className={`pms-btn ${perms.canEditMyGoals ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '6px' }}
              disabled={!perms.canEditMyGoals}
              onClick={() => setIsUpdateProgressOpen(true)}
              title={!perms.canEditMyGoals ? 'Goal progress updates locked by current cycle status' : undefined}
            >
              {!perms.canEditMyGoals ? <Lock size={14} /> : <Edit3 size={14} />}
              <span>Update Progress</span>
            </button>

            {/* Review Goal Button (Only enabled after due date passed or completed) */}
            {(category === 'team' || category === 'overall') && canEditCurrentGoal && (
              <button
                type="button"
                className={`pms-btn ${dueDatePassed || managerRating ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  gap: '6px',
                  backgroundColor: dueDatePassed || managerRating ? '#0284C7' : undefined
                }}
                onClick={handleOpenReviewClick}
              >
                {!dueDatePassed && !managerRating ? <Lock size={14} /> : <Award size={14} />}
                <span>{managerRating ? 'Edit Review' : 'Review & Rate Goal'}</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. Hero Goal Performance Card */}
      <div className="my-goal-hero-card">
        <div className="my-goal-hero-top">
          <div className="my-goal-hero-title-area">
            <span className="my-goal-hero-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {category === 'my' && <Target size={14} color="#0284C7" />}
              {category === 'team' && <Users size={14} color="#0284C7" />}
              {category === 'overall' && <Building2 size={14} color="#0284C7" />}
              <span>{category === 'my' ? 'Individual Goal' : category === 'team' ? 'Team Goal' : 'Overall Objective'}</span>
            </span>
            <h2 className="my-goal-hero-title">{title}</h2>
            {description && <p className="my-goal-hero-desc">{description}</p>}
          </div>
          <div className="my-goal-hero-badges">
            <span className="pms-badge badge-info">Appraisal Weight: {weight}%</span>
            {renderStatusBadge(status)}
          </div>
        </div>

        {/* Progress Section */}
        <div className="my-goal-progress-section">
          <div className="my-goal-progress-top-row">
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                Objective Achievement Progress
              </span>
              <div className="my-goal-progress-big-num">
                {progress}% Complete
              </div>
            </div>

            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem', gap: 5 }}
              onClick={() => setIsUpdateProgressOpen(true)}
            >
              <Edit3 size={13} />
              <span>Update Progress</span>
            </button>
          </div>

          <div className="sixtifi-progress-bar-bg" style={{ height: '10px' }}>
            <div
              className={`sixtifi-progress-bar-fill ${
                status === 'Completed' || progress === 100
                  ? 'complete'
                  : status === 'On Track'
                  ? 'primary'
                  : status === 'At Risk'
                  ? 'warning'
                  : 'danger'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="my-goal-metrics-grid">
          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Target</span>
            <span className="my-goal-metric-val">{target}</span>
          </div>

          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Current Achievement</span>
            <span className="my-goal-metric-val" style={{ color: '#0284C7' }}>
              {currentAchievement}
            </span>
          </div>

          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Start Date</span>
            <span className="my-goal-metric-val" style={{ fontSize: '0.85rem' }}>
              {startDate}
            </span>
          </div>

          <div className="my-goal-metric-box">
            <span className="my-goal-metric-lbl">Due Date</span>
            <span className="my-goal-metric-val" style={{ fontSize: '0.85rem' }}>
              {dueDate}
            </span>
          </div>
        </div>

        {/* Supporting Attachment if present */}
        {attachmentName && (
          <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '10px 14px', borderRadius: 6, fontSize: '0.8rem', color: '#0369A1', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Paperclip size={15} color="#0284C7" />
            <span>Supporting Document: <strong>{attachmentName}</strong></span>
          </div>
        )}

        {/* Notice line if cycle locked */}
        {!perms.canEditMyGoals && (
          <div className="manager-controlled-notice" style={{ background: '#FFFBEB', borderColor: '#FDE68A', color: '#92400E' }}>
            <Lock size={14} style={{ color: '#D97706', flexShrink: 0 }} />
            <span>
              <strong>Cycle Progress Locked:</strong> Goal milestone updates are currently disabled according to the review cycle status (<strong>{activeCycleStatus}</strong>).
            </span>
          </div>
        )}
      </div>

      {/* 3. Essential Two-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 'var(--space-4)' }}>
        {/* Left: Manager Evaluation & Review */}
        <Card
          title="Manager Evaluation & Review"
          subtitle="Performance checkpoints and supervisory rating"
          action={
            (category === 'team' || category === 'overall') && canEditCurrentGoal ? (
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.72rem', gap: 4 }}
                onClick={handleOpenReviewClick}
              >
                <Edit3 size={11} />
                <span>{managerRating ? 'Edit Feedback' : 'Add Review'}</span>
              </button>
            ) : undefined
          }
        >
          {managerRating || managerComment ? (
            <div className="my-goal-manager-feedback-box">
              <div className="my-goal-manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={15} color="#0284C7" />
                  <span>Feedback from {manager}</span>
                </div>
                {managerRating && (
                  <span className="pms-badge badge-success" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="currentColor" /> {managerRating}.0 / 5
                  </span>
                )}
              </div>
              {managerComment && (
                <p className="my-goal-manager-quote">
                  &ldquo;{managerComment}&rdquo;
                </p>
              )}
              <div className="my-goal-manager-sub">
                Evaluated for Appraisal Cycle: {activeCycleStatus}
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <Lock size={18} style={{ margin: '0 auto 8px', display: 'block', color: 'var(--text-muted)' }} />
              {dueDatePassed ? (
                <span>Target due date passed (<strong>{dueDate}</strong>). Ready for manager review and rating.</span>
              ) : (
                <div>
                  <span style={{ display: 'block', marginBottom: 4 }}>Goal review & rating is applicable <strong>after target due date ({dueDate})</strong> has passed.</span>
                  <span className="pms-badge badge-warning" style={{ fontSize: '0.68rem' }}>Review Locked Until Due Date</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Right: Goal Parameters */}
        <Card
          title="Goal Configuration"
          subtitle="Parameters & Metadata"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Owner:</span>
              <span style={{ fontWeight: 600 }}>{ownerName} ({ownerRole})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <span style={{ fontWeight: 600 }}>{department}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Supervising Manager:</span>
              <span style={{ fontWeight: 600 }}>{manager}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Cycle:</span>
              <span style={{ fontWeight: 600 }}>{activeCycleStatus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status Tier:</span>
              <span>{renderStatusBadge(status)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Progress History Timeline */}
      <Card
        title="Progress History"
        subtitle="Chronological log of milestone metric updates"
      >
        {history && history.length > 0 ? (
          <div className="my-goal-history-timeline">
            {history.map((hist, idx) => (
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
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No progression history recorded yet. Use the &quot;Update Progress&quot; button to log your first update!
          </div>
        )}
      </Card>

      {/* Modals */}
      {isUpdateProgressOpen && (
        <UpdateProgressModal
          goal={activeGoalForModal}
          isOpen={true}
          onClose={() => setIsUpdateProgressOpen(false)}
          onSave={handleSaveProgressUpdate}
        />
      )}

      {isReviewModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <form onSubmit={handleSaveReviewModal}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={18} color="#0284C7" />
                    <span>Review Goal — {title}</span>
                  </h3>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setIsReviewModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!dueDatePassed && reviewStatus !== 'Completed' && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: 6, fontSize: '0.78rem', color: '#92400E', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>Target due date ({dueDate}) has not passed yet. Change status to <strong>Completed</strong> to submit an early evaluation.</span>
                  </div>
                )}

                <div style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Goal Target</span>
                    <strong>{progress}% Complete</strong> ({target})
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <select
                      className="pms-select"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value as GoalStatus)}
                    >
                      <option value="On Track">On Track</option>
                      <option value="Completed">Completed</option>
                      <option value="At Risk">At Risk</option>
                      <option value="Needs Attention">Needs Attention</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 6, display: 'block' }}>
                    Single Goal Rating (1 to 5)
                  </label>
                  <RatingScale
                    value={reviewRating}
                    onChange={(val) => setReviewRating(val)}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 6, display: 'block' }}>
                    Evaluation Notes & Feedback
                  </label>
                  <textarea
                    className="pms-textarea"
                    rows={4}
                    placeholder="Enter review comments or observation notes..."
                    value={reviewCommentText}
                    onChange={(e) => setReviewCommentText(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pms-btn pms-btn-primary"
                  style={{ backgroundColor: '#0284C7' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
