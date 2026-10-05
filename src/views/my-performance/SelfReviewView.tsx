import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { MyGoalItem } from '../../data/mockMyGoals';
import { GoalStatus } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import {
  SelfReviewResponses,
  MOCK_COMPETENCIES
} from '../../data/selfReviewConfig';
import { QuestionTemplate, QuestionMapping, getQuestionsForRole } from '../../data/mockSettings';
import { RatingScale } from '../../components/reviews/RatingScale';
import { DynamicQuestionField } from '../../components/reviews/DynamicQuestionField';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Lock,
  FileText,
  UploadCloud,
  Layers,
  Award,
  BookOpen,
  HelpCircle,
  Clock,
  Sparkles,
  UserCheck,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import './SelfReviewStyles.css';

export interface SelfReviewViewProps {
  goals: MyGoalItem[];
  responses: SelfReviewResponses;
  questionTemplates: QuestionTemplate[];
  questionMappings: QuestionMapping[];
  onSaveDraft: (responses: SelfReviewResponses) => void;
  onSubmitReview: (responses: SelfReviewResponses) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

export const SelfReviewView: React.FC<SelfReviewViewProps> = ({
  goals,
  responses,
  questionTemplates,
  questionMappings,
  onSaveDraft,
  onSubmitReview,
  onNavigate,
  onShowToast
}) => {
  // Current step state (1, 2, or 3)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [localResponses, setLocalResponses] = useState<SelfReviewResponses>(responses);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [hasTriedSubmit, setHasTriedSubmit] = useState<boolean>(false);

  // Sync prop changes to local responses (e.g. when loading draft)
  useEffect(() => {
    setLocalResponses(responses);
  }, [responses]);

  // Mock employee settings: Sales Executive in Sales dept, Individual Contributor level
  const department = 'Sales';
  const designation = 'Sales Executive';
  const jobLevel = 'Individual Contributor';

  // Filter competencies based on department only
  const relevantCompetencies = MOCK_COMPETENCIES.filter(
    (c) =>
      c.department.toLowerCase() === department.toLowerCase() ||
      c.department.toLowerCase() === 'all'
  );

  // Resolve overall questions through the same Question Template + Mapping
  // architecture used by Manager Review and the Settings > Question
  // Templates preview — this is the one, shared question configuration path.
  const relevantOverallQuestions = getQuestionsForRole(
    questionMappings,
    questionTemplates,
    department,
    designation,
    jobLevel,
    'Self Review'
  );

  const isCompleted = localResponses.status === 'Completed';

  // --- Handlers ---
  const handleGoalFieldChange = (goalId: string, field: 'achievementSummary' | 'challengesRemarks', val: string) => {
    if (isCompleted) return;
    setLocalResponses((prev) => {
      const updatedGoals = { ...prev.goals };
      if (!updatedGoals[goalId]) {
        updatedGoals[goalId] = { achievementSummary: '', challengesRemarks: '' };
      }
      updatedGoals[goalId] = {
        ...updatedGoals[goalId],
        [field]: val
      };
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleSimulateGoalAttachment = (goalId: string) => {
    if (isCompleted) return;
    const fileNames = ['Q4_Sales_Pipeline.pdf', 'Western_Region_Contracts.zip', 'Client_Engagement_Feedback.xlsx'];
    const randomFile = fileNames[Math.floor(Math.random() * fileNames.length)];
    
    setLocalResponses((prev) => {
      const updatedGoals = { ...prev.goals };
      if (!updatedGoals[goalId]) {
        updatedGoals[goalId] = { achievementSummary: '', challengesRemarks: '' };
      }
      updatedGoals[goalId] = {
        ...updatedGoals[goalId],
        attachmentName: randomFile
      };
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleRemoveGoalAttachment = (goalId: string) => {
    if (isCompleted) return;
    setLocalResponses((prev) => {
      const updatedGoals = { ...prev.goals };
      if (updatedGoals[goalId]) {
        delete updatedGoals[goalId].attachmentName;
      }
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleCompetencyRatingChange = (compId: string, rating: number) => {
    if (isCompleted) return;
    setLocalResponses((prev) => {
      const updatedComps = { ...prev.competencies };
      if (!updatedComps[compId]) {
        updatedComps[compId] = { rating: 0, comment: '' };
      }
      updatedComps[compId] = {
        ...updatedComps[compId],
        rating
      };
      return { ...prev, competencies: updatedComps };
    });
  };

  const handleCompetencyCommentChange = (compId: string, comment: string) => {
    if (isCompleted) return;
    setLocalResponses((prev) => {
      const updatedComps = { ...prev.competencies };
      if (!updatedComps[compId]) {
        updatedComps[compId] = { rating: 0, comment: '' };
      }
      updatedComps[compId] = {
        ...updatedComps[compId],
        comment
      };
      return { ...prev, competencies: updatedComps };
    });
  };

  const handleOverallAnswerChange = (questionId: string, val: string) => {
    if (isCompleted) return;
    setLocalResponses((prev) => {
      const updatedOverall = { ...prev.overall };
      updatedOverall[questionId] = val;
      return { ...prev, overall: updatedOverall };
    });
  };

  // --- Calculations ---
  // Goals completed count (requires both achievementSummary and challengesRemarks filled)
  const completedGoalsCount = goals.filter((g) => {
    const resp = localResponses.goals[g.id];
    return resp && resp.achievementSummary.trim() !== '' && resp.challengesRemarks.trim() !== '';
  }).length;

  // Competencies completed count (requires rating selected)
  const completedCompsCount = relevantCompetencies.filter((c) => {
    const resp = localResponses.competencies[c.id];
    return resp && resp.rating > 0;
  }).length;

  // Overall questions completed count (requires answer filled for required ones)
  const completedOverallCount = relevantOverallQuestions.filter((q) => {
    const ans = localResponses.overall[q.id];
    if (q.required) {
      return ans && ans.trim() !== '';
    }
    // Optional questions are considered completed for the metric if answered or not, but let's count actual entries
    return ans !== undefined && ans.trim() !== '';
  }).length;

  const totalRequiredQuestions = relevantOverallQuestions.filter(q => q.required).length;
  const completedRequiredOverallCount = relevantOverallQuestions.filter(q => q.required).filter((q) => {
    const ans = localResponses.overall[q.id];
    return ans && ans.trim() !== '';
  }).length;

  // Global completion percentage calculation (weights goals, competencies, and overall assessment)
  const totalStepsItems = goals.length * 2 + relevantCompetencies.length + totalRequiredQuestions;
  const completedStepsItems =
    goals.filter(g => localResponses.goals[g.id]?.achievementSummary.trim()).length +
    goals.filter(g => localResponses.goals[g.id]?.challengesRemarks.trim()).length +
    completedCompsCount +
    completedRequiredOverallCount;

  const progressPercent = totalStepsItems > 0 ? Math.round((completedStepsItems / totalStepsItems) * 100) : 0;

  // --- Validation ---
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 1. Validate Goals
    goals.forEach((g) => {
      const resp = localResponses.goals[g.id];
      if (!resp || !resp.achievementSummary.trim()) {
        errors[`goal-${g.id}-achievement`] = 'Please complete this question.';
      }
      if (!resp || !resp.challengesRemarks.trim()) {
        errors[`goal-${g.id}-challenges`] = 'Please complete this question.';
      }
    });

    // 2. Validate Competencies
    relevantCompetencies.forEach((c) => {
      const resp = localResponses.competencies[c.id];
      if (!resp || resp.rating === 0) {
        errors[`comp-${c.id}-rating`] = 'For rating, please select a rating.';
      }
    });

    // 3. Validate Overall Assessment
    relevantOverallQuestions.forEach((q) => {
      if (q.required) {
        const ans = localResponses.overall[q.id];
        if (!ans || !ans.trim()) {
          errors[`overall-${q.id}`] = 'Please complete this question.';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Live validation on step changes
  useEffect(() => {
    if (hasTriedSubmit) {
      validateForm();
    }
  }, [localResponses, hasTriedSubmit]);

  const handleSaveDraft = () => {
    onSaveDraft(localResponses);
    if (onShowToast) {
      onShowToast('success', 'Self review saved as draft.', 'Your responses are preserved locally.');
    }
  };

  const handlePreSubmitCheck = () => {
    setHasTriedSubmit(true);
    const isValid = validateForm();
    if (!isValid) {
      if (onShowToast) {
        onShowToast('error', 'Incomplete Questionnaire', 'Please address validation errors in each section before submitting.');
      }
      // Auto redirect to first step with errors
      const errors = Object.keys(validateForm() ? {} : validationErrors);
      if (errors.some(e => e.startsWith('goal-'))) {
        setActiveStep(1);
      } else if (errors.some(e => e.startsWith('comp-'))) {
        setActiveStep(2);
      } else if (errors.some(e => e.startsWith('overall-'))) {
        setActiveStep(3);
      }
      return;
    }
    setShowSubmitModal(true);
  };

  const handleFinalSubmit = () => {
    setShowSubmitModal(false);
    const finalResponses: SelfReviewResponses = {
      ...localResponses,
      status: 'Completed',
      submittedDate: '28 Mar 2027'
    };
    setLocalResponses(finalResponses);
    onSubmitReview(finalResponses);
    if (onShowToast) {
      onShowToast('success', 'Self review submitted successfully.', 'Your self review has been locked and sent to manager review.');
    }
  };

  const renderGoalStatusBadge = (status: GoalStatus) => {
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

  // --- Completed View State ---
  if (isCompleted) {
    return (
      <div className="self-review-page animate-fade-in">
        {/* Page Header */}
        <PageHeader
          title="Self Review"
          subtitle="Reflect on your performance, achievements, and development during this Appraisal Cycle."
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'My Performance', href: '#/performance/my-performance' },
            { label: 'Self Review' }
          ]}
          actions={
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Back to My Performance</span>
            </button>
          }
        />

        {/* Success completed banner */}
        <div className="self-review-completed-banner">
          <div className="self-review-completed-icon">
            <Check size={28} />
          </div>
          <h2 className="self-review-completed-title">Self Review Completed</h2>
          <p className="self-review-completed-desc">
            Your self-assessment has been successfully submitted and locked. Your reporting manager has been notified to begin their evaluation checkpoint.
          </p>
          <div className="self-review-completed-meta">
            <span>Submitted: <strong>{localResponses.submittedDate || '28 Mar 2027'}</strong></span>
            <span>•</span>
            <span>Cycle: <strong>FY 2026–27 Annual Performance Review</strong></span>
            <span>•</span>
            <span>Department: <strong>Sales</strong></span>
          </div>
        </div>

        {/* Readonly Review Journey */}
        <Card
          title="Review Progression Stage"
          subtitle="Status of active appraisal workflow checkpoints"
        >
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, padding: 12, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}>
                <CheckCircle2 size={15} />
                <span>1. Self Review (Completed)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Your responses are finalized and locked for management calibration.
              </p>
            </div>
            <div style={{ flex: 1, padding: 12, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#B45309' }}>
                <Clock size={15} />
                <span>2. Manager Review (Pending)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Waiting for manager Vikram Patel to evaluate and provide performance ratings.
              </p>
            </div>
            <div style={{ flex: 1, padding: 12, background: '#F8FAFC', border: '1px solid var(--border-default)', borderRadius: 8, opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                <Lock size={14} />
                <span>3. HR Calibration (Locked)</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                HR review and final rating release details will unlock after manager assessment.
              </p>
            </div>
          </div>
        </Card>

        {/* Readonly Responses Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Section 1: Goals */}
          <Card title="1. Goals Assessment" subtitle="Achievements logged against performance objectives">
            <div className="form-section-gap">
              {goals.map((g) => {
                const resp = localResponses.goals[g.id] || { achievementSummary: '', challengesRemarks: '' };
                return (
                  <div key={g.id} className="self-review-goal-item-box">
                    <div className="self-review-goal-header-row">
                      <div className="self-review-goal-title-wrap">
                        <span className="self-review-goal-title">{g.title}</span>
                        <div className="self-review-goal-meta-chips">
                          <span>Target: <strong>{g.target}</strong></span>
                          <span>•</span>
                          <span>Appraisal Weight: <strong>{g.weight}%</strong></span>
                          <span>•</span>
                          <span>Due: <strong>{g.dueDate}</strong></span>
                          <span>•</span>
                          <span>Status: {renderGoalStatusBadge(g.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="self-review-goal-fields-grid">
                      <div className="form-group">
                        <span className="form-label">Achievement Summary</span>
                        <div className="self-review-readonly-field">{resp.achievementSummary}</div>
                      </div>
                      <div className="form-group">
                        <span className="form-label">Challenges / Remarks</span>
                        <div className="self-review-readonly-field">{resp.challengesRemarks}</div>
                      </div>
                    </div>
                    {resp.attachmentName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#0369A1', marginTop: 4 }}>
                        <FileText size={14} />
                        <span>Submitted Evidence: <strong>{resp.attachmentName}</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 2: Competencies */}
          <Card title="2. Competencies Assessment" subtitle="Role-based capability rating reflections">
            <div className="form-section-gap">
              {relevantCompetencies.map((c) => {
                const resp = localResponses.competencies[c.id] || { rating: 0, comment: '' };
                return (
                  <div key={c.id} className="self-review-competency-card">
                    <div className="self-review-competency-header">
                      <span className="self-review-competency-name">{c.name}</span>
                      <span className="self-review-competency-desc">{c.description}</span>
                    </div>
                    <div className="form-group">
                      <span className="form-label">Employee Self-Rating</span>
                      <RatingScale value={resp.rating} readOnly />
                    </div>
                    <div className="form-group">
                      <span className="form-label">Justification / Comment</span>
                      <div className="self-review-readonly-field">
                        {resp.comment || <em style={{ color: 'var(--text-muted)' }}>No comments provided</em>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 3: Overall Questions */}
          <Card title="3. Overall Assessment Questionnaire" subtitle="Dynamic overall performance questions">
            <div className="form-section-gap">
              {relevantOverallQuestions.map((q) => (
                <div key={q.id} className="question-engine-item">
                  <span className="question-engine-label">{q.question}</span>
                  <DynamicQuestionField
                    question={q}
                    value={localResponses.overall[q.id] || ''}
                    onChange={(val) => handleOverallAnswerChange(q.id, val)}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="self-review-page">
      {/* 1. Page Header */}
      <PageHeader
        title="Self Review"
        subtitle="Reflect on your performance, achievements, and development during this Appraisal Cycle."
        badge="Deadline: 30 Mar 2027"
        badgeVariant="warning"
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Performance', href: '#/performance/my-performance' },
          { label: 'Self Review' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Back to My Performance</span>
            </button>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={handleSaveDraft}
            >
              Save Draft
            </button>
          </div>
        }
      />

      {/* active cycle banner */}
      <div className="my-goals-cycle-banner">
        <div className="my-goals-banner-left">
          <div className="my-goals-banner-icon">
            <Calendar size={20} />
          </div>
          <div className="my-goals-banner-title-col">
            <div className="my-goals-banner-name">
              <span>FY 2026–27 Annual Performance Review</span>
              <span className="pms-badge badge-warning">Pending Submission</span>
            </div>
            <div className="my-goals-banner-meta">
              <span>Period: 01 Apr 2026 – 31 Mar 2027</span>
              <span>•</span>
              <span>Deadline: <strong>30 Mar 2027 (in 7 months)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Review Progress (Top Step Bar) */}
      <div className="self-review-progress-card">
        <div className="self-review-progress-header">
          <span className="self-review-progress-title">
            Self Review &mdash; Step {activeStep} of 3
          </span>
          <span className="self-review-progress-percentage">{progressPercent}% Completed</span>
        </div>

        {/* Progress Bar Track */}
        <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
          <div className="sixtifi-progress-bar-fill primary" style={{ width: `${progressPercent}%` }} />
        </div>

        {/* Interactive step pills */}
        <div className="self-review-steps-container">
          <div
            className={`self-review-step-pill ${activeStep === 1 ? 'is-active' : ''} ${
              completedGoalsCount === goals.length ? 'is-completed' : ''
            }`}
            onClick={() => setActiveStep(1)}
          >
            <span className="self-review-step-label">Section 1</span>
            <span className="self-review-step-name">
              <span>Goals Review</span>
              {completedGoalsCount === goals.length && <CheckCircle2 size={13} color="#059669" />}
            </span>
          </div>

          <div
            className={`self-review-step-pill ${activeStep === 2 ? 'is-active' : ''} ${
              completedCompsCount === relevantCompetencies.length ? 'is-completed' : ''
            }`}
            onClick={() => setActiveStep(2)}
          >
            <span className="self-review-step-label">Section 2</span>
            <span className="self-review-step-name">
              <span>Competencies</span>
              {completedCompsCount === relevantCompetencies.length && <CheckCircle2 size={13} color="#059669" />}
            </span>
          </div>

          <div
            className={`self-review-step-pill ${activeStep === 3 ? 'is-active' : ''} ${
              completedRequiredOverallCount === totalRequiredQuestions ? 'is-completed' : ''
            }`}
            onClick={() => setActiveStep(3)}
          >
            <span className="self-review-step-label">Section 3</span>
            <span className="self-review-step-name">
              <span>Overall Assessment</span>
              {completedRequiredOverallCount === totalRequiredQuestions && <CheckCircle2 size={13} color="#059669" />}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Render wizard active section */}
      <div className="self-review-content">
        {/* Step 1: Goals */}
        {activeStep === 1 && (
          <div className="self-review-section-card animate-fade-in">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title">Goal Self Review</h2>
              <p className="self-review-section-sub">
                Review your goals and describe your achievements against each. Your reporting manager will verify these logs.
              </p>
            </div>

            <div className="form-section-gap">
              {goals.map((g) => {
                const resp = localResponses.goals[g.id] || { achievementSummary: '', challengesRemarks: '' };
                const errAchievement = validationErrors[`goal-${g.id}-achievement`];
                const errChallenges = validationErrors[`goal-${g.id}-challenges`];

                return (
                  <div key={g.id} className="self-review-goal-item-box">
                    <div className="self-review-goal-header-row">
                      <div className="self-review-goal-title-wrap">
                        <span className="self-review-goal-title">{g.title}</span>
                        <p className="self-review-goal-desc">{g.description}</p>
                        <div className="self-review-goal-meta-chips">
                          <span>Target: <strong>{g.target}</strong></span>
                          <span>•</span>
                          <span>Appraisal Weight: <strong>{g.weight}%</strong></span>
                          <span>•</span>
                          <span>Due: <strong>{g.dueDate}</strong></span>
                          <span>•</span>
                          <span>Status: {renderGoalStatusBadge(g.status)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="self-review-goal-fields-grid">
                      {/* Achievement summary */}
                      <div className="form-group">
                        <label className="form-label" htmlFor={`goal-${g.id}-achievement`}>
                          <span>Achievement Summary *</span>
                        </label>
                        <textarea
                          id={`goal-${g.id}-achievement`}
                          className={`form-textarea ${errAchievement ? 'is-invalid' : ''}`}
                          rows={3}
                          value={resp.achievementSummary}
                          onChange={(e) => handleGoalFieldChange(g.id, 'achievementSummary', e.target.value)}
                          placeholder="What did you achieve against this goal?"
                          required
                        />
                        {errAchievement && (
                          <div className="form-error-msg">
                            <AlertCircle size={12} />
                            <span>{errAchievement}</span>
                          </div>
                        )}
                      </div>

                      {/* Challenges */}
                      <div className="form-group">
                        <label className="form-label" htmlFor={`goal-${g.id}-challenges`}>
                          <span>Challenges / Remarks *</span>
                        </label>
                        <textarea
                          id={`goal-${g.id}-challenges`}
                          className={`form-textarea ${errChallenges ? 'is-invalid' : ''}`}
                          rows={3}
                          value={resp.challengesRemarks}
                          onChange={(e) => handleGoalFieldChange(g.id, 'challengesRemarks', e.target.value)}
                          placeholder="What challenges affected your progress?"
                          required
                        />
                        {errChallenges && (
                          <div className="form-error-msg">
                            <AlertCircle size={12} />
                            <span>{errChallenges}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Evidence Attachment */}
                    <div className="form-group" style={{ maxWidth: '400px' }}>
                      <label className="form-label">Supporting Attachment (Optional)</label>
                      {resp.attachmentName ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', color: '#0369A1' }}>
                            <FileText size={13} />
                            <span>{resp.attachmentName}</span>
                          </div>
                          <button
                            type="button"
                            style={{ fontSize: '0.68rem', color: '#DC2626', fontWeight: 600 }}
                            onClick={() => handleRemoveGoalAttachment(g.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div
                          className="attachment-upload-box"
                          style={{ padding: '8px 12px' }}
                          onClick={() => handleSimulateGoalAttachment(g.id)}
                        >
                          <UploadCloud size={14} />
                          <span style={{ fontSize: '0.72rem' }}>Click to simulate evidence upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Competencies */}
        {activeStep === 2 && (
          <div className="self-review-section-card animate-fade-in">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title">Competency Self Assessment</h2>
              <p className="self-review-section-sub">
                Rate your capability level and provide reflections against core competencies aligned to your role (<strong>{designation} &mdash; {department}</strong>).
              </p>
            </div>

            <div className="form-section-gap">
              {relevantCompetencies.map((c) => {
                const resp = localResponses.competencies[c.id] || { rating: 0, comment: '' };
                const errRating = validationErrors[`comp-${c.id}-rating`];

                return (
                  <div key={c.id} className="self-review-competency-card">
                    <div className="self-review-competency-header">
                      <span className="self-review-competency-name">{c.name}</span>
                      <span className="self-review-competency-desc">{c.description}</span>
                    </div>

                    {/* Rating 1-5 Control */}
                    <div className="form-group">
                      <label className="form-label">
                        <span>Select Rating (1–5) *</span>
                      </label>
                      <RatingScale
                        value={resp.rating}
                        onChange={(num) => handleCompetencyRatingChange(c.id, num)}
                        error={errRating}
                        idPrefix={`comp-${c.id}`}
                      />
                    </div>

                    {/* Feedback Comment */}
                    <div className="form-group">
                      <label className="form-label" htmlFor={`comp-${c.id}-comment`}>
                        <span>Justification & Comment</span>
                        <span className="form-label-optional">Optional</span>
                      </label>
                      <textarea
                        id={`comp-${c.id}-comment`}
                        className="form-textarea"
                        rows={2}
                        value={resp.comment}
                        onChange={(e) => handleCompetencyCommentChange(c.id, e.target.value)}
                        placeholder="Provide details or recent achievements demonstrating this competency..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Overall Assessment */}
        {activeStep === 3 && (
          <div className="self-review-section-card animate-fade-in">
            <div className="self-review-section-header">
              <h2 className="self-review-section-title">Overall Self Assessment</h2>
              <p className="self-review-section-sub">
                Reflect broadly on your key achievements, challenges faced, development plans, and priorities.
              </p>
            </div>

            <div className="form-section-gap">
              {relevantOverallQuestions.map((q) => {
                return (
                  <div key={q.id} className="question-engine-item">
                    <label className="question-engine-label" htmlFor={`overall-${q.id}`}>
                      <span>{q.question} {q.required && '*'}</span>
                      {!q.required && <span className="form-label-optional">(Optional)</span>}
                    </label>

                    <DynamicQuestionField
                      question={q}
                      value={localResponses.overall[q.id] || ''}
                      onChange={(val) => handleOverallAnswerChange(q.id, val)}
                      error={validationErrors[`overall-${q.id}`]}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Sticky Actions Area */}
      <div className="self-review-actions-bar">
        <div className="self-review-summary-block">
          {/* Completion summary */}
          <div className="self-review-summary-pill">
            <Layers size={13} />
            <span>Goals: {completedGoalsCount} / {goals.length}</span>
          </div>

          <div className="self-review-summary-pill">
            <Award size={13} />
            <span>Competencies: {completedCompsCount} / {relevantCompetencies.length}</span>
          </div>

          <div className="self-review-summary-pill">
            <BookOpen size={13} />
            <span>Overall: {completedOverallCount} / {relevantOverallQuestions.length}</span>
          </div>

          <span style={{ fontWeight: 600 }}>Total Progress: {progressPercent}%</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeStep > 1 && (
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '8px 16px', gap: 6 }}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          )}

          {activeStep < 3 ? (
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 18px', gap: 6 }}
              onClick={() => setActiveStep(activeStep + 1)}
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
              <span>Submit Self Review</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Submit Confirmation Dialog Modal */}
      {showSubmitModal && (
        <div className="modal-backdrop" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title" style={{ color: '#B91C1C' }}>Submit Self Review?</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowSubmitModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>
                Once submitted, you will not be able to edit your responses or upload additional evidence unless your manager or HR administrator reopens the cycle review form for you.
              </p>
              <div style={{ marginTop: 12, padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 6, display: 'flex', gap: 8, color: '#991B1B' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>By submitting, you confirm that your assessment is accurate and final.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={() => setShowSubmitModal(false)}
              >
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
