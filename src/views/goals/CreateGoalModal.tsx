import React, { useState } from 'react';
import { Info, X, Layers, Gauge, Paperclip, UploadCloud, FileText, UserCheck, User, Calendar } from 'lucide-react';
import { MOCK_KRAS, MOCK_KPIS, KraItem, KpiItem } from '../../data/mockPerformanceModules';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import { PerformanceCycle } from '../../types/performance';

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
  /** Company goal owner or assigned name */
  owner: string;
  ownerRole: string;
  /** Goal assignee employee id */
  assigneeId: string;
  /** Performance Cycle identification */
  cycleId: string;
  cycleName: string;
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
  cycles?: PerformanceCycle[];
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
  cycles = MOCK_PERFORMANCE_CYCLES,
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

  const activeCycles = cycles.filter((c) => c.status !== 'Draft');
  const initialCycle = activeCycles[0] || cycles[0];

  const [selectedKraId, setSelectedKraId] = useState<string>(initialKra?.id || '');
  const [selectedKpiId, setSelectedKpiId] = useState<string>(initialKpi?.id || '');
  const [attachmentName, setAttachmentName] = useState<string>('');

  const currentKra = resultAreas.find((k) => k.id === selectedKraId) || initialKra;
  const kpisForSelectedKra = metrics.filter((m) => m.kraId === selectedKraId);
  const currentKpi = metrics.find((m) => m.id === selectedKpiId) || kpisForSelectedKra[0] || initialKpi;

  // Find self assignee option if present, or first cycle assignee
  const selfAssignee = assignees.find((a) => a.name.toLowerCase() === selfName.toLowerCase());
  const defaultCycleAssignee = assignees[0];

  const initialAssigneeId = mode === 'my'
    ? (selfAssignee?.id || 'self-id')
    : (defaultCycleAssignee?.id || '');

  const initialOwnerName = mode === 'my'
    ? selfName
    : (defaultCycleAssignee?.name || selfName);

  const initialOwnerRole = mode === 'my'
    ? 'Employee'
    : (defaultCycleAssignee?.designation || 'Team Member');

  const [form, setForm] = useState<CreateGoalFormValues>({
    title: currentKpi ? `${currentKpi.name}` : '',
    description: currentKra?.description || '',
    target: currentKpi ? `100 ${currentKpi.unit}` : '',
    weight: currentKra?.weightHint || 20,
    dueDate: DEFAULT_DUE,
    owner: initialOwnerName,
    ownerRole: initialOwnerRole,
    assigneeId: initialAssigneeId,
    cycleId: initialCycle?.id || 'cycle-1',
    cycleName: initialCycle?.name || 'FY 2026–27 Annual Performance Review',
    kraId: currentKra?.id || '',
    kraName: currentKra?.name || '',
    kpiId: currentKpi?.id || '',
    kpiName: currentKpi?.name || '',
    attachmentName: ''
  });

  // Handle KRA Change
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

  // Handle KPI Change
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
    mode === 'my' ? 'Add My Goal' : mode === 'team' ? 'Add Team Goal' : 'Add Company Goal';

  const subtitleByMode =
    mode === 'my'
      ? `Assigned only to yourself (${selfName}) for ${companyName}.`
      : mode === 'team'
        ? `Assign a team goal to an employee within the performance cycle scope at ${companyName}.`
        : `Assign a company goal to an owner / lead within the performance cycle scope at ${companyName}.`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.target.trim()) return;

    if (mode === 'my') {
      onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        target: form.target.trim(),
        owner: selfName,
        ownerRole: 'Employee',
        assigneeId: selfAssignee?.id || 'self-id',
        weight: Math.min(100, Math.max(1, Number(form.weight) || 10)),
        attachmentName: attachmentName || undefined
      });
      return;
    }

    // Team or Company (Overall) Goal: Assignee selected from cycle scope
    if (!form.assigneeId) return;
    const selectedAssignee = assignees.find((a) => a.id === form.assigneeId) || defaultCycleAssignee;

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      target: form.target.trim(),
      owner: selectedAssignee ? selectedAssignee.name : form.owner || selfName,
      ownerRole: selectedAssignee ? selectedAssignee.designation : form.ownerRole || 'Leadership',
      assigneeId: selectedAssignee ? selectedAssignee.id : form.assigneeId,
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
        style={{ maxWidth: '600px' }}
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
            {/* 0. Select Performance Cycle */}
            <div className="goals-form-field full">
              <label htmlFor="cg-cycle" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                <Calendar size={14} color="#6366F1" />
                <span>Performance Cycle *</span>
              </label>
              <select
                id="cg-cycle"
                value={form.cycleId}
                onChange={(e) => {
                  const selId = e.target.value;
                  const cyc = cycles.find((c) => c.id === selId);
                  setForm((prev) => ({
                    ...prev,
                    cycleId: selId,
                    cycleName: cyc ? cyc.name : prev.cycleName
                  }));
                }}
                required
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.status}) · {c.duration}
                  </option>
                ))}
              </select>
              <span className="goals-field-hint" style={{ marginTop: 2, fontSize: '0.73rem', color: '#64748B' }}>
                Cycle identification attaches this goal to an active performance evaluation window.
              </span>
            </div>

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

            {/* Goal Title */}
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

            {/* Assignee Field Rules:
                - mode === 'my': Lock assignee to myself only.
                - mode === 'team' | 'overall': Assignee selected from cycle scope assignees.
            */}
            {mode === 'my' ? (
              <div className="goals-form-field full">
                <label htmlFor="cg-assignee-self" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <User size={14} color="#2563EB" />
                  <span>Assignee *</span>
                </label>
                <input
                  id="cg-assignee-self"
                  value={`${selfName} (Myself)`}
                  disabled
                  readOnly
                  style={{
                    backgroundColor: 'var(--bg-secondary, #F8FAFC)',
                    color: 'var(--text-primary, #0F172A)',
                    cursor: 'not-allowed',
                    fontWeight: 600
                  }}
                />
                <span className="goals-field-hint" style={{ marginTop: 4, display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                  Goals created from &quot;My Goals&quot; are automatically assigned to yourself only.
                </span>
              </div>
            ) : (
              <div className="goals-form-field full">
                <label htmlFor="cg-assignee" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <UserCheck size={14} color="#059669" />
                  <span>{mode === 'overall' ? 'Goal Owner / Assignee (Cycle Scope) *' : 'Goal Assignee (Cycle Scope) *'}</span>
                </label>
                <select
                  id="cg-assignee"
                  value={form.assigneeId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const found = assignees.find((a) => a.id === selId);
                    setForm((prev) => ({
                      ...prev,
                      assigneeId: selId,
                      owner: found ? found.name : prev.owner,
                      ownerRole: found ? found.designation : prev.ownerRole
                    }));
                  }}
                  required
                >
                  {assignees.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.designation} ({a.department})
                    </option>
                  ))}
                </select>
                <span className="goals-field-hint" style={{ marginTop: 4, display: 'block', fontSize: '0.75rem', color: '#64748B' }}>
                  {mode === 'overall'
                    ? 'Select any lead, executive, or employee within the scope of this cycle.'
                    : 'Select any team member or employee within the scope of this cycle.'}
                </span>
              </div>
            )}

            {/* Target Value */}
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

            {/* Due Date */}
            <div className="goals-form-field">
              <label htmlFor="cg-due">Target Due Date</label>
              <input
                id="cg-due"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>

            {/* Weight */}
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
