import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { MOCK_CYCLE_EMPLOYEES } from '../../data/mockCycleEmployees';
import { MOCK_PERFORMANCE_CYCLES } from '../../data/mockCycles';
import {
  ArrowLeft,
  Users,
  Target,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Mail,
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';
import './CycleEmployeesTab.css';

export interface EmployeePerformanceDetailViewProps {
  cycleId: string;
  employeeId: string;
  initialTab?: 'overview' | 'goals' | 'reviews';
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const EmployeePerformanceDetailView: React.FC<EmployeePerformanceDetailViewProps> = ({
  cycleId,
  employeeId,
  initialTab = 'overview',
  onNavigate,
  onShowToast
}) => {
  const [currentTab, setCurrentTab] = useState<'overview' | 'goals' | 'reviews'>(initialTab);

  const matchedCycle =
    MOCK_PERFORMANCE_CYCLES.find((c) => c.id === cycleId) || MOCK_PERFORMANCE_CYCLES[0];
  const matchedEmployee =
    MOCK_CYCLE_EMPLOYEES.find((e) => e.id === employeeId) || MOCK_CYCLE_EMPLOYEES[0];

  const cycleName = matchedCycle.name;
  const empName = matchedEmployee.name;

  return (
    <div className="emp-detail-page animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title={empName}
        subtitle={`${matchedEmployee.designation} • ${matchedEmployee.department} Department`}
        badge={matchedEmployee.overallStatus}
        badgeVariant={
          matchedEmployee.overallStatus === 'Completed'
            ? 'success'
            : matchedEmployee.overallStatus === 'In Progress'
            ? 'primary'
            : matchedEmployee.overallStatus === 'Overdue'
            ? 'danger'
            : 'warning'
        }
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles', href: '#/performance/cycles' },
          { label: cycleName, href: `#/performance/cycles/${cycleId}` },
          { label: 'Employees', href: `#/performance/cycles/${cycleId}/employees` },
          { label: empName }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() => onNavigate(`/performance/cycles/${cycleId}/employees`)}
            >
              <ArrowLeft size={14} />
              <span>Back to Cycle Employees</span>
            </button>

            <button
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}
              onClick={() =>
                onShowToast?.(
                  'success',
                  'Reminder Sent',
                  `Performance review reminder sent to ${empName}.`
                )
              }
            >
              <Mail size={14} />
              <span>Send Reminder</span>
            </button>
          </div>
        }
      />

      {/* 2. Employee Profile Summary Banner */}
      <div className="emp-profile-banner-card">
        <div className="emp-profile-left">
          <div className="emp-profile-avatar-lg" style={{ backgroundColor: matchedEmployee.avatarBg }}>
            {matchedEmployee.initials}
          </div>
          <div className="emp-profile-titles">
            <h2 className="emp-profile-name">{empName}</h2>
            <div className="emp-profile-meta-row">
              <span>{matchedEmployee.employeeCode}</span>
              <span>•</span>
              <span>{matchedEmployee.designation}</span>
              <span>•</span>
              <span>{matchedEmployee.department} Department</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Reporting Manager: <strong>{matchedEmployee.manager}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Current Cycle
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {cycleName}
          </span>
          <span className="pms-badge badge-info" style={{ marginTop: 2 }}>
            Evaluation Period: {matchedCycle.duration}
          </span>
        </div>
      </div>

      {/* 3. Performance Summary Metric Cards (5 Cards) */}
      <div className="emp-performance-summary-grid">
        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Goals Progress</span>
          <span className="perf-metric-val" style={{ color: '#0284C7' }}>
            {matchedEmployee.goalsTotal > 0
              ? `${Math.round((matchedEmployee.goalsUpdated / matchedEmployee.goalsTotal) * 100)}%`
              : '0%'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {matchedEmployee.goalsUpdated} of {matchedEmployee.goalsTotal} updated
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Self Review</span>
          <span className="perf-metric-val">
            <span className={`pms-badge ${matchedEmployee.selfReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
              {matchedEmployee.selfReviewStatus}
            </span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Self-assessment rating
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Manager Review</span>
          <span className="perf-metric-val">
            <span
              className={`pms-badge ${
                matchedEmployee.managerReviewStatus === 'Completed'
                  ? 'badge-success'
                  : matchedEmployee.managerReviewStatus === 'Overdue'
                  ? 'badge-danger'
                  : 'badge-info'
              }`}
            >
              {matchedEmployee.managerReviewStatus}
            </span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {matchedEmployee.managerReviewNote || `Evaluated by ${matchedEmployee.manager}`}
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Final Review</span>
          <span className="perf-metric-val">
            <span
              className={`pms-badge ${
                matchedEmployee.finalReviewStatus === 'Completed'
                  ? 'badge-success'
                  : 'badge-neutral'
              }`}
            >
              {matchedEmployee.finalReviewStatus}
            </span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            HR calibration & sign-off
          </span>
        </div>

        <div className="perf-metric-box">
          <span className="perf-metric-lbl">Overall Rating</span>
          <span className="perf-metric-val" style={{ color: matchedEmployee.rating !== '--' ? '#047857' : 'var(--text-muted)' }}>
            {matchedEmployee.rating !== '--' ? `${matchedEmployee.rating} / 5` : 'Pending'}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Weighted performance score
          </span>
        </div>
      </div>

      {/* 4. Sub-Tabs */}
      <div className="cycle-detail-tabs-bar">
        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'overview' ? 'is-active' : ''}`}
          onClick={() => setCurrentTab('overview')}
        >
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'goals' ? 'is-active' : ''}`}
          onClick={() => setCurrentTab('goals')}
        >
          <span>Goals ({matchedEmployee.goalsTotal})</span>
        </button>

        <button
          type="button"
          className={`detail-tab-btn ${currentTab === 'reviews' ? 'is-active' : ''}`}
          onClick={() => setCurrentTab('reviews')}
        >
          <span>Reviews & Ratings</span>
        </button>
      </div>

      {/* 5. Sub-Tab Content */}
      {currentTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Card
            title="Appraisal Timeline & Milestones"
            subtitle="Stage progression for this Appraisal Cycle"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#047857" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>1. Goals Submission</span>
                </div>
                <span className="pms-badge badge-success">Completed</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color={matchedEmployee.selfReviewStatus === 'Completed' ? '#047857' : '#94A3B8'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>2. Self Review</span>
                </div>
                <span className={`pms-badge ${matchedEmployee.selfReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
                  {matchedEmployee.selfReviewStatus}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color={matchedEmployee.managerReviewStatus === 'Completed' ? '#047857' : matchedEmployee.managerReviewStatus === 'Overdue' ? '#EF4444' : '#94A3B8'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>3. Manager Assessment</span>
                </div>
                <span className={`pms-badge ${matchedEmployee.managerReviewStatus === 'Completed' ? 'badge-success' : matchedEmployee.managerReviewStatus === 'Overdue' ? 'badge-danger' : 'badge-info'}`}>
                  {matchedEmployee.managerReviewStatus}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color={matchedEmployee.finalReviewStatus === 'Completed' ? '#047857' : '#94A3B8'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>4. Final HR Calibration</span>
                </div>
                <span className={`pms-badge ${matchedEmployee.finalReviewStatus === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
                  {matchedEmployee.finalReviewStatus}
                </span>
              </div>
            </div>
          </Card>

          <Card
            title="Weightage & Component Breakdown"
            subtitle="Calculated evaluation weights for final rating"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Goals / KPI (70% Weight)</span>
                  <span style={{ fontWeight: 700, color: '#0284C7' }}>
                    {matchedEmployee.goalsUpdated} / {matchedEmployee.goalsTotal} Completed
                  </span>
                </div>
                <div className="sixtifi-progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="sixtifi-progress-bar-fill complete"
                    style={{
                      width: `${
                        matchedEmployee.goalsTotal > 0
                          ? (matchedEmployee.goalsUpdated / matchedEmployee.goalsTotal) * 100
                          : 0
                      }%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Competencies (30% Weight)</span>
                  <span style={{ fontWeight: 700, color: '#7C3AED' }}>
                    {matchedEmployee.overallStatus === 'Completed' ? '4.0 / 5 Evaluated' : 'In Progress'}
                  </span>
                </div>
                <div className="sixtifi-progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="sixtifi-progress-bar-fill primary"
                    style={{ width: matchedEmployee.overallStatus === 'Completed' ? '80%' : '50%' }}
                  />
                </div>
              </div>

              <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 6, border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Calculated Score</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: matchedEmployee.rating !== '--' ? '#047857' : 'var(--text-muted)' }}>
                  {matchedEmployee.rating !== '--' ? `${matchedEmployee.rating} / 5.0` : 'Pending Final Review'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {currentTab === 'goals' && (
        <div className="tab-placeholder-card animate-fade-in">
          <div className="tab-placeholder-icon" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' }}>
            <Target size={28} />
          </div>
          <h3 className="empty-title" style={{ fontSize: '1.15rem' }}>{empName}&apos;s Goals & KPIs</h3>
          <p className="empty-description" style={{ maxWidth: '480px' }}>
            Detailed KPI targets, individual deliverable progress, and manager goal approval history for <strong>{empName}</strong> will appear here.
          </p>
          <button
            className="pms-btn pms-btn-secondary"
            onClick={() => setCurrentTab('overview')}
          >
            &larr; Back to Overview
          </button>
        </div>
      )}

      {currentTab === 'reviews' && (
        <div className="tab-placeholder-card animate-fade-in">
          <div className="tab-placeholder-icon" style={{ backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0' }}>
            <Award size={28} />
          </div>
          <h3 className="empty-title" style={{ fontSize: '1.15rem' }}>{empName}&apos;s Review Forms</h3>
          <p className="empty-description" style={{ maxWidth: '480px' }}>
            Submitted self-assessment answers, supervisor rating breakdowns, and final calibration feedback for <strong>{empName}</strong> will appear here.
          </p>
          <button
            className="pms-btn pms-btn-secondary"
            onClick={() => setCurrentTab('overview')}
          >
            &larr; Back to Overview
          </button>
        </div>
      )}
    </div>
  );
};
