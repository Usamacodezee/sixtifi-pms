import React, { useMemo, useState } from 'react';
import {
  OverallGoal,
  summarizeGoalStats,
  calculateGoalStatus,
  getAssignableEmployees
} from '../../data/mockGoalsModule';
import { Company } from '../../data/mockCompanies';
import { GoalStatus, UserRole } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import { CreateGoalModal, CreateGoalFormValues } from './CreateGoalModal';
import {
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Plus,
  Link2,
  Target
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
  const canManage = currentUserRole === 'HR/Admin' || currentUserRole === 'Manager';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);

  const stats = useMemo(() => summarizeGoalStats(goals), [goals]);
  const cycleAssignees = useMemo(() => getAssignableEmployees(company.id), [company.id]);

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

  const handleCreateSubmit = (values: CreateGoalFormValues) => {
    const chosenPerson = cycleAssignees.find((a) => a.id === values.assigneeId);
    const ownerName = chosenPerson ? chosenPerson.name : (values.owner || 'Rahul Shah');
    const ownerRole = chosenPerson ? chosenPerson.designation : (values.ownerRole || 'Leadership');

    const goal: OverallGoal = {
      id: `og-${Date.now()}`,
      companyId: company.id,
      title: values.title.trim(),
      description: values.description.trim() || 'Company strategic objective.',
      owner: ownerName,
      ownerRole: ownerRole,
      target: values.target.trim(),
      currentAchievement: '0',
      progress: 0,
      weight: Math.min(100, Math.max(1, Number(values.weight) || 10)),
      startDate: '01 Apr 2026',
      dueDate: values.dueDate || '31 Mar 2027',
      status: calculateGoalStatus(0),
      linkedTeamGoalIds: [],
      history: []
    };

    onCreateGoal(goal);
    setShowCreate(false);
    onShowToast?.(
      'success',
      'Company goal created',
      `"${goal.title}" assigned to ${ownerName} for ${company.name}.`
    );
  };

  return (
    <div className="goals-tab-panel">
      <div className="goals-section-head">
        <div>
          <h3 className="goals-section-title">Overall / Company Goals</h3>
          <p className="goals-section-sub">
            Strategic objectives for <strong>{company.name}</strong>. Assignable to leads and team members within cycle scope.
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
                  <th>Owner / Assignee</th>
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
                        {goal.linkedTeamGoalIds ? goal.linkedTeamGoalIds.length : 0} teams
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
        <CreateGoalModal
          mode="overall"
          companyName={company.name}
          selfName="Rahul Shah"
          assignees={cycleAssignees}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
};
