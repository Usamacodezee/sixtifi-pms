import React, { useEffect, useRef, useState } from 'react';
import {
  SettingsCompetency,
  TargetingScope,
  COMPETENCY_CATEGORIES,
  JOB_LEVEL_OPTIONS,
  buildDefaultLevels
} from '../../data/mockSettings';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '../../data/mockEmployees';
import { MultiSelectField } from './MultiSelectField';
import { ToastType } from '../../components/ui/Toast';
import { Search, Plus, MoreVertical, Edit3, Ban, CheckCircle2, Award, X, Check, AlertCircle } from 'lucide-react';

export interface CompetenciesTabProps {
  competencies: SettingsCompetency[];
  onUpdateCompetencies: (list: SettingsCompetency[]) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
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
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Dialog State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State inside Dialog
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(COMPETENCY_CATEGORIES[0]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['All']);
  const [nameError, setNameError] = useState('');

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
    setDescription('');
    setCategory(COMPETENCY_CATEGORIES[0]);
    setStatus('Active');
    setSelectedDepts(['All']);
    setNameError('');
    setShowModal(true);
  };

  const openEditModal = (c: SettingsCompetency) => {
    setOpenMenuId(null);
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description);
    setCategory(c.category);
    setStatus(c.status);
    const depts = c.applicability?.departments || [];
    setSelectedDepts(depts.length > 0 ? depts : ['All']);
    setNameError('');
    setShowModal(true);
  };

  const handleSaveCompetency = () => {
    if (!name.trim()) {
      setNameError('Competency Name is required.');
      return;
    }
    setNameError('');

    const isAll = selectedDepts.includes('All');

    const payload: SettingsCompetency = {
      id: editingId || `cfg-comp-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      status,
      usedInRoles: 0,
      levels: buildDefaultLevels(),
      applicability: {
        scopes: isAll ? ['All Employees'] : ['Specific Department'],
        departments: isAll ? ['All'] : selectedDepts,
        designations: [],
        jobLevels: []
      }
    };

    if (editingId) {
      onUpdateCompetencies(competencies.map((item) => (item.id === editingId ? payload : item)));
      onShowToast?.('success', 'Competency updated', `"${payload.name}" was saved.`);
    } else {
      onUpdateCompetencies([payload, ...competencies]);
      onShowToast?.('success', 'Competency created', `"${payload.name}" was added to library.`);
    }

    setShowModal(false);
  };

  const filtered = competencies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleStatus = (c: SettingsCompetency) => {
    setOpenMenuId(null);
    const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
    onUpdateCompetencies(competencies.map((item) => (item.id === c.id ? { ...item, status: nextStatus } : item)));
    onShowToast?.(
      'success',
      nextStatus === 'Inactive' ? 'Competency deactivated' : 'Competency activated',
      `"${c.name}" is now ${nextStatus.toLowerCase()}.`
    );
  };

  return (
    <div className="settings-section-card">
      <div className="form-section-header" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 className="form-section-title">Competency Library</h2>
          <p className="form-section-subtitle">Create and manage the competencies used to evaluate employee performance.</p>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-primary"
          style={{ padding: '8px 14px', gap: 6, whiteSpace: 'nowrap' }}
          onClick={openCreateModal}
        >
          <Plus size={14} />
          <span>Create Competency</span>
        </button>
      </div>

      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          <div className="emp-search-wrap">
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search competencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="emp-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Category: All</option>
            {COMPETENCY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select className="emp-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {competencies.length} competencies
        </div>
      </div>

      {competencies.length === 0 ? (
        <div className="settings-inline-placeholder">
          <Award size={26} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
          <p style={{ margin: 0 }}>No competencies created yet.</p>
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
                {filtered.map((c) => {
                  const isMenuOpen = openMenuId === c.id;
                  return (
                    <tr key={c.id}>
                      <td>
                        <span
                          className="emp-name-title"
                          onClick={() => openEditModal(c)}
                        >
                          {c.name}
                        </span>
                      </td>
                      <td>
                        <span className={`category-pill ${categoryClass(c.category)}`}>{c.category}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 320 }}>{c.description}</td>
                      <td>
                        <span className={`pms-badge ${c.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
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
                          <div className="more-dropdown-menu" ref={menuRef} style={{ right: 8, top: '80%', zIndex: 90 }}>
                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => openEditModal(c)}
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className={`more-menu-item ${c.status === 'Active' ? 'danger-item' : ''}`}
                              onClick={() => handleToggleStatus(c)}
                            >
                              {c.status === 'Active' ? <Ban size={13} /> : <CheckCircle2 size={13} />}
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

      {/* Add / Edit Competency Dialog Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">{editingId ? 'Edit Competency' : 'Add Competency'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
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
                    placeholder="e.g. Customer Focus, Problem Solving"
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

              {/* Department Applicability */}
              <div className="form-section-header" style={{ marginTop: 8 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Competency Targeting
                </span>
                <p className="form-section-subtitle" style={{ fontSize: '0.75rem' }}>
                  Select which department(s) this competency applies to, or choose All Departments to apply company-wide.
                </p>
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
            </div>

            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ gap: 6 }} onClick={handleSaveCompetency}>
                <Check size={14} />
                <span>{editingId ? 'Save Changes' : 'Create Competency'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

