import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import {
  TEAM_MEMBERS,
  TEAM_MEMBERS_COUNT,
  GOALS_ON_TRACK_COUNT,
  REVIEWS_PENDING_COUNT,
  REVIEWS_OVERDUE_COUNT,
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
  CheckCircle2,
  AlertTriangle,
  Award
} from 'lucide-react';
import '../my-performance/MyPerformanceStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCycleDetailView.css';

export interface OverallPerformanceViewProps {
  managerReviewResponses?: Record<string, ManagerReviewResponses>;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const OverallPerformanceView: React.FC<OverallPerformanceViewProps> = ({
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
      member.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());

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

  const completedCount = TEAM_MEMBERS.filter(
    (m) => getEffectiveStatus(m).managerReviewStatus === 'Completed'
  ).length;

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

  return (
    <div className="overall-performance-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Overall Performance"
        subtitle="All organization employees participating in the active Appraisal Cycle."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Overall Performance' }
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
              <span className="pms-badge badge-success">Active Cycle</span>
            </div>
            <div className="cycle-banner-meta">
              <span>All Departments · Target Period: 01 Apr 2026 – 31 Mar 2027</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="my-perf-summary-grid">
        <div className="my-perf-stat-card is-primary">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Cycle Participants</span>
            <span className="my-perf-stat-val">{TEAM_MEMBERS_COUNT}</span>
          </div>
          <div className="my-perf-stat-icon blue">
            <Users size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-success">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Reviews Completed</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-success-text)' }}>
              {completedCount}
            </span>
          </div>
          <div className="my-perf-stat-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-warning">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Goals On Track</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-warning-text)' }}>
              {GOALS_ON_TRACK_COUNT}
            </span>
          </div>
          <div className="my-perf-stat-icon amber">
            <Target size={18} />
          </div>
        </div>

        <div className="my-perf-stat-card is-info">
          <div className="my-perf-stat-left">
            <span className="my-perf-stat-label">Avg Goal Progress</span>
            <span className="my-perf-stat-val" style={{ color: 'var(--color-info-text)' }}>
              {TEAM_AVERAGE_PROGRESS}%
            </span>
          </div>
          <div className="my-perf-stat-icon cyan">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="employees-tab-inner-header">
        <div className="employees-tab-title-group">
          <h2 className="employees-tab-title">Cycle Participant Roster</h2>
          <p className="employees-tab-sub">
            Monitor progress and open review profiles for all employees in this cycle.
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
              placeholder="Search employee, designation, code..."
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
          Showing <strong>{filteredMembers.length}</strong> of {TEAM_MEMBERS_COUNT} cycle participants
        </div>
      </div>

      {/* 4. Employees Table */}
      <div className="emp-table-card">
        {filteredMembers.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No employees match your filters</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
              Try adjusting your search criteria or clear active filters to view all cycle participants.
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
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Goal Progress</th>
                  <th>Self Review</th>
                  <th>Manager Review</th>
                  <th>Overall Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Action</th>
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
                      <td>{member.department}</td>
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
                          <span>View Performance</span>
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
    </div>
  );
};
