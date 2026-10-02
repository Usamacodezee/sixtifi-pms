import React from 'react';
import { Card } from '../../components/ui/Card';
import { Users, Target, Clock, Star } from 'lucide-react';
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
  Cell
} from 'recharts';
import { ChartTooltip } from '../../components/charts/ChartTooltip';
import {
  CHART_COLORS,
  MGR_TEAM_BARS,
  MGR_REVIEW_STATUS,
  MGR_GOAL_HEALTH
} from '../../data/mockDashboard';
import './OverviewStyles.css';

export interface ManagerOverviewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

const teamMembers = [
  {
    name: 'Rahul Shah',
    initials: 'RS',
    goalProgress: 82,
    reviewStatus: 'Self Review Completed',
    reviewVariant: 'success',
    rating: '4.2',
    status: 'On Track',
    statusVariant: 'success'
  },
  {
    name: 'Priya Patel',
    initials: 'PP',
    goalProgress: 75,
    reviewStatus: 'Manager Review Pending',
    reviewVariant: 'warning',
    rating: '4.0',
    status: 'On Track',
    statusVariant: 'success'
  },
  {
    name: 'Amit Kumar',
    initials: 'AK',
    goalProgress: 48,
    reviewStatus: 'Overdue',
    reviewVariant: 'danger',
    rating: '3.1',
    status: 'At Risk',
    statusVariant: 'warning'
  },
  {
    name: 'Neha Mehta',
    initials: 'NM',
    goalProgress: 91,
    reviewStatus: 'Review Completed',
    reviewVariant: 'success',
    rating: '4.5',
    status: 'On Track',
    statusVariant: 'success'
  }
];

export const ManagerOverview: React.FC<ManagerOverviewProps> = ({ onNavigate, onShowToast }) => {
  return (
    <div className="overview-dashboard-wrapper animate-fade-in">
      <div className="metrics-summary-grid">
        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Team Members</span>
            <div className="metric-icon-box cyan">
              <Users size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">12</span>
            <span className="metric-subtext">Direct Reports</span>
          </div>
          <span className="pms-badge badge-info" style={{ width: 'fit-content', marginTop: 2 }}>
            Engineering Team
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Goals On Track</span>
            <div className="metric-icon-box green">
              <Target size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">8</span>
            <span className="metric-subtext">/ 12 Members</span>
          </div>
          <div className="sixtifi-progress-bar-bg" style={{ marginTop: 6 }}>
            <div className="sixtifi-progress-bar-fill success" style={{ width: '67%' }} />
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
            <span className="metric-value">5</span>
            <span className="metric-subtext">Action Required</span>
          </div>
          <span className="pms-badge badge-warning" style={{ width: 'fit-content', marginTop: 2 }}>
            Cycle FY 2026–27
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Team Avg Rating</span>
            <div className="metric-icon-box purple">
              <Star size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">3.9</span>
            <span className="metric-subtext">/ 5.0</span>
          </div>
          <span className="metric-subtext" style={{ color: '#0369A1', fontWeight: 600 }}>
            +0.3 vs Last Quarter
          </span>
        </div>
      </div>

      <div className="dashboard-two-col-grid">
        <Card
          title="Team Goal Progress"
          subtitle="Progress % and rating by direct report"
          action={
            <button type="button" className="pms-btn-link" onClick={() => onNavigate('/performance/my-team')}>
              Team Performance →
            </button>
          }
        >
          <div className="pms-chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MGR_TEAM_BARS} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
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
                  dataKey="goalProgress"
                  name="Goal %"
                  fill={CHART_COLORS.cyan}
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
                <Bar
                  yAxisId="right"
                  dataKey="rating"
                  name="Rating"
                  fill={CHART_COLORS.purple}
                  radius={[4, 4, 0, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="dashboard-stack-col">
          <Card title="Review Status Mix" subtitle="Where your team sits in the pipeline">
            <div className="pms-chart-box pms-chart-box--pie">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={MGR_REVIEW_STATUS}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {MGR_REVIEW_STATUS.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pms-chart-legend">
                {MGR_REVIEW_STATUS.map((item) => (
                  <div key={item.name} className="pms-chart-legend-item">
                    <span className="pms-chart-legend-swatch" style={{ background: item.fill }} />
                    <span>
                      {item.name} · <strong>{item.value}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Pending Actions" subtitle="Manager deliverables">
            <div className="action-items-list">
              <div className="action-row-item">
                <div className="action-row-left">
                  <div className="action-dot-indicator amber" />
                  <span className="action-row-text">5 Manager Reviews Pending</span>
                </div>
                <button
                  type="button"
                  className="pms-btn pms-btn-primary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  onClick={() => {
                    onNavigate('/performance/my-team');
                    onShowToast?.('info', 'Manager Reviews', 'Opening pending reviews queue.');
                  }}
                >
                  Review
                </button>
              </div>
              <div className="action-row-item">
                <div className="action-row-left">
                  <div className="action-dot-indicator" />
                  <span className="action-row-text">2 Goal Approvals Pending</span>
                </div>
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  onClick={() => onNavigate('/performance/goals/team')}
                >
                  Approve
                </button>
              </div>
              <div className="action-row-item">
                <div className="action-row-left">
                  <div className="action-dot-indicator red" />
                  <span className="action-row-text">1 Employee Requires Attention</span>
                </div>
                <button
                  type="button"
                  className="pms-btn pms-btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  onClick={() => onNavigate('/performance/my-team')}
                >
                  View
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="dashboard-two-col-grid">
        <Card title="Team Goal Health" subtitle="How many reports are on track vs at risk">
          <div className="pms-chart-box">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={MGR_GOAL_HEALTH}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Members" radius={[0, 4, 4, 0]} barSize={18}>
                  {MGR_GOAL_HEALTH.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Team Snapshot"
          subtitle="Key reports at a glance"
          action={
            <button type="button" className="pms-btn-link" onClick={() => onNavigate('/performance/my-team')}>
              View all →
            </button>
          }
          noPadding
        >
          <div className="pms-table-container">
            <table className="pms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal %</th>
                  <th>Review</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.name}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar-sm">{member.initials}</div>
                        <span className="employee-name-bold">{member.name}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{member.goalProgress}%</strong>
                    </td>
                    <td>
                      <span className={`pms-badge badge-${member.reviewVariant}`}>{member.reviewStatus}</span>
                    </td>
                    <td>
                      <strong>{member.rating}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}> / 5</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
