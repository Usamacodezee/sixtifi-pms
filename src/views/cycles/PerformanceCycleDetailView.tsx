import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { PerformanceCycle } from '../../types/performance';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import { CycleEmployeesTab } from './CycleEmployeesTab';
import { CycleGoalsTab } from './CycleGoalsTab';
import { CycleReviewsTab } from './CycleReviewsTab';
import {
  Users,
  Target,
  CheckCircle2,
  TrendingUp,
  FileEdit,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  Copy,
  Power,
  Layers,
  Sparkles,
  Calendar,
  Check,
  Award
} from 'lucide-react';
import './PerformanceCycleDetailView.css';

export type CycleDetailTab = 'overview' | 'employees' | 'goals' | 'reviews';

export interface PerformanceCycleDetailViewProps {
  cycleId: string;
  activeTab?: CycleDetailTab;
  cycles?: PerformanceCycle[];
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const PerformanceCycleDetailView: React.FC<PerformanceCycleDetailViewProps> = ({
  cycleId,
  activeTab = 'overview',
  cycles = MOCK_PERFORMANCE_CYCLES,
  onNavigate,
  onShowToast
}) => {
  const [currentTab, setCurrentTab] = useState<CycleDetailTab>(activeTab);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync external tab prop
  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Click outside listener for more actions menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Locate matched cycle or fall back to primary FY 2026-27 review
  const matchedCycle = cycles.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];
  const cycleName = matchedCycle.name;
  const duration = matchedCycle.duration;
  const status = matchedCycle.status;
  const employeesCount = matchedCycle.employeesCount || 248;

  // Handle Tab Switch
  const handleTabChange = (tab: CycleDetailTab) => {
    setCurrentTab(tab);
    if (tab === 'overview') {
      onNavigate(`/performance/cycles/${cycleId}`);
    } else {
      onNavigate(`/performance/cycles/${cycleId}/${tab}`);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Active':
        return <span className="pms-badge badge-success">Active</span>;
      case 'Completed':
        return <span className="pms-badge badge-info">Completed</span>;
      case 'Draft':
        return <span className="pms-badge badge-warning">Draft</span>;
      default:
        return <span className="pms-badge badge-neutral">Archived</span>;
    }
  };

  // Recent Activity Feed
  const recentActivities = [
    { text: 'Priya Patel completed self review', time: '15 minutes ago' },
    { text: 'Amit Kumar updated goal progress', time: '1 hour ago' },
    { text: 'Neha Mehta submitted manager review', time: '2 hours ago' },
    { text: 'Rahul Shah approved employee goals', time: 'Yesterday' },
    { text: 'Rajesh Patel completed self review', time: 'Yesterday' }
  ];

  return (
    <div className="cycle-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={cycleName}
        subtitle="Manage cycle progress, employee participation, goals, and performance reviews."
        badge={status}
        badgeVariant={status === 'Active' ? 'success' : status === 'Completed' ? 'primary' : 'warning'}
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: cycleName }
        ]}
        actions={
          <div className="header-actions-group">
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate('/performance/cycles')}
            >
              <ArrowLeft size={14} />
              <span>Back to Cycles</span>
            </button>

            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => {
                onNavigate('/performance/cycles/create');
                onShowToast?.('info', 'Edit Cycle', `Opening cycle editor for ${cycleName}.`);
              }}
            >
              <FileEdit size={14} />
              <span>Edit Cycle</span>
            </button>

            {/* More Actions Dropdown */}
            <div className="more-actions-container" ref={moreMenuRef}>
              <button
                className={`more-trigger-btn ${isMoreMenuOpen ? 'is-active' : ''}`}
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                title="More cycle actions"
              >
                <MoreVertical size={16} />
              </button>

              {isMoreMenuOpen && (
                <div className="more-dropdown-menu">
                  <button
                    className="more-menu-item"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onShowToast?.('info', 'Duplicate Cycle', `Created a clone draft of "${cycleName}".`);
                    }}
                  >
                    <Copy size={13} />
                    <span>Duplicate Cycle</span>
                  </button>

                  <button
                    className="more-menu-item danger-item"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onShowToast?.('warning', 'Close Cycle', `Performance review cycle "${cycleName}" closed.`);
                    }}
                  >
                    <Power size={13} />
                    <span>Close Cycle</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* 2. Top Summary Metrics Grid */}
      <div className="detail-summary-grid">
        <div className="detail-metric-card">
          <div className="detail-metric-left">
            <span className="detail-metric-label">Employees</span>
            <span className="detail-metric-val">{employeesCount}</span>
          </div>
          <div className="detail-metric-icon cyan">
            <Users size={18} />
          </div>
        </div>

        <div className="detail-metric-card">
          <div className="detail-metric-left">
            <span className="detail-metric-label">Goals</span>
            <span className="detail-metric-val">1,124</span>
          </div>
          <div className="detail-metric-icon purple">
            <Target size={18} />
          </div>
        </div>

        <div className="detail-metric-card">
          <div className="detail-metric-left">
            <span className="detail-metric-label">Review Completion</span>
            <span className="detail-metric-val" style={{ color: '#047857' }}>68%</span>
          </div>
          <div className="detail-metric-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="detail-metric-card">
          <div className="detail-metric-left">
            <span className="detail-metric-label">Cycle Progress</span>
            <span className="detail-metric-val" style={{ color: '#0284C7' }}>72%</span>
          </div>
          <div className="detail-metric-icon amber">
            <TrendingUp size={18} />
          </div>
        </div>
      </div>

      {/* 3. Cycle Information & Progress Section */}
      <div className="info-and-progress-grid">
        {/* Cycle Information Card */}
        <div className="cycle-info-card">
          <div className="card-title-sm">
            <span>Cycle Information</span>
            {getStatusBadge(status)}
          </div>
          <div className="info-kv-grid">
            <div className="info-kv-item">
              <span className="info-k-label">Cycle Type</span>
              <span className="info-v-val">{matchedCycle.type || 'Annual'}</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Period</span>
              <span className="info-v-val">{duration}</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Participants</span>
              <span className="info-v-val">{employeesCount} Employees</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Goal Weight</span>
              <span className="info-v-val">{matchedCycle.goalsWeightage ?? 70}%</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Competency Weight</span>
              <span className="info-v-val">{matchedCycle.competenciesWeightage ?? 30}%</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Goal Range</span>
              <span className="info-v-val">{matchedCycle.minGoalsPerEmployee ?? 3} – {matchedCycle.maxGoalsPerEmployee ?? 8} Goals / emp</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Manager Goal Approval</span>
              <span className="info-v-val">{matchedCycle.requireGoalApproval !== false ? 'Required' : 'Optional'}</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Employee Progress Updates</span>
              <span className="info-v-val">{matchedCycle.allowEmployeeGoalUpdates !== false ? 'Allowed' : 'Restricted'}</span>
            </div>
            <div className="info-kv-item">
              <span className="info-k-label">Automated Reminders</span>
              <span className="info-v-val">{matchedCycle.sendProgressReminders !== false ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-k-label">Review Flow</span>
              <span className="info-v-val" style={{ color: '#0284C7' }}>
                {matchedCycle.reviewFlow === 'manager_only'
                  ? 'Manager only'
                  : matchedCycle.reviewFlow === 'manager_admin'
                  ? 'Manager → Admin'
                  : 'Self → Manager → Admin'}
              </span>
            </div>
            <div className="info-kv-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-k-label">Rating Scale &amp; Score Mapping</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {(matchedCycle.ratingMapping || [
                  { minScore: 4.5, maxScore: 5.0, label: 'Exceptional', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
                  { minScore: 4.0, maxScore: 4.4, label: 'Exceeds Expectations', bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
                  { minScore: 3.0, maxScore: 3.9, label: 'Meets Expectations', bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
                  { minScore: 2.0, maxScore: 2.9, label: 'Needs Improvement', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
                  { minScore: 1.0, maxScore: 1.9, label: 'Needs Significant Improvement', bg: '#FEE2E2', color: '#DC2626', border: '#FCA5A5' }
                ]).map((r: any) => (
                  <span
                    key={r.label}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: r.bg || '#F8FAFC',
                      color: r.color || '#0284C7',
                      border: `1px solid ${r.border || '#CBD5E1'}`
                    }}
                  >
                    {r.label} ({r.minScore.toFixed(1)}–{r.maxScore.toFixed(1)})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Appraisal Cycle Progress Card */}
        <div className="cycle-progress-card">
          <div className="card-title-sm">
            <span>Appraisal Cycle Progress</span>
            <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 700 }}>
              68% Complete
            </span>
          </div>
          <div className="stages-progress-list">
            <div className="stage-track-item">
              <div className="stage-track-header">
                <span className="stage-track-name">1. Goals Setup</span>
                <span className="stage-track-percent">100%</span>
              </div>
              <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
                <div className="sixtifi-progress-bar-fill complete" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="stage-track-item">
              <div className="stage-track-header">
                <span className="stage-track-name">2. Self Review</span>
                <span className="stage-track-percent">82%</span>
              </div>
              <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
                <div className="sixtifi-progress-bar-fill primary" style={{ width: '82%' }} />
              </div>
            </div>

            <div className="stage-track-item">
              <div className="stage-track-header">
                <span className="stage-track-name">3. Manager Review</span>
                <span className="stage-track-percent">68%</span>
              </div>
              <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
                <div className="sixtifi-progress-bar-fill primary" style={{ width: '68%' }} />
              </div>
            </div>

            <div className="stage-track-item">
              <div className="stage-track-header">
                <span className="stage-track-name">4. Final Review</span>
                <span className="stage-track-percent">42%</span>
              </div>
              <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
                <div className="sixtifi-progress-bar-fill warning" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Tabs Navigation */}
      <div className="cycle-detail-tabs-bar">
        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'employees' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('employees')}
        >
          <span>Employees</span>
          <span className="tab-badge-pill">{employeesCount}</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'goals' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('goals')}
        >
          <span>Goals</span>
          <span className="tab-badge-pill">1,124</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'reviews' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('reviews')}
        >
          <span>Reviews</span>
          <span className="tab-badge-pill">68%</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW TAB CONTENT
          ======================================================== */}
      {currentTab === 'overview' && (
        <div className="overview-tab-content">
          {/* Main 2-Column Progress & Health Section */}
          <div className="overview-two-col-grid">
            {/* Left: Review Progress */}
            <Card
              title="Review Progress"
              subtitle="Completion stage breakdown for participating workforce"
            >
              <div className="review-progress-breakdown-list">
                {/* Self Review Stage */}
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">Self Review</span>
                    <span className="stage-box-count">
                      <strong>203</strong> / {employeesCount} completed (45 pending)
                    </span>
                  </div>
                  <div className="sixtifi-progress-bar-bg" style={{ height: '7px' }}>
                    <div className="sixtifi-progress-bar-fill primary" style={{ width: '82%' }} />
                  </div>
                </div>

                {/* Manager Review Stage */}
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">Manager Review</span>
                    <span className="stage-box-count">
                      <strong>169</strong> / {employeesCount} completed (79 pending)
                    </span>
                  </div>
                  <div className="sixtifi-progress-bar-bg" style={{ height: '7px' }}>
                    <div className="sixtifi-progress-bar-fill primary" style={{ width: '68%' }} />
                  </div>
                </div>

                {/* Final Review Stage */}
                <div className="review-stage-box">
                  <div className="stage-box-top">
                    <span className="stage-box-title">Final Review</span>
                    <span className="stage-box-count">
                      <strong>104</strong> / {employeesCount} completed (144 pending)
                    </span>
                  </div>
                  <div className="sixtifi-progress-bar-bg" style={{ height: '7px' }}>
                    <div className="sixtifi-progress-bar-fill warning" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Cycle Health */}
            <Card
              title="Cycle Health"
              subtitle="Operational milestone indicators"
            >
              <div className="health-status-list">
                <div className="health-status-row">
                  <span className="health-label">Goals Setup</span>
                  <span className="pms-badge badge-success">Completed</span>
                </div>
                <div className="health-status-row">
                  <span className="health-label">Employee Participation</span>
                  <span className="pms-badge badge-success">On Track</span>
                </div>
                <div className="health-status-row">
                  <span className="health-label">Self Reviews</span>
                  <span className="pms-badge badge-success">On Track</span>
                </div>
                <div className="health-status-row">
                  <span className="health-label">Manager Reviews</span>
                  <span className="pms-badge badge-warning">Needs Attention</span>
                </div>
                <div className="health-status-row">
                  <span className="health-label">Final Reviews</span>
                  <span className="pms-badge badge-info">In Progress</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Employee Participation Table Card */}
          <div className="participation-table-card">
            <div className="card-title-sm">
              <span>Employee Participation</span>
              <button
                className="pms-btn-link"
                onClick={() => handleTabChange('employees')}
              >
                View Employees &rarr;
              </button>
            </div>

            <div className="participation-rows-list">
              <div className="participation-row">
                <div className="participation-left">
                  <span className="pms-badge badge-success" style={{ width: '90px', justifyContent: 'center' }}>
                    Completed
                  </span>
                </div>
                <div className="participation-bar-wrap">
                  <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                    <div className="sixtifi-progress-bar-fill complete" style={{ width: '68%' }} />
                  </div>
                </div>
                <span className="participation-count">169 (68%)</span>
              </div>

              <div className="participation-row">
                <div className="participation-left">
                  <span className="pms-badge badge-info" style={{ width: '90px', justifyContent: 'center' }}>
                    In Progress
                  </span>
                </div>
                <div className="participation-bar-wrap">
                  <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                    <div className="sixtifi-progress-bar-fill primary" style={{ width: '21%' }} />
                  </div>
                </div>
                <span className="participation-count">52 (21%)</span>
              </div>

              <div className="participation-row">
                <div className="participation-left">
                  <span className="pms-badge badge-warning" style={{ width: '90px', justifyContent: 'center' }}>
                    Not Started
                  </span>
                </div>
                <div className="participation-bar-wrap">
                  <div className="sixtifi-progress-bar-bg" style={{ height: '8px' }}>
                    <div className="sixtifi-progress-bar-fill warning" style={{ width: '11%' }} />
                  </div>
                </div>
                <span className="participation-count">27 (11%)</span>
              </div>
            </div>
          </div>

          {/* Two Column Bottom Section: Recent Activity & Attention Required */}
          <div className="overview-two-col-grid">
            {/* Left: Recent Activity */}
            <Card
              title="Recent Activity"
              subtitle="Latest submissions & milestone updates"
              action={
                <button
                  className="pms-btn-link"
                  onClick={() => onShowToast?.('info', 'Activity Log', 'Viewing complete audit log of 48 events.')}
                >
                  View All Activity
                </button>
              }
            >
              <div className="activity-stream-list">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="activity-stream-item">
                    <div className="activity-dot-pin" />
                    <div className="activity-item-content">
                      <span className="activity-item-text">{act.text}</span>
                      <span className="activity-item-time">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Right: Attention Required */}
            <Card
              title="Attention Required"
              subtitle="Operational bottlenecks requiring action"
            >
              <div className="attention-card-list">
                <div className="attention-row-card">
                  <div className="attention-left-box">
                    <div className="attention-icon-box amber">
                      <Clock size={16} />
                    </div>
                    <div className="attention-text-col">
                      <span className="attention-title">Manager reviews pending</span>
                      <span className="attention-sub">12 employees awaiting manager sign-off</span>
                    </div>
                  </div>
                  <button
                    className="pms-btn pms-btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      handleTabChange('reviews');
                      onShowToast?.('info', 'Manager Reviews', 'Filtering 12 pending manager reviews.');
                    }}
                  >
                    Review
                  </button>
                </div>

                <div className="attention-row-card">
                  <div className="attention-left-box">
                    <div className="attention-icon-box red">
                      <AlertCircle size={16} />
                    </div>
                    <div className="attention-text-col">
                      <span className="attention-title">Self reviews overdue</span>
                      <span className="attention-sub">6 employees have passed the deadline</span>
                    </div>
                  </div>
                  <button
                    className="pms-btn pms-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      handleTabChange('employees');
                      onShowToast?.('warning', 'Overdue Reviews', 'Viewing 6 overdue employee submissions.');
                    }}
                  >
                    View Employees
                  </button>
                </div>

                <div className="attention-row-card">
                  <div className="attention-left-box">
                    <div className="attention-icon-box blue">
                      <Target size={16} />
                    </div>
                    <div className="attention-text-col">
                      <span className="attention-title">Goals awaiting manager approval</span>
                      <span className="attention-sub">8 employees submitted revised KPIs</span>
                    </div>
                  </div>
                  <button
                    className="pms-btn pms-btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      handleTabChange('goals');
                      onShowToast?.('info', 'Goal Approvals', 'Opening 8 pending goal approvals.');
                    }}
                  >
                    Review Goals
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: EMPLOYEES TAB
          ======================================================== */}
      {currentTab === 'employees' && (
        <CycleEmployeesTab
          cycleId={cycleId}
          cycleName={cycleName}
          onNavigate={onNavigate}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================
          TAB 3: GOALS TAB
          ======================================================== */}
      {currentTab === 'goals' && (
        <CycleGoalsTab
          cycleId={cycleId}
          cycleName={cycleName}
          onNavigate={onNavigate}
          onShowToast={onShowToast}
        />
      )}

      {/* ========================================================
          TAB 4: REVIEWS TAB
          ======================================================== */}
      {currentTab === 'reviews' && (
        <CycleReviewsTab
          cycleId={cycleId}
          cycleName={cycleName}
          onNavigate={onNavigate}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
