import React from 'react';
import { Card } from '../../components/ui/Card';
import {
  CalendarClock,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ChartTooltip } from '../../components/charts/ChartTooltip';
import {
  CHART_COLORS,
  HR_STAGE_COMPLETION,
  HR_COMPLETION_TREND,
  HR_DEPT_CHART,
  HR_RATING_DISTRIBUTION,
  HR_GOAL_HEALTH
} from '../../data/mockDashboard';
import './OverviewStyles.css';

export interface HrAdminOverviewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const HrAdminOverview: React.FC<HrAdminOverviewProps> = ({
  onNavigate,
  onShowToast
}) => {
  return (
    <div className="overview-dashboard-wrapper animate-fade-in">
      <div className="metrics-summary-grid">
        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Active Cycle</span>
            <div className="metric-icon-box cyan">
              <CalendarClock size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ fontSize: '1.25rem' }}>
              FY 2026–27
            </span>
          </div>
          <span className="pms-badge badge-success" style={{ width: 'fit-content', marginTop: 2 }}>
            Annual Appraisal
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Employees in Cycle</span>
            <div className="metric-icon-box purple">
              <Users size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">248</span>
            <span className="metric-subtext">Across 8 Depts</span>
          </div>
          <span className="metric-subtext" style={{ color: '#0284C7', fontWeight: 600 }}>
            100% Enrolled
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Review Completion</span>
            <div className="metric-icon-box green">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">68%</span>
          </div>
          <div className="sixtifi-progress-bar-bg" style={{ marginTop: 6 }}>
            <div className="sixtifi-progress-bar-fill success" style={{ width: '68%' }} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Pending Reviews</span>
            <div className="metric-icon-box amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">79</span>
            <span className="metric-subtext">Unfinished</span>
          </div>
          <span className="pms-badge badge-warning" style={{ width: 'fit-content', marginTop: 2 }}>
            Deadline: 31 Mar
          </span>
        </div>
      </div>

      <div className="dashboard-two-col-grid">
        <Card
          title="Review Pipeline"
          subtitle="Completed vs pending by stage"
          action={
            <button type="button" className="pms-btn-link" onClick={() => onNavigate('/performance/reviews')}>
              Open reviews →
            </button>
          }
        >
          <div className="pms-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={HR_STAGE_COMPLETION} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill={CHART_COLORS.green} radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill={CHART_COLORS.amber} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Completion Trend" subtitle="Organization review completion over the cycle">
          <div className="pms-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={HR_COMPLETION_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="hrCompletionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<ChartTooltip valueSuffix="%" />} />
                <Area
                  type="monotone"
                  dataKey="completion"
                  name="Completion"
                  stroke={CHART_COLORS.cyan}
                  strokeWidth={2.5}
                  fill="url(#hrCompletionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="dashboard-charts-3col">
        <Card title="Rating Distribution" subtitle="Share of finalized ratings">
          <div className="pms-chart-box pms-chart-box--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={HR_RATING_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {HR_RATING_DISTRIBUTION.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip valueSuffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pms-chart-legend">
              {HR_RATING_DISTRIBUTION.map((item) => (
                <div key={item.name} className="pms-chart-legend-item">
                  <span className="pms-chart-legend-swatch" style={{ background: item.fill }} />
                  <span>
                    {item.name} · <strong>{item.value}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Goal Health" subtitle="Active goals across the org">
          <div className="pms-chart-box pms-chart-box--pie">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={HR_GOAL_HEALTH}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {HR_GOAL_HEALTH.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip valueSuffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pms-chart-legend">
              {HR_GOAL_HEALTH.map((item) => (
                <div key={item.name} className="pms-chart-legend-item">
                  <span className="pms-chart-legend-swatch" style={{ background: item.fill }} />
                  <span>
                    {item.name} · <strong>{item.value}%</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Attention Required"
          subtitle="Actionable cycle bottlenecks"
        >
          <div className="action-items-list" style={{ marginTop: 4 }}>
            <div className="action-row-item">
              <div className="action-row-left">
                <div className="action-dot-indicator amber" />
                <span className="action-row-text">79 reviews pending</span>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => {
                  onNavigate('/performance/reviews');
                  onShowToast?.('info', 'Bulk Reminder', 'Sent automated reminder notifications to 79 reviewers.');
                }}
              >
                Remind
              </button>
            </div>
            <div className="action-row-item">
              <div className="action-row-left">
                <div className="action-dot-indicator" />
                <span className="action-row-text">14 self reviews incomplete</span>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => onNavigate('/performance/cycles')}
              >
                View
              </button>
            </div>
            <div className="action-row-item">
              <div className="action-row-left">
                <div className="action-dot-indicator red" />
                <span className="action-row-text">3 reviews overdue</span>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => {
                  onNavigate('/performance/cycles');
                  onShowToast?.('warning', 'Overdue Escalation', 'Escalating 3 overdue reviews to department heads.');
                }}
              >
                Escalate
              </button>
            </div>
            <div className="action-row-item">
              <div className="action-row-left">
                <div className="action-dot-indicator amber" />
                <span className="action-row-text">24 employees with low goal progress</span>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => onNavigate('/performance/reports')}
              >
                Reports
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Department Performance"
        subtitle="Review completion, goal progress, and average score"
        action={
          <button type="button" className="pms-btn-link" onClick={() => onNavigate('/performance/reports')}>
            Full reports →
          </button>
        }
      >
        <div className="pms-chart-box">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={HR_DEPT_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="reviewCompletion"
                name="Review %"
                fill={CHART_COLORS.cyan}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                yAxisId="left"
                dataKey="goalProgress"
                name="Goals %"
                fill={CHART_COLORS.teal}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                yAxisId="right"
                dataKey="avgScore"
                name="Avg score"
                fill={CHART_COLORS.purple}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
