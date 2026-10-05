import React, { useEffect, useRef, useState } from 'react';
import {
  SettingsCompetency,
  CompetencyMapping,
  COMPETENCY_CATEGORIES,
  buildDefaultLevels,
  getCompetenciesForRole
} from '../../data/mockSettings';
import { MOCK_DEPARTMENTS } from '../../data/mockEmployees';
import { MultiSelectField } from './MultiSelectField';
import { SingleSelectAutocomplete } from '../../components/ui/SingleSelectAutocomplete';
import { ToastType } from '../../components/ui/Toast';
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Ban,
  CheckCircle2,
  Award,
  X,
  Check,
  AlertCircle,
  Building2,
  ListTree,
  Eye,
  Trash2,
  Layers,
  HelpCircle,
  Globe
} from 'lucide-react';
import './SettingsStyles.css';

export interface CompetenciesTabProps {
  competencies: SettingsCompetency[];
  onUpdateCompetencies: (list: SettingsCompetency[]) => void;
  competencyMappings?: CompetencyMapping[];
  onUpdateCompetencyMappings?: (list: CompetencyMapping[]) => void;
  onNavigate?: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  initialSubTab?: 'library' | 'mapping';
}

const categoryClass = (category: string) => {
  switch (category) {
    case 'Behavioral':
      return 'behavioral';
    case 'Leadership':
      return 'leadership';
    case 'Functional':
    case 'Technical':
      return 'functional';
    default:
      return 'behavioral';
  }
};

export const CompetenciesTab: React.FC<CompetenciesTabProps> = ({
  competencies,
  onUpdateCompetencies,
  competencyMappings = [],
  onUpdateCompetencyMappings,
  onShowToast,
  initialSubTab = 'library'
}) => {
  const [subTab, setSubTab] = useState<'library' | 'mapping'>(initialSubTab);

  // Common State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Competency Library Dialog State
  const [showCompModal, setShowCompModal] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(COMPETENCY_CATEGORIES[0]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['All']);
  const [nameError, setNameError] = useState('');

  // Department Mapping Dialog State
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [mapDepartment, setMapDepartment] = useState('All');
  const [mapSelectedCompIds, setMapSelectedCompIds] = useState<string[]>([]);
  const [mapError, setMapError] = useState('');

  // Preview Drawer/Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDept, setPreviewDept] = useState('Sales');

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Department Autocomplete Options
  const departmentOptions = [
    { value: 'All', label: 'All Departments (Company-Wide)', sub: 'Applies to every department in the organization' },
    ...MOCK_DEPARTMENTS.map((d) => ({
      value: d.name,
      label: d.name,
      sub: `${d.count} active employees`
    }))
  ];

  // Competency Select Options for Mapping
  const competencyOptions = competencies
    .filter((c) => c.status === 'Active')
    .map((c) => ({ value: c.id, label: c.name, sub: `${c.category} • ${c.description.slice(0, 40)}...` }));

  // --- Handlers: Competency Library ---
  const openCreateCompModal = () => {
    setEditingCompId(null);
    setName('');
    setDescription('');
    setCategory(COMPETENCY_CATEGORIES[0]);
    setStatus('Active');
    setSelectedDepts(['All']);
    setNameError('');
    setShowCompModal(true);
  };

  const openEditCompModal = (c: SettingsCompetency) => {
    setOpenMenuId(null);
    setEditingCompId(c.id);
    setName(c.name);
    setDescription(c.description);
    setCategory(c.category);
    setStatus(c.status);
    const depts = c.applicability?.departments || [];
    setSelectedDepts(depts.length > 0 ? depts : ['All']);
    setNameError('');
    setShowCompModal(true);
  };

  const handleSaveCompetency = () => {
    if (!name.trim()) {
      setNameError('Competency Name is required.');
      return;
    }
    setNameError('');

    const payload: SettingsCompetency = {
      id: editingCompId || `cfg-comp-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      usedInRoles: 0,
      levels: buildDefaultLevels(),
      applicability: {
        scopes: ['All Employees'],
        departments: ['All']
      }
    };

    if (editingCompId) {
      onUpdateCompetencies(competencies.map((item) => (item.id === editingCompId ? payload : item)));
      onShowToast?.('success', 'Competency updated', `"${payload.name}" was saved.`);
    } else {
      onUpdateCompetencies([payload, ...competencies]);
      onShowToast?.('success', 'Competency created', `"${payload.name}" was added to library.`);
    }

    setShowCompModal(false);
  };

  const handleToggleCompStatus = (c: SettingsCompetency) => {
    setOpenMenuId(null);
    const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateCompetencies(competencies.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item)));
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Competency deactivated' : 'Competency activated',
      `"${c.name}" is now ${nextStatus.toLowerCase()}.`
    );
  };

  // --- Handlers: Department Mapping ---
  const openCreateMapModal = () => {
    setEditingMapId(null);
    setMapDepartment('All');
    setMapSelectedCompIds([]);
    setMapError('');
    setShowMapModal(true);
  };

  const openEditMapModal = (m: CompetencyMapping) => {
    setEditingMapId(m.id);
    setMapDepartment(m.department || 'All');
    setMapSelectedCompIds(m.competencyIds || []);
    setMapError('');
    setShowMapModal(true);
  };

  const handleSaveMap = () => {
    if (!mapDepartment) {
      setMapError('Department is required.');
      return;
    }
    if (mapSelectedCompIds.length === 0) {
      setMapError('Select at least one competency for this department.');
      return;
    }
    setMapError('');

    if (!onUpdateCompetencyMappings) return;

    if (editingMapId) {
      const updated = competencyMappings.map((item) =>
        item.id === editingMapId
          ? { ...item, department: mapDepartment.trim(), competencyIds: mapSelectedCompIds }
          : item
      );
      onUpdateCompetencyMappings(updated);
      onShowToast?.(
        'success',
        'Mapping updated',
        `${mapDepartment} mapping updated with ${mapSelectedCompIds.length} competencies.`
      );
    } else {
      const newMap: CompetencyMapping = {
        id: `map-dept-${Date.now()}`,
        department: mapDepartment.trim(),
        competencyIds: mapSelectedCompIds,
        status: 'Active'
      };
      onUpdateCompetencyMappings([newMap, ...competencyMappings]);
      onShowToast?.(
        'success',
        'Department mapping created',
        `${mapDepartment} mapped to ${mapSelectedCompIds.length} competencies.`
      );
    }

    setShowMapModal(false);
  };

  const handleToggleMapStatus = (m: CompetencyMapping) => {
    if (!onUpdateCompetencyMappings) return;
    const nextStatus = m.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateCompetencyMappings(
      competencyMappings.map((item) => (item.id === m.id ? { ...item, status: nextStatus } : item))
    );
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Mapping deactivated' : 'Mapping activated',
      `${m.department} mapping is now ${nextStatus.toLowerCase()}.`
    );
  };

  const handleDeleteMapping = (m: CompetencyMapping) => {
    if (!onUpdateCompetencyMappings) return;
    onUpdateCompetencyMappings(competencyMappings.filter((item) => item.id !== m.id));
    onShowToast?.('success', 'Mapping deleted', `Removed mapping for ${m.department}.`);
  };

  // --- Filtering ---
  const filteredCompetencies = competencies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

    const depts = c.applicability?.departments || [];
    const matchesDept =
      deptFilter === 'all' || depts.includes('All') || depts.includes(deptFilter);

    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  });

  const filteredMappings = competencyMappings.filter((m) => {
    const matchesSearch =
      m.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.competencyIds.some((id) =>
        competencies.find((c) => c.id === id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const previewResults = getCompetenciesForRole(
    competencyMappings,
    competencies,
    previewDept
  );

  return (
    <div className="settings-section-card animate-fade-in">
      {/* Top Combined Module Banner & Sub-Nav */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          paddingBottom: 8,
          borderBottom: '1px solid var(--border-default)',
          marginBottom: 5
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="#0284C7" />
            <h2 className="form-section-title" style={{ margin: 0, fontSize: '1.15rem' }}>
              Department Competency Management
            </h2>
          </div>
          <p className="form-section-subtitle" style={{ marginTop: 2, margin: 0 }}>
            Define department-based competencies and configure department mappings for appraisal cycles.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className={`pms-btn ${subTab === 'library' ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
            style={{ padding: '7px 16px', fontSize: '0.82rem', gap: 6 }}
            onClick={() => setSubTab('library')}
          >
            <ListTree size={14} />
            <span>Competency Library ({competencies.length})</span>
          </button>

          <button
            type="button"
            className={`pms-btn ${subTab === 'mapping' ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
            style={{ padding: '7px 16px', fontSize: '0.82rem', gap: 6 }}
            onClick={() => setSubTab('mapping')}
          >
            <Building2 size={14} />
            <span>Department Mapping ({competencyMappings.length})</span>
          </button>

          {subTab === 'library' ? (
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 14px', gap: 6, whiteSpace: 'nowrap' }}
              onClick={openCreateCompModal}
            >
              <Plus size={14} />
              <span>Create Competency</span>
            </button>
          ) : (
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 14px', gap: 6, whiteSpace: 'nowrap' }}
              onClick={openCreateMapModal}
            >
              <Plus size={14} />
              <span>Create Department Mapping</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="emp-filter-toolbar" style={{ marginBottom: 5 }}>
        <div className="emp-toolbar-left" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="emp-search-wrap" style={{ minWidth: 220 }}>
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder={subTab === 'library' ? 'Search competencies...' : 'Search mappings...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {subTab === 'library' && (
            <select
              className="emp-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Category: All</option>
              {COMPETENCY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <select
            className="emp-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">Department: All</option>
            <option value="All">All Departments (Company-Wide)</option>
            {MOCK_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="emp-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing{' '}
          <strong>
            {subTab === 'library' ? filteredCompetencies.length : filteredMappings.length}
          </strong>{' '}
          items
        </div>
      </div>

      {/* --- SUB-TAB 1: COMPETENCY LIBRARY --- */}
      {subTab === 'library' && (
        <>
          {filteredCompetencies.length === 0 ? (
            <div className="settings-inline-placeholder">
              <Award size={26} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
              <p style={{ margin: 0 }}>No competencies found matching your filter.</p>
            </div>
          ) : (
            <div className="emp-table-card">
              <div className="emp-table-wrap">
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Competency</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompetencies.map((c) => {
                      const isMenuOpen = openMenuId === c.id;

                      return (
                        <tr key={c.id}>
                          <td>
                            <span className="emp-name-title" onClick={() => openEditCompModal(c)}>
                              {c.name}
                            </span>
                          </td>
                          <td>
                            <span className={`category-pill ${categoryClass(c.category)}`}>
                              {c.category}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: 380 }}>
                            {c.description}
                          </td>
                          <td>
                            <span
                              className={`pms-badge ${c.status === 'Active' ? 'badge-success' : 'badge-neutral'
                                }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', position: 'relative' }}>
                            <button
                              type="button"
                              className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                              style={{ margin: '0 auto', width: '28px', height: '28px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(isMenuOpen ? null : c.id);
                              }}
                              aria-label={`Actions for ${c.name}`}
                            >
                              <MoreVertical size={14} />
                            </button>

                            {isMenuOpen && (
                              <div
                                className="more-dropdown-menu"
                                ref={menuRef}
                                style={{ right: 8, top: '80%', zIndex: 90 }}
                              >
                                <button
                                  type="button"
                                  className="more-menu-item"
                                  onClick={() => openEditCompModal(c)}
                                >
                                  <Edit3 size={13} />
                                  <span>Edit Competency</span>
                                </button>
                                <button
                                  type="button"
                                  className={`more-menu-item ${c.status === 'Active' ? 'danger-item' : ''
                                    }`}
                                  onClick={() => handleToggleCompStatus(c)}
                                >
                                  {c.status === 'Active' ? (
                                    <Ban size={13} />
                                  ) : (
                                    <CheckCircle2 size={13} />
                                  )}
                                  <span>{c.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
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
        </>
      )}

      {/* --- SUB-TAB 2: DEPARTMENT MAPPING --- */}
      {subTab === 'mapping' && (
        <>
          {filteredMappings.length === 0 ? (
            <div className="settings-inline-placeholder">
              <Building2 size={28} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>No department mappings match your filters.</p>
            </div>
          ) : (
            <div className="emp-table-card">
              <div className="emp-table-wrap">
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Mapped Competencies</th>
                      <th>Status</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMappings.map((m) => {
                      const isAllDept = !m.department || m.department === 'All';
                      return (
                        <tr key={m.id}>
                          <td>
                            {isAllDept ? (
                              <span
                                className="pms-badge badge-info"
                                style={{ gap: 4, padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                <Globe size={12} />
                                <span>All Departments (Company-Wide)</span>
                              </span>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                <Building2 size={15} color="#0284C7" />
                                <span>{m.department} Department</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {m.competencyIds.map((id) => {
                                const comp = competencies.find((c) => c.id === id);
                                return (
                                  <span
                                    key={id}
                                    className="multiselect-pill"
                                    style={{ fontSize: '0.72rem', padding: '3px 10px' }}
                                  >
                                    <span>{comp ? comp.name : id}</span>
                                    {comp && (
                                      <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>
                                        ({comp.category})
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`pms-badge ${m.status === 'Active' ? 'badge-success' : 'badge-neutral'
                                }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4
                              }}
                            >
                              <button
                                type="button"
                                className="pms-btn pms-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                onClick={() => openEditMapModal(m)}
                                title="Edit Department Mapping"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                className="pms-btn pms-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                onClick={() => handleToggleMapStatus(m)}
                                title={m.status === 'Active' ? 'Deactivate' : 'Activate'}
                              >
                                {m.status === 'Active' ? (
                                  <Ban size={13} color="#D97706" />
                                ) : (
                                  <CheckCircle2 size={13} color="#059669" />
                                )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- MODAL 1: ADD / EDIT COMPETENCY --- */}
      {showCompModal && (
        <div className="modal-backdrop" onClick={() => setShowCompModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">
                  {editingCompId ? 'Edit Competency' : 'Create Competency'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCompModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
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
                    placeholder="e.g. Customer Focus, Technical Expertise"
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
                    placeholder="What capability or behavior does this competency measure?"
                  />
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">
                    Category <span className="required-asterisk">*</span>
                  </span>
                  <select
                    className="form-input-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {COMPETENCY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">Status</span>
                  <select
                    className="form-input-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={() => setShowCompModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ gap: 6 }}
                onClick={handleSaveCompetency}
              >
                <Check size={14} />
                <span>{editingCompId ? 'Save Changes' : 'Create Competency'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD / EDIT DEPARTMENT MAPPING --- */}
      {showMapModal && (
        <div className="modal-backdrop" onClick={() => setShowMapModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '560px' }}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">
                  {editingMapId ? 'Edit Department Mapping' : 'Create Department Mapping'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowMapModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  background: '#F0F9FF',
                  borderRadius: 6,
                  border: '1px solid #BAE6FD',
                  fontSize: '0.78rem',
                  color: '#0369A1'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <HelpCircle size={15} />
                  <span>
                    Select a department to assign a set of competencies. Choose &quot;All Departments&quot; to apply company-wide competencies to everyone.
                  </span>
                </div>
              </div>

              <div className="form-field-group">
                <span className="form-field-label">
                  Target Department <span className="required-asterisk">*</span>
                </span>
                <SingleSelectAutocomplete
                  options={departmentOptions}
                  value={mapDepartment}
                  onChange={setMapDepartment}
                  placeholder="Select department..."
                />
              </div>

              <div className="form-field-group">
                <span className="form-field-label">
                  Select Competencies <span className="required-asterisk">*</span>
                </span>
                <MultiSelectField
                  options={competencyOptions}
                  selected={mapSelectedCompIds}
                  onChange={setMapSelectedCompIds}
                  searchable
                  placeholder="Search and select competencies..."
                />
              </div>

              {mapError && (
                <div className="form-field-error">
                  <AlertCircle size={12} />
                  <span>{mapError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={() => setShowMapModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ gap: 6 }}
                onClick={handleSaveMap}
              >
                <Check size={14} />
                <span>{editingMapId ? 'Update Mapping' : 'Save Mapping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: PREVIEW DEPARTMENT COMPETENCIES --- */}
      {showPreviewModal && (
        <div className="modal-backdrop" onClick={() => setShowPreviewModal(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px' }}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Preview Department Competencies</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
            >
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Select a department to view the exact competencies an employee in that department will be evaluated on during appraisal reviews.
              </p>

              <div className="form-field-group">
                <span className="form-field-label">Target Department</span>
                <SingleSelectAutocomplete
                  options={departmentOptions}
                  value={previewDept}
                  onChange={setPreviewDept}
                />
              </div>

              <div className="form-field-group">
                <span className="form-field-label">
                  Assigned Competencies ({previewResults.length})
                </span>
                {previewResults.length === 0 ? (
                  <div className="settings-inline-placeholder">
                    No competencies assigned to this department yet.
                  </div>
                ) : (
                  <div className="multiselect-pills">
                    {previewResults.map((c) => (
                      <span
                        key={c.id}
                        className="multiselect-pill"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Building2 size={12} />
                        <span>{c.name}</span>
                        <span style={{ opacity: 0.65, fontSize: '0.68rem' }}>({c.category})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
