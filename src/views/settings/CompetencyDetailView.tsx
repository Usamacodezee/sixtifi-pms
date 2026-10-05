import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MultiSelectField } from './MultiSelectField';
import {
  SettingsCompetency,
  TargetingScope,
  CompetencyLevel,
  COMPETENCY_CATEGORIES,
  JOB_LEVEL_OPTIONS,
  buildDefaultLevels
} from '../../data/mockSettings';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '../../data/mockEmployees';
import { ToastType } from '../../components/ui/Toast';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import '../cycles/CreateCycleWizard.css';
import './SettingsStyles.css';

export interface CompetencyDetailViewProps {
  competencyId: string; // 'new' for create mode, otherwise an existing competency id
  competencies: SettingsCompetency[];
  onCreateCompetency: (competency: SettingsCompetency) => void;
  onUpdateCompetency: (competency: SettingsCompetency) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const APPLICABLE_TO_OPTIONS: TargetingScope[] = [
  'All Employees',
  'Specific Department'
];

export const CompetencyDetailView: React.FC<CompetencyDetailViewProps> = ({
  competencyId,
  competencies,
  onCreateCompetency,
  onUpdateCompetency,
  onNavigate,
  onShowToast
}) => {
  const isEdit = competencyId !== 'new';
  const existing = isEdit ? competencies.find((c) => c.id === competencyId) : undefined;

  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState(existing?.category || COMPETENCY_CATEGORIES[0]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>(existing?.status || 'Active');
  const [levels, setLevels] = useState<CompetencyLevel[]>(existing?.levels || buildDefaultLevels());
  const initialDepts = existing?.applicability.departments || [];
  const [selectedDepts, setSelectedDepts] = useState<string[]>(initialDepts.length > 0 ? initialDepts : ['All']);
  const [nameError, setNameError] = useState('');

  const updateLevel = (level: number, field: 'label' | 'description', value: string) => {
    setLevels((prev) => prev.map((l) => (l.level === level ? { ...l, [field]: value } : l)));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Competency Name is required.');
      return;
    }
    setNameError('');

    const isAll = selectedDepts.includes('All');

    const payload: SettingsCompetency = {
      id: existing?.id || `cfg-comp-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      usedInRoles: existing?.usedInRoles ?? 0,
      levels,
      applicability: {
        scopes: isAll ? ['All Employees'] : ['Specific Department'],
        departments: isAll ? ['All'] : selectedDepts,
        designations: [],
        jobLevels: []
      }
    };

    if (isEdit) {
      onUpdateCompetency(payload);
      onShowToast?.('success', 'Competency updated.', `"${payload.name}" was updated.`);
    } else {
      onCreateCompetency(payload);
      onShowToast?.('success', 'Competency saved.', `"${payload.name}" was added to the competency library.`);
    }
    onNavigate('/performance/settings/competencies');
  };

  const departmentOptions = MOCK_DEPARTMENTS.map((d) => ({ value: d.name, label: d.name }));
  const designationOptions = [
    { value: 'Manager', label: 'Manager' },
    ...MOCK_DESIGNATIONS.map((d) => ({ value: d.name, label: d.name }))
  ];
  const jobLevelOptions = JOB_LEVEL_OPTIONS.map((jl) => ({ value: jl, label: jl }));

  return (
    <div className="settings-page animate-fade-in">
      <PageHeader
        title={isEdit ? 'Edit Competency' : 'Add Competency'}
        subtitle="Define a competency, its proficiency levels, and where it applies."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Settings', href: '#/performance/settings' },
          { label: 'Competencies', href: '#/performance/settings/competencies' },
          { label: isEdit ? 'Edit Competency' : 'Add Competency' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/settings/competencies')}
          >
            <ArrowLeft size={14} />
            <span>Back to Competencies</span>
          </button>
        }
      />

      <div className="wizard-content-card">
        <div className="form-section-header">
          <h2 className="form-section-title">Competency Details</h2>
          <p className="form-section-subtitle">This competency becomes available in question templates, mapping, and reviews.</p>
        </div>

        <div className="form-grid-2">
          <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
            <span className="form-field-label">
              Competency Name <span className="required-asterisk">*</span>
            </span>
            <input
              type="text"
              className={`form-input-text ${nameError ? 'has-error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leadership"
            />
            {nameError && (
              <div className="form-field-error">
                <AlertCircle size={12} />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
            <span className="form-field-label">
              Description <span className="required-asterisk">*</span>
            </span>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this competency measure?"
            />
          </div>

          <div className="form-field-group">
            <span className="form-field-label">
              Category <span className="required-asterisk">*</span>
            </span>
            <select className="form-input-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {COMPETENCY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-field-group">
            <span className="form-field-label">Status</span>
            <select className="form-input-select" value={status} onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Competency Levels */}
        <div className="form-section-header">
          <h2 className="form-section-title">Competency Levels</h2>
          <p className="form-section-subtitle">
            Define what each proficiency level means. This is a capability benchmark, kept separate from the final
            performance rating used in reviews.
          </p>
        </div>

        <div className="form-section-gap">
          {levels.map((l) => (
            <div key={l.level} className="level-editor-row">
              <div className="level-editor-badge">
                <div className="level-editor-num">{l.level}</div>
                <span className="level-editor-label" style={{ textAlign: 'center', width: '100%', fontWeight: 600, fontSize: '0.8rem' }}>
                  {l.label}
                </span>
              </div>
              <textarea
                className="form-textarea"
                rows={2}
                style={{ flex: 1 }}
                value={l.description}
                onChange={(e) => updateLevel(l.level, 'description', e.target.value)}
                placeholder={`Describe what Level ${l.level} (${l.label}) looks like...`}
              />
            </div>
          ))}
        </div>

        <div className="settings-section-footer">
          <button
            type="button"
            className="pms-btn pms-btn-secondary"
            style={{ padding: '8px 16px' }}
            onClick={() => onNavigate('/performance/settings/competencies')}
          >
            Cancel
          </button>
          <button type="button" className="pms-btn pms-btn-primary" style={{ padding: '8px 18px', gap: 6 }} onClick={handleSave}>
            <Check size={14} />
            <span>{isEdit ? 'Save Changes' : 'Save Competency'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
