import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { MOCK_CYCLE_REVIEWS } from '../../data/mockCycleReviews';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import {
  ArrowLeft,
  User,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  MessageSquare,
  TrendingUp,
  FileText,
  Building,
  Target
} from 'lucide-react';
import './CycleReviewsTab.css';

export interface ReviewDetailViewProps {
  cycleId: string;
  employeeId: string;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const ReviewDetailView: React.FC<ReviewDetailViewProps> = ({
  cycleId,
  employeeId,
  onNavigate,
  onShowToast
}) => {
  const matchedCycle =
    MOCK_PERFORMANCE_CYCLES.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];
  const matchedReview =
    MOCK_CYCLE_REVIEWS.find((r) => r.employeeId === employeeId) || MOCK_CYCLE_REVIEWS[1];

  const cycleName = matchedCycle.name;
  const empName = matchedReview.employeeName;

  return (
    <div className="review-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={empName}
        subtitle={`${matchedReview.designation} • ${matchedReview.department} Department • Reporting to ${matchedReview.manager}`}
        badge={
          matchedReview.currentStage === 'Completed'
            ? 'Review Completed'
            : `${matchedReview.currentStage} Pending`
        }
        badgeVariant={
          matchedReview.overallStatus === 'Completed'
            ? 'success'
            : matchedReview.overallStatus === 'Overdue'
            ? 'danger'
            : 'primary'
        }
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: cycleName, href: `#/performance/cycles/${cycleId}` },
          { label: 'Reviews', href: `#/performance/cycles/${cycleId}/reviews` },
          { label: empName }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate(`/performance/cycles/${cycleId}/reviews`)}
            >
              <ArrowLeft size={14} />
              <span>Back to Cycle Reviews</span>
            </button>

            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() =>
                onNavigate(
                  `/performance/cycles/${cycleId}/employees/${matchedReview.employeeId}`
                )
              }
            >
              <User size={14} />
              <span>View Performance</span>
            </button>

            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() =>
                onNavigate(
                  `/performance/cycles/${cycleId}/reviews/${matchedReview.employeeId}/final-review`
                )
              }
            >
              <Award size={14} />
              <span>{matchedReview.finalReviewStatus === 'Completed' ? 'View Final Review' : 'Start Final Review'}</span>
            </button>
          </div>
        }
      />

      {/* 2. Review Process Timeline Flow */}
      <div className="review-timeline-flow-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="distribution-title">Review Process Timeline</span>
          <span className="pms-badge badge-info">Current Stage: {matchedReview.currentStage}</span>
        </div>

        <div className="timeline-steps-track">
          {/* Stage 1: Self Review */}
          <div className={`timeline-step-node ${matchedReview.selfReviewStatus === 'Completed' ? 'is-active' : ''}`}>
            <div className="timeline-node-top">
              <span className="timeline-node-title">1. Self Review</span>
              <span className={`pms-badge ${matchedReview.selfReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                {matchedReview.selfReviewStatus}
              </span>
            </div>
            <span className="timeline-node-date">
              {matchedReview.selfReviewDate ? `Completed on ${matchedReview.selfReviewDate}` : 'Pending Submission'}
            </span>
          </div>

          <div style={{ color: 'var(--border-strong)', fontSize: '1.1rem' }}>&rarr;</div>

          {/* Stage 2: Manager Review */}
          <div className={`timeline-step-node ${matchedReview.managerReviewStatus === 'Completed' ? 'is-active' : ''}`}>
            <div className="timeline-node-top">
              <span className="timeline-node-title">2. Manager Review</span>
              <span
                className={`pms-badge ${
                  matchedReview.managerReviewStatus === 'Completed'
                    ? 'badge-success'
                    : matchedReview.managerReviewStatus === 'Overdue'
                    ? 'badge-danger'
                    : 'badge-info'
                }`}
                style={{ fontSize: '0.65rem' }}
              >
                {matchedReview.managerReviewStatus}
              </span>
            </div>
            <span className="timeline-node-date">
              {matchedReview.managerReviewNote ||
                (matchedReview.managerReviewDate
                  ? `Completed on ${matchedReview.managerReviewDate}`
                  : `Evaluator: ${matchedReview.manager}`)}
            </span>
          </div>

          <div style={{ color: 'var(--border-strong)', fontSize: '1.1rem' }}>&rarr;</div>

          {/* Stage 3: Final Review */}
          <div className={`timeline-step-node ${matchedReview.finalReviewStatus === 'Completed' ? 'is-active' : ''}`}>
            <div className="timeline-node-top">
              <span className="timeline-node-title">3. Final Review</span>
              <span className={`pms-badge ${matchedReview.finalReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                {matchedReview.finalReviewStatus}
              </span>
            </div>
            <span className="timeline-node-date">
              {matchedReview.finalReviewDate ? `Ratified on ${matchedReview.finalReviewDate}` : 'HR Calibration & Sign-off'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Review Summary Card */}
      <Card
        title="Review Score Summary"
        subtitle="Evaluated performance score metrics"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          <div className="perf-metric-box">
            <span className="perf-metric-lbl">Goals Score</span>
            <span className="perf-metric-val" style={{ color: '#0284C7' }}>
              {matchedReview.goalsScore || 'Pending'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>70% Evaluation Weight</span>
          </div>

          <div className="perf-metric-box">
            <span className="perf-metric-lbl">Competency Score</span>
            <span className="perf-metric-val" style={{ color: '#7C3AED' }}>
              {matchedReview.competencyScore || 'Pending'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30% Evaluation Weight</span>
          </div>

          <div className="perf-metric-box">
            <span className="perf-metric-lbl">Overall Rating</span>
            <span className="perf-metric-val" style={{ color: matchedReview.overallStatus === 'Completed' ? '#047857' : 'var(--text-primary)' }}>
              {matchedReview.overallRating || 'Pending Final Review'}
            </span>
            {matchedReview.ratingLabel && (
              <span className="pms-badge badge-success" style={{ width: 'fit-content', marginTop: 2, fontSize: '0.68rem' }}>
                {matchedReview.ratingLabel}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 4. Review Comments Preview */}
      <Card
        title="Review Feedback & Submissions Preview"
        subtitle="Inspection of responses recorded across review stages"
      >
        <div className="comments-preview-stack">
          {/* Employee Self Review */}
          <div className="comment-preview-box">
            <div className="comment-header-row">
              <div className="comment-author-title">
                <User size={14} color="#0284C7" />
                <span>Employee Self Review ({empName})</span>
              </div>
              <span className="pms-badge badge-info" style={{ fontSize: '0.65rem' }}>
                {matchedReview.selfReviewDate || 'Pending'}
              </span>
            </div>
            <p className="comment-quote-text">
              {matchedReview.selfReviewComment
                ? `“${matchedReview.selfReviewComment}”`
                : 'No self review response submitted yet.'}
            </p>
          </div>

          {/* Manager Review */}
          <div className="comment-preview-box">
            <div className="comment-header-row">
              <div className="comment-author-title">
                <MessageSquare size={14} color="#7C3AED" />
                <span>Manager Assessment ({matchedReview.manager})</span>
              </div>
              <span className="pms-badge badge-info" style={{ fontSize: '0.65rem' }}>
                {matchedReview.managerReviewDate || matchedReview.managerReviewNote || 'Pending'}
              </span>
            </div>
            <p className="comment-quote-text">
              {matchedReview.managerReviewComment
                ? `“${matchedReview.managerReviewComment}”`
                : 'Manager evaluation has not been submitted yet.'}
            </p>
          </div>

          {/* Final Review */}
          <div className="comment-preview-box">
            <div className="comment-header-row">
              <div className="comment-author-title">
                <Award size={14} color="#047857" />
                <span>Final HR Calibration & Sign-off</span>
              </div>
              <span className={`pms-badge ${matchedReview.finalReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                {matchedReview.finalReviewStatus}
              </span>
            </div>
            <p className="comment-quote-text">
              {matchedReview.finalReviewComment
                ? `“${matchedReview.finalReviewComment}”`
                : 'Final calibration pending completion of manager appraisal stage.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
