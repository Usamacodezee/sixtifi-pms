import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import {
  TEAM_MEMBERS,
  TEAM_MEMBERS_COUNT,
  GOALS_ON_TRACK_COUNT,
  GOALS_AT_RISK_COUNT,
  GOALS_NEEDS_ATTENTION_COUNT,
  REVIEWS_PENDING_COUNT,
  REVIEWS_OVERDUE_COUNT,
  GOALS_AWAITING_APPROVAL_COUNT,
  TEAM_AVERAGE_PROGRESS
} from '../../data/mockMyTeam';
import { TeamMember, TeamMemberOverallStatus, ReviewStageStatus } from '../../types/performance';
import { calculateGoalStatus } from '../../data/mockMyGoals';
import { ManagerReviewResponses } from '../../data/mockManagerReview';
import {
  Users,
  Target,
  Clock,
  TrendingUp,
  Search,
  X,
  Eye,
  Calendar,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import '../my-performance/MyPerformanceStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';

export interface MyTeamViewProps {
  managerReviewResponses?: Record<string, ManagerReviewResponses>;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const MyTeamView: React.FC<MyTeamViewProps> = ({
  managerReviewResponses = {},
  onNavigate,
  onShowToast
}) => {
  const getEffectiveStatus = (member: TeamMember): { managerReviewStatus: ReviewStageStatus; overallStatus: TeamMemberOverallStatus } => {
    const live = managerReviewResponses[member.id];
    if (live?.status === 'Completed') {
      return { managerReviewStatus: 'Completed', overallStatus: 'Completed' };
    }
    return { managerReviewStatus: member.managerReviewStatus, overallStatus: member.overallStatus };
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [goalStatusFilter, setGoalStatusFilter] = useState('all');

  const filteredMembers = TEAM_MEMBERS.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      departmentFilter === 'all' || member.department.toLowerCase() === departmentFilter.toLowerCase();

    const matchesReviewStatus =
      reviewStatusFilter === 'all' ||
      member.managerReviewStatus.toLowerCase() === reviewStatusFilter.toLowerCase();

    const matchesGoalStatus =
      goalStatusFilter === 'all' ||
      calculateGoalStatus(member.goalProgress).toLowerCase() === goalStatusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesReviewStatus && matchesGoalStatus;
  });

  const isFiltered =
    searchTerm !== '' ||
    departmentFilter !== 'all' ||
    reviewStatusFilter !== 'all' ||
    goalStatusFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setReviewStatusFilter('all');
    setGoalStatusFilter('all');
  };

  const renderReviewBadge = (status: ReviewStageStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'Pending':
        return <span className="pms-badge badge-info">Pending</span>;
      case 'Overdue':
        return <span className="pms-badge badge-danger">Overdue</span>;
      default:
        return <span className="pms-badge badge-neutral">{status}</span>;
    }
  };

  const renderOverallBadge = (status: TeamMemberOverallStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'In Progress':
        return <span className="pms-badge badge-info">In Progress</span>;
      case 'At Risk':
        return <span className="pms-badge badge-warning">At Risk</span>;
      case 'Overdue':
        return <span className="pms-badge badge-danger">Overdue</span>;
      default:
        return <span className="pms-badge badge-neutral">{status}</span>;
    }
  };

  const goalBreakdown = [
    { label: 'On Track', count: GOALS_ON_TRACK_COUNT, color: '#10B981' },
    { label: 'At Risk', count: GOALS_AT_RISK_COUNT, color: '#F59E0B' },
    { label: 'Needs Attention', count: GOALS_NEEDS_ATTENTION_COUNT, color: '#EF4444' }
  ];

  const firstPendingReview = TEAM_MEMBERS.find((m) => m.managerReviewStatus === 'Pending');
  const firstOverdueReview = TEAM_MEMBERS.find((m) => m.managerReviewStatus === 'Overdue');

  const handleReviewAction = () => {
    if (firstPendingReview) {
      onNavigate(`/performance/my-team/${firstPendingReview.id}/review`);
    } else {
      onShowToast?.('info', 'Manager Reviews', 'No manager reviews are currently pending.');
    }
  };

  const handleGoalApprovalAction = () => {
    const target = TEAM_MEMBERS[0];
    onNavigate(`/performance/my-team/${target.id}/goals`);
    onShowToast?.('info', 'Goals Awaiting Approval', 'Opening goal approval queue for your team.');
  };

  const handleOverdueAction = () => {
    if (firstOverdueReview) {
      onNavigate(`/performance/my-team/${firstOverdueReview.id}/review`);
    } else {
      onShowToast?.('info', 'Overdue Reviews', 'No overdue reviews at this time.');
    }
  };

  if (TEAM_MEMBERS_COUNT === 0) {
    return (
      <div className="my-performance-page animate-fade-in">
        <PageHeader
          title="My Team"
          subtitle="Monitor your team's goals, reviews, and performance progress."
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'My Team' }
          ]}
        />
        <Card>
          <EmptyPlaceholder
            icon={<Users size={26} />}
            title="No Team Members"
            description="You don't currently have any employees assigned to your team."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="my-performance-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="My Team"
        subtitle="Monitor your team's goals, reviews, and performance progress."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'My Team' }
        ]}
      />

      {/* Active Cycle Banner */}
      <div className="active-cycle-banner">
        <div className="cycle-banner-left">
          <div className="cycle-banner-icon">
            <Calendar size={20} />
          </div>
          <div className="cycle-banner-title-col">
            <div className="cycle-banner-name">
              <span>FY 2026–27 Annual Performance Review</span>
              <span className="pms-badge badge-success">Active</span>
            </div>
            <div className="cycle-banner-meta">
              <span>Period: 01 Apr 2026 – 31 Mar 2027</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="my-perf-summary-grid">
        <div className="my-perf-stat-card is-primary">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Team Members</span>
            <span className="my-perf-stat-val">{TEAM_MEMBERS_COUNT}</span>
          </div>
          <div className="my-perf-stat-icon blue">
            <Users size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-success">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Goals On Track</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-success-text)' }}>
              {GOALS_ON_TRACK_COUNT}
            </span>
          </div>
          <div className="my-perf-stat-icon green">
            <Target size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-warning">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Reviews Pending</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-warning-text)' }}>
              {REVIEWS_PENDING_COUNT}
            </span>
          </div>
          <div className="my-perf-stat-icon amber">
            <Clock size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-info">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Team Avg Progress</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-info-text)' }}>
              {TEAM_AVERAGE_PROGRESS}%
            </span>
          </div>
          <div className="my-perf-stat-icon cyan">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* 3 & 4. Team Performance Overview + Filters */}
      <div className="employees-tab-inner-header">
        <div className="employees-tab-title-group">
          <h2 className="employees-tab-title">Team Performance Overview</h2>
          <p className="employees-tab-sub">
            Review submission status and goal progress for your direct reports.
          </p>
        </div>
      </div>

      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          <div className="emp-search-wrap">
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="emp-filter-select"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="sales">Sales</option>
            <option value="engineering">Engineering</option>
            <option value="operations">Operations</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            className="emp-filter-select"
            value={reviewStatusFilter}
            onChange={(e) => setReviewStatusFilter(e.target.value)}
          >
            <option value="all">Review Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            className="emp-filter-select"
            value={goalStatusFilter}
            onChange={(e) => setGoalStatusFilter(e.target.value)}
          >
            <option value="all">Goal Status</option>
            <option value="on track">On Track</option>
            <option value="at risk">At Risk</option>
            <option value="needs attention">Needs Attention</option>
            <option value="completed">Completed</option>
          </select>

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
          Showing <strong>{filteredMembers.length}</strong> of {TEAM_MEMBERS_COUNT} team members
        </div>
      </div>

      <div className="emp-table-card">
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No employees match your filters</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
              Try adjusting your search criteria or clear active filters to view your full team.
            </p>
            <button type="button" className="pms-btn pms-btn-secondary" style={{ marginTop: 6 }} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Goal Progress</th>
                  <th>Self Review</th>
                  <th>Manager Review</th>
                  <th>Overall Status</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member: TeamMember) => {
                  const effective = getEffectiveStatus(member);
                  return (
                  <tr key={member.id}>
                    <td>
                      <div className="emp-cell-content">
                        <div className="emp-avatar-box" style={{ backgroundColor: member.avatarBg }}>
                          {member.initials}
                        </div>
                        <div className="emp-name-text-col">
                          <span
                            className="emp-name-title"
                            onClick={() => onNavigate(`/performance/employees/${member.id}`)}
                          >
                            {member.name}
                          </span>
                          <span className="emp-designation-sub">{member.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td>{member.designation}</td>
                    <td>
                      <div className="emp-goals-cell">
                        <span className="emp-goals-text">{member.goalProgress}%</span>
                        <div className="sixtifi-progress-bar-bg" style={{ width: '60px', height: '5px' }}>
                          <div
                            className={`sixtifi-progress-bar-fill ${member.goalProgress < 60 ? 'warning' : 'primary'}`}
                            style={{ width: `${member.goalProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{renderReviewBadge(member.selfReviewStatus)}</td>
                    <td>{renderReviewBadge(effective.managerReviewStatus)}</td>
                    <td>{renderOverallBadge(effective.overallStatus)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="pms-btn pms-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.72rem', gap: 4 }}
                        onClick={() => onNavigate(`/performance/employees/${member.id}`)}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Team Goal Progress + 6. Pending Manager Actions */}
      <div className="dashboard-two-col-grid">
        <Card title="Team Goal Progress" subtitle="Distribution of direct report goal health">
          <div className="participation-rows-list">
            {goalBreakdown.map((row) => (
              <div key={row.label} className="participation-row">
                <div className="participation-left">
                  <span
                    className="action-dot-indicator"
                    style={{ backgroundColor: row.color }}
                  />
                  <span>{row.label}</span>
                </div>
                <div className="participation-bar-wrap">
                  <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                    <div
                      className="sixtifi-progress-bar-fill"
                      style={{
                        width: `${(row.count / TEAM_MEMBERS_COUNT) * 100}%`,
                        backgroundColor: row.color
                      }}
                    />
                  </div>
                </div>
                <span className="participation-count">
                  {row.count} employee{row.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Your Actions" subtitle="Manager deliverables for this cycle">
          <div className="attention-card-list">
            <div className="attention-row-card">
              <div className="attention-left-box">
                <div className="attention-icon-box amber">
                  <Clock size={16} />
                </div>
                <div className="attention-text-col">
                  <span className="attention-title">Manager Reviews Pending</span>
                  <span className="attention-sub">{REVIEWS_PENDING_COUNT} employees</span>
                </div>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={handleReviewAction}
              >
                Review
              </button>
            </div>

            <div className="attention-row-card">
              <div className="attention-left-box">
                <div className="attention-icon-box blue">
                  <FileCheck size={16} />
                </div>
                <div className="attention-text-col">
                  <span className="attention-title">Goals Awaiting Approval</span>
                  <span className="attention-sub">{GOALS_AWAITING_APPROVAL_COUNT} employees</span>
                </div>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={handleGoalApprovalAction}
              >
                View
              </button>
            </div>

            <div className="attention-row-card">
              <div className="attention-left-box">
                <div className="attention-icon-box red">
                  <AlertCircle size={16} />
                </div>
                <div className="attention-text-col">
                  <span className="attention-title">Overdue Reviews</span>
                  <span className="attention-sub">{REVIEWS_OVERDUE_COUNT} employee</span>
                </div>
              </div>
              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={handleOverdueAction}
              >
                View
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
