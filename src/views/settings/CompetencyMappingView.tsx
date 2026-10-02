import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MultiSelectField } from './MultiSelectField';
import { SingleSelectAutocomplete } from '../../components/ui/SingleSelectAutocomplete';
import {
  CompetencyMapping,
  SettingsCompetency,
  JOB_LEVEL_OPTIONS,
  getCompetenciesForRole
} from '../../data/mockSettings';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '../../data/mockEmployees';
import { ToastType } from '../../components/ui/Toast';
import {
  Plus,
  Eye,
  Ban,
  CheckCircle2,
  X,
  Check,
  Layers,
  Search,
  Globe,
  Edit3,
  Trash2,
  Layers3,
  HelpCircle
} from 'lucide-react';
import '../cycles/CreateCycleWizard.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';
import '../my-performance/MyGoalsStyles.css';
import './SettingsStyles.css';

export interface CompetencyMappingViewProps {
  mappings: CompetencyMapping[];
  onUpdateMappings: (list: CompetencyMapping[]) => void;
  competencies: SettingsCompetency[];
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  embedded?: boolean;
}

const competencyName = (competencies: SettingsCompetency[], id: string) =>
  competencies.find((c) => c.id === id)?.name || id;

export const CompetencyMappingView: React.FC<CompetencyMappingViewProps> = ({
  mappings,
  onUpdateMappings,
  competencies,
  onNavigate,
  onShowToast,
  embedded = false
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState<string | null>(null);

  // Search & Filters state for table
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [department, setDepartment] = useState('All');
  const [designation, setDesignation] = useState('All');
  const [jobLevel, setJobLevel] = useState('All');
  const [selectedCompetencyIds, setSelectedCompetencyIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Preview state
  const [previewDept, setPreviewDept] = useState('Sales');
  const [previewDesignation, setPreviewDesignation] = useState('Sales Executive');
  const [previewJobLevel, setPreviewJobLevel] = useState('Individual Contributor');

  // Autocomplete Options
  const departmentOptions = [
    { value: 'All', label: 'All Departments', sub: 'Map competencies across all company departments' },
    ...MOCK_DEPARTMENTS.map((d) => ({
      value: d.name,
      label: d.name,
      sub: `${d.count} active employees`
    }))
  ];

  const filteredDesignationList = MOCK_DESIGNATIONS.filter(
    (d) => department === 'All' || !d.department || d.department === department
  );

  const designationOptions = [
    {
      value: 'All',
      label: 'All Designations',
      sub: department === 'All' ? 'Map competencies across all job titles' : `Map across all titles in ${department}`
    },
    ...filteredDesignationList.map((d) => ({
      value: d.name,
      label: d.name,
      sub: `${d.count} active employees${d.department && department === 'All' ? ` • ${d.department}` : ''}`
    }))
  ];

  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept);
    if (newDept !== 'All') {
      const match = MOCK_DESIGNATIONS.find((d) => d.name === designation);
      if (match && match.department && match.department !== newDept) {
        setDesignation('All');
      }
    }
  };

  const jobLevelOptions = [
    { value: 'All', label: 'All Grades', sub: 'Map competencies across all seniority levels' },
    ...JOB_LEVEL_OPTIONS.map((jl) => ({
      value: jl,
      label: jl,
      sub: `Seniority tier`
    }))
  ];

  const resetForm = () => {
    setDepartment('All');
    setDesignation('All');
    setJobLevel('All');
    setSelectedCompetencyIds([]);
    setFormError('');
    setEditingMappingId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (m: CompetencyMapping) => {
    setEditingMappingId(m.id);
    setDepartment(m.department || 'All');
    setDesignation(m.designation || 'All');
    setJobLevel(m.jobLevel || 'All');
    setSelectedCompetencyIds(m.competencyIds || []);
    setFormError('');
    setShowCreateModal(true);
  };

  const handleSaveMapping = () => {
    if (!department) {
      setFormError('Department is required. Select "All Departments" for company-wide.');
      return;
    }
    if (!designation) {
      setFormError('Designation is required. Select "All Designations" for department/level wide.');
      return;
    }
    if (!jobLevel) {
      setFormError('Grade is required. Select "All Grades" if applicable to all seniority levels.');
      return;
    }
    if (selectedCompetencyIds.length === 0) {
      setFormError('Select at least one competency to map.');
      return;
    }
    setFormError('');

    if (editingMappingId) {
      const updated = mappings.map((item) =>
        item.id === editingMappingId
          ? {
              ...item,
              department: department.trim(),
              designation: designation.trim(),
              jobLevel: jobLevel.trim(),
              competencyIds: selectedCompetencyIds
            }
          : item
      );
      onUpdateMappings(updated);
      onShowToast?.(
        'success',
        'Mapping updated successfully.',
        `${designation} (${jobLevel}) mapping updated with ${selectedCompetencyIds.length} competencies.`
      );
    } else {
      const newMapping: CompetencyMapping = {
        id: `map-role-${Date.now()}`,
        department: department.trim(),
        designation: designation.trim(),
        jobLevel: jobLevel.trim(),
        competencyIds: selectedCompetencyIds,
        status: 'Active'
      };
      onUpdateMappings([newMapping, ...mappings]);
      onShowToast?.(
        'success',
        'Competency mapping created successfully.',
        `${designation} (${jobLevel}) maps to ${selectedCompetencyIds.length} competencies.`
      );
    }

    setShowCreateModal(false);
    resetForm();
  };

  const handleToggleStatus = (m: CompetencyMapping) => {
    const nextStatus = m.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateMappings(
      mappings.map((item) => (item.id === m.id ? { ...item, status: nextStatus } : item))
    );
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Mapping deactivated' : 'Mapping activated',
      `${m.designation} mapping is now ${nextStatus.toLowerCase()}.`
    );
  };

  const handleDeleteMapping = (m: CompetencyMapping) => {
    onUpdateMappings(mappings.filter((item) => item.id !== m.id));
    onShowToast?.('success', 'Mapping deleted', `Removed mapping for ${m.designation}.`);
  };

  // Filtered mappings table
  const filteredMappings = mappings.filter((m) => {
    const searchLow = searchTerm.toLowerCase();
    const compNames = m.competencyIds
      .map((id) => competencyName(competencies, id).toLowerCase())
      .join(' ');

    const matchesSearch =
      m.department.toLowerCase().includes(searchLow) ||
      m.designation.toLowerCase().includes(searchLow) ||
      m.jobLevel.toLowerCase().includes(searchLow) ||
      compNames.includes(searchLow);

    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    const matchesLevel = levelFilter === 'all' || m.jobLevel === levelFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesDept && matchesLevel && matchesStatus;
  });

  const previewResults = getCompetenciesForRole(
    mappings,
    competencies,
    previewDept,
    previewDesignation,
    previewJobLevel
  );

  const competencyOptions = competencies
    .filter((c) => c.status === 'Active')
    .map((c) => ({ value: c.id, label: c.name, sub: c.category }));

  const isAllValue = (val?: string) =>
    !val || val.toLowerCase() === 'all' || val.toLowerCase().startsWith('all ');

  const renderBadgeValue = (val: string, type: 'Dept' | 'Desig' | 'Level') => {
    if (isAllValue(val)) {
      return (
        <span className="pms-badge badge-info" style={{ gap: 4, padding: '3px 8px', fontSize: '0.7rem' }}>
          <Globe size={11} />
          <span>All {type === 'Dept' ? 'Departments' : type === 'Desig' ? 'Designations' : 'Grades'}</span>
        </span>
      );
    }
    return <span>{val}</span>;
  };

  const actionButtons = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="pms-btn pms-btn-secondary"
        style={{ padding: '7px 14px', fontSize: '0.8rem', gap: '6px' }}
        onClick={() => setShowPreviewModal(true)}
      >
        <Eye size={14} />
        <span>Preview Review Competencies</span>
      </button>
      <button
        className="pms-btn pms-btn-primary"
        style={{ padding: '7px 14px', fontSize: '0.8rem', gap: '6px' }}
        onClick={handleOpenCreate}
      >
        <Plus size={14} />
        <span>Create Mapping</span>
      </button>
    </div>
  );

  return (
    <div className={embedded ? 'settings-embedded-panel' : 'settings-page animate-fade-in'}>
      {!embedded && (
        <PageHeader
          title="Competency Mapping"
          subtitle="Map competencies to specific roles or broadly across all departments, designations, and grades."
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'Settings', href: '#/performance/settings' },
            { label: 'Competency Mapping' }
          ]}
          actions={actionButtons}
        />
      )}

      {embedded && (
        <div className="settings-embedded-header">
          <div>
            <h2 className="settings-embedded-title">Competency Mapping</h2>
            <p className="settings-embedded-subtitle">
              Map competencies to specific roles or broadly across all departments, designations, and grades.
            </p>
          </div>
          {actionButtons}
        </div>
      )}

      {/* Flexible Wildcard Guidance Banner */}
      <div className="settings-section-card" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
        <div className="form-section-header" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers3 size={18} color="#0284C7" />
            <h2 className="form-section-title" style={{ fontSize: '1rem', margin: 0 }}>
              Flexible Competency Mapping & Priorities
            </h2>
          </div>
          <p className="form-section-subtitle">
            You can use <strong>&quot;All&quot;</strong> in Department, Designation, or Grade to map competencies universally or to broad employee segments.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          <div style={{ padding: '12px 14px', backgroundColor: '#F0F9FF', borderRadius: 8, border: '1px solid #BAE6FD' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: '#0369A1', marginBottom: 4 }}>
              <Globe size={14} />
              <span>1. Company-Wide (&quot;All&quot; / &quot;All&quot; / &quot;All&quot;)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#0C4A6E', lineHeight: 1.5 }}>
              Maps core competencies (e.g. Communication, Core Values) to <strong>every employee</strong> in the company regardless of role.
            </p>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#F5F3FF', borderRadius: 8, border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: '#6D28D9', marginBottom: 4 }}>
              <Layers size={14} />
              <span>2. Segment Specific (&quot;All&quot; wildcards)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#4C1D95', lineHeight: 1.5 }}>
              Target specific groups like <strong>All Managers</strong> (Grade = Manager) or <strong>All Sales Roles</strong> (Dept = Sales).
            </p>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: '#ECFDF5', borderRadius: 8, border: '1px solid #A7F3D0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8rem', color: '#047857', marginBottom: 4 }}>
              <CheckCircle2 size={14} />
              <span>3. Role-Specific Mapping</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#064E3B', lineHeight: 1.5 }}>
              Target exact combinations (e.g. <em>Engineering &rarr; Software Engineer &rarr; Individual Contributor</em>).
            </p>
          </div>
        </div>
      </div>

      {/* Mapping Table Card */}
      <div className="settings-section-card">
        <div className="form-section-header">
          <h2 className="form-section-title" style={{ fontSize: '1rem' }}>Active Role Mappings</h2>
          <p className="form-section-subtitle">
            Search, filter, create or modify department, designation, and grade mappings.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="emp-filter-toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="emp-toolbar-left" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="emp-search-wrap" style={{ minWidth: 220 }}>
              <Search size={14} className="emp-search-icon" />
              <input
                type="text"
                className="emp-search-input"
                placeholder="Search mapping or competency..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select className="emp-filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="all">Department: All</option>
              <option value="All">All Departments (Wildcard)</option>
              {MOCK_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select className="emp-filter-select" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
              <option value="all">Grade: All</option>
              <option value="All">All Grades (Wildcard)</option>
              {JOB_LEVEL_OPTIONS.map((jl) => (
                <option key={jl} value={jl}>{jl}</option>
              ))}
            </select>

            <select className="emp-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredMappings.length}</strong> of {mappings.length} mappings
          </div>
        </div>

        {filteredMappings.length === 0 ? (
          <div className="settings-inline-placeholder">
            <Layers size={28} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No competency mappings match your search criteria.</p>
          </div>
        ) : (
          <div className="emp-table-card">
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Grade</th>
                    <th>Mapped Competencies</th>
                    <th>Status</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMappings.map((m) => (
                    <tr key={m.id}>
                      <td>{renderBadgeValue(m.department, 'Dept')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {renderBadgeValue(m.designation, 'Desig')}
                      </td>
                      <td>{renderBadgeValue(m.jobLevel, 'Level')}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.competencyIds.map((id) => (
                            <span key={id} className="multiselect-pill" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                              <span>{competencyName(competencies, id)}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`pms-badge ${m.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <button
                            type="button"
                            className="pms-btn pms-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => handleOpenEdit(m)}
                            title="Edit Mapping"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            className="pms-btn pms-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            onClick={() => handleToggleStatus(m)}
                            title={m.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {m.status === 'Active' ? <Ban size={13} color="#D97706" /> : <CheckCircle2 size={13} color="#059669" />}
                          </button>
                          <button
                            type="button"
                            className="pms-btn pms-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#DC2626' }}
                            onClick={() => handleDeleteMapping(m)}
                            title="Delete Mapping"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Mapping Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">
                  {editingMappingId ? 'Edit Competency Mapping' : 'Create Competency Mapping'}
                </h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ padding: '8px 12px', background: '#F0F9FF', borderRadius: 6, border: '1px solid #BAE6FD', fontSize: '0.76rem', color: '#0369A1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <HelpCircle size={14} />
                  <span>Select &quot;All&quot; in any field to apply competencies broadly across departments, titles, or levels.</span>
                </div>
              </div>

              <div className="targeting-chain" style={{ marginBottom: 4 }}>
                <span className="targeting-chain-item">1. Department: {department}</span>
                <span className="targeting-chain-arrow">&rarr;</span>
                <span className="targeting-chain-item">2. Designation: {designation}</span>
                <span className="targeting-chain-arrow">&rarr;</span>
                <span className="targeting-chain-item">3. Grade: {jobLevel}</span>
              </div>

              {/* Autocomplete fields */}
              <div className="form-grid-2">
                <div className="form-field-group">
                  <span className="form-field-label">
                    1. Department <span className="required-asterisk">*</span>
                  </span>
                  <SingleSelectAutocomplete
                    options={departmentOptions}
                    value={department}
                    onChange={handleDepartmentChange}
                    placeholder="Search or select department..."
                  />
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">
                    2. Designation (Nested) <span className="required-asterisk">*</span>
                  </span>
                  <SingleSelectAutocomplete
                    options={designationOptions}
                    value={designation}
                    onChange={setDesignation}
                    placeholder={department === 'All' ? 'Select designation...' : `Select designation in ${department}...`}
                  />
                </div>

                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">
                    3. Grade <span className="required-asterisk">*</span>
                  </span>
                  <SingleSelectAutocomplete
                    options={jobLevelOptions}
                    value={jobLevel}
                    onChange={setJobLevel}
                    placeholder="Search or select grade..."
                  />
                </div>
              </div>

              {/* Select Competencies */}
              <div className="form-field-group">
                <span className="form-field-label">
                  Select Competencies <span className="required-asterisk">*</span>
                </span>
                <MultiSelectField
                  options={competencyOptions}
                  selected={selectedCompetencyIds}
                  onChange={setSelectedCompetencyIds}
                  searchable
                  placeholder="Search competencies..."
                />
              </div>

              {formError && (
                <div className="form-field-error">
                  <span>{formError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ gap: 6 }} onClick={handleSaveMapping}>
                <Check size={14} />
                <span>{editingMappingId ? 'Update Mapping' : 'Save Mapping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Review Competencies Modal */}
      {showPreviewModal && (
        <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Preview Review Competencies</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowPreviewModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Test role combinations to verify which competencies are assigned to an employee during review cycles.
              </p>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <span className="form-field-label">Target Department</span>
                  <SingleSelectAutocomplete
                    options={departmentOptions}
                    value={previewDept}
                    onChange={setPreviewDept}
                  />
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">Target Designation</span>
                  <SingleSelectAutocomplete
                    options={designationOptions}
                    value={previewDesignation}
                    onChange={setPreviewDesignation}
                  />
                </div>
                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">Target Grade</span>
                  <SingleSelectAutocomplete
                    options={jobLevelOptions}
                    value={previewJobLevel}
                    onChange={setPreviewJobLevel}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <span className="form-field-label">
                  Competencies Assigned ({previewResults.length})
                </span>
                {previewResults.length === 0 ? (
                  <div className="settings-inline-placeholder">No competencies match this combination.</div>
                ) : (
                  <div className="multiselect-pills">
                    {previewResults.map((c) => (
                      <span key={c.id} className="multiselect-pill" style={{ padding: '4px 10px' }}>
                        <span>{c.name}</span>
                        <span style={{ opacity: 0.7, fontSize: '0.65rem' }}>({c.category})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowPreviewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

