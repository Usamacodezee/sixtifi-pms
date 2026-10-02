import React, { useEffect, useRef, useState } from 'react';
import { ToastType } from '../../components/ui/Toast';
import {
  KraItem,
  KpiItem,
  KRA_DEPARTMENT_OPTIONS,
  KRA_STATUSES,
  KraStatus,
  withLinkedMetricCounts
} from '../../data/mockPerformanceModules';
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Layers,
  ArrowRight,
  Globe,
  Building,
  Eye,
  Ban,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import '../settings/SettingsStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCyclesView.css';
import '../my-performance/MyGoalsStyles.css';
import './ModuleStyles.css';

export interface KrasPageProps {
  resultAreas: KraItem[];
  metrics: KpiItem[];
  onUpdateResultAreas: (list: KraItem[]) => void;
  onUpdateMetrics: (list: KpiItem[]) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  embedded?: boolean;
}

interface KraFormState {
  name: string;
  code: string;
  departments: string[];
  description: string;
  weightHint: number;
  status: KraStatus;
}

const emptyForm = (): KraFormState => ({
  name: '',
  code: '',
  departments: ['All'],
  description: '',
  weightHint: 10,
  status: 'Draft'
});

const formFromItem = (item: KraItem): KraFormState => ({
  name: item.name,
  code: item.code,
  departments:
    item.departments && item.departments.length > 0
      ? item.departments
      : item.department
        ? item.department.split(/,\s*/)
        : ['All'],
  description: item.description,
  weightHint: item.weightHint,
  status: item.status
});

export const KrasPage: React.FC<KrasPageProps> = ({
  resultAreas,
  metrics,
  onUpdateResultAreas,
  onUpdateMetrics,
  onNavigate,
  onShowToast,
  embedded = false
}) => {
  const rows = withLinkedMetricCounts(resultAreas, metrics);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; id?: string } | null>(null);
  const [viewTarget, setViewTarget] = useState<KraItem | null>(null);
  const [form, setForm] = useState<KraFormState>(emptyForm());
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<KraItem | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggleStatus = (item: KraItem) => {
    setOpenMenuId(null);
    const nextStatus: KraStatus = item.status === 'Active' ? 'Draft' : 'Active';
    const nextKras = resultAreas.map((k) =>
      k.id === item.id ? { ...k, status: nextStatus } : k
    );
    onUpdateResultAreas(nextKras);
    onShowToast?.(
      'success',
      nextStatus === 'Active' ? 'Result area activated' : 'Result area deactivated',
      `"${item.name}" is now ${nextStatus.toLowerCase()}.`
    );
  };

  const filtered = rows.filter((k) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      k.name.toLowerCase().includes(q) ||
      k.code.toLowerCase().includes(q) ||
      k.department.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
    const matchesDept =
      deptFilter === 'all' ||
      (k.departments && k.departments.includes(deptFilter)) ||
      k.department.includes(deptFilter);
    return matchesSearch && matchesStatus && matchesDept;
  });

  const openCreate = () => {
    setForm(emptyForm());
    setFormError('');
    setEditor({ mode: 'create' });
  };

  const openEdit = (item: KraItem) => {
    setOpenMenuId(null);
    setForm(formFromItem(item));
    setFormError('');
    setEditor({ mode: 'edit', id: item.id });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!form.code.trim()) {
      setFormError('Code is required.');
      return;
    }
    if (!form.departments || form.departments.length === 0) {
      setFormError('Select at least one department (or "All Departments").');
      return;
    }
    const code = form.code.trim().toUpperCase();
    const duplicate = resultAreas.some(
      (k) => k.code.toUpperCase() === code && k.id !== editor?.id
    );
    if (duplicate) {
      setFormError('Another result area already uses this code.');
      return;
    }

    const formattedDept = form.departments.includes('All') ? 'All' : form.departments.join(', ');
    const weightHint = Math.min(100, Math.max(0, Number(form.weightHint) || 0));
    const payload = {
      name: form.name.trim(),
      code,
      department: formattedDept,
      departments: form.departments,
      description: form.description.trim(),
      weightHint,
      status: form.status
    };

    if (editor?.mode === 'edit' && editor.id) {
      const nextKras = resultAreas.map((k) =>
        k.id === editor.id ? { ...k, ...payload } : k
      );
      const renamed = resultAreas.find((k) => k.id === editor.id);
      let nextMetrics = metrics;
      if (renamed && renamed.name !== payload.name) {
        nextMetrics = metrics.map((m) =>
          m.kraId === editor.id ? { ...m, kraName: payload.name } : m
        );
        onUpdateMetrics(nextMetrics);
      }
      onUpdateResultAreas(withLinkedMetricCounts(nextKras, nextMetrics));
      onShowToast?.('success', 'Result area updated', `"${payload.name}" was saved.`);
    } else {
      const created: KraItem = {
        id: `kra-${Date.now()}`,
        linkedKpis: 0,
        ...payload
      };
      onUpdateResultAreas([created, ...resultAreas]);
      onShowToast?.('success', 'Result area added', `"${payload.name}" was created.`);
    }
    setEditor(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    const linked = metrics.filter((m) => m.kraId === id);
    onUpdateMetrics(metrics.filter((m) => m.kraId !== id));
    onUpdateResultAreas(resultAreas.filter((k) => k.id !== id));
    onShowToast?.(
      'success',
      'Result area deleted',
      linked.length
        ? `"${deleteTarget.name}" and ${linked.length} linked metric(s) were removed.`
        : `"${deleteTarget.name}" was removed.`
    );
    setDeleteTarget(null);
  };

  return (
    <div className={embedded ? 'settings-embedded-panel' : 'perf-module-page animate-fade-in'}>
      <div className="settings-embedded-header">
        <div>
          <h2 className="settings-embedded-title">Result Areas</h2>
          <p className="settings-embedded-subtitle">
            Focus areas that goals and reviews are aligned to across single or multiple departments.
          </p>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-primary"
          style={{ padding: '8px 14px', gap: 6 }}
          onClick={openCreate}
        >
          <Plus size={14} />
          <span>Add result area</span>
        </button>
      </div>

      <div className="settings-section-card">
        <div className="emp-filter-toolbar">
          <div className="emp-toolbar-left">
            <div className="emp-search-wrap">
              <Search size={14} className="emp-search-icon" />
              <input
                type="text"
                className="emp-search-input"
                placeholder="Search result areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="emp-filter-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="all">Department: All</option>
              {['Sales', 'Engineering', 'Customer Success', 'Operations', 'HR', 'Finance', 'Marketing'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="emp-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status: All</option>
              {KRA_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> of {rows.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="settings-inline-placeholder">
            <Layers size={26} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
            <p style={{ margin: 0 }}>No result areas yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="emp-table-card">
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Result area</th>
                    <th>Departments</th>
                    <th>Metrics</th>
                    <th>Suggested weight</th>
                    <th>Status</th>
                    <th style={{ width: 70, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((k) => {
                    const isMenuOpen = openMenuId === k.id;
                    const depts = k.departments && k.departments.length > 0 ? k.departments : k.department.split(/,\s*/);
                    const isAll = k.department === 'All' || depts.includes('All');

                    return (
                      <tr key={k.id}>
                        <td>
                          <span style={{ fontWeight: 600 }}>{k.code}</span>
                        </td>
                        <td>
                          <span className="emp-name-title" onClick={() => openEdit(k)}>
                            {k.name}
                          </span>
                          {k.description && (
                            <div
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                maxWidth: 280,
                                marginTop: 2
                              }}
                            >
                              {k.description}
                            </div>
                          )}
                        </td>
                        <td>
                          {isAll ? (
                            <span className="pms-badge badge-info" style={{ gap: 4, padding: '3px 8px', fontSize: '0.7rem' }}>
                              <Globe size={11} />
                              <span>All Departments</span>
                            </span>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {depts.map((d) => (
                                <span key={d} className="pms-badge badge-neutral" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>{k.linkedKpis}</td>
                        <td>{k.weightHint}%</td>
                        <td>
                          <span
                            className={`pms-badge ${k.status === 'Active'
                              ? 'badge-success'
                              : k.status === 'Draft'
                                ? 'badge-warning'
                                : 'badge-neutral'
                              }`}
                          >
                            {k.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <button
                            type="button"
                            className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                            style={{ margin: '0 auto', width: 28, height: 28 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : k.id);
                            }}
                            aria-label={`Actions for ${k.name}`}
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
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setViewTarget(k);
                                }}
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                              <button
                                type="button"
                                className="more-menu-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEdit(k);
                                }}
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className={`more-menu-item ${k.status === 'Active' ? 'danger-item' : ''}`}
                                onClick={() => handleToggleStatus(k)}
                              >
                                {k.status === 'Active' ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                                <span>{k.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                              </button>
                              <button
                                type="button"
                                className="more-menu-item danger-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteTarget(k);
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
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
      </div>

      {editor && (
        <div className="modal-backdrop" onClick={() => setEditor(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">
                  {editor.mode === 'create' ? 'Add result area' : 'Edit result area'}
                </h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditor(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {form.status === 'Active' && (
                <div style={{ padding: '8px 12px', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 6, fontSize: '0.78rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={15} color="#D97706" style={{ flexShrink: 0 }} />
                  <span>This Result Area is <strong>Active</strong>. Only the description can be edited while Active. Switch status to Draft to edit name, code, departments, or weight.</span>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">
                    Name <span className="required-asterisk">*</span>
                  </span>
                  <input
                    className={`form-input-text ${formError && !form.name.trim() ? 'has-error' : ''}`}
                    value={form.name}
                    disabled={form.status === 'Active'}
                    style={form.status === 'Active' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : undefined}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Revenue Growth"
                  />
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">
                    Code <span className="required-asterisk">*</span>
                  </span>
                  <input
                    className={`form-input-text ${formError && !form.code.trim() ? 'has-error' : ''}`}
                    value={form.code}
                    disabled={form.status === 'Active'}
                    style={form.status === 'Active' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : undefined}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. RA-REV"
                  />
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">Suggested weight (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-input-text"
                    value={form.weightHint}
                    disabled={form.status === 'Active'}
                    style={form.status === 'Active' ? { backgroundColor: '#F1F5F9', cursor: 'not-allowed' } : undefined}
                    onChange={(e) => setForm({ ...form, weightHint: Number(e.target.value) })}
                  />
                </div>

                {/* Department Select */}
                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">
                    Departments <span className="required-asterisk">*</span>
                  </span>
                  <select
                    multiple
                    className="form-input-select"
                    style={{
                      height: 'auto',
                      minHeight: '120px',
                      padding: '6px 8px',
                      backgroundColor: form.status === 'Active' ? '#F1F5F9' : undefined,
                      cursor: form.status === 'Active' ? 'not-allowed' : undefined
                    }}
                    value={form.departments}
                    disabled={form.status === 'Active'}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                      setForm({ ...form, departments: selected.length ? selected : ['All'] });
                    }}
                  >
                    <option value="All">All Departments</option>
                    {['Sales', 'Engineering', 'Customer Success', 'Operations', 'HR', 'Finance', 'Marketing'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <span className="form-field-helper" style={{ marginTop: 4 }}>
                    Hold Cmd (Mac) or Ctrl (Windows) to select multiple departments.
                  </span>
                </div>

                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">Status</span>
                  <select
                    className="form-input-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as KraStatus })}
                  >
                    {KRA_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">Description</span>
                  <textarea
                    className="form-input-text"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What this result area covers"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              {formError && (
                <p style={{ margin: 0, color: 'var(--color-danger, #dc2626)', fontSize: '0.8rem' }}>
                  {formError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-ghost" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" onClick={handleSave}>
                {editor.mode === 'create' ? 'Create' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Delete result area?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Delete <strong>{deleteTarget.name}</strong>
                {deleteTarget.linkedKpis > 0
                  ? ` and its ${deleteTarget.linkedKpis} linked metric(s)? This cannot be undone in this session.`
                  : '? This cannot be undone in this session.'}
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewTarget && (
        <div className="modal-backdrop" onClick={() => setViewTarget(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="pms-badge badge-info" style={{ marginBottom: 4 }}>{viewTarget.code}</span>
                <h3 className="modal-title">{viewTarget.name}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setViewTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="info-kv-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="info-kv-item">
                  <span className="info-k-label">Status</span>
                  <span
                    className={`pms-badge ${
                      viewTarget.status === 'Active'
                        ? 'badge-success'
                        : viewTarget.status === 'Draft'
                          ? 'badge-warning'
                          : 'badge-neutral'
                    }`}
                  >
                    {viewTarget.status}
                  </span>
                </div>
                <div className="info-kv-item">
                  <span className="info-k-label">Suggested Weight</span>
                  <span className="info-v-val">{viewTarget.weightHint}%</span>
                </div>
                <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-k-label">Applicable Departments</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {(!viewTarget.departments || viewTarget.departments.includes('All') || viewTarget.department === 'All') ? (
                      <span className="pms-badge badge-info" style={{ gap: 4 }}>
                        <Globe size={11} />
                        <span>All Departments</span>
                      </span>
                    ) : (
                      (viewTarget.departments && viewTarget.departments.length > 0
                        ? viewTarget.departments
                        : viewTarget.department.split(/,\s*/)
                      ).map((d) => (
                        <span key={d} className="pms-badge badge-neutral">
                          {d}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-k-label">Description</span>
                  <span className="info-v-val" style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                    {viewTarget.description || 'No description provided.'}
                  </span>
                </div>
                <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-k-label">Linked Metrics</span>
                  <span className="info-v-val" style={{ color: '#0284C7', fontWeight: 600 }}>
                    {viewTarget.linkedKpis} Metric{viewTarget.linkedKpis === 1 ? '' : 's'} linked
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ gap: 6 }}
                onClick={() => {
                  const target = viewTarget;
                  setViewTarget(null);
                  openEdit(target);
                }}
              >
                <Edit3 size={14} />
                <span>Edit Result Area</span>
              </button>
              <button type="button" className="pms-btn pms-btn-primary" onClick={() => setViewTarget(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
