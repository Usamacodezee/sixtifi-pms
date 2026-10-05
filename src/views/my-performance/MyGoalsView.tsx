import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { MyGoalItem, calculateGoalStatus } from '../../data/mockMyGoals';
import { GoalStatus } from '../../types/performance';
import { ToastType } from '../../components/ui/Toast';
import { UpdateProgressModal } from './UpdateProgressModal';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Calendar,
  ArrowLeft,
  Award,
  Edit3
} from 'lucide-react';
import './MyGoalsStyles.css';

export interface MyGoalsViewProps {
  goals: MyGoalItem[];
  onUpdateGoal: (goalId: string, updatedFields: {
    progress: number;
    currentAchievement: string;
    comment?: string;
    attachmentName?: string;
  }) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  /** When true, hide page header / cycle banner (used inside Goals module shell). */
  embedded?: boolean;
  /** Base path for goal detail navigation. */
  detailBasePath?: string;
}

export const MyGoalsView: React.FC<MyGoalsViewProps> = ({
  goals,
  onUpdateGoal,
  onNavigate,
  onShowToast,
  embedded = false,
  detailBasePath = '/performance/my-performance/goals'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [modalGoal, setModalGoal] = useState<MyGoalItem | null>(null);

  // Compute summary stats dynamically from goals list
  const totalCount = goals.length;
  const onTrackCount = goals.filter((g) => g.status === 'On Track').length;
  const atRiskCount = goals.filter((g) => g.status === 'At Risk').length;
  const completedCount = goals.filter((g) => g.status === 'Completed').length;

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

  // Filtered goals
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.currentAchievement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (goal.cycleName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || goal.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCycle =
      cycleFilter === 'all' || goal.cycleId === cycleFilter || !goal.cycleId;

    return matchesSearch && matchesStatus && matchesCycle;
  });

  const isFiltered = searchTerm !== '' || statusFilter !== 'all' || cycleFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCycleFilter('all');
  };

  const handleOpenUpdateModal = (goal: MyGoalItem) => {
    setModalGoal(goal);
  };

  const handleSaveProgress = (
    goalId: string,
    updatedFields: {
      progress: number;
      currentAchievement: string;
      comment?: string;
      attachmentName?: string;
    }
  ) => {
    onUpdateGoal(goalId, updatedFields);
    setModalGoal(null);
    if (onShowToast) {
      onShowToast('success', 'Goal progress updated successfully.', `New progress: ${updatedFields.progress}% (${updatedFields.currentAchievement})`);
    }
  };

  const renderStatusBadge = (status: GoalStatus) => {
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

  return (
    <div className={`my-goals-page ${embedded ? 'is-embedded' : ''}`}>
      {!embedded && (
        <PageHeader
          title="My Goals"
          subtitle="Track your goals, update progress, and monitor your performance across review cycles."
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'My Performance', href: '#/performance/my-performance' },
            { label: 'My Goals' }
          ]}
          actions={
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/my-performance')}
            >
              <ArrowLeft size={14} />
              <span>Back to My Performance</span>
            </button>
          }
        />
      )}

      {!embedded && (
      <div className="my-goals-cycle-banner">
        <div className="my-goals-banner-left">
          <div className="my-goals-banner-icon">
            <Calendar size={20} />
          </div>
          <div className="my-goals-banner-title-col">
            <div className="my-goals-banner-name">
              <span>FY 2026–27 Annual Performance Review</span>
              <span className="pms-badge badge-success">Active Cycle</span>
            </div>
            <div className="my-goals-banner-meta">
              <span>Period: 01 Apr 2026 – 31 Mar 2027</span>
              <span>•</span>
              <span>Manager: <strong>Vikram Patel</strong></span>
              <span>•</span>
              <span>Total Appraisal Weight: <strong>100%</strong></span>
            </div>
          </div>
        </div>

        <div className="my-goals-banner-right">
          <div className="my-goals-stage-tag">
            <span>Current Stage:</span>
            <strong style={{ color: 'var(--text-primary)' }}>Goal Execution &amp; Self Review</strong>
          </div>
        </div>
      </div>
      )}

      {/* 3. Summary (4 Compact Cards) */}
      <div className="my-goals-summary-grid">
        {/* Total Goals */}
        <div className="my-goals-stat-card">
          <div className="my-goals-stat-left">
            <span className="my-goals-stat-label">Total Goals</span>
            <span className="my-goals-stat-val">{totalCount}</span>
          </div>
          <div className="my-goals-stat-icon blue">
            <Target size={18} />
          </div>
        </div>

        {/* On Track */}
        <div className="my-goals-stat-card">
          <div className="my-goals-stat-left">
            <span className="my-goals-stat-label">On Track</span>
            <span className="my-goals-stat-val" style={{ color: '#047857' }}>
              {onTrackCount}
            </span>
          </div>
          <div className="my-goals-stat-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* At Risk */}
        <div className="my-goals-stat-card">
          <div className="my-goals-stat-left">
            <span className="my-goals-stat-label">At Risk</span>
            <span className="my-goals-stat-val" style={{ color: '#B45309' }}>
              {atRiskCount}
            </span>
          </div>
          <div className="my-goals-stat-icon amber">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Completed */}
        <div className="my-goals-stat-card">
          <div className="my-goals-stat-left">
            <span className="my-goals-stat-label">Completed</span>
            <span className="my-goals-stat-val" style={{ color: '#047857' }}>
              {completedCount}
            </span>
          </div>
          <div className="my-goals-stat-icon green">
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="my-goals-toolbar">
        <div className="my-goals-toolbar-left">
          {/* Search */}
          <div className="my-goals-search-wrap">
            <Search size={14} className="my-goals-search-icon" />
            <input
              type="text"
              className="my-goals-search-input"
              placeholder="Search goals or cycles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Performance Cycle Filter */}
          <select
            className="my-goals-filter-select"
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            style={{ minWidth: 200 }}
          >
            <option value="all">All Cycles</option>
            {cycleOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="my-goals-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="on track">On Track</option>
            <option value="at risk">At Risk</option>
            <option value="completed">Completed</option>
            <option value="needs attention">Needs Attention</option>
          </select>

          {/* Clear Filters */}
          {isFiltered && (
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', gap: '4px' }}
              onClick={clearFilters}
            >
              <X size={12} />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredGoals.length}</strong> of {totalCount} goals
        </div>
      </div>

      {/* 5. Goals Table / List */}
      <div className="my-goals-table-card">
        {filteredGoals.length === 0 ? (
          <div className="my-goals-empty-card">
            <div className="empty-icon-circle">
              <Target size={24} />
            </div>
            {isFiltered ? (
              <>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No matching goals found</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
                  No goals match &quot;{searchTerm || statusFilter}&quot;. Try adjusting your search query or clear the filter.
                </p>
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ marginTop: 6 }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No goals assigned</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
                  You don&apos;t have any performance goals assigned for this cycle.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="my-goals-table-wrap">
            <table className="my-goals-table">
              <thead>
                <tr>
                  <th>Goal &amp; Cycle</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '20px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGoals.map((goal) => (
                  <tr key={goal.id}>
                    {/* Goal Title & Description & Cycle Badge */}
                    <td>
                      <div className="goal-cell-title-box">
                        <span
                          className="goal-cell-clickable-title"
                          onClick={() =>
                            onNavigate(`${detailBasePath}/${goal.id}`)
                          }
                          title="Click to view full goal details"
                        >
                          {goal.title}
                        </span>
                        <span className="goal-cell-desc-sub">{goal.description}</span>
                        <div style={{ marginTop: 4 }}>
                          <span className="goals-cycle-tag">
                            <Calendar size={11} />
                            {goal.cycleName || 'FY 2026–27 Annual Performance Review'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Target */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {goal.target}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Current: {goal.currentAchievement}
                        </span>
                      </div>
                    </td>

                    {/* Progress */}
                    <td>
                      <div className="goal-progress-col">
                        <div className="goal-progress-header-row">
                          <span className="goal-progress-num-bold">{goal.progress}%</span>
                          <span className="goal-progress-current-text">
                            {goal.progress >= 100 ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
                          <div
                            className={`sixtifi-progress-bar-fill ${
                              goal.status === 'Completed' || goal.progress === 100
                                ? 'complete'
                                : goal.status === 'On Track'
                                ? 'primary'
                                : goal.status === 'At Risk'
                                ? 'warning'
                                : 'danger'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Weight */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {goal.weight}%
                      </span>
                    </td>

                    {/* Due Date */}
                    <td>
                      <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {goal.dueDate}
                      </span>
                    </td>

                    {/* Status */}
                    <td>{renderStatusBadge(goal.status)}</td>

                    {/* Action */}
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          className="pms-btn pms-btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.72rem', gap: 4 }}
                          onClick={() => handleOpenUpdateModal(goal)}
                        >
                          <Edit3 size={12} />
                          <span>Update Progress</span>
                        </button>

                        <button
                          type="button"
                          className="pms-btn pms-btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          onClick={() =>
                            onNavigate(`${detailBasePath}/${goal.id}`)
                          }
                          title="View Goal Details"
                        >
                          Details &rarr;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {modalGoal && (
        <UpdateProgressModal
          goal={modalGoal}
          isOpen={true}
          onClose={() => setModalGoal(null)}
          onSave={handleSaveProgress}
        />
      )}
    </div>
  );
};
