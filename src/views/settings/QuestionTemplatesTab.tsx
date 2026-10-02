import React, { useEffect, useRef, useState } from 'react';
import { QuestionTemplate, ReviewTypeOption, applicableToChain } from '../../data/mockSettings';
import { DynamicQuestion, QuestionType, QuestionCategory } from '../../data/selfReviewConfig';
import { RATING_LABELS } from '../../data/reviewEngine';
import { MOCK_DEPARTMENTS } from '../../data/mockEmployees';
import { MultiSelectField } from './MultiSelectField';
import { ToastType } from '../../components/ui/Toast';
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Copy,
  Ban,
  CheckCircle2,
  FileQuestion,
  X,
  Check,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface QuestionTemplatesTabProps {
  templates: QuestionTemplate[];
  onUpdateTemplates: (list: QuestionTemplate[]) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const REVIEW_TYPES: ReviewTypeOption[] = ['Self Review', 'Manager Review', 'Final Review'];
const QUESTION_TYPE_OPTIONS: QuestionType[] = ['Short Text', 'Long Text', 'Rating', 'Yes/No', 'Single Select'];
const QUESTION_CATEGORY_OPTIONS: QuestionCategory[] = ['Goal', 'Competency', 'Self Assessment', 'Development', 'General'];

export const QuestionTemplatesTab: React.FC<QuestionTemplatesTabProps> = ({
  templates,
  onUpdateTemplates,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewTypeFilter, setReviewTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Dialog State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state inside Dialog
  const [name, setName] = useState('');
  const [reviewType, setReviewType] = useState<ReviewTypeOption>('Self Review');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['All']);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [nameError, setNameError] = useState('');
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setReviewType('Self Review');
    setSelectedDepts(['All']);
    setStatus('Active');
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        section: 'overall',
        question: '',
        type: 'Long Text',
        required: true,
        category: 'General'
      }
    ]);
    setNameError('');
    setQuestionErrors({});
    setShowModal(true);
  };

  const openEditModal = (t: QuestionTemplate) => {
    setOpenMenuId(null);
    setEditingId(t.id);
    setName(t.name);
    setReviewType(t.reviewType);
    const depts = t.departments && t.departments.length > 0 ? t.departments : [t.department || 'All'];
    setSelectedDepts(depts);
    setStatus(t.status);
    setQuestions(t.questions.map((q) => ({ ...q })));
    setNameError('');
    setQuestionErrors({});
    setShowModal(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
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
        if (field === 'category') {
          next.section = value === 'Goal' ? 'goals' : value === 'Competency' ? 'competency' : 'overall';
        }
        if (field === 'type' && value === 'Rating' && !next.ratingLabels) {
          next.ratingLabels = [...RATING_LABELS];
        }
        if (field === 'type' && value === 'Single Select' && !next.options) {
          next.options = [''];
        }
        return next;
      })
    );
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDuplicateQuestion = (id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const clone: DynamicQuestion = { ...prev[idx], id: `q-${Date.now()}-dup` };
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

  const handleSaveTemplate = () => {
    if (!name.trim()) {
      setNameError('Template Name is required.');
      return;
    }
    setNameError('');

    const qErrors: Record<string, string> = {};
    let valid = true;
    questions.forEach((q) => {
      if (!q.question.trim()) {
        qErrors[q.id] = 'Question Text is required.';
        valid = false;
      }
    });

    if (!valid) {
      setQuestionErrors(qErrors);
      return;
    }

    const primaryDept = selectedDepts.includes('All') || selectedDepts.length === 0 ? 'All' : selectedDepts.join(', ');
    const payload: QuestionTemplate = {
      id: editingId || `cfg-tpl-${Date.now()}`,
      name: name.trim(),
      reviewType,
      department: primaryDept,
      departments: selectedDepts,
      designation: 'All',
      jobLevel: 'All',
      status,
      questions
    };

    if (editingId) {
      onUpdateTemplates(templates.map((t) => (t.id === editingId ? payload : t)));
      onShowToast?.('success', 'Template updated', `"${payload.name}" was saved.`);
    } else {
      onUpdateTemplates([payload, ...templates]);
      onShowToast?.('success', 'Template created', `"${payload.name}" was added to library.`);
    }

    setShowModal(false);
  };

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReviewType = reviewTypeFilter === 'all' || t.reviewType === reviewTypeFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesReviewType && matchesStatus;
  });

  const handleDuplicate = (t: QuestionTemplate) => {
    setOpenMenuId(null);
    const clone: QuestionTemplate = {
      ...t,
      id: `cfg-tpl-${Date.now()}`,
      name: `${t.name} (Copy)`,
      questions: t.questions.map((q, idx) => ({ ...q, id: `${t.id}-copy-q-${idx}-${Date.now()}` }))
    };
    onUpdateTemplates([clone, ...templates]);
    onShowToast?.('success', 'Template duplicated', `"${clone.name}" was added to the library.`);
  };

  const handleToggleStatus = (t: QuestionTemplate) => {
    setOpenMenuId(null);
    const nextStatus = t.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateTemplates(templates.map((item) => (item.id === t.id ? { ...item, status: nextStatus } : item)));
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Template deactivated' : 'Template activated',
      `"${t.name}" is now ${nextStatus.toLowerCase()}.`
    );
  };

  return (
    <div className="settings-section-card">
      <div className="form-section-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="form-section-title">Question Templates</h2>
          <p className="form-section-subtitle">Create reusable performance review question sets for different roles and review stages.</p>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-primary"
          style={{ padding: '8px 14px', gap: 6, whiteSpace: 'nowrap' }}
          onClick={openCreateModal}
        >
          <Plus size={14} />
          <span>Create Template</span>
        </button>
      </div>

      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          <div className="emp-search-wrap">
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="emp-filter-select" value={reviewTypeFilter} onChange={(e) => setReviewTypeFilter(e.target.value)}>
            <option value="all">Review Type: All</option>
            {REVIEW_TYPES.map((rt) => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>

          <select className="emp-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {templates.length} templates
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="settings-inline-placeholder">
          <FileQuestion size={26} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
          <p style={{ margin: 0 }}>No question templates created yet.</p>
        </div>
      ) : (
        <div className="emp-table-card">
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Review Type</th>
                  <th>Applicable To</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const isMenuOpen = openMenuId === t.id;
                  return (
                    <tr key={t.id}>
                      <td>
                        <span
                          className="emp-name-title"
                          onClick={() => openEditModal(t)}
                        >
                          {t.name}
                        </span>
                      </td>
                      <td>
                        <span className="pms-badge badge-info">{t.reviewType}</span>
                      </td>
                      <td>{applicableToChain(t)}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t.questions.length} Question{t.questions.length === 1 ? '' : 's'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {t.questions.filter((q) => q.required).length} required, {t.questions.filter((q) => !q.required).length} optional
                        </div>
                      </td>
                      <td>
                        <span className={`pms-badge ${t.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                          style={{ margin: '0 auto', width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(isMenuOpen ? null : t.id);
                          }}
                          aria-label={`Actions for ${t.name}`}
                        >
                          <MoreVertical size={14} />
                        </button>

                        {isMenuOpen && (
                          <div className="more-dropdown-menu" ref={menuRef} style={{ right: 8, top: '80%', zIndex: 90 }}>
                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => openEditModal(t)}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button type="button" className="more-menu-item" onClick={() => handleDuplicate(t)}>
                              <Copy size={13} />
                              <span>Duplicate</span>
                            </button>
                            <button
                              type="button"
                              className={`more-menu-item ${t.status === 'Active' ? 'danger-item' : ''}`}
                              onClick={() => handleToggleStatus(t)}
                            >
                              {t.status === 'Active' ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                              <span>{t.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Question Template Dialog Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">{editingId ? 'Edit Question Template' : 'Create Question Template'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                    {REVIEW_TYPES.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">
                    Applicable Department(s) <span className="required-asterisk">*</span>
                  </span>
                  <MultiSelectField
                    options={[
                      { value: 'All', label: 'All Departments (Company-Wide)', sub: 'Applies universally to all company departments' },
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
                    placeholder="Select department(s)..."
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

              {/* Questions Section */}
              <div className="form-section-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Questions</span>
                  <p className="form-section-subtitle" style={{ fontSize: '0.75rem' }}>
                    {questions.length} question{questions.length === 1 ? '' : 's'} in this template.
                  </p>
                </div>
                <button type="button" className="pms-btn pms-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', gap: 4 }} onClick={handleAddQuestion}>
                  <Plus size={13} />
                  <span>Add Question</span>
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="settings-inline-placeholder" style={{ padding: 16 }}>
                  No questions added yet. Click &ldquo;Add Question&rdquo; to build this template.
                </div>
              ) : (
                <div className="form-section-gap">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="question-builder-item" style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                      <div className="question-builder-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="question-builder-index" style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Question {idx + 1} of {questions.length}
                          </span>
                          <span
                            className={`pms-badge ${q.required ? 'badge-warning' : 'badge-neutral'}`}
                            style={{ fontSize: '0.65rem', padding: '1px 6px' }}
                          >
                            {q.required ? 'Required *' : 'Optional'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="more-trigger-btn"
                            style={{ width: 24, height: 24 }}
                            disabled={idx === 0}
                            onClick={() => handleMoveQuestion(q.id, 'up')}
                            title="Move up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="more-trigger-btn"
                            style={{ width: 24, height: 24 }}
                            disabled={idx === questions.length - 1}
                            onClick={() => handleMoveQuestion(q.id, 'down')}
                            title="Move down"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button type="button" className="question-builder-remove" style={{ color: 'var(--text-secondary)', padding: '2px 6px', fontSize: '0.72rem' }} onClick={() => handleDuplicateQuestion(q.id)}>
                            <Copy size={12} />
                            <span>Duplicate</span>
                          </button>
                          <button type="button" className="question-builder-remove" style={{ color: '#DC2626', padding: '2px 6px', fontSize: '0.72rem' }} onClick={() => handleRemoveQuestion(q.id)}>
                            <X size={12} />
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

                      <div className="form-grid-2" style={{ marginTop: 8 }}>
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

                      <div className="toggle-setting-row" style={{ marginTop: 10, padding: '8px 12px', background: '#FFFFFF' }}>
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                            {q.required ? 'Response Required *' : 'Optional Question'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {q.required
                              ? 'Answering this question is mandatory before submitting review.'
                              : 'Users can submit reviews without answering this question.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`toggle-switch-btn ${q.required ? 'is-active' : ''}`}
                          onClick={() => handleUpdateQuestion(q.id, 'required', !q.required)}
                          aria-label="Toggle Question Required"
                        >
                          <div className="toggle-switch-knob" />
                        </button>
                      </div>

                      {q.type === 'Rating' && (
                        <div className="form-field-group" style={{ marginTop: 8 }}>
                          <span className="form-field-label">Rating Scale: 1–5 — Customize Labels</span>
                          <div className="form-section-gap" style={{ marginTop: 4 }}>
                            {(q.ratingLabels || RATING_LABELS).map((label, labelIdx) => (
                              <div key={labelIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="level-editor-num" style={{ width: 22, height: 22, fontSize: '0.7rem' }}>{labelIdx + 1}</span>
                                <input
                                  type="text"
                                  className="form-input-text"
                                  style={{ padding: '3px 6px', fontSize: '0.78rem' }}
                                  value={label}
                                  onChange={(e) => handleUpdateRatingLabel(q.id, labelIdx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {q.type === 'Single Select' && (
                        <div className="form-field-group" style={{ marginTop: 8 }}>
                          <span className="form-field-label">Options</span>
                          <div className="form-section-gap" style={{ marginTop: 4 }}>
                            {(q.options || []).map((opt, optIdx) => (
                              <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="text"
                                  className="form-input-text"
                                  style={{ padding: '3px 6px', fontSize: '0.78rem' }}
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
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="pms-btn pms-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.7rem', gap: 4, alignSelf: 'flex-start' }}
                              onClick={() => handleAddOption(q.id)}
                            >
                              <Plus size={11} />
                              <span>Add Option</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ gap: 6 }} onClick={handleSaveTemplate}>
                <Check size={14} />
                <span>{editingId ? 'Save Changes' : 'Create Template'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
