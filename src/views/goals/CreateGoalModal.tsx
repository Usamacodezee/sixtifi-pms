import React, { useState } from 'react';
import { Info, X, Layers, Gauge, Paperclip, UploadCloud, FileText } from 'lucide-react';
import { MOCK_KRAS, MOCK_KPIS, KraItem, KpiItem } from '../../data/mockPerformanceModules';

export type CreateGoalMode = 'my' | 'team' | 'overall';

export interface TeamAssigneeOption {
  id: string;
  name: string;
  employeeCode: string;
  designation: string;
  department: string;
  initials: string;
  avatarBg?: string;
}

export interface CreateGoalFormValues {
  title: string;
  description: string;
  target: string;
  weight: number;
  dueDate: string;
  /** Company goal owner, or locked self for Mine */
  owner: string;
  ownerRole: string;
  /** Team assignee employee id */
  assigneeId: string;
  kraId?: string;
  kraName?: string;
  kpiId?: string;
  kpiName?: string;
  attachmentName?: string;
}

export interface CreateGoalModalProps {
  mode: CreateGoalMode;
  companyName: string;
  selfName: string;
  assignees: TeamAssigneeOption[];
  resultAreas?: KraItem[];
  metrics?: KpiItem[];
  onClose: () => void;
  onSubmit: (values: CreateGoalFormValues) => void;
}

const DEFAULT_DUE = '31 Mar 2027';

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  mode,
  companyName,
  selfName,
  assignees,
  resultAreas = MOCK_KRAS,
  metrics = MOCK_KPIS,
  onClose,
  onSubmit
}) => {
  const activeKras = resultAreas.filter((k) => k.status !== 'Archived');
  const initialKra = activeKras[0] || resultAreas[0];
  const activeKpisForKra = metrics.filter(
    (m) => m.kraId === initialKra?.id && m.status !== 'Archived'
  );
  const initialKpi = activeKpisForKra[0] || metrics[0];

  const [selectedKraId, setSelectedKraId] = useState<string>(initialKra?.id || '');
  const [selectedKpiId, setSelectedKpiId] = useState<string>(initialKpi?.id || '');
  const [attachmentName, setAttachmentName] = useState<string>('');

  const currentKra = resultAreas.find((k) => k.id === selectedKraId) || initialKra;
  const kpisForSelectedKra = metrics.filter((m) => m.kraId === selectedKraId);
  const currentKpi = metrics.find((m) => m.id === selectedKpiId) || kpisForSelectedKra[0] || initialKpi;

  const [form, setForm] = useState<CreateGoalFormValues>({
    title: currentKpi ? `${currentKpi.name}` : '',
    description: currentKra?.description || '',
    target: currentKpi ? `100 ${currentKpi.unit}` : '',
    weight: currentKra?.weightHint || 20,
    dueDate: DEFAULT_DUE,
    owner: mode === 'overall' ? '' : selfName,
    ownerRole: mode === 'overall' ? 'Leadership' : 'Employee',
    assigneeId: assignees[0]?.id || '',
    kraId: currentKra?.id || '',
    kraName: currentKra?.name || '',
    kpiId: currentKpi?.id || '',
    kpiName: currentKpi?.name || '',
    attachmentName: ''
  });

  // Handle Kra Change
  const handleKraChange = (kraId: string) => {
    setSelectedKraId(kraId);
    const kra = resultAreas.find((k) => k.id === kraId);
    const linkedKpis = metrics.filter((m) => m.kraId === kraId);
    const firstKpi = linkedKpis[0];
    if (firstKpi) {
      setSelectedKpiId(firstKpi.id);
    }

    setForm((prev) => ({
      ...prev,
      kraId: kraId,
      kraName: kra?.name || '',
      kpiId: firstKpi?.id || '',
      kpiName: firstKpi?.name || '',
      title: firstKpi ? `${firstKpi.name}` : prev.title,
      description: kra?.description || prev.description,
      weight: kra?.weightHint || prev.weight,
      target: firstKpi ? `100 ${firstKpi.unit}` : prev.target
    }));
  };

  // Handle Kpi Change
  const handleKpiChange = (kpiId: string) => {
    setSelectedKpiId(kpiId);
    const kpi = metrics.find((m) => m.id === kpiId);
    setForm((prev) => ({
      ...prev,
      kpiId,
      kpiName: kpi?.name || '',
      title: kpi ? `${kpi.name}` : prev.title,
      target: kpi ? `100 ${kpi.unit}` : prev.target
    }));
  };

  const titleByMode =
    mode === 'my' ? 'Add my goal' : mode === 'team' ? 'Add team goal' : 'Add company goal';

  const subtitleByMode =
    mode === 'my'
      ? `Assigned only to you (${selfName}) at ${companyName}.`
      : mode === 'team'
        ? `Assign this goal to a team member at ${companyName}.`
        : `Company-wide objective for ${companyName}.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.target.trim()) return;
    if (mode === 'overall' && !form.owner.trim()) return;
    if (mode === 'team' && !form.assigneeId) return;
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      target: form.target.trim(),
      owner: form.owner.trim() || selfName,
      weight: Math.min(100, Math.max(1, Number(form.weight) || 10)),
      attachmentName: attachmentName || undefined
    });
  };

  return (
    <div className="goals-create-modal-backdrop" onClick={onClose}>
      <div
        className="goals-create-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-goal-title"
        style={{ maxWidth: '580px' }}
      >
        <div className="goals-create-modal-head">
          <div>
            <h3 id="create-goal-title">{titleByMode}</h3>
            <p>{subtitleByMode}</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="goals-form-grid">
            {/* 1. Select Result Area (KRA) */}
            <div className="goals-form-field full">
              <label htmlFor="cg-kra" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <Layers size={14} color="#0284C7" />
                <span>Result Area (KRA) *</span>
              </label>
              <select
                id="cg-kra"
                value={selectedKraId}
                onChange={(e) => handleKraChange(e.target.value)}
                required
              >
                {activeKras.map((k) => (
                  <option key={k.id} value={k.id}>
                    [{k.code}] {k.name} ({k.department} Dept)
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Select Metric (KPI) */}
            <div className="goals-form-field full">
              <label htmlFor="cg-kpi" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <Gauge size={14} color="#7C3AED" />
                <span>Metric (KPI) *</span>
              </label>
              <select
                id="cg-kpi"
                value={selectedKpiId}
                onChange={(e) => handleKpiChange(e.target.value)}
                required
              >
                {kpisForSelectedKra.length === 0 ? (
                  <option value="">No metrics configured for this result area</option>
                ) : (
                  kpisForSelectedKra.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.code}] {m.name} · Unit: {m.unit} ({m.direction})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Context Strip showing configuration */}
            {currentKra && currentKpi && (
              <div
                className="goals-form-field full"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <strong>Aligned Standard:</strong> {currentKra.name} &rarr; <strong>{currentKpi.name}</strong> ({currentKpi.unit}, {currentKpi.frequency}, {currentKpi.direction})
              </div>
            )}

            {/* Title */}
            <div className="goals-form-field full">
              <label htmlFor="cg-title">Goal Title *</label>
              <input
                id="cg-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Increase recurring sales revenue"
                required
              />
            </div>

            {/* Description */}
            <div className="goals-form-field full">
              <label htmlFor="cg-desc">Description</label>
              <textarea
                id="cg-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Key achievement objectives and outcome expectations"
              />
            </div>

            {mode === 'my' && (
              <div className="goals-form-field full">
                <label>Assigned to</label>
                <input value={selfName} disabled readOnly />
                <span className="goals-field-hint">Mine goals are assigned to you only.</span>
              </div>
            )}

            {mode === 'team' && (
              <div className="goals-form-field full">
                <label htmlFor="cg-assignee">Assign to *</label>
                <select
                  id="cg-assignee"
                  value={form.assigneeId}
                  onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
                  required
                >
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.designation} ({a.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'overall' && (
              <>
                <div className="goals-form-field">
                  <label htmlFor="cg-owner">Owner *</label>
                  <input
                    id="cg-owner"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    placeholder="Executive owner"
                    required
                  />
                </div>
                <div className="goals-form-field">
                  <label htmlFor="cg-owner-role">Owner role</label>
                  <input
                    id="cg-owner-role"
                    value={form.ownerRole}
                    onChange={(e) => setForm({ ...form, ownerRole: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="goals-form-field">
              <label htmlFor="cg-target">Target Metric Value *</label>
              <input
                id="cg-target"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder={currentKpi ? `e.g. 100 ${currentKpi.unit}` : 'e.g. 90% or ₹1 Crore'}
                required
              />
            </div>

            <div className="goals-form-field">
              <label htmlFor="cg-due">Target Due Date</label>
              <input
                id="cg-due"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            <div className="goals-form-field full">
              <label htmlFor="cg-weight">Appraisal Weight (%)</label>
              <input
                id="cg-weight"
                type="number"
                min={1}
                max={100}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
              />
              <div className="goals-weight-explain">
                <Info size={14} />
                <p>
                  <strong>Appraisal Weight</strong> dictates how much this goal counts in final performance scoring. Suggested weight pre-populated from <strong>{currentKra?.name}</strong> ({currentKra?.weightHint}%).
                </p>
              </div>
            </div>

            {/* Attachment Support */}
            <div className="goals-form-field full">
              <label htmlFor="cg-attachment" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <Paperclip size={14} color="#0284C7" />
                <span>Supporting Attachment (Optional)</span>
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  id="cg-attachment"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAttachmentName(file.name);
                    }
                  }}
                />
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 6 }}
                  onClick={() => document.getElementById('cg-attachment')?.click()}
                >
                  <UploadCloud size={14} />
                  <span>{attachmentName ? 'Change File' : 'Upload Attachment'}</span>
                </button>
                {attachmentName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#0284C7', background: '#E0F2FE', border: '1px solid #BAE6FD', padding: '4px 10px', borderRadius: 4 }}>
                    <FileText size={13} />
                    <span>{attachmentName}</span>
                    <button
                      type="button"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, marginLeft: 4, color: '#0369A1' }}
                      onClick={() => setAttachmentName('')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="goals-modal-actions">
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '8px 14px' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pms-btn pms-btn-primary"
              style={{ padding: '8px 14px' }}
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
