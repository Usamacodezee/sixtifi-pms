import React, { useMemo, useState } from 'react';
import {
  OverallGoal,
  summarizeGoalStats,
  calculateGoalStatus
} from '../../data/mockGoalsModule';
import { Company } from '../../data/mockCompanies';
import { GoalStatus, UserRole } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  X,
  Plus,
  Building2,
  Link2
} from 'lucide-react';

export interface OverallGoalsTabProps {
  company: Company;
  goals: OverallGoal[];
  currentUserRole: UserRole;
  onCreateGoal: (goal: OverallGoal) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const statusBadge = (status: GoalStatus) => {
  switch (status) {
    case 'On Track':
      return <span className="pms-badge badge-success">On Track</span>;
    case 'Completed':
      return <span className="pms-badge badge-success">Completed</span>;
    case 'At Risk':
      return <span className="pms-badge badge-warning">At Risk</span>;
    case 'Needs Attention':
      return <span className="pms-badge badge-danger">Needs Attention</span>;
    default:
      return <span className="pms-badge badge-neutral">{status}</span>;
  }
};

const progressClass = (status: GoalStatus) => {
  if (status === 'Completed') return 'is-done';
  if (status === 'At Risk') return 'is-risk';
  if (status === 'Needs Attention') return 'is-bad';
  return '';
};

export const OverallGoalsTab: React.FC<OverallGoalsTabProps> = ({
  company,
  goals,
  currentUserRole,
  onCreateGoal,
  onShowToast
}) => {
  const canManage = currentUserRole === 'HR/Admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: '',
    ownerRole: 'Leadership',
    target: '',
    weight: 10,
    dueDate: '31 Mar 2027'
  });

  const stats = useMemo(() => summarizeGoalStats(goals), [goals]);

  const filtered = goals.filter((g) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.owner.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || g.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.target.trim() || !form.owner.trim()) {
      onShowToast?.('error', 'Missing fields', 'Title, owner, and target are required.');
      return;
    }
    const goal: OverallGoal = {
      id: `og-${Date.now()}`,
      companyId: company.id,
      title: form.title.trim(),
      description: form.description.trim() || 'Company strategic objective.',
      owner: form.owner.trim(),
      ownerRole: form.ownerRole.trim() || 'Leadership',
      target: form.target.trim(),
      currentAchievement: '0',
      progress: 0,
      weight: Math.min(100, Math.max(1, Number(form.weight) || 10)),
      startDate: '01 Apr 2026',
      dueDate: form.dueDate,
      status: calculateGoalStatus(0),
      linkedTeamGoalIds: [],
      history: []
    };
    onCreateGoal(goal);
    setShowCreate(false);
    setForm({
      title: '',
      description: '',
      owner: '',
      ownerRole: 'Leadership',
      target: '',
      weight: 10,
      dueDate: '31 Mar 2027'
    });
    onShowToast?.(
      'success',
      'Company goal created',
      `"${goal.title}" added for ${company.name}.`
    );
  };

  return (
    <div className="goals-tab-panel">
      <div className="goals-section-head">
        <div>
          <h3 className="goals-section-title">Overall / Company Goals</h3>
          <p className="goals-section-sub">
            Strategic objectives for <strong>{company.name}</strong>. Team and individual goals
            align upward to these.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            className="pms-btn pms-btn-primary"
            style={{ padding: '8px 14px', gap: 6, fontSize: '0.8rem' }}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={14} />
            <span>Add Company Goal</span>
          </button>
        )}
      </div>

      <div className="goals-summary-grid">
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">Company Goals</span>
            <span className="goals-stat-val">{stats.total}</span>
          </div>
          <div className="goals-stat-icon blue">
            <Building2 size={18} />
          </div>
        </div>
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">Avg Progress</span>
            <span className="goals-stat-val">{stats.avgProgress}%</span>
          </div>
          <div className="goals-stat-icon slate">
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">On Track</span>
            <span className="goals-stat-val" style={{ color: '#047857' }}>
              {stats.onTrack}
            </span>
          </div>
          <div className="goals-stat-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">At Risk</span>
            <span className="goals-stat-val" style={{ color: '#B45309' }}>
              {stats.atRisk + stats.needsAttention}
            </span>
          </div>
          <div className="goals-stat-icon amber">
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      <div className="goals-toolbar">
        <div className="goals-toolbar-left">
          <div className="goals-search-wrap">
            <Search size={14} className="goals-search-icon" />
            <input
              type="text"
              className="goals-search-input"
              placeholder="Search company goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="goals-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="on track">On Track</option>
            <option value="at risk">At Risk</option>
            <option value="needs attention">Needs Attention</option>
            <option value="completed">Completed</option>
          </select>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', gap: 4 }}
              onClick={clearFilters}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filtered.length}</strong> of {goals.length}
        </div>
      </div>

      <div className="goals-table-card">
        {filtered.length === 0 ? (
          <div className="goals-empty">
            <div className="goals-empty-icon">
              <Target size={22} />
            </div>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>No company goals</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360 }}>
              {canManage
                ? `Add the first strategic goal for ${company.name}.`
                : `No overall goals are published for ${company.name} yet.`}
            </p>
          </div>
        ) : (
          <div className="goals-table-wrap">
            <table className="goals-table">
              <thead>
                <tr>
                  <th>Company Goal</th>
                  <th>Owner</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Linked Teams</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((goal) => (
                  <tr key={goal.id}>
                    <td>
                      <div className="goals-title-cell">
                        <span className="goals-title-main">{goal.title}</span>
                        <span className="goals-title-sub">{goal.description}</span>
                      </div>
                    </td>
                    <td>
                      <div className="goals-title-cell">
                        <span className="goals-title-main" style={{ fontWeight: 600 }}>
                          {goal.owner}
                        </span>
                        <span className="goals-title-sub">{goal.ownerRole}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{goal.target}</td>
                    <td>
                      <div className="goals-progress-cell">
                        <span className="goals-progress-label">{goal.progress}%</span>
                        <div className="goals-progress-track">
                          <div
                            className={`goals-progress-fill ${progressClass(goal.status)}`}
                            style={{ width: `${Math.min(100, goal.progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{goal.weight}%</td>
                    <td>
                      <span className="goals-align-chip">
                        <Link2 size={11} />
                        {goal.linkedTeamGoalIds.length} teams
                      </span>
                    </td>
                    <td>{statusBadge(goal.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="goals-create-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div
            className="goals-create-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div>
              <h3>Add Company Goal</h3>
              <p>
                Creates an overall goal for <strong>{company.name}</strong> only.
              </p>
            </div>
            <div className="goals-form-grid">
              <div className="goals-form-field full">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Grow ARR to ₹50 Cr"
                />
              </div>
              <div className="goals-form-field full">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Strategic context and success criteria"
                />
              </div>
              <div className="goals-form-field">
                <label>Owner</label>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  placeholder="Executive owner"
                />
              </div>
              <div className="goals-form-field">
                <label>Owner Role</label>
                <input
                  value={form.ownerRole}
                  onChange={(e) => setForm({ ...form, ownerRole: e.target.value })}
                />
              </div>
              <div className="goals-form-field">
                <label>Target</label>
                <input
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  placeholder="Measurable target"
                />
              </div>
              <div className="goals-form-field">
                <label>Weight (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                />
              </div>
              <div className="goals-form-field full">
                <label>Due Date</label>
                <input
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="goals-modal-actions">
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '8px 14px' }}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ padding: '8px 14px' }}
                onClick={handleCreate}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
