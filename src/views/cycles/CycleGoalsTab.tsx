import React, { useState, useEffect, useRef } from 'react';
import { CycleGoalItem, GoalStatus } from '../../types/performance';
import { MOCK_CYCLE_GOALS, CYCLE_GOALS_SUMMARY } from '../../data/mockCycleGoals';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  X,
  MoreVertical,
  Eye,
  User,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import './CycleGoalsTab.css';

export interface CycleGoalsTabProps {
  cycleId: string;
  cycleName?: string;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const CycleGoalsTab: React.FC<CycleGoalsTabProps> = ({
  cycleId,
  cycleName = 'FY 2026–27 Annual Performance Review',
  onNavigate,
  onShowToast
}) => {
  const [goals, setGoals] = useState<CycleGoalItem[]>(MOCK_CYCLE_GOALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedManager, setSelectedManager] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Close action menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter Logic
  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.target.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || goal.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || goal.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesManager = selectedManager === 'all' || goal.manager.toLowerCase() === selectedManager.toLowerCase();
    const matchesEmployee = selectedEmployee === 'all' || goal.employeeName.toLowerCase() === selectedEmployee.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus && matchesManager && matchesEmployee;
  });

  const isFiltered =
    searchTerm !== '' ||
    selectedDept !== 'all' ||
    selectedStatus !== 'all' ||
    selectedManager !== 'all' ||
    selectedEmployee !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setSelectedManager('all');
    setSelectedEmployee('all');
  };

  // Status Badge Component
  const renderGoalStatusBadge = (status: GoalStatus) => {
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
    <div className="cycle-goals-tab-content animate-fade-in">
      {/* 1. Tab Inner Header */}
      <div className="goals-tab-inner-header">
        <div className="goals-tab-title-group">
          <h2 className="goals-tab-title">Cycle Goals</h2>
          <p className="goals-tab-sub">
            Monitor goal progress and identify employees who need attention.
          </p>
        </div>
      </div>

      {/* 2. 4 Compact Summary Cards */}
      <div className="goals-metrics-grid">
        <div className="goal-metric-card">
          <div className="goal-metric-left">
            <span className="goal-metric-label">Total Goals</span>
            <span className="goal-metric-val">{CYCLE_GOALS_SUMMARY.totalGoals.toLocaleString()}</span>
          </div>
          <div className="goal-metric-icon blue">
            <Target size={18} />
          </div>
        </div>

        <div className="goal-metric-card">
          <div className="goal-metric-left">
            <span className="goal-metric-label">On Track</span>
            <span className="goal-metric-val" style={{ color: '#047857' }}>
              {CYCLE_GOALS_SUMMARY.onTrack}
            </span>
          </div>
          <div className="goal-metric-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="goal-metric-card">
          <div className="goal-metric-left">
            <span className="goal-metric-label">At Risk</span>
            <span className="goal-metric-val" style={{ color: '#B45309' }}>
              {CYCLE_GOALS_SUMMARY.atRisk}
            </span>
          </div>
          <div className="goal-metric-icon amber">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="goal-metric-card">
          <div className="goal-metric-left">
            <span className="goal-metric-label">Needs Attention</span>
            <span className="goal-metric-val" style={{ color: '#DC2626' }}>
              {CYCLE_GOALS_SUMMARY.needsAttention}
            </span>
          </div>
          <div className="goal-metric-icon red">
            <AlertCircle size={18} />
          </div>
        </div>
      </div>

      {/* 3. Goal Progress Distribution Overview */}
      <div className="goal-distribution-card">
        <div className="distribution-header">
          <span className="distribution-title">Goal Progress Distribution</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Total 1,124 KPI Objectives
          </span>
        </div>

        <div className="distribution-bar-track">
          <div
            className="distribution-segment on-track"
            style={{ width: `${CYCLE_GOALS_SUMMARY.distribution.onTrackPercent}%` }}
            title={`On Track: ${CYCLE_GOALS_SUMMARY.distribution.onTrackPercent}%`}
          />
          <div
            className="distribution-segment at-risk"
            style={{ width: `${CYCLE_GOALS_SUMMARY.distribution.atRiskPercent}%` }}
            title={`At Risk: ${CYCLE_GOALS_SUMMARY.distribution.atRiskPercent}%`}
          />
          <div
            className="distribution-segment needs-attention"
            style={{ width: `${CYCLE_GOALS_SUMMARY.distribution.needsAttentionPercent}%` }}
            title={`Needs Attention: ${CYCLE_GOALS_SUMMARY.distribution.needsAttentionPercent}%`}
          />
        </div>

        <div className="distribution-legend-grid">
          <div className="distribution-legend-item">
            <div className="legend-color-dot on-track" />
            <span className="legend-label">On Track</span>
            <span className="legend-percent">{CYCLE_GOALS_SUMMARY.distribution.onTrackPercent}% ({CYCLE_GOALS_SUMMARY.onTrack})</span>
          </div>

          <div className="distribution-legend-item">
            <div className="legend-color-dot at-risk" />
            <span className="legend-label">At Risk</span>
            <span className="legend-percent">{CYCLE_GOALS_SUMMARY.distribution.atRiskPercent}% ({CYCLE_GOALS_SUMMARY.atRisk})</span>
          </div>

          <div className="distribution-legend-item">
            <div className="legend-color-dot needs-attention" />
            <span className="legend-label">Needs Attention</span>
            <span className="legend-percent">{CYCLE_GOALS_SUMMARY.distribution.needsAttentionPercent}% ({CYCLE_GOALS_SUMMARY.needsAttention})</span>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          {/* Search */}
          <div className="emp-search-wrap">
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search goals or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Department */}
          <select
            className="emp-filter-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="sales">Sales</option>
            <option value="engineering">Engineering</option>
            <option value="operations">Operations</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
          </select>

          {/* Goal Status */}
          <select
            className="emp-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="on track">On Track</option>
            <option value="at risk">At Risk</option>
            <option value="needs attention">Needs Attention</option>
            <option value="completed">Completed</option>
          </select>

          {/* Manager */}
          <select
            className="emp-filter-select"
            value={selectedManager}
            onChange={(e) => setSelectedManager(e.target.value)}
          >
            <option value="all">All Managers</option>
            <option value="vikram patel">Vikram Patel</option>
            <option value="ankit mehta">Ankit Mehta</option>
            <option value="rajesh shah">Rajesh Shah</option>
            <option value="rahul shah">Rahul Shah</option>
          </select>

          {/* Employee */}
          <select
            className="emp-filter-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            <option value="rahul shah">Rahul Shah</option>
            <option value="priya patel">Priya Patel</option>
            <option value="amit kumar">Amit Kumar</option>
            <option value="neha mehta">Neha Mehta</option>
            <option value="karan desai">Karan Desai</option>
            <option value="sneha verma">Sneha Verma</option>
            <option value="vikram malhotra">Vikram Malhotra</option>
            <option value="ananya das">Ananya Das</option>
            <option value="pooja nair">Pooja Nair</option>
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
          Showing <strong>{filteredGoals.length}</strong> of 1,124 goals
        </div>
      </div>

      {/* 5. Goals Table */}
      <div className="emp-table-card">
        {filteredGoals.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No goals match your current search or filters</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
              Try adjusting your query or reset the filters to monitor organizational goals.
            </p>
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ marginTop: 6 }}
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Target</th>
                  <th>Progress</th>
                  <th>Weight</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGoals.map((goal) => {
                  const isMenuOpen = openActionId === goal.id;

                  return (
                    <tr key={goal.id}>
                      {/* Goal Title */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span
                            className="goal-cell-title"
                            onClick={() =>
                              onNavigate(`/performance/goals/${goal.id}`)
                            }
                          >
                            {goal.title}
                          </span>
                          <span className="goal-cell-desc">{goal.description}</span>
                        </div>
                      </td>

                      {/* Employee Cell */}
                      <td>
                        <div className="emp-cell-content">
                          <div className="emp-avatar-box" style={{ backgroundColor: goal.avatarBg }}>
                            {goal.initials}
                          </div>
                          <div className="emp-name-text-col">
                            <span
                              className="emp-name-title"
                              onClick={() =>
                                onNavigate(
                                  `/performance/cycles/${cycleId}/employees/${goal.employeeId}`
                                )
                              }
                            >
                              {goal.employeeName}
                            </span>
                            <span className="emp-designation-sub">{goal.employeeCode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>{goal.department}</td>

                      {/* Target */}
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {goal.target}
                        </span>
                      </td>

                      {/* Progress */}
                      <td>
                        <div className="goal-progress-wrap">
                          <span className="goal-progress-num">{goal.progress}%</span>
                          <div className="sixtifi-progress-bar-bg" style={{ width: '55px', height: '5px' }}>
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
                      <td>{renderGoalStatusBadge(goal.status)}</td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                          style={{ margin: '0 auto', width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(isMenuOpen ? null : goal.id);
                          }}
                          aria-label={`Actions for ${goal.title}`}
                        >
                          <MoreVertical size={14} />
                        </button>

                        {isMenuOpen && (
                          <div
                            className="more-dropdown-menu"
                            ref={actionMenuRef}
                            style={{ right: 8, top: '80%', zIndex: 90 }}
                          >
                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                onNavigate(`/performance/goals/${goal.id}`);
                              }}
                            >
                              <Eye size={13} />
                              <span>View Goal</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                onNavigate(
                                  `/performance/cycles/${cycleId}/employees/${goal.employeeId}`
                                );
                              }}
                            >
                              <User size={13} />
                              <span>View Performance</span>
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
        )}
      </div>
    </div>
  );
};
