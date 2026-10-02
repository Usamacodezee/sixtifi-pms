import React, { useMemo, useState } from 'react';
import {
  TeamGoal,
  TeamMemberGoalRow,
  OverallGoal,
  summarizeGoalStats
} from '../../data/mockGoalsModule';
import { Company } from '../../data/mockCompanies';
import { GoalStatus } from '../../types/performance';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Users,
  Search,
  X,
  Link2,
  Layers
} from 'lucide-react';

export interface TeamGoalsTabProps {
  company: Company;
  teamGoals: TeamGoal[];
  memberGoalRows: TeamMemberGoalRow[];
  overallGoals: OverallGoal[];
  onNavigate: (route: string) => void;
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

export const TeamGoalsTab: React.FC<TeamGoalsTabProps> = ({
  company,
  teamGoals,
  memberGoalRows,
  overallGoals,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'team' | 'people'>('team');

  const stats = useMemo(() => summarizeGoalStats(teamGoals), [teamGoals]);
  const departments = useMemo(
    () => Array.from(new Set(teamGoals.map((g) => g.department))).sort(),
    [teamGoals]
  );

  const parentTitle = (parentId?: string) =>
    overallGoals.find((g) => g.id === parentId)?.title;

  const filteredTeamGoals = teamGoals.filter((g) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      g.title.toLowerCase().includes(q) ||
      g.teamName.toLowerCase().includes(q) ||
      g.department.toLowerCase().includes(q) ||
      g.owner.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || g.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = deptFilter === 'all' || g.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const filteredPeople = memberGoalRows.filter((row) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      row.employeeName.toLowerCase().includes(q) ||
      row.goalTitle.toLowerCase().includes(q) ||
      row.department.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || row.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = deptFilter === 'all' || row.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDeptFilter('all');
  };

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || deptFilter !== 'all';

  return (
    <div className="goals-tab-panel">
      <div className="goals-section-head">
        <div>
          <h3 className="goals-section-title">Team Goals</h3>
          <p className="goals-section-sub">
            Department and team objectives for <strong>{company.name}</strong>, plus individual
            goals across your reports.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className={`pms-btn ${viewMode === 'team' ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
            style={{ padding: '7px 12px', fontSize: '0.75rem', gap: 6 }}
            onClick={() => setViewMode('team')}
          >
            <Layers size={13} />
            Team OKRs
          </button>
          <button
            type="button"
            className={`pms-btn ${viewMode === 'people' ? 'pms-btn-primary' : 'pms-btn-secondary'}`}
            style={{ padding: '7px 12px', fontSize: '0.75rem', gap: 6 }}
            onClick={() => setViewMode('people')}
          >
            <Users size={13} />
            People Goals
          </button>
        </div>
      </div>

      <div className="goals-summary-grid">
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">Team Goals</span>
            <span className="goals-stat-val">{stats.total}</span>
          </div>
          <div className="goals-stat-icon blue">
            <Target size={18} />
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
        <div className="goals-stat-card">
          <div>
            <span className="goals-stat-label">People Goals</span>
            <span className="goals-stat-val">{memberGoalRows.length}</span>
          </div>
          <div className="goals-stat-icon slate">
            <Users size={18} />
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
              placeholder={viewMode === 'team' ? 'Search team goals...' : 'Search people goals...'}
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
          <select
            className="goals-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {isFiltered && (
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
      </div>

      <div className="goals-table-card">
        {viewMode === 'team' ? (
          filteredTeamGoals.length === 0 ? (
            <div className="goals-empty">
              <div className="goals-empty-icon">
                <Layers size={22} />
              </div>
              <h3 style={{ margin: 0, fontSize: '0.95rem' }}>No team goals</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360 }}>
                No team-level goals for {company.name} match your filters.
              </p>
            </div>
          ) : (
            <div className="goals-table-wrap">
              <table className="goals-table">
                <thead>
                  <tr>
                    <th>Team Goal</th>
                    <th>Team</th>
                    <th>Owner</th>
                    <th>Aligned To</th>
                    <th>Progress</th>
                    <th>Members</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeamGoals.map((goal) => {
                    const parent = parentTitle(goal.parentOverallGoalId);
                    return (
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
                              {goal.teamName}
                            </span>
                            <span className="goals-title-sub">{goal.department}</span>
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
                        <td>
                          {parent ? (
                            <span className="goals-align-chip" title={parent}>
                              <Link2 size={11} />
                              {parent.length > 28 ? `${parent.slice(0, 28)}…` : parent}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                              Not linked
                            </span>
                          )}
                        </td>
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
                        <td>{goal.memberCount}</td>
                        <td>{statusBadge(goal.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : filteredPeople.length === 0 ? (
          <div className="goals-empty">
            <div className="goals-empty-icon">
              <Users size={22} />
            </div>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>No people goals</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: 360 }}>
              No individual goals for {company.name} match your filters.
            </p>
          </div>
        ) : (
          <div className="goals-table-wrap">
            <table className="goals-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 20 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPeople.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="goals-person-cell">
                        <div
                          className="goals-avatar"
                          style={{ background: row.avatarBg || '#E0F2FE' }}
                        >
                          {row.initials}
                        </div>
                        <div>
                          <div className="goals-person-name">{row.employeeName}</div>
                          <div className="goals-person-meta">
                            {row.employeeCode} · {row.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="goals-title-main">{row.goalTitle}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.target}</td>
                    <td>
                      <div className="goals-progress-cell">
                        <span className="goals-progress-label">{row.progress}%</span>
                        <div className="goals-progress-track">
                          <div
                            className={`goals-progress-fill ${progressClass(row.status)}`}
                            style={{ width: `${Math.min(100, row.progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{row.weight}%</td>
                    <td>{statusBadge(row.status)}</td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button
                        type="button"
                        className="pms-btn pms-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                        onClick={() => onNavigate(`/performance/my-team/${row.employeeId}/goals`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
