import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { RatingScale } from '../../components/reviews/RatingScale';
import { DynamicQuestionField } from '../../components/reviews/DynamicQuestionField';
import { TEAM_MEMBERS } from '../../data/mockMyTeam';
import { MOCK_CYCLE_GOALS } from '../../data/mockCycleGoals';
import { getRelevantCompetencies } from '../../data/reviewEngine';
import {
  ManagerReviewResponses,
  MANAGER_GOAL_RATING_QUESTION,
  MANAGER_GOAL_COMMENT_QUESTION,
  MANAGER_COMPETENCY_RATING_QUESTION,
  MANAGER_COMPETENCY_COMMENT_QUESTION,
  calculateManagerReviewScores,
  buildSelfReviewReference,
  buildSeededCompletedReview
} from '../../data/mockManagerReview';
import { QuestionTemplate, QuestionMapping, getQuestionsForRole } from '../../data/mockSettings';
import { ToastType } from '../../components/ui/Toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Eye
} from 'lucide-react';
import '../my-performance/SelfReviewStyles.css';
import '../my-performance/MyGoalsStyles.css';
import '../cycles/PerformanceCycleDetailView.css';

export type ManagerReviewStep = 1 | 2 | 3;

export interface ManagerReviewViewProps {
  employeeId: string;
  response: ManagerReviewResponses;
  questionTemplates: QuestionTemplate[];
  questionMappings: QuestionMapping[];
  onSaveDraft: (employeeId: string, response: ManagerReviewResponses) => void;
  onSubmitReview: (employeeId: string, response: ManagerReviewResponses) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const CYCLE_NAME = 'FY 2026–27 Annual Performance Review';
const REVIEW_DEADLINE = '15 Apr 2027';

export const ManagerReviewView: React.FC<ManagerReviewViewProps> = ({
  employeeId,
  response,
  questionTemplates,
  questionMappings,
  onSaveDraft,
  onSubmitReview,
  onNavigate,
  onShowToast
}) => {
  const member = TEAM_MEMBERS.find((m) => m.id === employeeId) || TEAM_MEMBERS[0];
  const competencies = getRelevantCompetencies(member.department, member.designation, member.jobLevel);
  const selfReviewReference = buildSelfReviewReference(member, competencies);

  // Resolve the Overall Assessment questions through the same Question
  // Template + Mapping architecture used by Self Review and the Settings
  // preview — there is only ever one dynamic question configuration path.
  const overallQuestions = getQuestionsForRole(
    questionMappings,
    questionTemplates,
    member.department,
    member.designation,
    member.jobLevel,
    'Manager Review'
  );

  // Auto pre-fill goals that have ad-hoc single goal reviews (from GoalDetailView or member.goals)
  const initialGoalsState = { ...response.goals };
  member.goals.forEach((g) => {
    if (!initialGoalsState[g.id] || initialGoalsState[g.id].rating === 0) {
      const cycleGoalMatch = MOCK_CYCLE_GOALS.find(
        (cg) => (cg.id === g.id || cg.title.toLowerCase() === g.title.toLowerCase()) && (cg as any).managerRating
      );
      if (cycleGoalMatch && (cycleGoalMatch as any).managerRating) {
        initialGoalsState[g.id] = {
          rating: (cycleGoalMatch as any).managerRating,
          comment: cycleGoalMatch.managerComment || ''
        };
      } else if ((g as any).managerRating) {
        initialGoalsState[g.id] = {
          rating: (g as any).managerRating,
          comment: (g as any).managerComment || ''
        };
      }
    }
  });

  const baseResponse: ManagerReviewResponses = {
    ...response,
    goals: initialGoalsState
  };

  const effectiveResponse =
    response.status === 'Completed'
      ? response
      : member.managerReviewStatus === 'Completed'
      ? buildSeededCompletedReview(member, competencies, overallQuestions)
      : baseResponse;

  const [localResponse, setLocalResponse] = useState<ManagerReviewResponses>(effectiveResponse);
  const [activeStep, setActiveStep] = useState<ManagerReviewStep>(1);
  const [showSelfReviewRef, setShowSelfReviewRef] = useState(false);
  const [showSubmittedDetail, setShowSubmittedDetail] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  // Re-sync only when navigating to a different employee — not on every
  // Save Draft, which replaces the `response` prop reference but should
  // not reset the manager's place in the wizard.
  useEffect(() => {
    setLocalResponse(effectiveResponse);
    setActiveStep(1);
    setShowSubmittedDetail(false);
    setHasTriedSubmit(false);
    setValidationErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const isCompleted = localResponse.status === 'Completed';

  // --- Handlers ---
  const handleGoalRatingChange = (goalId: string, rating: number) => {
    if (isCompleted) return;
    setLocalResponse((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [goalId]: { ...(prev.goals[goalId] || { rating: 0, comment: '' }), rating }
      }
    }));
  };

  const handleGoalCommentChange = (goalId: string, comment: string) => {
    if (isCompleted) return;
    setLocalResponse((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [goalId]: { ...(prev.goals[goalId] || { rating: 0, comment: '' }), comment }
      }
    }));
  };

  const handleCompetencyRatingChange = (compId: string, rating: number) => {
    if (isCompleted) return;
    setLocalResponse((prev) => ({
      ...prev,
      competencies: {
        ...prev.competencies,
        [compId]: { ...(prev.competencies[compId] || { rating: 0, comment: '' }), rating }
      }
    }));
  };

  const handleCompetencyCommentChange = (compId: string, comment: string) => {
    if (isCompleted) return;
    setLocalResponse((prev) => ({
      ...prev,
      competencies: {
        ...prev.competencies,
        [compId]: { ...(prev.competencies[compId] || { rating: 0, comment: '' }), comment }
      }
    }));
  };

  const handleOverallChange = (questionId: string, value: string) => {
    if (isCompleted) return;
    setLocalResponse((prev) => ({
      ...prev,
      overall: { ...prev.overall, [questionId]: value }
    }));
  };

  // --- Completion tallies (for the step pills) ---
  const goalsRatedCount = member.goals.filter((g) => (localResponse.goals[g.id]?.rating || 0) > 0).length;
  const compsRatedCount = competencies.filter((c) => (localResponse.competencies[c.id]?.rating || 0) > 0).length;
  const requiredOverallQuestions = overallQuestions.filter((q) => q.required);
  const overallCompletedCount = requiredOverallQuestions.filter((q) => {
    const ans = localResponse.overall[q.id];
    return ans && ans.trim() !== '';
  }).length;

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    member.goals.forEach((g) => {
      const r = localResponse.goals[g.id];
      if (!r || r.rating === 0) {
        errors[`goal-${g.id}-rating`] = 'Please select a rating for this goal.';
      }
    });

    competencies.forEach((c) => {
      const r = localResponse.competencies[c.id];
      if (!r || r.rating === 0) {
        errors[`comp-${c.id}-rating`] = 'Please select a rating for this competency.';
      }
    });

    requiredOverallQuestions.forEach((q) => {
      const ans = localResponse.overall[q.id];
      if (!ans || !ans.trim()) {
        errors[`overall-${q.id}`] =
          q.type === 'Rating' ? 'Please select an overall rating.' : 'Please complete this field.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (hasTriedSubmit) {
      validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localResponse, hasTriedSubmit]);

  const handleSaveDraft = () => {
    onSaveDraft(employeeId, localResponse);
    onShowToast?.('success', 'Manager review saved as draft.', `You can return to finish evaluating ${member.name} later.`);
  };

  const handlePreSubmitCheck = () => {
    setHasTriedSubmit(true);
    const isValid = validateForm();
    if (!isValid) {
      onShowToast?.('error', 'Incomplete Review', 'Please address validation errors before submitting.');
      const errorKeys = Object.keys(validationErrors);
      if (member.goals.some((g) => errorKeys.includes(`goal-${g.id}-rating`)) || goalsRatedCount < member.goals.length) {
        setActiveStep(1);
      } else if (competencies.some((c) => errorKeys.includes(`comp-${c.id}-rating`)) || compsRatedCount < competencies.length) {
        setActiveStep(2);
      } else {
        setActiveStep(3);
      }
      return;
    }
    setShowSubmitModal(true);
  };

  const handleFinalSubmit = () => {
    setShowSubmitModal(false);
    const finalResponse: ManagerReviewResponses = {
      ...localResponse,
      status: 'Completed',
      submittedDate: '18 Apr 2027'
    };
    setLocalResponse(finalResponse);
    onSubmitReview(employeeId, finalResponse);
    onShowToast?.(
      'success',
      'Manager review submitted successfully.',
      `${member.name}'s review has moved to Final Review (Pending).`
    );
  };

  const scores = calculateManagerReviewScores(localResponse, member.goals, competencies);

  return (
    <div className="self-review-page animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* 1. Header */}
      <PageHeader
        title="Manager Review"
        subtitle="Evaluate the employee's performance, goals, and competencies for this Appraisal Cycle."
        badge={isCompleted ? 'Completed' : 'Pending'}
        badgeVariant={isCompleted ? 'success' : 'warning'}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Team', href: '#/performance/my-team' },
          { label: member.name, href: `#/performance/my-team/${member.id}` },
          { label: 'Manager Review' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate(`/performance/my-team/${member.id}`)}
          >
            <ArrowLeft size={14} />
            <span>Back to {member.name}</span>
          </button>
        }
      />

      {/* Employee / Cycle / Status / Deadline strip */}
      <div className="cycle-info-card">
        <div className="info-kv-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="info-kv-item">
            <span className="info-k-label">Employee</span>
            <span className="info-v-val">{member.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {member.designation} • {member.department} Department
            </span>
          </div>
          <div className="info-kv-item">
            <span className="info-k-label">Cycle</span>
            <span className="info-v-val">{CYCLE_NAME}</span>
          </div>
          <div className="info-kv-item">
            <span className="info-k-label">Status</span>
            <span className={`pms-badge ${isCompleted ? 'badge-success' : 'badge-warning'}`} style={{ width: 'fit-content' }}>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="info-kv-item">
            <span className="info-k-label">Deadline</span>
            <span className="info-v-val">{REVIEW_DEADLINE}</span>
          </div>
        </div>
      </div>

      {/* 11. Completed compact state */}
      {isCompleted && !showSubmittedDetail && (
        <div className="self-review-completed-banner">
          <div className="self-review-completed-icon">
            <Check size={28} />
          </div>
          <h2 className="self-review-completed-title">Manager Review Completed</h2>
          <p className="self-review-completed-desc">
            You have already submitted your evaluation of {member.name} for this cycle. Editing is disabled.
          </p>
          <div className="self-review-completed-meta">
            <span>Submitted: <strong>{localResponse.submittedDate}</strong></span>
            <span>•</span>
            <span>Overall Rating: <strong>{scores.overallScore.toFixed(1)} / 5</strong></span>
          </div>
          <button
            type="button"
            className="pms-btn pms-btn-secondary"
            style={{ marginTop: 4 }}
            onClick={() => setShowSubmittedDetail(true)}
          >
            <Eye size={14} />
            <span>View Submitted Review</span>
          </button>
        </div>
      )}

      {(!isCompleted || showSubmittedDetail) && (
        <>
          {/* 2. Review Progress */}
          <div className="self-review-progress-card">
            <div className="self-review-progress-header">
              <span className="self-review-progress-title">
                {isCompleted ? 'Submitted Manager Review' : `Manager Review — Step ${activeStep} of 3`}
              </span>
              {!isCompleted && (
                <span className="self-review-progress-percentage">
                  {goalsRatedCount + compsRatedCount + overallCompletedCount} /{' '}
                  {member.goals.length + competencies.length + requiredOverallQuestions.length} Rated
                </span>
              )}
            </div>

            <div className="self-review-steps-container">
              <div
                className={`self-review-step-pill ${activeStep === 1 ? 'is-active' : ''} ${
                  goalsRatedCount === member.goals.length ? 'is-completed' : ''
                }`}
                onClick={() => setActiveStep(1)}
              >
                <span className="self-review-step-label">Section 1</span>
                <span className="self-review-step-name">
                  <span>Goal Review</span>
                  {goalsRatedCount === member.goals.length && <CheckCircle2 size={13} color="#059669" />}
                </span>
              </div>

              <div
                className={`self-review-step-pill ${activeStep === 2 ? 'is-active' : ''} ${
                  compsRatedCount === competencies.length ? 'is-completed' : ''
                }`}
                onClick={() => setActiveStep(2)}
              >
                <span className="self-review-step-label">Section 2</span>
                <span className="self-review-step-name">
                  <span>Competency Review</span>
                  {compsRatedCount === competencies.length && <CheckCircle2 size={13} color="#059669" />}
                </span>
              </div>

              <div
                className={`self-review-step-pill ${activeStep === 3 ? 'is-active' : ''} ${
                  overallCompletedCount === requiredOverallQuestions.length ? 'is-completed' : ''
                }`}
                onClick={() => setActiveStep(3)}
              >
                <span className="self-review-step-label">Section 3</span>
                <span className="self-review-step-name">
                  <span>Overall Assessment</span>
                  {overallCompletedCount === requiredOverallQuestions.length && <CheckCircle2 size={13} color="#059669" />}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Employee Self Review Reference (collapsible) */}
          <div className="self-review-section-card">
            <button
              type="button"
              onClick={() => setShowSelfReviewRef((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div>
                <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Employee Self Review</h2>
                <p className="self-review-section-sub">
                  Reference {member.name}&apos;s submitted self-assessment while evaluating each section below.
                </p>
              </div>
              {showSelfReviewRef ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showSelfReviewRef && (
              <div className="form-section-gap animate-fade-in" style={{ marginTop: 'var(--space-2)' }}>
                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Goal Self-Assessment</h3>
                  <div className="form-section-gap">
                    {member.goals.map((g) => (
                      <div key={g.id} className="self-review-goal-item-box">
                        <span className="self-review-goal-title">{g.title}</span>
                        <div className="self-review-readonly-field">
                          {selfReviewReference.goals[g.id]?.achievementSummary}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Competency Self-Ratings</h3>
                  <div className="form-section-gap">
                    {competencies.map((c) => (
                      <div key={c.id} className="self-review-competency-card">
                        <span className="self-review-competency-name">{c.name}</span>
                        <RatingScale value={selfReviewReference.competencies[c.id]?.rating || 0} readOnly />
                        <div className="self-review-readonly-field">
                          {selfReviewReference.competencies[c.id]?.comment}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8 }}>Overall Self-Assessment</h3>
                  <div className="form-section-gap">
                    <div className="question-engine-item">
                      <span className="question-engine-label">Key Achievements</span>
                      <div className="self-review-readonly-field">{selfReviewReference.overall.keyAchievements}</div>
                    </div>
                    <div className="question-engine-item">
                      <span className="question-engine-label">Biggest Challenges</span>
                      <div className="self-review-readonly-field">{selfReviewReference.overall.biggestChallenges}</div>
                    </div>
                    <div className="question-engine-item">
                      <span className="question-engine-label">Skills to Improve</span>
                      <div className="self-review-readonly-field">{selfReviewReference.overall.skillsToImprove}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Section 1 — Goal Review */}
          {activeStep === 1 && (
            <div className="self-review-section-card animate-fade-in">
              <div className="self-review-section-header">
                <h2 className="self-review-section-title">Goal Review</h2>
                <p className="self-review-section-sub">
                  Evaluate {member.name}&apos;s performance against each goal. Goal details and employee progress are locked.
                </p>
              </div>

              <div className="form-section-gap">
                {member.goals.map((g) => {
                  const resp = localResponse.goals[g.id] || { rating: 0, comment: '' };
                  const cycleGoalMatch = MOCK_CYCLE_GOALS.find(
                    (cg) => (cg.id === g.id || cg.title.toLowerCase() === g.title.toLowerCase()) && (cg as any).managerRating
                  );
                  const isAdHocPrefilled = Boolean(cycleGoalMatch || (g as any).managerRating);

                  return (
                    <div key={g.id} className="self-review-goal-item-box">
                      <div className="self-review-goal-header-row">
                        <div className="self-review-goal-title-wrap">
                          <span className="self-review-goal-title">{g.title}</span>
                          <div className="self-review-goal-meta-chips">
                            <span>Target: <strong>{g.target}</strong></span>
                            <span>•</span>
                            <span>Employee Progress: <strong>{g.progress}%</strong></span>
                            <span>•</span>
                            <span>Weight: <strong>{g.weight}%</strong></span>
                            {isAdHocPrefilled && (
                              <>
                                <span>•</span>
                                <span className="pms-badge badge-info" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <CheckCircle2 size={11} color="#0284C7" /> Pre-filled from Single Goal Review
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <span className="form-label">Employee Self-Assessment</span>
                        <div className="self-review-readonly-field">
                          &ldquo;{selfReviewReference.goals[g.id]?.achievementSummary}&rdquo;
                        </div>
                      </div>

                      <div className="question-engine-item">
                        <span className="question-engine-label">
                          {MANAGER_GOAL_RATING_QUESTION.question} *
                        </span>
                        <RatingScale
                          value={resp.rating}
                          onChange={(rating) => handleGoalRatingChange(g.id, rating)}
                          readOnly={isCompleted}
                          error={validationErrors[`goal-${g.id}-rating`]}
                          idPrefix={`goal-${g.id}`}
                        />
                      </div>

                      <div className="question-engine-item">
                        <label className="question-engine-label" htmlFor={`goal-${g.id}-comment`}>
                          <span>Manager Comment</span>
                          <span className="form-label-optional">Optional</span>
                        </label>
                        <DynamicQuestionField
                          question={MANAGER_GOAL_COMMENT_QUESTION}
                          value={resp.comment}
                          onChange={(val) => handleGoalCommentChange(g.id, val)}
                          readOnly={isCompleted}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Section 2 — Competency Review */}
          {activeStep === 2 && (
            <div className="self-review-section-card animate-fade-in">
              <div className="self-review-section-header">
                <h2 className="self-review-section-title">Competency Review</h2>
                <p className="self-review-section-sub">
                  Competencies for <strong>{member.designation}</strong> ({member.department} • {member.jobLevel}).
                </p>
              </div>

              {competencies.length === 0 ? (
                <div className="self-review-readonly-field">
                  No competency framework is configured yet for this role.
                </div>
              ) : (
                <div className="form-section-gap">
                  {competencies.map((c) => {
                    const resp = localResponse.competencies[c.id] || { rating: 0, comment: '' };
                    return (
                      <div key={c.id} className="self-review-competency-card">
                        <div className="self-review-competency-header">
                          <span className="self-review-competency-name">{c.name}</span>
                          <span className="self-review-competency-desc">{c.description}</span>
                        </div>

                        <div className="question-engine-item">
                          <span className="question-engine-label">
                            {MANAGER_COMPETENCY_RATING_QUESTION.question} *
                          </span>
                          <RatingScale
                            value={resp.rating}
                            onChange={(rating) => handleCompetencyRatingChange(c.id, rating)}
                            readOnly={isCompleted}
                            error={validationErrors[`comp-${c.id}-rating`]}
                            idPrefix={`comp-${c.id}`}
                          />
                        </div>

                        <div className="question-engine-item">
                          <label className="question-engine-label" htmlFor={`comp-${c.id}-comment`}>
                            <span>Manager Comment</span>
                            <span className="form-label-optional">Optional</span>
                          </label>
                          <DynamicQuestionField
                            question={MANAGER_COMPETENCY_COMMENT_QUESTION}
                            value={resp.comment}
                            onChange={(val) => handleCompetencyCommentChange(c.id, val)}
                            readOnly={isCompleted}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Section 3 — Overall Assessment */}
          {activeStep === 3 && (
            <div className="self-review-section-card animate-fade-in">
              <div className="self-review-section-header">
                <h2 className="self-review-section-title">Overall Assessment</h2>
                <p className="self-review-section-sub">
                  Summarize {member.name}&apos;s overall performance for this cycle.
                </p>
              </div>

              <div className="form-section-gap">
                {overallQuestions.map((q) => (
                  <div key={q.id} className="question-engine-item">
                    <label className="question-engine-label" htmlFor={`overall-${q.id}`}>
                      <span>{q.question}{q.required && ' *'}</span>
                      {!q.required && <span className="form-label-optional">(Optional)</span>}
                    </label>
                    <DynamicQuestionField
                      question={q}
                      value={localResponse.overall[q.id] || ''}
                      onChange={(val) => handleOverallChange(q.id, val)}
                      readOnly={isCompleted}
                      error={validationErrors[`overall-${q.id}`]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Performance Summary */}
          <div className="self-review-section-card">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title" style={{ fontSize: '1rem' }}>Performance Summary</h2>
              <p className="self-review-section-sub">
                Frontend mock calculation — Goals weighted 70%, Competencies weighted 30%.
              </p>
            </div>
            <div className="emp-performance-summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Goal Score</span>
                <span className="perf-metric-val" style={{ color: '#0284C7' }}>{scores.goalScore.toFixed(1)} / 5</span>
              </div>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Competency Score</span>
                <span className="perf-metric-val" style={{ color: '#7C3AED' }}>{scores.competencyScore.toFixed(1)} / 5</span>
              </div>
              <div className="perf-metric-box">
                <span className="perf-metric-lbl">Overall Manager Rating</span>
                <span className="perf-metric-val" style={{ color: '#047857' }}>{scores.overallScore.toFixed(1)} / 5</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
              {scores.goalScore.toFixed(1)} × 70% + {scores.competencyScore.toFixed(1)} × 30% = {scores.overallScore.toFixed(1)} / 5
            </p>
          </div>

          {/* 8 & 9. Actions */}
          <div className="self-review-actions-bar">
            <div className="self-review-summary-block">
              <div className="self-review-summary-pill">
                <span>Goals: {goalsRatedCount} / {member.goals.length}</span>
              </div>
              <div className="self-review-summary-pill">
                <span>Competencies: {compsRatedCount} / {competencies.length}</span>
              </div>
              <div className="self-review-summary-pill">
                <span>Overall: {overallCompletedCount} / {requiredOverallQuestions.length}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isCompleted ? (
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '8px 16px', gap: 6 }}
                  onClick={() => setShowSubmittedDetail(false)}
                >
                  <Lock size={14} />
                  <span>Hide Submitted Review</span>
                </button>
              ) : (
                <>
                  {activeStep > 1 && (
                    <button
                      type="button"
                      className="pms-btn pms-btn-secondary"
                      style={{ padding: '8px 16px', gap: 6 }}
                      onClick={() => setActiveStep((activeStep - 1) as ManagerReviewStep)}
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="pms-btn pms-btn-secondary"
                    style={{ padding: '8px 16px' }}
                    onClick={handleSaveDraft}
                  >
                    Save Draft
                  </button>

                  {activeStep < 3 ? (
                    <button
                      type="button"
                      className="pms-btn pms-btn-primary"
                      style={{ padding: '8px 18px', gap: 6 }}
                      onClick={() => setActiveStep((activeStep + 1) as ManagerReviewStep)}
                    >
                      <span>Next Section</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="pms-btn pms-btn-primary"
                      style={{ padding: '8px 20px', gap: 6, backgroundColor: '#059669' }}
                      onClick={handlePreSubmitCheck}
                    >
                      <Check size={14} />
                      <span>Submit Manager Review</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 9. Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title" style={{ color: '#B91C1C' }}>Submit Manager Review?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowSubmitModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>
                Once submitted, your review will be sent for final review and you may no longer edit it.
              </p>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 6, display: 'flex', gap: 8, color: '#991B1B' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>By submitting, you confirm this evaluation is accurate and final.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ backgroundColor: '#DC2626' }}
                onClick={handleFinalSubmit}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
