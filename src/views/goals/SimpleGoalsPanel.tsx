import React, { useMemo, useState } from 'react';
import { GoalStatus } from '../../types/performance';
import { Search, Plus, Calendar } from 'lucide-react';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';

export interface SimpleGoalCard {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  target?: string;
  current?: string;
  progress: number;
  status: GoalStatus;
  dueDate?: string;
  weight?: number;
  cycleId?: string;
  cycleName?: string;
}

export interface SimpleGoalsPanelProps {
  goals: SimpleGoalCard[];
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyHint?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onOpenGoal?: (goalId: string) => void;
  onUpdateGoal?: (goalId: string) => void;
  showUpdate?: boolean;
  /** Extra column label for meta (e.g. Assignee / Owner) */
  metaColumnLabel?: string;
}

const STATUS_CHIPS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'On Track', label: 'On Track' },
  { id: 'At Risk', label: 'At Risk' },
  { id: 'Needs Attention', label: 'Needs Attention' },
  { id: 'Completed', label: 'Done' }
];

const badgeFor = (status: GoalStatus) => {
  if (status === 'On Track' || status === 'Completed') {
    return <span className="pms-badge badge-success">{status === 'Completed' ? 'Done' : status}</span>;
  }
  if (status === 'At Risk') return <span className="pms-badge badge-warning">At Risk</span>;
  return <span className="pms-badge badge-danger">Needs Attention</span>;
};

const fillClass = (status: GoalStatus) => {
  if (status === 'Completed') return 'is-done';
  if (status === 'At Risk') return 'is-risk';
  if (status === 'Needs Attention') return 'is-bad';
  return '';
};

export const SimpleGoalsPanel: React.FC<SimpleGoalsPanelProps> = ({
  goals,
  searchPlaceholder = 'Search goals…',
  emptyTitle = 'No goals yet',
  emptyHint = 'Nothing to show for this view.',
  primaryActionLabel,
  onPrimaryAction,
  onOpenGoal,
  onUpdateGoal,
  showUpdate = false,
  metaColumnLabel
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');

  const showMeta = goals.some((g) => !!g.meta);

  // Extract unique cycles from goals or mock cycles list
  const cycleOptions = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_PERFORMANCE_CYCLES.forEach((c) => map.set(c.id, c.name));
    goals.forEach((g) => {
      if (g.cycleId && g.cycleName) {
        map.set(g.cycleId, g.cycleName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [goals]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return goals.filter((g) => {
      const matchQ =
        !q ||
        g.title.toLowerCase().includes(q) ||
        (g.description || '').toLowerCase().includes(q) ||
        (g.meta || '').toLowerCase().includes(q) ||
        (g.cycleName || '').toLowerCase().includes(q);

      const matchS = status === 'all' || g.status === status;
      const matchC = cycleFilter === 'all' || g.cycleId === cycleFilter || !g.cycleId;

      return matchQ && matchS && matchC;
    });
  }, [goals, search, status, cycleFilter]);

  return (
    <div className="sg-panel">
      <div className="sg-toolbar">
        <div className="sg-toolbar-left">
          {/* Search */}
          <div className="sg-search">
            <Search size={14} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </div>

          {/* Performance Cycle Filter Dropdown */}
          <select
            className="goals-company-select compact"
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            style={{ minWidth: 210 }}
            aria-label="Filter by Performance Cycle"
          >
            <option value="all">All Cycles</option>
            {cycleOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Chips */}
          <div className="sg-chips" role="tablist" aria-label="Filter by status">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                role="tab"
                aria-selected={status === chip.id}
                className={`sg-chip ${status === chip.id ? 'is-active' : ''}`}
                onClick={() => setStatus(chip.id)}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sg-toolbar-right">
          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 12px', fontSize: '0.78rem', gap: 6 }}
              onClick={onPrimaryAction}
            >
              <Plus size={14} />
              {primaryActionLabel}
            </button>
          )}
        </div>
      </div>

      <div className="goals-table-card">
        {filtered.length === 0 ? (
          <div className="sg-empty">
            <h3>{emptyTitle}</h3>
            <p>{emptyHint}</p>
            {primaryActionLabel && onPrimaryAction && (
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ marginTop: 10, padding: '7px 12px', fontSize: '0.78rem', gap: 6 }}
                onClick={onPrimaryAction}
              >
                <Plus size={14} />
                {primaryActionLabel}
              </button>
            )}
          </div>
        ) : (
          <div className="goals-table-wrap">
            <table className="goals-table">
              <thead>
                <tr>
                  <th>Goal &amp; Cycle</th>
                  {showMeta && <th>{metaColumnLabel || 'Owner'}</th>}
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 16 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((goal) => (
                  <tr key={goal.id}>
                    <td>
                      <div className="goals-title-cell">
                        <button
                          type="button"
                          className="goals-title-link"
                          onClick={() => onOpenGoal?.(goal.id)}
                          disabled={!onOpenGoal}
                        >
                          {goal.title}
                        </button>
                        {goal.description && (
                          <span className="goals-title-sub">{goal.description}</span>
                        )}
                        <div style={{ marginTop: 4 }}>
                          <span className="goals-cycle-tag">
                            <Calendar size={11} />
                            {goal.cycleName || 'FY 2026–27 Annual Performance Review'}
                          </span>
                        </div>
                      </div>
                    </td>
                    {showMeta && (
                      <td>
                        <span className="goals-meta-cell">{goal.meta || '—'}</span>
                      </td>
                    )}
                    <td>
                      <div className="goals-title-cell">
                        <span className="goals-title-main" style={{ fontWeight: 600 }}>
                          {goal.target || '—'}
                        </span>
                        {goal.current && (
                          <span className="goals-title-sub">Current: {goal.current}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="goals-progress-cell">
                        <span className="goals-progress-label">{goal.progress}%</span>
                        <div className="goals-progress-track">
                          <div
                            className={`goals-progress-fill ${fillClass(goal.status)}`}
                            style={{ width: `${Math.min(100, goal.progress)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{typeof goal.weight === 'number' ? `${goal.weight}%` : '—'}</td>
                    <td>{goal.dueDate || '—'}</td>
                    <td>{badgeFor(goal.status)}</td>
                    <td style={{ textAlign: 'right', paddingRight: 16 }}>
                      <div className="goals-row-actions">
                        {showUpdate && onUpdateGoal && (
                          <button
                            type="button"
                            className="pms-btn pms-btn-primary"
                            style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                            onClick={() => onUpdateGoal(goal.id)}
                          >
                            Update Progress
                          </button>
                        )}
                        {onOpenGoal && (
                          <button
                            type="button"
                            className="pms-btn pms-btn-secondary"
                            style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                            onClick={() => onOpenGoal(goal.id)}
                          >
                            View Details
                          </button>
                        )}
                      </div>
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
