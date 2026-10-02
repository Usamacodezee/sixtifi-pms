import React from 'react';
import { Card } from '../../components/ui/Card';
import {
  Target,
  TrendingUp,
  Clock,
  Star,
  Calendar,
  FileEdit,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { ChartTooltip } from '../../components/charts/ChartTooltip';
import {
  CHART_COLORS,
  EMP_MY_GOALS,
  EMP_PROGRESS_TREND,
  EMP_SCORE_BREAKDOWN
} from '../../data/mockDashboard';
import './OverviewStyles.css';

export interface EmployeeOverviewProps {
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

const radialData = [{ name: 'Progress', value: 72, fill: CHART_COLORS.green }];

export const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ onNavigate, onShowToast }) => {
  return (
    <div className="overview-dashboard-wrapper animate-fade-in">
      <div className="cycle-info-strip">
        <div className="cycle-info-left">
          <Calendar size={16} className="cycle-info-icon" />
          <span>Active Appraisal Cycle:</span>
          <span className="cycle-name">FY 2026–27</span>
        </div>
        <div className="cycle-info-right">
          <span className="pms-badge badge-success">Active</span>
        </div>
      </div>

      <div className="metrics-summary-grid">
        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">My Goals</span>
            <div className="metric-icon-box cyan">
              <Target size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">6</span>
            <span className="metric-subtext">Total</span>
          </div>
          <span className="pms-badge badge-success" style={{ width: 'fit-content', marginTop: 2 }}>
            4 On Track
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Goal Progress</span>
            <div className="metric-icon-box green">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">72%</span>
          </div>
          <div className="sixtifi-progress-bar-bg" style={{ marginTop: 6 }}>
            <div className="sixtifi-progress-bar-fill success" style={{ width: '72%' }} />
          </div>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Review Status</span>
            <div className="metric-icon-box amber">
              <Clock size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value" style={{ fontSize: '1.15rem' }}>
              Self Review
            </span>
          </div>
          <span className="pms-badge badge-warning" style={{ width: 'fit-content', marginTop: 2 }}>
            Pending Submission
          </span>
        </div>

        <div className="metric-stat-card">
          <div className="metric-header-row">
            <span className="metric-label">Current Rating</span>
            <div className="metric-icon-box purple">
              <Star size={16} />
            </div>
          </div>
          <div className="metric-value-row">
            <span className="metric-value">4.2</span>
            <span className="metric-subtext">/ 5.0</span>
          </div>
          <span className="metric-subtext" style={{ color: '#047857', fontWeight: 600 }}>
            Top Quartile
          </span>
        </div>
      </div>

      <div className="dashboard-two-col-grid">
        <Card
          title="My Goals"
          subtitle="Progress against each active goal"
          action={
            <button type="button" className="pms-btn-link" onClick={() => onNavigate('/performance/goals/my')}>
              View all goals →
            </button>
          }
        >
          <div className="pms-chart-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={EMP_MY_GOALS}
                margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip valueSuffix="%" />} />
                <Bar dataKey="progress" name="Progress" radius={[0, 4, 4, 0]} barSize={16}>
                  {EMP_MY_GOALS.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="dashboard-stack-col">
          <Card title="Overall Progress" subtitle="Weighted goal completion">
            <div className="pms-chart-box pms-chart-box--radial">
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="68%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#F1F5F9' }} />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 28, fontWeight: 700, fill: '#0F172A' }}
                  >
                    72%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Score Breakdown" subtitle="Goals vs competencies">
            <div className="pms-chart-box">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={EMP_SCORE_BREAKDOWN} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="score" name="Score" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Progress Over Time" subtitle="How your goal completion has moved this cycle">
        <div className="pms-chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={EMP_PROGRESS_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="empProgressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
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
                dataKey="progress"
                name="Progress"
                stroke={CHART_COLORS.green}
                strokeWidth={2.5}
                fill="url(#empProgressFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Upcoming Actions
          </h3>
        </div>
        <div className="actions-cards-grid">
          <div className="pms-action-card">
            <div className="pms-action-card-top">
              <div className="action-card-icon" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <FileEdit size={16} />
              </div>
              <div className="action-card-text">
                <span className="action-card-title">Complete Self Review</span>
                <span className="action-card-meta">Deadline: 30 Mar 2027</span>
              </div>
            </div>
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              onClick={() => {
                onNavigate('/performance/my-performance/self-review');
                onShowToast?.('info', 'Self Review', 'Navigated to self-review questionnaire.');
              }}
            >
              Start Review
            </button>
          </div>

          <div className="pms-action-card">
            <div className="pms-action-card-top">
              <div className="action-card-icon" style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
                <RefreshCw size={16} />
              </div>
              <div className="action-card-text">
                <span className="action-card-title">Update Goal Progress</span>
                <span className="action-card-meta">2 goals need check-in updates</span>
              </div>
            </div>
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              onClick={() => onNavigate('/performance/goals/my')}
            >
              Update Goals
            </button>
          </div>

          <div className="pms-action-card">
            <div className="pms-action-card-top">
              <div className="action-card-icon" style={{ backgroundColor: '#F1F5F9', color: '#64748B' }}>
                <UserCheck size={16} />
              </div>
              <div className="action-card-text">
                <span className="action-card-title">Manager Review</span>
                <span className="action-card-meta">Scheduled for April 2027</span>
              </div>
            </div>
            <span className="pms-badge badge-neutral" style={{ alignSelf: 'flex-start', padding: '5px 10px' }}>
              Available after self review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
