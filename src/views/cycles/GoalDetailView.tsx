import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { RatingScale } from '../../components/reviews/RatingScale';
import { MOCK_CYCLE_GOALS } from '../../data/mockCycleGoals';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import { TEAM_MEMBERS } from '../../data/mockMyTeam';
import { ToastType } from '../../components/ui/Toast';
import { GoalStatus } from '../../types/performance';
import {
  ArrowLeft,
  User,
  Clock,
  MessageSquare,
  Award,
  Star,
  CheckCircle2,
  X,
  Edit3,
  Lock,
  AlertTriangle
} from 'lucide-react';
import './CycleGoalsTab.css';

export interface GoalDetailViewProps {
  cycleId: string;
  goalId: string;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

export const isGoalDueDatePassed = (dueDateStr?: string, status?: GoalStatus): boolean => {
  if (status === 'Completed') return true;
  if (!dueDateStr) return false;

  const parsedDueDate = new Date(dueDateStr);
  if (isNaN(parsedDueDate.getTime())) return false;

  const currentDemoDate = new Date('2026-10-01');
  return parsedDueDate.getTime() <= currentDemoDate.getTime();
};

export const GoalDetailView: React.FC<GoalDetailViewProps> = ({
  cycleId,
  goalId,
  onNavigate,
  onShowToast
}) => {
  const matchedCycle =
    MOCK_PERFORMANCE_CYCLES.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];
  const matchedGoal =
    MOCK_CYCLE_GOALS.find((g) => g.id === goalId) || MOCK_CYCLE_GOALS[0];

  const cycleName = matchedCycle.name;

  // Local state for ad-hoc goal review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(
    (matchedGoal as any).managerRating || 4
  );
  const [reviewComment, setReviewComment] = useState<string>(
    matchedGoal.managerComment || ''
  );
  const [reviewStatus, setReviewStatus] = useState<GoalStatus>(matchedGoal.status);

  // Saved state for display
  const [savedRating, setSavedRating] = useState<number | undefined>(
    (matchedGoal as any).managerRating
  );
  const [savedComment, setSavedComment] = useState<string>(
    matchedGoal.managerComment || ''
  );
  const [savedDate, setSavedDate] = useState<string | undefined>(
    (matchedGoal as any).reviewedDate
  );

  const isDueDatePassed = isGoalDueDatePassed(matchedGoal.dueDate, reviewStatus || matchedGoal.status);

  const handleOpenReviewModal = () => {
    if (!isDueDatePassed && !savedRating) {
      if (onShowToast) {
        onShowToast(
          'warning',
          'Goal Review Locked',
          `Single goal review is available after the due date (${matchedGoal.dueDate}) or when status is marked as Completed.`
        );
      }
      setShowReviewModal(true);
      return;
    }
    setShowReviewModal(true);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      if (onShowToast) {
        onShowToast('error', 'Rating Required', 'Please select a rating between 1 and 5.');
      }
      return;
    }

    const todayStr = '01 Oct 2026';
    (matchedGoal as any).managerRating = reviewRating;
    matchedGoal.managerComment = reviewComment;
    matchedGoal.status = reviewStatus;
    (matchedGoal as any).reviewedDate = todayStr;

    // Sync into TEAM_MEMBERS for the main Manager Review wizard pre-filling
    TEAM_MEMBERS.forEach((m) => {
      m.goals.forEach((g) => {
        if (g.id === matchedGoal.id || g.title.toLowerCase() === matchedGoal.title.toLowerCase()) {
          (g as any).managerRating = reviewRating;
          (g as any).managerComment = reviewComment;
          g.status = reviewStatus;
        }
      });
    });

    setSavedRating(reviewRating);
    setSavedComment(reviewComment);
    setSavedDate(todayStr);
    setShowReviewModal(false);

    if (onShowToast) {
      onShowToast(
        'success',
        'Goal Review Saved',
        `Review & rating of ${reviewRating}/5 recorded for "${matchedGoal.title}".`
      );
    }
  };

  return (
    <div className="goal-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={matchedGoal.title}
        subtitle={`Owned by ${matchedGoal.employeeName} • ${matchedGoal.department} Department • ${cycleName}`}
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
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: cycleName, href: `#/performance/cycles/${cycleId}` },
          { label: 'Goals', href: `#/performance/cycles/${cycleId}/goals` },
          { label: matchedGoal.title }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate(`/performance/cycles/${cycleId}/goals`)}
            >
              <ArrowLeft size={14} />
              <span>Back to Cycle Goals</span>
            </button>

            <button
              className="pms-btn pms-btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                gap: '6px',
                backgroundColor: '#0284C7'
              }}
              onClick={() => setShowReviewModal(true)}
            >
              <Award size={14} />
              <span>{savedRating ? 'Edit Goal Review' : 'Review & Rate Goal'}</span>
            </button>

            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() =>
                onNavigate(
                  `/performance/cycles/${cycleId}/employees/${matchedGoal.employeeId}`
                )
              }
            >
              <User size={14} />
              <span>View Performance</span>
            </button>
          </div>
        }
      />

      {/* 2. Performance Summary Card */}
      <div className="goal-performance-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Performance Target & Achievement
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              {matchedGoal.progress}% Complete
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {savedRating && (
              <span className="pms-badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={12} fill="currentColor" />
                Single Goal Rating: {savedRating}.0 / 5
              </span>
            )}
            <span className="pms-badge badge-info">Weight in Appraisal: {matchedGoal.weight}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sixtifi-progress-bar-bg" style={{ height: '10px' }}>
          <div
            className={`sixtifi-progress-bar-fill ${matchedGoal.status === 'Completed' || matchedGoal.progress === 100
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

        {/* Target vs Achievement Metrics */}
        <div className="goal-perf-metrics-row">
          <div className="goal-perf-metric-box">
            <span className="goal-perf-lbl">Numerical Target</span>
            <span className="goal-perf-val" style={{ color: 'var(--text-primary)' }}>
              {matchedGoal.target}
            </span>
          </div>

          <div className="goal-perf-metric-box">
            <span className="goal-perf-lbl">Current Achievement</span>
            <span className="goal-perf-val" style={{ color: '#0284C7' }}>
              {matchedGoal.currentAchievement}
            </span>
          </div>

          <div className="goal-perf-metric-box">
            <span className="goal-perf-lbl">Target Deadline</span>
            <span className="goal-perf-val" style={{ fontSize: 'var(--text-base)' }}>
              {matchedGoal.dueDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Goal Information & Manager Comments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Left: Goal Information */}
        <Card
          title="Goal Information"
          subtitle="Objective parameters & metadata"
        >
          <div className="info-kv-grid">
            <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-k-label">Goal Title</span>
              <span className="info-v-val" style={{ fontSize: '0.85rem' }}>{matchedGoal.title}</span>
            </div>

            <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-k-label">Description</span>
              <span className="info-v-val" style={{ fontWeight: 'normal' }}>
                {matchedGoal.description}
              </span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Employee</span>
              <span className="info-v-val">{matchedGoal.employeeName} ({matchedGoal.employeeCode})</span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Department</span>
              <span className="info-v-val">{matchedGoal.department}</span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Reporting Manager</span>
              <span className="info-v-val">{matchedGoal.manager}</span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Weight</span>
              <span className="info-v-val">{matchedGoal.weight}%</span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Start Date</span>
              <span className="info-v-val">{matchedGoal.startDate}</span>
            </div>

            <div className="info-kv-item">
              <span className="info-k-label">Due Date</span>
              <span className="info-v-val">{matchedGoal.dueDate}</span>
            </div>
          </div>
        </Card>

        {/* Right: Manager Comments */}
        <Card
          title="Manager Evaluation & Feedback"
          subtitle="Ad-hoc single goal review & rating"
          action={
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.72rem', gap: 4 }}
              onClick={() => setShowReviewModal(true)}
            >
              <Edit3 size={12} />
              <span>{savedRating ? 'Edit Review' : 'Add Review'}</span>
            </button>
          }
        >
          {savedRating || savedComment ? (
            <div className="manager-comment-box" style={{ background: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 14 }}>
              <div className="manager-comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  <MessageSquare size={14} color="#0284C7" />
                  <span>Manager Feedback ({matchedGoal.manager})</span>
                </div>
                {savedRating && (
                  <span className="pms-badge badge-success" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={11} fill="currentColor" /> {savedRating}.0 / 5
                  </span>
                )}
              </div>
              {savedComment ? (
                <p className="manager-comment-quote" style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '8px 0' }}>
                  &ldquo;{savedComment}&rdquo;
                </p>
              ) : (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No feedback comments entered.</p>
              )}
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Evaluated individually outside cycle session</span>
                {savedDate && <span>Reviewed on {savedDate}</span>}
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <div style={{ marginBottom: 12 }}>
                {isDueDatePassed ? (
                  <span className="pms-badge badge-warning" style={{ fontSize: '0.7rem' }}>
                    Target Due Date ({matchedGoal.dueDate}) Passed
                  </span>
                ) : (
                  <span className="pms-badge badge-info" style={{ fontSize: '0.7rem' }}>
                    Target Due Date: {matchedGoal.dueDate} (Early Review Available)
                  </span>
                )}
              </div>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Evaluate {matchedGoal.employeeName}&apos;s achievement and assign an individual score (1–5).
              </p>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ padding: '6px 16px', fontSize: '0.8rem', margin: '0 auto', gap: 6, backgroundColor: '#0284C7' }}
                onClick={() => setShowReviewModal(true)}
              >
                <Award size={14} />
                <span>Review & Rate This Goal Now</span>
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Progress Update History Timeline */}
      <Card
        title="Progress Update History"
        subtitle="Audit log of metric milestones recorded during the cycle"
      >
        {matchedGoal.history && matchedGoal.history.length > 0 ? (
          <div className="goal-history-timeline">
            {matchedGoal.history.map((hist, idx) => (
              <div key={idx} className="timeline-event-item">
                <div className="timeline-date-row">
                  <Clock size={12} color="var(--text-muted)" />
                  <span>{hist.date}</span>
                  <span className="pms-badge badge-info" style={{ fontSize: '0.65rem', marginLeft: 'auto' }}>
                    Updated to {hist.newPercent}%
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Progress updated from {hist.previousPercent}% to {hist.newPercent}% by {hist.updatedBy}
                </div>
                {hist.comment && (
                  <div className="timeline-comment-box">
                    <strong>Note:</strong> {hist.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No progression history recorded yet.
          </div>
        )}
      </Card>

      {/* Single Goal Review & Rating Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <form onSubmit={handleSaveReview}>
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={18} color="#0284C7" />
                    <span>Review & Rate Goal</span>
                  </h3>
                  <p className="modal-subtitle">
                    Evaluate &ldquo;{matchedGoal.title}&rdquo; owned by {matchedGoal.employeeName}.
                  </p>
                </div>
                <button type="button" className="modal-close-btn" onClick={() => setShowReviewModal(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!isDueDatePassed && reviewStatus !== 'Completed' && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 12px', borderRadius: 6, fontSize: '0.78rem', color: '#92400E', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>Target due date ({matchedGoal.dueDate}) has not passed yet. Change status to <strong>Completed</strong> to submit an early evaluation.</span>
                  </div>
                )}

                {/* Current Progress & Status context */}
                <div style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Progress & Target</span>
                    <strong>{matchedGoal.progress}% Complete</strong> ({matchedGoal.currentAchievement} / {matchedGoal.target})
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

                {/* Rating scale */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 6, display: 'block' }}>
                    Single Goal Rating (1 to 5) *
                  </label>
                  <RatingScale
                    value={reviewRating}
                    onChange={(val) => setReviewRating(val)}
                  />
                </div>

                {/* Manager comment */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 6, display: 'block' }}>
                    Manager Feedback & Evaluation Notes
                  </label>
                  <textarea
                    className="pms-textarea"
                    rows={4}
                    placeholder="Provide performance feedback, achievement observations, or guidance on this specific goal..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pms-btn pms-btn-primary"
                  style={{ backgroundColor: '#0284C7' }}
                >
                  <CheckCircle2 size={14} />
                  <span>Save Goal Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

