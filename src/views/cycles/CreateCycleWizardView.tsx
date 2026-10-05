import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  CreateCycleFormData,
  EmployeeSelectionMode,
  PerformanceCycle,
  ReviewFlowOption
} from '../../types/performance';
import {
  MOCK_DEPARTMENTS,
  MOCK_DESIGNATIONS,
  MOCK_EMPLOYEES_LIST
} from '../../data/mockEmployees';
import {
  REVIEW_FLOW_OPTIONS,
  getReviewFlowMeta,
  reviewFlowIncludesSelf,
  reviewFlowIncludesAdmin,
  DEFAULT_FINAL_RATING_MAPPING,
  FinalRatingMappingRow
} from '../../data/mockSettings';

const getBadgeStyle = (label?: string) => {
  if (!label) return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1' };
  const l = label.toLowerCase();
  if (l.includes('outstanding') || l.includes('exceptional') || l.includes('exceeds')) {
    return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
  }
  if (l.includes('meets') || l.includes('proficient') || l.includes('good')) {
    return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' };
  }
  if (l.includes('needs') || l.includes('developing') || l.includes('improvement')) {
    return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
  }
  return { bg: '#FEE2E2', color: '#DC2626', border: '#FCA5A5' };
};
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  Building,
  Briefcase,
  UserCheck,
  Target,
  Award,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Sparkles,
  Search
} from 'lucide-react';
import './CreateCycleWizard.css';
import '../settings/SettingsStyles.css';

export interface CreateCycleWizardViewProps {
  onNavigate: (route: string) => void;
  onCreateCycle?: (newCycle: PerformanceCycle) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

const calculateCycleEndDate = (startDateStr: string, cycleType: string): string => {
  if (!startDateStr || cycleType === 'Custom') return '';
  const parts = startDateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return '';
  const [year, month, day] = parts;
  const startDate = new Date(year, month - 1, day);
  if (isNaN(startDate.getTime())) return '';

  const targetDate = new Date(startDate);
  if (cycleType === 'Annual') {
    targetDate.setFullYear(startDate.getFullYear() + 1);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (cycleType === 'Half-Yearly') {
    targetDate.setMonth(startDate.getMonth() + 6);
    targetDate.setDate(targetDate.getDate() - 1);
  } else if (cycleType === 'Quarterly') {
    targetDate.setMonth(startDate.getMonth() + 3);
    targetDate.setDate(targetDate.getDate() - 1);
  } else {
    return '';
  }

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const CreateCycleWizardView: React.FC<CreateCycleWizardViewProps> = ({
  onNavigate,
  onCreateCycle,
  onShowToast
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State (preserved across steps)
  const [formData, setFormData] = useState<CreateCycleFormData>({
    name: 'FY 2026–27 Mid-Year Performance Review',
    type: 'Half-Yearly',
    startDate: '2026-10-01',
    endDate: '2027-03-31',
    description: 'Mid-year Appraisal Cycle for evaluation of H2 deliverables and team competencies.',
    selectionMode: 'all',
    selectedDepartments: ['engineering', 'sales'],
    selectedDesignations: ['swe', 'sr_swe'],
    selectedEmployeeIds: ['emp-1', 'emp-2', 'emp-3'],
    goalsWeightage: 70,
    competenciesWeightage: 30,
    minGoalsPerEmployee: 3,
    maxGoalsPerEmployee: 8,
    reviewFlow: 'self_manager_admin',
    requireGoalApproval: true,
    allowEmployeeGoalUpdates: true,
    sendProgressReminders: true,
    showFinalRatingToEmployee: true,
    showFinalScoreToEmployee: true,
    showManagerCommentsToEmployee: true,
    showCompetencyScoresToEmployee: true,
    selfReviewDeadlineDays: 7,
    selfReviewDeadline: '7 days after Goal Due Date',
    managerReviewDeadline: 'Checks Goal Due Date',
    finalReviewDeadline: 'Checks Goal Due Date',
    ratingMapping: DEFAULT_FINAL_RATING_MAPPING
  });

  const reviewFlow = formData.reviewFlow;
  const flowMeta = getReviewFlowMeta(reviewFlow);

  // Specific employee search filter
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Basic Details' },
    { number: 2, title: 'Select Employees' },
    { number: 3, title: 'Performance Setup' },
    { number: 4, title: 'Review & Create' }
  ];

  // Helper to calculate selected employees count
  const getSelectedEmployeesCount = (): number => {
    switch (formData.selectionMode) {
      case 'all':
        return 248;
      case 'department':
        return formData.selectedDepartments.reduce((acc, deptId) => {
          const found = MOCK_DEPARTMENTS.find((d) => d.id === deptId);
          return acc + (found ? found.count : 0);
        }, 0);
      case 'designation':
        return formData.selectedDesignations.reduce((acc, desId) => {
          const found = MOCK_DESIGNATIONS.find((d) => d.id === desId);
          return acc + (found ? found.count : 0);
        }, 0);
      case 'specific':
        return formData.selectedEmployeeIds.length;
      default:
        return 248;
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Cycle name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.selectionMode === 'department' && formData.selectedDepartments.length === 0) {
      newErrors.employees = 'Please select at least one department';
    } else if (formData.selectionMode === 'designation' && formData.selectedDesignations.length === 0) {
      newErrors.employees = 'Please select at least one designation';
    } else if (formData.selectionMode === 'specific' && formData.selectedEmployeeIds.length === 0) {
      newErrors.employees = 'Please select at least one employee';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 3 Validation
  const totalWeightage = Number(formData.goalsWeightage) + Number(formData.competenciesWeightage);
  const isWeightageValid = totalWeightage === 100;

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!isWeightageValid) {
      newErrors.weightage = 'Total weightage must equal exactly 100%';
    }
    if (reviewFlowIncludesSelf(reviewFlow) && (formData.selfReviewDeadlineDays === undefined || formData.selfReviewDeadlineDays < 0)) {
      newErrors.selfReviewDeadlineDays = 'Please enter a valid number of days (0 or more)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = (isSaveAsDraft: boolean = false) => {
    const count = getSelectedEmployeesCount();

    // Format readable dates
    const startFormatted = new Date(formData.startDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const endFormatted = new Date(formData.endDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const newCycle: PerformanceCycle = {
      id: `cycle-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      startDate: startFormatted,
      endDate: endFormatted,
      duration: `${startFormatted} – ${endFormatted}`,
      employeesCount: count,
      reviewProgress: 0,
      status: 'Draft',
      description: formData.description,
      reviewFlow,
      goalsWeightage: formData.goalsWeightage,
      competenciesWeightage: formData.competenciesWeightage,
      minGoalsPerEmployee: formData.minGoalsPerEmployee,
      maxGoalsPerEmployee: formData.maxGoalsPerEmployee,
      requireGoalApproval: formData.requireGoalApproval,
      allowEmployeeGoalUpdates: formData.allowEmployeeGoalUpdates,
      sendProgressReminders: formData.sendProgressReminders,
      showFinalRatingToEmployee: formData.showFinalRatingToEmployee,
      showFinalScoreToEmployee: formData.showFinalScoreToEmployee,
      showManagerCommentsToEmployee: formData.showManagerCommentsToEmployee,
      showCompetencyScoresToEmployee: formData.showCompetencyScoresToEmployee,
      selfReviewDeadline: formData.selfReviewDeadline,
      managerReviewDeadline: formData.managerReviewDeadline,
      finalReviewDeadline: formData.finalReviewDeadline,
      ratingMapping: formData.ratingMapping
    };

    onCreateCycle?.(newCycle);

    if (isSaveAsDraft) {
      onShowToast?.(
        'success',
        'Draft Saved',
        `Appraisal Cycle "${formData.name}" saved as draft.`
      );
    } else {
      onShowToast?.(
        'success',
        'Appraisal Cycle Created',
        `Appraisal Cycle "${formData.name}" created successfully.`
      );
    }

    onNavigate('/performance/cycles');
  };

  // Helper toggle functions for Step 2
  const toggleDepartment = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDepartments: prev.selectedDepartments.includes(deptId)
        ? prev.selectedDepartments.filter((id) => id !== deptId)
        : [...prev.selectedDepartments, deptId]
    }));
  };

  const toggleDesignation = (desId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDesignations: prev.selectedDesignations.includes(desId)
        ? prev.selectedDesignations.filter((id) => id !== desId)
        : [...prev.selectedDesignations, desId]
    }));
  };

  const toggleEmployee = (empId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployeeIds: prev.selectedEmployeeIds.includes(empId)
        ? prev.selectedEmployeeIds.filter((id) => id !== empId)
        : [...prev.selectedEmployeeIds, empId]
    }));
  };

  const filteredEmployees = MOCK_EMPLOYEES_LIST.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.designation.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="create-cycle-page animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title="Create Appraisal Cycle"
        subtitle="Set up a Appraisal Cycle and define how employee performance will be reviewed."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: 'Create' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/cycles')}
          >
            <ArrowLeft size={14} />
            <span>Back to Cycles</span>
          </button>
        }
      />

      {/* 4-Step Stepper Header */}
      <div className="wizard-stepper-card">
        <nav className="stepper-nav" aria-label="Creation Progress">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            const isClickable = step.number < currentStep;

            return (
              <React.Fragment key={step.number}>
                <div
                  className={`step-item ${isCurrent ? 'is-current' : ''} ${
                    isCompleted ? 'is-completed' : ''
                  } ${!isClickable && !isCurrent ? 'is-disabled' : ''}`}
                  onClick={() => {
                    if (isClickable) setCurrentStep(step.number);
                  }}
                  role="button"
                  tabIndex={isClickable ? 0 : -1}
                >
                  <div className="step-number-circle">
                    {isCompleted ? <Check size={16} /> : step.number}
                  </div>
                  <div className="step-label-group">
                    <span className="step-index-label">STEP 0{step.number}</span>
                    <span className="step-title">{step.title}</span>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`step-connector-line ${
                      currentStep > step.number ? 'is-active' : ''
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Wizard Content Card */}
      <div className="wizard-content-card">
        {/* ========================================================
            STEP 1: BASIC DETAILS
            ======================================================== */}
        {currentStep === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-section-header">
              <h2 className="form-section-title">Cycle Details</h2>
              <p className="form-section-subtitle">
                Enter name, cadence, and timeline bounds for the appraisal period.
              </p>
            </div>

            {/* Cycle Name */}
            <div className="form-field-group">
              <label className="form-field-label">
                Cycle Name <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                className={`form-input-text ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. FY 2026–27 Annual Performance Review"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span className="form-field-error">{errors.name}</span>}
              <span className="form-field-helper">A distinct, recognizable title for employees and reviewers.</span>
            </div>

            {/* Cycle Type & Dates Grid */}
            <div className="form-grid-2">
              {/* Cycle Type */}
              <div className="form-field-group">
                <label className="form-field-label">
                  Cycle Type <span className="required-asterisk">*</span>
                </label>
                <select
                  className="form-input-select"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    if (newType !== 'Custom') {
                      const computedEnd = calculateCycleEndDate(formData.startDate, newType);
                      setFormData({
                        ...formData,
                        type: newType,
                        endDate: computedEnd || formData.endDate
                      });
                    } else {
                      setFormData({ ...formData, type: newType });
                    }
                  }}
                >
                  <option value="Annual">Annual</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Custom">Custom</option>
                </select>
                <span className="form-field-helper">Determines the evaluation cadence.</span>
              </div>

              {/* Status Indicator (Fixed Draft) */}
              <div className="form-field-group">
                <label className="form-field-label">Initial Status</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                  <span className="pms-badge badge-warning" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    Draft (Auto-assigned)
                  </span>
                </div>
                <span className="form-field-helper">The cycle remains in Draft until explicitly activated.</span>
              </div>
            </div>

            {/* Start & End Dates */}
            <div className="form-grid-2">
              <div className="form-field-group">
                <label className="form-field-label">
                  Start Date <span className="required-asterisk">*</span>
                </label>
                <input
                  type="date"
                  className={`form-input-text ${errors.startDate ? 'has-error' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    if (formData.type !== 'Custom') {
                      const computedEnd = calculateCycleEndDate(newStart, formData.type);
                      setFormData({
                        ...formData,
                        startDate: newStart,
                        endDate: computedEnd || formData.endDate
                      });
                    } else {
                      setFormData({ ...formData, startDate: newStart });
                    }
                  }}
                />
                {errors.startDate && <span className="form-field-error">{errors.startDate}</span>}
              </div>

              <div className="form-field-group">
                <label className="form-field-label">
                  End Date <span className="required-asterisk">*</span>
                </label>
                <input
                  type="date"
                  className={`form-input-text ${errors.endDate ? 'has-error' : ''}`}
                  value={formData.endDate}
                  disabled={formData.type !== 'Custom'}
                  style={
                    formData.type !== 'Custom'
                      ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed', color: 'var(--text-secondary)' }
                      : undefined
                  }
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                {errors.endDate && <span className="form-field-error">{errors.endDate}</span>}
                <span className="form-field-helper">
                  {formData.type === 'Custom'
                    ? 'Select custom cycle end date.'
                    : `Calculated automatically based on ${formData.type} cycle type.`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="form-field-group">
              <label className="form-field-label">Cycle Description (Optional)</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Annual performance review cycle for the financial year 2026–27."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <span className="form-field-helper">Context or instructions visible in review communications.</span>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: SELECT EMPLOYEES
            ======================================================== */}
        {currentStep === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-section-header">
              <h2 className="form-section-title">Select Employees</h2>
              <p className="form-section-subtitle">
                Choose who will participate in this Appraisal Cycle.
              </p>
            </div>

            {/* Selection Mode Cards */}
            <div className="selection-modes-grid">
              <div
                className={`selection-mode-card ${formData.selectionMode === 'all' ? 'is-selected' : ''}`}
                onClick={() => setFormData({ ...formData, selectionMode: 'all' })}
              >
                <div className="mode-radio-circle">
                  {formData.selectionMode === 'all' && <div className="mode-radio-dot" />}
                </div>
                <div className="mode-content">
                  <span className="mode-title">All Active Employees</span>
                  <span className="mode-desc">Include entire workforce (248)</span>
                </div>
              </div>

              <div
                className={`selection-mode-card ${formData.selectionMode === 'department' ? 'is-selected' : ''}`}
                onClick={() => setFormData({ ...formData, selectionMode: 'department' })}
              >
                <div className="mode-radio-circle">
                  {formData.selectionMode === 'department' && <div className="mode-radio-dot" />}
                </div>
                <div className="mode-content">
                  <span className="mode-title">By Department</span>
                  <span className="mode-desc">Filter by specific business units</span>
                </div>
              </div>

              <div
                className={`selection-mode-card ${formData.selectionMode === 'designation' ? 'is-selected' : ''}`}
                onClick={() => setFormData({ ...formData, selectionMode: 'designation' })}
              >
                <div className="mode-radio-circle">
                  {formData.selectionMode === 'designation' && <div className="mode-radio-dot" />}
                </div>
                <div className="mode-content">
                  <span className="mode-title">By Designation</span>
                  <span className="mode-desc">Filter by role job titles</span>
                </div>
              </div>

              <div
                className={`selection-mode-card ${formData.selectionMode === 'specific' ? 'is-selected' : ''}`}
                onClick={() => setFormData({ ...formData, selectionMode: 'specific' })}
              >
                <div className="mode-radio-circle">
                  {formData.selectionMode === 'specific' && <div className="mode-radio-dot" />}
                </div>
                <div className="mode-content">
                  <span className="mode-title">Select Specific</span>
                  <span className="mode-desc">Hand-pick individual employees</span>
                </div>
              </div>
            </div>

            {/* Error Message if none selected */}
            {errors.employees && (
              <div className="form-field-error" style={{ padding: '6px 10px', backgroundColor: '#FEF2F2', borderRadius: 6 }}>
                {errors.employees}
              </div>
            )}

            {/* Mode 1: All Active Employees */}
            {formData.selectionMode === 'all' && (
              <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
                  <Users size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0369A1' }}>
                    248 active employees will be included
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#075985' }}>
                    Covers all active staff across 8 departments for full organizational calibration.
                  </span>
                </div>
              </div>
            )}

            {/* Mode 2: By Department */}
            {formData.selectionMode === 'department' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Select Departments:
                  </span>
                  <span className="pms-badge badge-info">
                    Selected: {getSelectedEmployeesCount()} employees
                  </span>
                </div>
                <div className="multiselect-pill-grid">
                  {MOCK_DEPARTMENTS.map((dept) => {
                    const isSelected = formData.selectedDepartments.includes(dept.id);
                    return (
                      <div
                        key={dept.id}
                        className={`multiselect-item-pill ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => toggleDepartment(dept.id)}
                      >
                        <div className="pill-left">
                          <Building size={14} color={isSelected ? '#0284C7' : '#64748B'} />
                          <span>{dept.name}</span>
                        </div>
                        <span className="pill-count-badge">{dept.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 3: By Designation */}
            {formData.selectionMode === 'designation' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Select Job Designations:
                  </span>
                  <span className="pms-badge badge-info">
                    Selected: {getSelectedEmployeesCount()} employees
                  </span>
                </div>
                <div className="multiselect-pill-grid">
                  {MOCK_DESIGNATIONS.map((des) => {
                    const isSelected = formData.selectedDesignations.includes(des.id);
                    return (
                      <div
                        key={des.id}
                        className={`multiselect-item-pill ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => toggleDesignation(des.id)}
                      >
                        <div className="pill-left">
                          <Briefcase size={14} color={isSelected ? '#0284C7' : '#64748B'} />
                          <span>{des.name}</span>
                        </div>
                        <span className="pill-count-badge">{des.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode 4: Select Specific Employees */}
            {formData.selectionMode === 'specific' && (
              <div className="employee-select-table-box">
                <div className="employee-table-toolbar">
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 8, top: 10, color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input-text"
                      style={{ paddingLeft: '28px', height: '32px' }}
                      placeholder="Search employees..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />
                  </div>
                  <span className="pms-badge badge-info">
                    Selected: {formData.selectedEmployeeIds.length} of {MOCK_EMPLOYEES_LIST.length}
                  </span>
                </div>

                <div className="employee-table-scroll">
                  <table className="pms-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input
                            type="checkbox"
                            checked={
                              formData.selectedEmployeeIds.length === MOCK_EMPLOYEES_LIST.length &&
                              MOCK_EMPLOYEES_LIST.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedEmployeeIds: MOCK_EMPLOYEES_LIST.map((emp) => emp.id)
                                });
                              } else {
                                setFormData({ ...formData, selectedEmployeeIds: [] });
                              }
                            }}
                          />
                        </th>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Designation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        const isChecked = formData.selectedEmployeeIds.includes(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            style={{ cursor: 'pointer', backgroundColor: isChecked ? '#F0F9FF' : undefined }}
                            onClick={() => toggleEmployee(emp.id)}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleEmployee(emp.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td>
                              <div className="employee-cell">
                                <div className="employee-avatar-sm" style={{ backgroundColor: emp.avatarBg }}>
                                  {emp.initials}
                                </div>
                                <span className="employee-name-bold">{emp.name}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--text-muted)' }}>
                                {emp.employeeId}
                              </span>
                            </td>
                            <td>{emp.department}</td>
                            <td>{emp.designation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STEP 3: PERFORMANCE SETUP
            ======================================================== */}
        {currentStep === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-section-header">
              <h2 className="form-section-title">Performance Setup</h2>
              <p className="form-section-subtitle">
                Define how performance will be evaluated in this cycle.
              </p>
            </div>

            {/* A. Performance Components */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">A. Performance Components</span>
              <div className="component-card-grid">
                <div className="component-card">
                  <div className="component-icon-box">
                    <Target size={18} />
                  </div>
                  <div className="component-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="component-title">1. Goals / KPI</span>
                      <span className="pms-badge badge-success" style={{ fontSize: '0.65rem' }}>Enabled</span>
                    </div>
                    <span className="component-desc">Key performance indicators, targets, and deliverable milestones.</span>
                  </div>
                </div>

                <div className="component-card">
                  <div className="component-icon-box" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED' }}>
                    <Award size={18} />
                  </div>
                  <div className="component-details">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="component-title">2. Competencies</span>
                      <span className="pms-badge badge-success" style={{ fontSize: '0.65rem' }}>Enabled</span>
                    </div>
                    <span className="component-desc">Behavioral attributes, communication, values, and leadership traits.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* B. Performance Weightage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">B. Performance Weightage</span>
              <div className="weightage-config-box">
                <div className="weightage-row">
                  <div className="weightage-label-group">
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Goals / KPI Weightage
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Weight given to numerical target achievement.
                    </span>
                  </div>
                  <div className="weightage-input-group">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      className="weightage-input"
                      value={formData.goalsWeightage}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value)));
                        setFormData({
                          ...formData,
                          goalsWeightage: val,
                          competenciesWeightage: 100 - val
                        });
                      }}
                    />
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>%</span>
                  </div>
                </div>

                <div className="weightage-row">
                  <div className="weightage-label-group">
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Competencies Weightage
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Weight given to behavioral skill evaluations.
                    </span>
                  </div>
                  <div className="weightage-input-group">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      className="weightage-input"
                      value={formData.competenciesWeightage}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(100, Number(e.target.value)));
                        setFormData({
                          ...formData,
                          competenciesWeightage: val,
                          goalsWeightage: 100 - val
                        });
                      }}
                    />
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>%</span>
                  </div>
                </div>

                <div className="weightage-total-bar">
                  <div className="weightage-total-text-row">
                    <span style={{ color: isWeightageValid ? '#047857' : '#EF4444' }}>
                      {isWeightageValid ? '✓ Total Weightage Balance' : '⚠ Invalid Total Weightage'}
                    </span>
                    <span style={{ color: isWeightageValid ? '#047857' : '#EF4444' }}>
                      {totalWeightage}% / 100%
                    </span>
                  </div>
                  <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                    <div
                      className={`sixtifi-progress-bar-fill ${isWeightageValid ? 'complete' : 'danger'}`}
                      style={{ width: `${Math.min(100, totalWeightage)}%` }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    These weightages will be used to calculate the overall performance score.
                  </span>
                </div>
              </div>
            </div>

            {/* C. Review Flow */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">C. Review Flow</span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Choose which stages this cycle will run. Admin Review is HR/Admin finalization.
              </p>
              <div className="review-flow-options">
                {REVIEW_FLOW_OPTIONS.map((opt) => {
                  const selected = formData.reviewFlow === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`review-flow-option ${selected ? 'is-selected' : ''}`}
                      onClick={() =>
                        setFormData({ ...formData, reviewFlow: opt.id as ReviewFlowOption })
                      }
                    >
                      <span className="review-flow-option-radio" aria-hidden />
                      <span className="review-flow-option-body">
                        <span className="review-flow-option-title">{opt.label}</span>
                        <span className="review-flow-option-path">{opt.shortLabel}</span>
                        <span className="review-flow-option-desc">{opt.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Goal & employee policies */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">D. Goal &amp; employee policies</span>

              <div className="settings-toggle-stack">
                <div className="toggle-setting-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Require manager approval for employee goals
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Employees can only initiate appraisal after manager signs off on their goals.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${formData.requireGoalApproval ? 'is-active' : ''}`}
                    onClick={() =>
                      setFormData({ ...formData, requireGoalApproval: !formData.requireGoalApproval })
                    }
                    aria-label="Toggle Manager Goal Approval"
                  >
                    <div className="toggle-switch-knob" />
                  </button>
                </div>

                <div className="toggle-setting-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Allow employee goal progress updates
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Employees can log their own progress updates against assigned goals.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${formData.allowEmployeeGoalUpdates ? 'is-active' : ''}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        allowEmployeeGoalUpdates: !formData.allowEmployeeGoalUpdates
                      })
                    }
                    aria-label="Toggle employee goal progress updates"
                  >
                    <div className="toggle-switch-knob" />
                  </button>
                </div>

                <div className="toggle-setting-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Show final rating & score to employee
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Employees can see their overall rating once the review is finalized for this cycle.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch-btn ${formData.showFinalRatingToEmployee ? 'is-active' : ''}`}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        showFinalRatingToEmployee: !formData.showFinalRatingToEmployee
                      })
                    }
                    aria-label="Toggle show final rating to employee"
                  >
                    <div className="toggle-switch-knob" />
                  </button>
                </div>

<div className="toggle-setting-row">
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
      Show manager comments to employee
    </span>
    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
      Employees can see manager comments once the review is finalized for this cycle.
    </span>
  </div>
  <button
    type="button"
    className={`toggle-switch-btn ${formData.showManagerCommentsToEmployee ? 'is-active' : ''}`}
    onClick={() =>
      setFormData({
        ...formData,
        showManagerCommentsToEmployee: !formData.showManagerCommentsToEmployee
      })
    }
    aria-label="Toggle show manager comments to employee"
  >
    <div className="toggle-switch-knob" />
  </button>
</div>
              </div>
            </div>

            {/* E. Review Deadlines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">E. Review Deadlines</span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                First review deadline is defined in days relative to the Goal due date. Manager and Admin reviews do not have separate deadline dates and check the Goal Due Date directly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                {reviewFlowIncludesSelf(reviewFlow) && (
                  <div className="form-field-group" style={{ backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <label className="form-field-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      First Review (Self Review) Deadline <span className="required-asterisk">*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <input
                        type="number"
                        min={0}
                        max={90}
                        className={`form-input-text ${errors.selfReviewDeadlineDays ? 'has-error' : ''}`}
                        style={{ width: '120px' }}
                        value={formData.selfReviewDeadlineDays ?? 7}
                        onChange={(e) => {
                          const days = Math.max(0, parseInt(e.target.value) || 0);
                          setFormData({
                            ...formData,
                            selfReviewDeadlineDays: days,
                            selfReviewDeadline: `${days} days after Goal Due Date`
                          });
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        days after Goal Due Date
                      </span>
                    </div>
                    {errors.selfReviewDeadlineDays && (
                      <span className="form-field-error">{errors.selfReviewDeadlineDays}</span>
                    )}
                    <span className="form-field-helper" style={{ marginTop: 6 }}>
                      e.g., Employee self-review is due <strong>{formData.selfReviewDeadlineDays ?? 7} days</strong> after goal due date.
                    </span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  <div style={{ padding: '12px 14px', backgroundColor: '#F0F9FF', borderRadius: 8, border: '1px solid #BAE6FD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: '#0369A1', marginBottom: 4 }}>
                      <CheckCircle2 size={14} />
                      <span>Manager Review</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#0C4A6E', lineHeight: 1.5 }}>
                      No fixed deadline date — evaluates against employee Goal Due Date.
                    </p>
                  </div>

                  {reviewFlowIncludesAdmin(reviewFlow) && (
                    <div style={{ padding: '12px 14px', backgroundColor: '#F5F3FF', borderRadius: 8, border: '1px solid #DDD6FE' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: '#6D28D9', marginBottom: 4 }}>
                        <CheckCircle2 size={14} />
                        <span>Admin / Final Review</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#4C1D95', lineHeight: 1.5 }}>
                        No fixed deadline date — evaluates against employee Goal Due Date.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* F. Review & Rating Scale Mapping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <span className="form-field-label">F. Rating Scale &amp; Score Mapping</span>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Configure rating band score ranges for this cycle. Ranges auto-align continuously from 1.0 to 5.0 without any skipped scores or gaps.
              </p>

              <div className="form-section-gap" style={{ marginTop: 4 }}>
                {[...(formData.ratingMapping || DEFAULT_FINAL_RATING_MAPPING)]
                  .sort((a, b) => b.minScore - a.minScore)
                  .map((row, idx, arr) => {
                    const badge = getBadgeStyle(row.label);
                    const isBottom = idx === arr.length - 1;

                    return (
                      <div
                        key={row.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                          padding: '12px 16px',
                          background: '#FFFFFF',
                          borderRadius: 8,
                          border: `1px solid ${badge.border}`,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '4px 12px',
                              borderRadius: 999,
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`
                            }}
                          >
                            {row.label}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                            {row.description}
                          </span>
                        </div>

                        {/* Score Range Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Range:</span>

                          {!isBottom ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="number"
                                step={0.1}
                                min={1.1}
                                max={4.9}
                                className="form-input-text"
                                style={{ width: 68, textAlign: 'center', fontWeight: 700, padding: '4px 6px' }}
                                value={row.minScore}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  if (Number.isNaN(val)) return;

                                  setFormData((prev) => {
                                    const currentMapping = prev.ratingMapping || DEFAULT_FINAL_RATING_MAPPING;
                                    const sorted = [...currentMapping].sort((a, b) => b.minScore - a.minScore);
                                    const i = sorted.findIndex((r) => r.id === row.id);
                                    if (i === -1) return prev;

                                    const upperMin = i === 0 ? 5.0 : sorted[i - 1].minScore;
                                    const lowerMin = i === sorted.length - 1 ? 1.0 : sorted[i + 1].minScore;

                                    const maxAllowed = Number((upperMin - 0.1).toFixed(1));
                                    const minAllowed = Number((lowerMin + 0.1).toFixed(1));
                                    const clamped = Math.min(maxAllowed, Math.max(minAllowed, val));

                                    sorted[i].minScore = Number(clamped.toFixed(1));

                                    // Auto-align maxScores seamlessly
                                    const recomputed = sorted.map((r, index) => {
                                      const max = index === 0 ? 5.0 : Number((sorted[index - 1].minScore - 0.1).toFixed(1));
                                      return { ...r, maxScore: max };
                                    });

                                    return { ...prev, ratingMapping: recomputed };
                                  });
                                }}
                              />
                              <span style={{ color: 'var(--text-muted)' }}>–</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'center' }}>
                                {row.maxScore.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 30, textAlign: 'center' }}>
                                1.0
                              </span>
                              <span style={{ color: 'var(--text-muted)' }}>–</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'center' }}>
                                {row.maxScore.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: REVIEW & CREATE
            ======================================================== */}
        {currentStep === 4 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="form-section-header">
              <h2 className="form-section-title">Review Appraisal Cycle</h2>
              <p className="form-section-subtitle">
                Review the setup before creating the Appraisal Cycle.
              </p>
            </div>

            <div className="review-summary-stack">
              {/* Block 1: Cycle Details */}
              <div className="summary-block-card">
                <span className="summary-block-title">Cycle Details</span>
                <div className="summary-kv-grid">
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Cycle Name</span>
                    <span className="summary-v-val">{formData.name}</span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Cycle Type</span>
                    <span className="summary-v-val">{formData.type}</span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Timeline Duration</span>
                    <span className="summary-v-val">
                      {formData.startDate} → {formData.endDate}
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Selection Scope</span>
                    <span className="summary-v-val">
                      {formData.selectionMode === 'all'
                        ? 'All Active Employees'
                        : formData.selectionMode === 'department'
                        ? `By Department (${formData.selectedDepartments.length} selected)`
                        : formData.selectionMode === 'designation'
                        ? `By Designation (${formData.selectedDesignations.length} selected)`
                        : `Specific Employees (${formData.selectedEmployeeIds.length} chosen)`}
                    </span>
                  </div>
                  {formData.description && (
                    <div className="summary-kv-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="summary-k-label">Description</span>
                      <span className="summary-v-val" style={{ fontWeight: 'normal' }}>
                        {formData.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Block 3: Performance Setup */}
              <div className="summary-block-card">
                <span className="summary-block-title">Performance Setup</span>
                <div className="summary-kv-grid">
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Weightage Balance</span>
                    <span className="summary-v-val">
                      Goals / KPI: {formData.goalsWeightage}% • Competencies: {formData.competenciesWeightage}%
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Review Flow Sequence</span>
                    <span className="summary-v-val">
                      {flowMeta.shortLabel}
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Manager Goal Approval</span>
                    <span className="summary-v-val">
                      {formData.requireGoalApproval ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Employee Goal Updates</span>
                    <span className="summary-v-val">
                      {formData.allowEmployeeGoalUpdates ? 'Allowed' : 'Not allowed'}
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Show Final Rating</span>
                    <span className="summary-v-val">
                      {formData.showFinalRatingToEmployee ? 'Visible to employee' : 'Hidden from employee'}
                    </span>
                  </div>
                  <div className="summary-kv-item">
                    <span className="summary-k-label">Review Deadlines</span>
                    <span className="summary-v-val">
                      {reviewFlowIncludesSelf(reviewFlow)
                        ? `Self: ${formData.selfReviewDeadlineDays ?? 7} days after Goal Due Date · `
                        : ''}
                      Manager &amp; Admin: Checks Goal Due Date
                    </span>
                  </div>
                  <div className="summary-kv-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="summary-k-label">Rating Scale &amp; Score Mapping</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {[...(formData.ratingMapping || DEFAULT_FINAL_RATING_MAPPING)]
                        .sort((a, b) => b.minScore - a.minScore)
                        .map((r) => {
                          const badge = getBadgeStyle(r.label);
                          return (
                            <span
                              key={r.id}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: 999,
                                background: badge.bg,
                                color: badge.color,
                                border: `1px solid ${badge.border}`
                              }}
                            >
                              {r.label} ({r.minScore.toFixed(1)}–{r.maxScore.toFixed(1)})
                            </span>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="wizard-footer-bar">
          <div>
            {currentStep === 1 ? (
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={() => onNavigate('/performance/cycles')}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={handleBack}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="wizard-footer-right">
            {currentStep < 4 ? (
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                onClick={handleContinue}
                disabled={currentStep === 3 && !isWeightageValid}
                style={{
                  opacity: currentStep === 3 && !isWeightageValid ? 0.6 : 1,
                  cursor: currentStep === 3 && !isWeightageValid ? 'not-allowed' : 'pointer'
                }}
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  onClick={() => handleFinalSubmit(true)}
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="pms-btn pms-btn-primary"
                  onClick={() => handleFinalSubmit(false)}
                >
                  <Check size={14} />
                  <span>Create Appraisal Cycle</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
