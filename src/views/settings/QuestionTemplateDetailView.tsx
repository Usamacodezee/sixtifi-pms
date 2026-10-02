import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MultiSelectField } from './MultiSelectField';
import { SingleSelectAutocomplete } from '../../components/ui/SingleSelectAutocomplete';
import { QuestionTemplate, ReviewTypeOption, JOB_LEVEL_OPTIONS } from '../../data/mockSettings';
import { DynamicQuestion, QuestionType, QuestionCategory } from '../../data/selfReviewConfig';
import { RATING_LABELS } from '../../data/reviewEngine';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '../../data/mockEmployees';
import { ToastType } from '../../components/ui/Toast';
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  X,
  Copy,
  ArrowUp,
  ArrowDown,
  Ban,
  CheckCircle2
} from 'lucide-react';
import '../cycles/CreateCycleWizard.css';
import './SettingsStyles.css';

export interface QuestionTemplateDetailViewProps {
  templateId: string; // 'new' for create mode
  templates: QuestionTemplate[];
  onCreateTemplate: (template: QuestionTemplate) => void;
  onUpdateTemplate: (template: QuestionTemplate) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const REVIEW_TYPE_OPTIONS: ReviewTypeOption[] = ['Self Review', 'Manager Review', 'Final Review'];
const QUESTION_TYPE_OPTIONS: QuestionType[] = ['Short Text', 'Long Text', 'Rating', 'Yes/No', 'Single Select'];
const QUESTION_CATEGORY_OPTIONS: QuestionCategory[] = ['Goal', 'Competency', 'Self Assessment', 'Development', 'General'];

let idCounter = 0;
const nextQuestionId = () => `new-q-${Date.now()}-${idCounter++}`;

const sectionForCategory = (category: QuestionCategory): DynamicQuestion['section'] =>
  category === 'Goal' ? 'goals' : category === 'Competency' ? 'competency' : 'overall';

export const QuestionTemplateDetailView: React.FC<QuestionTemplateDetailViewProps> = ({
  templateId,
  templates,
  onCreateTemplate,
  onUpdateTemplate,
  onNavigate,
  onShowToast
}) => {
  const isEdit = templateId !== 'new';
  const existing = isEdit ? templates.find((t) => t.id === templateId) : undefined;

  const [name, setName] = useState(existing?.name || '');
  const [reviewType, setReviewType] = useState<ReviewTypeOption>(existing?.reviewType || 'Self Review');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    existing?.departments && existing.departments.length > 0
      ? existing.departments
      : [existing?.department || 'All']
  );
  const [status, setStatus] = useState<'Active' | 'Inactive'>(existing?.status || 'Active');
  const [questions, setQuestions] = useState<DynamicQuestion[]>(
    existing ? existing.questions.map((q) => ({ ...q })) : []
  );
  const [nameError, setNameError] = useState('');
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: nextQuestionId(),
        section: 'overall',
        question: '',
        type: 'Long Text',
        required: true,
        category: 'General'
      }
    ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof DynamicQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const next = { ...q, [field]: value };
        if (field === 'category') next.section = sectionForCategory(value as QuestionCategory);
        if (field === 'type' && value === 'Rating' && !next.ratingLabels) next.ratingLabels = [...RATING_LABELS];
        if (field === 'type' && value === 'Single Select' && !next.options) next.options = [''];
        return next;
      })
    );
  };

  const handleUpdateRatingLabel = (id: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const labels = [...(q.ratingLabels || RATING_LABELS)];
        labels[idx] = value;
        return { ...q, ratingLabels: labels };
      })
    );
  };

  const handleUpdateOption = (id: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const options = [...(q.options || [])];
        options[idx] = value;
        return { ...q, options };
      })
    );
  };

  const handleAddOption = (id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, options: [...(q.options || []), ''] } : q)));
  };

  const handleRemoveOption = (id: string, idx: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options: (q.options || []).filter((_, i) => i !== idx) } : q))
    );
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDuplicateQuestion = (id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const clone: DynamicQuestion = { ...prev[idx], id: nextQuestionId() };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const handleMoveQuestion = (id: string, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Template Name is required.');
      valid = false;
    } else {
      setNameError('');
    }

    const qErrors: Record<string, string> = {};
    questions.forEach((q) => {
      if (!q.question.trim()) {
        qErrors[q.id] = 'Question Text is required.';
        valid = false;
      } else if (q.type === 'Single Select' && (!q.options || q.options.filter((o) => o.trim()).length === 0)) {
        qErrors[q.id] = 'Add at least one option for this Single Select question.';
        valid = false;
      }
    });
    setQuestionErrors(qErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validate()) {
      onShowToast?.('error', 'Fix validation errors', 'Please resolve the highlighted fields before saving.');
      return;
    }

    const primaryDept = selectedDepts.includes('All') || selectedDepts.length === 0 ? 'All' : selectedDepts.join(', ');
    const payload: QuestionTemplate = {
      id: existing?.id || `cfg-tpl-${Date.now()}`,
      name: name.trim(),
      reviewType,
      department: primaryDept,
      departments: selectedDepts,
      designation: 'All',
      jobLevel: 'All',
      status,
      questions: questions.map((q, idx) => ({ ...q, order: idx + 1 }))
    };

    if (isEdit) {
      onUpdateTemplate(payload);
      onShowToast?.('success', 'Template updated.', `"${payload.name}" was updated.`);
    } else {
      onCreateTemplate(payload);
      onShowToast?.('success', 'Question template saved.', `"${payload.name}" was added with ${questions.length} question${questions.length === 1 ? '' : 's'}.`);
    }
    onNavigate('/performance/settings/question-templates');
  };

  const handleDuplicateTemplate = () => {
    if (!existing) return;
    const clone: QuestionTemplate = {
      ...existing,
      id: `cfg-tpl-${Date.now()}`,
      name: `${existing.name} (Copy)`,
      questions: existing.questions.map((q) => ({ ...q, id: nextQuestionId() }))
    };
    onCreateTemplate(clone);
    onShowToast?.('success', 'Template duplicated', `"${clone.name}" was added to the library.`);
    onNavigate('/performance/settings/question-templates');
  };

  const handleToggleTemplateStatus = () => {
    if (!existing) return;
    const nextStatus = existing.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateTemplate({ ...existing, status: nextStatus });
    setStatus(nextStatus);
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Template deactivated' : 'Template activated',
      `"${existing.name}" is now ${nextStatus.toLowerCase()}.`
    );
  };

  return (
    <div className="settings-page animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit Question Template' : 'Create Question Template'}
        subtitle="Build a set of review questions and target the audience it applies to."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Settings', href: '#/performance/settings' },
          { label: 'Question Templates', href: '#/performance/settings/question-templates' },
          { label: isEdit ? 'Edit Template' : 'Create Template' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {isEdit && (
              <>
                <button
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
                  onClick={handleDuplicateTemplate}
                >
                  <Copy size={14} />
                  <span>Duplicate</span>
                </button>
                <button
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
                  onClick={handleToggleTemplateStatus}
                >
                  {status === 'Active' ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                  <span>{status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                </button>
              </>
            )}
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/settings/question-templates')}
            >
              <ArrowLeft size={14} />
              <span>Back to Templates</span>
            </button>
          </div>
        }
      />

      <div className="wizard-content-card">
        <div className="form-section-header">
          <h2 className="form-section-title">Template Details</h2>
          <p className="form-section-subtitle">Name this template and choose which review stage it belongs to.</p>
        </div>

        <div className="form-grid-2">
          <div className="form-field-group">
            <span className="form-field-label">
              Template Name <span className="required-asterisk">*</span>
            </span>
            <input
              type="text"
              className={`form-input-text ${nameError ? 'has-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sales Executive Self Review"
            />
            {nameError && (
              <div className="form-field-error">
                <AlertCircle size={12} />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div className="form-field-group">
            <span className="form-field-label">
              Review Type <span className="required-asterisk">*</span>
            </span>
            <select className="form-input-select" value={reviewType} onChange={(e) => setReviewType(e.target.value as ReviewTypeOption)}>
              {REVIEW_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section-header">
          <h2 className="form-section-title">Question Targeting</h2>
          <p className="form-section-subtitle">
            This template applies to employees in the targeted department(s) for the specified review type.
          </p>
        </div>

        <div className="targeting-chain">
          <span className="targeting-chain-item">Company</span>
          <span className="targeting-chain-arrow">&rarr;</span>
          <span className="targeting-chain-item">{selectedDepts.join(', ')}</span>
          <span className="targeting-chain-arrow">&rarr;</span>
          <span className="targeting-chain-item">{reviewType}</span>
        </div>

        <div className="form-grid-2">
          <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
            <span className="form-field-label">
              Applicable Department(s) <span className="required-asterisk">*</span>
            </span>
            <MultiSelectField
              options={[
                { value: 'All', label: 'All Departments (Company-Wide)', sub: 'Apply to all company departments' },
                ...MOCK_DEPARTMENTS.map((d) => ({ value: d.name, label: d.name, sub: `${d.count} active employees` }))
              ]}
              selected={selectedDepts}
              onChange={(next) => {
                if (next.length === 0) {
                  setSelectedDepts(['All']);
                } else if (next.includes('All') && next.length > 1) {
                  if (next[next.length - 1] === 'All') {
                    setSelectedDepts(['All']);
                  } else {
                    setSelectedDepts(next.filter((d) => d !== 'All'));
                  }
                } else {
                  setSelectedDepts(next);
                }
              }}
              searchable
              placeholder="Search or select department(s)..."
            />
          </div>

          <div className="form-field-group">
            <span className="form-field-label">Status</span>
            <select className="form-input-select" value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-section-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="form-section-title">Questions</h2>
            <p className="form-section-subtitle">{questions.length} question{questions.length === 1 ? '' : 's'} in this template.</p>
          </div>
          <button type="button" className="pms-btn pms-btn-secondary" style={{ padding: '7px 14px', gap: 6 }} onClick={handleAddQuestion}>
            <Plus size={14} />
            <span>Add Question</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="settings-inline-placeholder">
            No questions added yet. Click &ldquo;Add Question&rdquo; to build this template.
          </div>
        ) : (
          <div className="form-section-gap">
            {questions.map((q, idx) => (
              <div key={q.id} className="question-builder-item">
                <div className="question-builder-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="question-builder-index">Question {idx + 1} of {questions.length}</span>
                    <span
                      className={`pms-badge ${q.required ? 'badge-warning' : 'badge-neutral'}`}
                      style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                    >
                      {q.required ? 'Required *' : 'Optional'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="more-trigger-btn"
                      style={{ width: 26, height: 26 }}
                      disabled={idx === 0}
                      onClick={() => handleMoveQuestion(q.id, 'up')}
                      aria-label="Move question up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="more-trigger-btn"
                      style={{ width: 26, height: 26 }}
                      disabled={idx === questions.length - 1}
                      onClick={() => handleMoveQuestion(q.id, 'down')}
                      aria-label="Move question down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button type="button" className="question-builder-remove" style={{ color: 'var(--text-secondary)' }} onClick={() => handleDuplicateQuestion(q.id)}>
                      <Copy size={13} />
                      <span>Duplicate</span>
                    </button>
                    <button type="button" className="question-builder-remove" onClick={() => handleRemoveQuestion(q.id)}>
                      <X size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">
                    Question Text <span className="required-asterisk">*</span>
                  </span>
                  <textarea
                    className={`form-textarea ${questionErrors[q.id] ? 'is-invalid' : ''}`}
                    rows={2}
                    value={q.question}
                    onChange={(e) => handleUpdateQuestion(q.id, 'question', e.target.value)}
                    placeholder='e.g. "What were your key achievements during this Appraisal Cycle?"'
                  />
                  {questionErrors[q.id] && (
                    <div className="form-field-error">
                      <AlertCircle size={12} />
                      <span>{questionErrors[q.id]}</span>
                    </div>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-field-group">
                    <span className="form-field-label">Question Type</span>
                    <select
                      className="form-input-select"
                      value={q.type}
                      onChange={(e) => handleUpdateQuestion(q.id, 'type', e.target.value as QuestionType)}
                    >
                      {QUESTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <span className="form-field-label">Question Category</span>
                    <select
                      className="form-input-select"
                      value={q.category || 'General'}
                      onChange={(e) => handleUpdateQuestion(q.id, 'category', e.target.value as QuestionCategory)}
                    >
                      {QUESTION_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {q.type === 'Rating' && (
                  <div className="form-field-group">
                    <span className="form-field-label">Rating Scale: 1–5 — Customize Labels</span>
                    <div className="form-section-gap">
                      {(q.ratingLabels || RATING_LABELS).map((label, labelIdx) => (
                        <div key={labelIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="level-editor-num" style={{ width: 24, height: 24, fontSize: '0.7rem' }}>{labelIdx + 1}</span>
                          <input
                            type="text"
                            className="form-input-text"
                            value={label}
                            onChange={(e) => handleUpdateRatingLabel(q.id, labelIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === 'Single Select' && (
                  <div className="form-field-group">
                    <span className="form-field-label">Options</span>
                    <div className="form-section-gap">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="text"
                            className="form-input-text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                          />
                          <button
                            type="button"
                            className="question-builder-remove"
                            onClick={() => handleRemoveOption(q.id, optIdx)}
                            aria-label="Remove option"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="pms-btn pms-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.72rem', gap: 4, alignSelf: 'flex-start' }}
                        onClick={() => handleAddOption(q.id)}
                      >
                        <Plus size={12} />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="toggle-setting-row">
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>Required</span>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${q.required ? 'is-active' : ''}`}
                    onClick={() => handleUpdateQuestion(q.id, 'required', !q.required)}
                    aria-label="Toggle Required"
                  >
                    <div className="toggle-switch-knob" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="settings-section-footer">
          <button
            type="button"
            className="pms-btn pms-btn-secondary"
            style={{ padding: '8px 16px' }}
            onClick={() => onNavigate('/performance/settings/question-templates')}
          >
            Cancel
          </button>
          <button type="button" className="pms-btn pms-btn-primary" style={{ padding: '8px 18px', gap: 6 }} onClick={handleSave}>
            <Check size={14} />
            <span>{isEdit ? 'Save Changes' : 'Save Template'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
