import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { RatingScale } from '../../components/reviews/RatingScale';
import { getRatingLabel } from '../../data/reviewEngine';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import {
  MOCK_FINAL_REVIEW_DATA,
  FinalReviewDecision,
  calculateFinalReviewScores
} from '../../data/mockFinalReview';
import { ToastType } from '../../components/ui/Toast';
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  Undo2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Lock
} from 'lucide-react';
import '../my-performance/SelfReviewStyles.css';
import '../my-performance/MyGoalsStyles.css';
import '../my-performance/MyPerformanceStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';

export interface FinalReviewViewProps {
  cycleId: string;
  employeeId: string;
  decision: FinalReviewDecision;
  onSendBack: (employeeId: string, decision: FinalReviewDecision) => void;
  onFinalize: (employeeId: string, decision: FinalReviewDecision) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

export const FinalReviewView: React.FC<FinalReviewViewProps> = ({
  cycleId,
  employeeId,
  decision,
  onSendBack,
  onFinalize,
  onNavigate,
  onShowToast
}) => {
  const matchedCycle = MOCK_PERFORMANCE_CYCLES.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];
  const record = MOCK_FINAL_REVIEW_DATA[employeeId] || MOCK_FINAL_REVIEW_DATA['emp-1'];
  const scores = calculateFinalReviewScores(record.goals, record.competencies);

  const [finalRating, setFinalRating] = useState(decision.finalRating || Math.round(scores.overallScore));
  const [finalReviewerComments, setFinalReviewerComments] = useState(decision.finalReviewerComments);
  const [developmentRecommendations, setDevelopmentRecommendations] = useState(decision.developmentRecommendations);
  const [nextCycleFocusAreas, setNextCycleFocusAreas] = useState(decision.nextCycleFocusAreas);

  const [showSelfReviewRef, setShowSelfReviewRef] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showSendBackModal, setShowSendBackModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [hasTriedFinalize, setHasTriedFinalize] = useState(false);

  useEffect(() => {
    setFinalRating(decision.finalRating || Math.round(scores.overallScore));
    setFinalReviewerComments(decision.finalReviewerComments);
    setDevelopmentRecommendations(decision.developmentRecommendations);
    setNextCycleFocusAreas(decision.nextCycleFocusAreas);
    setShowDetail(false);
    setHasTriedFinalize(false);
    setValidationErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const isCompleted = decision.status === 'Completed';
  const isSentBack = decision.status === 'Sent Back';

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!finalRating || finalRating === 0) {
      errors.finalRating = 'Please select a final rating.';
    }
    if (!finalReviewerComments.trim()) {
      errors.finalReviewerComments = 'Final reviewer comments are required.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (hasTriedFinalize) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalRating, finalReviewerComments, hasTriedFinalize]);

  const handleFinalizeClick = () => {
    setHasTriedFinalize(true);
    if (!validate()) {
      onShowToast?.('error', 'Incomplete Final Review', 'Please select a final rating and add reviewer comments.');
      return;
    }
    setShowFinalizeModal(true);
  };

  const handleConfirmFinalize = () => {
    setShowFinalizeModal(false);
    const finalDecision: FinalReviewDecision = {
      status: 'Completed',
      finalRating,
      finalReviewerComments,
      developmentRecommendations,
      nextCycleFocusAreas,
      completedDate: '31 Mar 2027'
    };
    onFinalize(employeeId, finalDecision);
    onShowToast?.('success', 'Performance review finalized successfully.', `${record.employeeName}'s result is now marked completed.`);
  };

  const handleConfirmSendBack = () => {
    setShowSendBackModal(false);
    const revisedDecision: FinalReviewDecision = {
      status: 'Sent Back',
      finalRating,
      finalReviewerComments,
      developmentRecommendations,
      nextCycleFocusAreas,
      sentBackDate: '29 Mar 2027'
    };
    onSendBack(employeeId, revisedDecision);
    onShowToast?.('success', 'Sent back for revision.', `${record.manager} will need to review and update the assessment.`);
  };

  return (
    <div className="self-review-page animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* 1. Header */}
      <PageHeader
        title="Final Review"
        subtitle="Review the completed assessments and finalize the employee's performance result."
        badge={isCompleted ? 'Completed' : isSentBack ? 'Sent Back for Revision' : 'Pending Final Review'}
        badgeVariant={isCompleted ? 'success' : isSentBack ? 'warning' : 'primary'}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: matchedCycle.name, href: `#/performance/cycles/${cycleId}` },
          { label: record.employeeName, href: `#/performance/cycles/${cycleId}/reviews/${employeeId}` },
          { label: 'Final Review' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate(`/performance/cycles/${cycleId}/reviews/${employeeId}`)}
          >
            <ArrowLeft size={14} />
            <span>Back to Review</span>
          </button>
        }
      />

      {/* Employee / Cycle / Status strip */}
      <div className="cycle-info-card">
        <div className="info-kv-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="info-kv-item">
            <span className="info-k-label">Employee</span>
            <span className="info-v-val">{record.employeeName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {record.designation} • {record.department} Department
            </span>
          </div>
          <div className="info-kv-item">
            <span className="info-k-label">Cycle</span>
            <span className="info-v-val">{record.cycleName}</span>
          </div>
          <div className="info-kv-item">
            <span className="info-k-label">Status</span>
            <span
              className={`pms-badge ${isCompleted ? 'badge-success' : isSentBack ? 'badge-warning' : 'badge-info'}`}
              style={{ width: 'fit-content' }}
            >
              {isCompleted ? 'Completed' : isSentBack ? 'Sent Back for Revision' : 'Pending Final Review'}
            </span>
          </div>
        </div>
      </div>

      {isSentBack && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, color: '#92400E', fontSize: '0.8rem' }}>
          <Undo2 size={16} style={{ flexShrink: 0 }} />
          <span>This review was sent back to {record.manager} for revision on {decision.sentBackDate}.</span>
        </div>
      )}

      {/* 11. Completed compact state */}
      {isCompleted && !showDetail && (
        <div className="self-review-completed-banner">
          <div className="self-review-completed-icon">
            <Check size={28} />
          </div>
          <h2 className="self-review-completed-title">Performance Review Completed</h2>
          <p className="self-review-completed-desc">
            {record.employeeName}&apos;s performance review for this cycle has been finalized.
          </p>
          <div className="self-review-completed-meta">
            <span>Final Rating: <strong>{finalRating} — {getRatingLabel(finalRating)}</strong></span>
            <span>•</span>
            <span>Final Score: <strong>{scores.overallScore.toFixed(2)} / 5</strong></span>
            <span>•</span>
            <span>Completed: <strong>{decision.completedDate}</strong></span>
          </div>
          <button type="button" className="pms-btn pms-btn-secondary" style={{ marginTop: 4 }} onClick={() => setShowDetail(true)}>
            <Eye size={14} />
            <span>View Final Review</span>
          </button>
        </div>
      )}

      {(!isCompleted || showDetail) && (
        <>
          {/* 2. Review Journey */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Review Journey</h2>
              <p className="self-review-section-sub">Progression through this cycle&apos;s review stages.</p>
            </div>
            <div className="review-journey-timeline">
              <div className="journey-step-row is-completed">
                <div className="journey-node-circle" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>✓</div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Self Review</span>
                    <span className="pms-badge badge-success">Completed</span>
                  </div>
                  <span className="journey-step-desc">{record.employeeName} submitted their self assessment.</span>
                </div>
              </div>

              <div className="journey-step-row is-completed">
                <div className="journey-node-circle" style={{ backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' }}>✓</div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Manager Review</span>
                    <span className="pms-badge badge-success">Completed</span>
                  </div>
                  <span className="journey-step-desc">{record.manager} completed the manager evaluation.</span>
                </div>
              </div>

              <div className={`journey-step-row ${!isCompleted ? 'is-current' : ''}`}>
                <div className="journey-node-circle" style={isCompleted ? { backgroundColor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' } : {}}>
                  {isCompleted ? '✓' : '3'}
                </div>
                <div className="journey-step-content">
                  <div className="journey-step-title-row">
                    <span className="journey-step-title">Final Review</span>
                    <span className={`pms-badge ${isCompleted ? 'badge-success' : 'badge-info'}`}>
                      {isCompleted ? 'Completed' : 'Current'}
                    </span>
                  </div>
                  <span className="journey-step-desc">
                    {isCompleted ? 'HR/Admin has finalized this performance result.' : 'Awaiting HR/Admin final rating and sign-off.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Performance Summary */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Performance Summary</h2>
              <p className="self-review-section-sub">Goals weighted 70%, Competencies weighted 30%.</p>
            </div>
            <div className="emp-performance-summary-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Goal Score</span>
                <span className="perf-metric-val" style={{ color: '#0284C7' }}>{scores.goalScore.toFixed(1)} / 5</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Weight: 70%</span>
              </div>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Competency Score</span>
                <span className="perf-metric-val" style={{ color: '#7C3AED' }}>{scores.competencyScore.toFixed(1)} / 5</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Weight: 30%</span>
              </div>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Calculated Performance Score</span>
                <span className="perf-metric-val" style={{ color: '#047857' }}>{scores.overallScore.toFixed(2)} / 5</span>
              </div>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Overall Rating</span>
                <span className="perf-metric-val" style={{ fontSize: '0.95rem', color: '#047857' }}>{scores.overallLabel}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
              {scores.goalScore.toFixed(1)} × 70% + {scores.competencyScore.toFixed(1)} × 30% = {scores.overallScore.toFixed(2)} / 5
            </p>
          </div>

          {/* 4. Goal Summary */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Goal Summary</h2>
              <p className="self-review-section-sub">Read-only — final manager ratings for each goal.</p>
            </div>
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Progress</th>
                    <th>Weight</th>
                    <th>Manager Rating</th>
                    <th>Manager Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {record.goals.map((g) => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 600 }}>{g.title}</td>
                      <td>{g.progress}%</td>
                      <td>{g.weight}%</td>
                      <td style={{ fontWeight: 700, color: '#0284C7' }}>{g.managerRating.toFixed(1)} / 5</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{g.managerComment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Competency Summary */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Competency Summary</h2>
              <p className="self-review-section-sub">Read-only — final manager competency ratings.</p>
            </div>
            <div className="form-section-gap">
              {record.competencies.map((c) => (
                <div key={c.id} className="self-review-competency-card">
                  <div className="self-review-competency-header" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="self-review-competency-name">{c.name}</span>
                    <span className="self-review-readonly-rating">{c.managerRating} / 5</span>
                  </div>
                  {c.managerComment && (
                    <div className="self-review-readonly-field">{c.managerComment}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 6. Employee Self Review (collapsible) */}
          <div className="self-review-section-card">
            <button
              type="button"
              onClick={() => setShowSelfReviewRef((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
            >
              <div>
                <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Employee Self Review</h2>
                <p className="self-review-section-sub">{record.employeeName}&apos;s submitted self-assessment, for reference only.</p>
              </div>
              {showSelfReviewRef ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showSelfReviewRef && (
              <div className="form-section-gap animate-fade-in" style={{ marginTop: 'var(--space-2)' }}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Goal Self-Assessment</h3>
                  <div className="form-section-gap">
                    {record.goals.map((g) => (
                      <div key={g.id} className="self-review-goal-item-box">
                        <span className="self-review-goal-title">{g.title}</span>
                        <div className="self-review-readonly-field">&ldquo;{g.selfComment}&rdquo;</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Competency Self-Ratings</h3>
                  <div className="form-section-gap">
                    {record.competencies.map((c) => (
                      <div key={c.id} className="self-review-competency-card">
                        <span className="self-review-competency-name">{c.name}</span>
                        <RatingScale value={c.selfRating} readOnly />
                        <div className="self-review-readonly-field">{c.selfComment}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Overall Self-Assessment</h3>
                  <div className="form-section-gap">
                    <div className="question-engine-item">
                      <span className="question-engine-label">Key Achievements</span>
                      <div className="self-review-readonly-field">{record.selfReviewOverall.keyAchievements}</div>
                    </div>
                    <div className="question-engine-item">
                      <span className="question-engine-label">Biggest Challenges</span>
                      <div className="self-review-readonly-field">{record.selfReviewOverall.biggestChallenges}</div>
                    </div>
                    <div className="question-engine-item">
                      <span className="question-engine-label">Skills to Improve</span>
                      <div className="self-review-readonly-field">{record.selfReviewOverall.skillsToImprove}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. Manager Review */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Manager Review</h2>
              <p className="self-review-section-sub">Submitted by {record.manager}, read-only.</p>
            </div>
            <div className="form-section-gap">
              <div className="question-engine-item">
                <span className="question-engine-label">Key Strengths</span>
                <div className="self-review-readonly-field">{record.managerReviewOverall.keyStrengths}</div>
              </div>
              <div className="question-engine-item">
                <span className="question-engine-label">Areas for Improvement</span>
                <div className="self-review-readonly-field">{record.managerReviewOverall.areasForImprovement}</div>
              </div>
              <div className="question-engine-item">
                <span className="question-engine-label">Manager Summary</span>
                <div className="self-review-readonly-field">{record.managerReviewOverall.managerSummary}</div>
              </div>
              <div className="question-engine-item">
                <span className="question-engine-label">Development Recommendations</span>
                <div className="self-review-readonly-field">{record.managerReviewOverall.developmentRecommendations}</div>
              </div>
            </div>
          </div>

          {/* 8. Final Rating */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Final Performance Rating</h2>
              <p className="self-review-section-sub">HR/Admin makes the final rating decision for this cycle.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-default)', borderRadius: 8 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Calculated Score (reference only)</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>{scores.overallScore.toFixed(2)} / 5</span>
            </div>

            <div className="question-engine-item">
              <span className="question-engine-label">Select Final Rating *</span>
              <RatingScale
                value={finalRating}
                onChange={(r) => setFinalRating(r)}
                readOnly={isCompleted}
                error={validationErrors.finalRating}
                idPrefix="final-rating"
              />
            </div>
          </div>

          {/* 9. Final Comments */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Final Comments</h2>
              <p className="self-review-section-sub">Final Reviewer: <strong>HR / Admin</strong></p>
            </div>
            <div className="form-section-gap">
              <div className="form-group">
                <label className="form-label" htmlFor="final-reviewer-comments">
                  <span>Final Reviewer Comments *</span>
                </label>
                {isCompleted ? (
                  <div className="self-review-readonly-field">{finalReviewerComments}</div>
                ) : (
                  <>
                    <textarea
                      id="final-reviewer-comments"
                      className={`form-textarea ${validationErrors.finalReviewerComments ? 'is-invalid' : ''}`}
                      rows={3}
                      value={finalReviewerComments}
                      onChange={(e) => setFinalReviewerComments(e.target.value)}
                      placeholder="Summarize the overall result and rationale for the final rating..."
                    />
                    {validationErrors.finalReviewerComments && (
                      <div className="form-error-msg">
                        <AlertTriangle size={12} />
                        <span>{validationErrors.finalReviewerComments}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="final-dev-recs">
                  <span>Development Recommendations</span>
                  <span className="form-label-optional">Optional</span>
                </label>
                {isCompleted ? (
                  <div className="self-review-readonly-field">
                    {developmentRecommendations || <em style={{ color: 'var(--text-muted)' }}>Not provided</em>}
                  </div>
                ) : (
                  <textarea
                    id="final-dev-recs"
                    className="form-textarea"
                    rows={3}
                    value={developmentRecommendations}
                    onChange={(e) => setDevelopmentRecommendations(e.target.value)}
                    placeholder="Recommended growth areas or enablement for the employee..."
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="final-next-cycle-focus">
                  <span>Next Cycle Focus Areas</span>
                  <span className="form-label-optional">Optional</span>
                </label>
                {isCompleted ? (
                  <div className="self-review-readonly-field">
                    {nextCycleFocusAreas || <em style={{ color: 'var(--text-muted)' }}>Not provided</em>}
                  </div>
                ) : (
                  <textarea
                    id="final-next-cycle-focus"
                    className="form-textarea"
                    rows={3}
                    value={nextCycleFocusAreas}
                    onChange={(e) => setNextCycleFocusAreas(e.target.value)}
                    placeholder="Key priorities to carry into the next Appraisal Cycle..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* 10. Final Decision */}
          <div className="self-review-section-card" style={{ border: '1px solid #BAE6FD', backgroundColor: '#F0F9FF' }}>
            <div className="self-review-section-header" style={{ borderBottomColor: '#BAE6FD' }}>
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Final Decision</h2>
              <p className="self-review-section-sub">This action determines the outcome of this employee&apos;s Appraisal Cycle.</p>
            </div>

            {isCompleted ? (
              <button type="button" className="pms-btn pms-btn-secondary" style={{ alignSelf: 'flex-start', gap: 6 }} onClick={() => setShowDetail(false)}>
                <Lock size={14} />
                <span>Hide Final Review</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="pms-btn pms-btn-primary"
                  style={{ padding: '10px 20px', gap: 6, backgroundColor: '#059669' }}
                  onClick={handleFinalizeClick}
                >
                  <CheckCircle2 size={15} />
                  <span>Finalize Performance Review</span>
                </button>
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '10px 20px', gap: 6 }}
                  onClick={() => setShowSendBackModal(true)}
                >
                  <Undo2 size={15} />
                  <span>Send Back for Revision</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Finalize Confirmation Modal */}
      {showFinalizeModal && (
        <div className="modal-backdrop" onClick={() => setShowFinalizeModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title" style={{ color: '#047857' }}>Finalize Performance Review?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowFinalizeModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>Once finalized, the performance result will be marked as completed.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowFinalizeModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ backgroundColor: '#059669' }} onClick={handleConfirmFinalize}>
                Finalize Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Back Confirmation Modal */}
      {showSendBackModal && (
        <div className="modal-backdrop" onClick={() => setShowSendBackModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title" style={{ color: '#B45309' }}>Send review back for revision?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowSendBackModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>Manager will need to review and update the assessment.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowSendBackModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ backgroundColor: '#B45309' }} onClick={handleConfirmSendBack}>
                Send Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

