import React, { useEffect, useRef, useState } from 'react';
import { ToastType } from '../../components/ui/Toast';
import {
  KraItem,
  KpiItem,
  KPI_DIRECTIONS,
  KPI_STATUSES,
  KPI_UNITS,
  KpiDirection,
  KpiStatus,
  withLinkedMetricCounts
} from '../../data/mockPerformanceModules';
import {
  Search,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Gauge,
  ArrowRight,
  X
} from 'lucide-react';
import '../settings/SettingsStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCyclesView.css';
import '../my-performance/MyGoalsStyles.css';
import './ModuleStyles.css';

export interface KpisPageProps {
  metrics: KpiItem[];
  resultAreas: KraItem[];
  onUpdateMetrics: (list: KpiItem[]) => void;
  onUpdateResultAreas: (list: KraItem[]) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  embedded?: boolean;
}

interface KpiFormState {
  name: string;
  code: string;
  kraId: string;
  unit: string;
  direction: KpiDirection;
  status: KpiStatus;
}

const emptyForm = (defaultKraId: string): KpiFormState => ({
  name: '',
  code: '',
  kraId: defaultKraId,
  unit: '%',
  direction: 'Higher is better',
  status: 'Draft'
});

const formFromItem = (item: KpiItem): KpiFormState => ({
  name: item.name,
  code: item.code,
  kraId: item.kraId,
  unit: item.unit,
  direction: item.direction,
  status: item.status
});

export const KpisPage: React.FC<KpisPageProps> = ({
  metrics,
  resultAreas,
  onUpdateMetrics,
  onUpdateResultAreas,
  onNavigate,
  onShowToast,
  embedded = false
}) => {
  const defaultKraId = resultAreas[0]?.id || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kraFilter, setKraFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; id?: string } | null>(null);
  const [form, setForm] = useState<KpiFormState>(() => emptyForm(defaultKraId));
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<KpiItem | null>(null);
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

  const filtered = metrics.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.kraName.toLowerCase().includes(q) ||
      m.unit.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesKra = kraFilter === 'all' || m.kraId === kraFilter;
    return matchesSearch && matchesStatus && matchesKra;
  });

  const openCreate = () => {
    if (resultAreas.length === 0) {
      onShowToast?.('info', 'Add a result area first', 'Metrics must be linked to a result area.');
      onNavigate('/performance/settings/result-areas');
      return;
    }
    setForm(emptyForm(resultAreas[0].id));
    setFormError('');
    setEditor({ mode: 'create' });
  };

  const openEdit = (item: KpiItem) => {
    setOpenMenuId(null);
    setForm(formFromItem(item));
    setFormError('');
    setEditor({ mode: 'edit', id: item.id });
  };

  const syncResultAreaCounts = (nextMetrics: KpiItem[]) => {
    onUpdateResultAreas(withLinkedMetricCounts(resultAreas, nextMetrics));
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
    if (!form.kraId) {
      setFormError('Select a result area.');
      return;
    }
    if (!form.unit.trim()) {
      setFormError('Unit is required.');
      return;
    }

    const code = form.code.trim().toUpperCase();
    const duplicate = metrics.some((m) => m.code.toUpperCase() === code && m.id !== editor?.id);
    if (duplicate) {
      setFormError('Another metric already uses this code.');
      return;
    }

    const kra = resultAreas.find((k) => k.id === form.kraId);
    if (!kra) {
      setFormError('Selected result area was not found.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      code,
      kraId: kra.id,
      kraName: kra.name,
      unit: form.unit.trim(),
      frequency: (editor?.mode === 'edit' && editor.id ? metrics.find((m) => m.id === editor.id)?.frequency : undefined) || 'Monthly',
      direction: form.direction,
      status: form.status
    };

    if (editor?.mode === 'edit' && editor.id) {
      const next = metrics.map((m) => (m.id === editor.id ? { ...m, ...payload } : m));
      onUpdateMetrics(next);
      syncResultAreaCounts(next);
      onShowToast?.('success', 'Metric updated', `"${payload.name}" was saved.`);
    } else {
      const created: KpiItem = { id: `kpi-${Date.now()}`, ...payload };
      const next = [created, ...metrics];
      onUpdateMetrics(next);
      syncResultAreaCounts(next);
      onShowToast?.('success', 'Metric added', `"${payload.name}" was created.`);
    }
    setEditor(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const next = metrics.filter((m) => m.id !== deleteTarget.id);
    onUpdateMetrics(next);
    syncResultAreaCounts(next);
    onShowToast?.('success', 'Metric deleted', `"${deleteTarget.name}" was removed.`);
    setDeleteTarget(null);
  };

  return (
    <div className={embedded ? 'settings-embedded-panel' : 'perf-module-page animate-fade-in'}>
      <div className="settings-embedded-header">
        <div>
          <h2 className="settings-embedded-title">Metrics</h2>
          <p className="settings-embedded-subtitle">
            How success is measured for each result area — unit and direction.
          </p>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-primary"
          style={{ padding: '8px 14px', gap: 6 }}
          onClick={openCreate}
        >
          <Plus size={14} />
          <span>Add metric</span>
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
                placeholder="Search metrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="emp-filter-select"
              value={kraFilter}
              onChange={(e) => setKraFilter(e.target.value)}
            >
              <option value="all">Result area: All</option>
              {resultAreas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
            <select
              className="emp-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Status: All</option>
              {KPI_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> of {metrics.length}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="settings-inline-placeholder">
            <Gauge size={26} style={{ marginBottom: 8, color: 'var(--text-disabled)' }} />
            <p style={{ margin: 0 }}>No metrics yet. Add one linked to a result area.</p>
          </div>
        ) : (
          <div className="emp-table-card">
            <div className="emp-table-wrap">
              <table className="emp-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Metric</th>
                    <th>Result area</th>
                    <th>Unit</th>
                    <th>Success means</th>
                    <th>Status</th>
                    <th style={{ width: 70, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const isMenuOpen = openMenuId === m.id;
                    return (
                      <tr key={m.id}>
                        <td>
                          <span style={{ fontWeight: 600 }}>{m.code}</span>
                        </td>
                        <td>
                          <span className="emp-name-title" onClick={() => openEdit(m)}>
                            {m.name}
                          </span>
                        </td>
                        <td>{m.kraName}</td>
                        <td>{m.unit}</td>
                        <td>{m.direction}</td>
                        <td>
                          <span
                            className={`pms-badge ${
                              m.status === 'Active'
                                ? 'badge-success'
                                : m.status === 'Draft'
                                  ? 'badge-warning'
                                  : 'badge-neutral'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <button
                            type="button"
                            className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                            style={{ margin: '0 auto', width: 28, height: 28 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : m.id);
                            }}
                            aria-label={`Actions for ${m.name}`}
                          >
                            <MoreVertical size={14} />
                          </button>
                          {isMenuOpen && (
                            <div
                              className="more-dropdown-menu"
                              ref={menuRef}
                              style={{ right: 8, top: '80%', zIndex: 90 }}
                            >
                              <button type="button" className="more-menu-item" onClick={() => openEdit(m)}>
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="more-menu-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onNavigate('/performance/settings/result-areas');
                                }}
                              >
                                <ArrowRight size={13} />
                                <span>Open result areas</span>
                              </button>
                              <button
                                type="button"
                                className="more-menu-item danger-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setDeleteTarget(m);
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
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">{editor.mode === 'create' ? 'Add metric' : 'Edit metric'}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setEditor(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-grid-2">
                <div className="form-field-group" style={{ gridColumn: '1 / -1' }}>
                  <span className="form-field-label">
                    Name <span className="required-asterisk">*</span>
                  </span>
                  <input
                    className="form-input-text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. New ARR"
                  />
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">
                    Code <span className="required-asterisk">*</span>
                  </span>
                  <input
                    className="form-input-text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. M-ARR"
                  />
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">
                    Result area <span className="required-asterisk">*</span>
                  </span>
                  <select
                    className="form-input-select"
                    value={form.kraId}
                    onChange={(e) => setForm({ ...form, kraId: e.target.value })}
                  >
                    {resultAreas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">
                    Unit <span className="required-asterisk">*</span>
                  </span>
                  <select
                    className="form-input-select"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    {!KPI_UNITS.includes(form.unit) && form.unit && (
                      <option value={form.unit}>{form.unit}</option>
                    )}
                    {KPI_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <span className="form-field-label">Success means</span>
                  <select
                    className="form-input-select"
                    value={form.direction}
                    onChange={(e) => setForm({ ...form, direction: e.target.value as KpiDirection })}
                  >
                    {KPI_DIRECTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field-group">
                  <span className="form-field-label">Status</span>
                  <select
                    className="form-input-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as KpiStatus })}
                  >
                    {KPI_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
                <h3 className="modal-title">Delete metric?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Delete <strong>{deleteTarget.name}</strong>? This cannot be undone in this session.
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
    </div>
  );
};
