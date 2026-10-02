import React, { useEffect, useRef, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import { MOCK_DEPARTMENTS } from '../../data/mockEmployees';
import { JOB_LEVEL_OPTIONS } from '../../data/mockSettings';
import {
  REPORT_SUMMARY,
  REVIEW_COMPLETION,
  GOAL_PERFORMANCE,
  RATING_DISTRIBUTION,
  DEPARTMENT_PERFORMANCE,
  ATTENTION_REPORT_ITEMS,
  EMPLOYEE_PERFORMANCE_REPORT
} from '../../data/mockReports';
import { ToastType } from '../../components/ui/Toast';
import {
  Users,
  Target,
  CheckCircle2,
  Star,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  File,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import '../overview/OverviewStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';
import './ReportsStyles.css';

export interface PerformanceReportsViewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const ratingBadgeVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'badge-success';
    case 'In Progress':
      return 'badge-info';
    case 'Overdue':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};

export const PerformanceReportsView: React.FC<PerformanceReportsViewProps> = ({ onNavigate, onShowToast }) => {
  const [cycleId, setCycleId] = useState('cycle-1');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [jobLevelFilter, setJobLevelFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selectedCycle = MOCK_PERFORMANCE_CYCLES.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];

  const filteredDepartmentRows = DEPARTMENT_PERFORMANCE.filter(
    (row) => departmentFilter === 'all' || row.department.toLowerCase() === departmentFilter.toLowerCase()
  );

  const filteredEmployeeRows = EMPLOYEE_PERFORMANCE_REPORT.filter((row) => {
    const matchesDept = departmentFilter === 'all' || row.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesJobLevel = jobLevelFilter === 'all' || row.jobLevel.toLowerCase() === jobLevelFilter.toLowerCase();
    return matchesDept && matchesJobLevel;
  });

  const isFiltered = departmentFilter !== 'all' || jobLevelFilter !== 'all';

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    onShowToast?.('success', 'Report export prepared successfully.', `Your ${format} export is ready (frontend preview only).`);
  };

  const handleClearFilters = () => {
    setDepartmentFilter('all');
    setJobLevelFilter('all');
  };

  return (
    <div className="reports-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Performance Reports"
        subtitle="Understand performance progress, review completion, and goal outcomes across your organization."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="export-menu-wrap" ref={exportMenuRef}>
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 14px', gap: 6 }}
              onClick={() => setShowExportMenu((v) => !v)}
            >
              <Download size={14} />
              <span>Export Report</span>
              <ChevronDown size={13} />
            </button>

            {showExportMenu && (
              <div className="more-dropdown-menu" style={{ right: 0, top: '110%', zIndex: 90, minWidth: 180 }}>
                <button type="button" className="more-menu-item" onClick={() => handleExport('PDF')}>
                  <FileText size={13} />
                  <span>Export PDF</span>
                </button>
                <button type="button" className="more-menu-item" onClick={() => handleExport('Excel')}>
                  <FileSpreadsheet size={13} />
                  <span>Export Excel</span>
                </button>
                <button type="button" className="more-menu-item" onClick={() => handleExport('CSV')}>
                  <File size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Top Filters */}
      <div className="reports-filter-bar">
        <div className="reports-filter-group">
          <span className="reports-filter-label">Appraisal Cycle</span>
          <select className="emp-filter-select" value={cycleId} onChange={(e) => setCycleId(e.target.value)}>
            {MOCK_PERFORMANCE_CYCLES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="reports-filter-group">
          <span className="reports-filter-label">Department</span>
          <select className="emp-filter-select" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {MOCK_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="reports-filter-group">
          <span className="reports-filter-label">Grade</span>
          <select className="emp-filter-select" value={jobLevelFilter} onChange={(e) => setJobLevelFilter(e.target.value)}>
            <option value="all">All Levels</option>
            {JOB_LEVEL_OPTIONS.map((jl) => (
              <option key={jl} value={jl}>{jl}</option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button type="button" className="pms-btn pms-btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Cycle Status: <strong style={{ color: 'var(--text-secondary)' }}>{selectedCycle.status}</strong>
        </span>
      </div>

      {/* 2. Summary Cards */}
      <div className="metrics-summary-grid">
        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Employees</span>
            <div className="metric-icon-box cyan"><Users size={16} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{REPORT_SUMMARY.employees}</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Goals</span>
            <div className="metric-icon-box purple"><Target size={16} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{REPORT_SUMMARY.goals.toLocaleString()}</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Reviews Completed</span>
            <div className="metric-icon-box green"><CheckCircle2 size={16} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{REPORT_SUMMARY.reviewsCompletedPercent}%</span>
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Average Performance Score</span>
            <div className="metric-icon-box amber"><Star size={16} /></div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">{REPORT_SUMMARY.avgPerformanceScore}</span>
            <span className="metric-subtext">/ 5</span>
          </div>
        </div>
      </div>

      <div className="dashboard-two-col-grid">
        {/* 3. Review Completion */}
        <Card title="Review Completion" subtitle="Share of employees completed at each review stage">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {REVIEW_COMPLETION.map((stage) => (
              <div key={stage.stage} className="report-bar-row">
                <div className="report-bar-row-header">
                  <span className="report-bar-row-label">{stage.stage}</span>
                  <span className="report-bar-row-value">{stage.percent}%</span>
                </div>
                <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                  <div className="sixtifi-progress-bar-fill primary" style={{ width: `${stage.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Goal Performance */}
        <Card title="Goal Performance" subtitle="Health distribution across all active goals">
          <div className="goal-perf-tiles-grid">
            <div className="goal-perf-tile">
              <span className="goal-perf-tile-value" style={{ color: '#047857' }}>{GOAL_PERFORMANCE.onTrack}%</span>
              <span className="goal-perf-tile-label">On Track</span>
            </div>
            <div className="goal-perf-tile">
              <span className="goal-perf-tile-value" style={{ color: '#B45309' }}>{GOAL_PERFORMANCE.atRisk}%</span>
              <span className="goal-perf-tile-label">At Risk</span>
            </div>
            <div className="goal-perf-tile">
              <span className="goal-perf-tile-value" style={{ color: '#DC2626' }}>{GOAL_PERFORMANCE.needsAttention}%</span>
              <span className="goal-perf-tile-label">Needs Attention</span>
            </div>
            <div className="goal-perf-tile">
              <span className="goal-perf-tile-value" style={{ color: '#0284C7' }}>{GOAL_PERFORMANCE.completed}%</span>
              <span className="goal-perf-tile-label">Completed</span>
            </div>
          </div>
          <div style={{ display: 'flex', height: '10px', borderRadius: 'var(--radius-full)', overflow: 'hidden', gap: '2px', marginTop: 'var(--space-3)' }}>
            <div style={{ width: `${GOAL_PERFORMANCE.onTrack}%`, backgroundColor: '#10B981' }} title={`On Track: ${GOAL_PERFORMANCE.onTrack}%`} />
            <div style={{ width: `${GOAL_PERFORMANCE.atRisk}%`, backgroundColor: '#F59E0B' }} title={`At Risk: ${GOAL_PERFORMANCE.atRisk}%`} />
            <div style={{ width: `${GOAL_PERFORMANCE.needsAttention}%`, backgroundColor: '#EF4444' }} title={`Needs Attention: ${GOAL_PERFORMANCE.needsAttention}%`} />
          </div>
        </Card>
      </div>

      {/* 5. Performance Rating Distribution */}
      <Card title="Performance Rating Distribution" subtitle="Share of employees at each final rating band">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3-5)' }}>
          {RATING_DISTRIBUTION.map((r) => (
            <div key={r.label} className="report-bar-row">
              <div className="report-bar-row-header">
                <span className="report-bar-row-label">{r.label}</span>
                <span className="report-bar-row-value">{r.percent}%</span>
              </div>
              <div className="sixtifi-progress-bar-bg" style={{ height: '10px' }}>
                <div className="sixtifi-progress-bar-fill" style={{ width: `${r.percent}%`, backgroundColor: r.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. Department Performance */}
      <Card title="Department Performance" subtitle="Compare goal progress, review completion, and average score by department" noPadding>
        {filteredDepartmentRows.length === 0 ? (
          <EmptyPlaceholder
            icon={<BarChart3 size={26} />}
            title="No performance data available"
            description="There is no performance data available for the selected filters."
          />
        ) : (
          <div className="pms-table-container">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Employees</th>
                  <th>Goal Progress</th>
                  <th>Review Completion</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartmentRows.map((row) => (
                  <tr key={row.department}>
                    <td style={{ fontWeight: 600 }}>{row.department}</td>
                    <td>{row.employees}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="sixtifi-progress-bar-bg" style={{ width: '70px', height: '5px', flex: 'none' }}>
                          <div className="sixtifi-progress-bar-fill primary" style={{ width: `${row.goalProgress}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.goalProgress}%</span>
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{row.reviewCompletion}%</td>
                    <td style={{ fontWeight: 700, color: '#047857' }}>{row.avgScore.toFixed(1)} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 7. Attention Required */}
      <Card title="Performance Areas Requiring Attention" subtitle="Operational bottlenecks that need manager or HR action">
        <div className="attention-card-list">
          {ATTENTION_REPORT_ITEMS.slice(0, 5).map((item) => (
            <div key={item.id} className="attention-row-card">
              <div className="attention-left-box">
                <div className="attention-icon-box amber">
                  <Target size={16} />
                </div>
                <div className="attention-text-col">
                  <span className="attention-title">{item.label}</span>
                  <span className="attention-sub">{item.count} {item.count === 1 ? 'item' : 'items'}</span>
                </div>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.75rem', gap: 4 }}
                onClick={() => onNavigate(item.route)}
              >
                <span>View Details</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* 8. Employee Performance Report */}
      <Card title="Employee Performance" subtitle="Individual results for the selected filters" noPadding>
        {filteredEmployeeRows.length === 0 ? (
          <EmptyPlaceholder
            icon={<BarChart3 size={26} />}
            title="No performance data available"
            description="There is no performance data available for the selected filters."
          />
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Goal Progress</th>
                  <th>Final Score</th>
                  <th>Rating</th>
                  <th>Review Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeeRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="emp-cell-content">
                        <div className="emp-avatar-box" style={{ backgroundColor: row.avatarBg }}>{row.initials}</div>
                        <div className="emp-name-text-col">
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</span>
                          <span className="emp-designation-sub">{row.jobLevel}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.department}</td>
                    <td>
                      <div className="emp-goals-cell">
                        <span className="emp-goals-text">{row.goalProgress}%</span>
                        <div className="sixtifi-progress-bar-bg" style={{ width: '45px', height: '5px' }}>
                          <div className={`sixtifi-progress-bar-fill ${row.goalProgress < 60 ? 'warning' : 'primary'}`} style={{ width: `${row.goalProgress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{row.finalScore.toFixed(1)} / 5</td>
                    <td>{row.rating}</td>
                    <td>
                      <span className={`pms-badge ${ratingBadgeVariant(row.reviewStatus)}`}>{row.reviewStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
