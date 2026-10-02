import React, { useState, useEffect, useRef } from 'react';
import { CycleReviewItem, ReviewStageStatus, CycleParticipationStatus, ReviewCurrentStage } from '../../types/performance';
import { MOCK_CYCLE_REVIEWS, CYCLE_REVIEWS_SUMMARY } from '../../data/mockCycleReviews';
import {
  UserCheck,
  Users,
  Award,
  AlertCircle,
  Clock,
  Search,
  X,
  Mail,
  MoreVertical,
  Eye,
  User,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import './CycleReviewsTab.css';

export interface CycleReviewsTabProps {
  cycleId: string;
  cycleName?: string;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const CycleReviewsTab: React.FC<CycleReviewsTabProps> = ({
  cycleId,
  cycleName = 'FY 2026–27 Annual Performance Review',
  onNavigate,
  onShowToast
}) => {
  const [reviews, setReviews] = useState<CycleReviewItem[]>(MOCK_CYCLE_REVIEWS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedManager, setSelectedManager] = useState('all');
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
  const filteredReviews = reviews.filter((rev) => {
    const matchesSearch =
      rev.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || rev.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesStage = selectedStage === 'all' || rev.currentStage.toLowerCase() === selectedStage.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || rev.overallStatus.toLowerCase() === selectedStatus.toLowerCase();
    const matchesManager = selectedManager === 'all' || rev.manager.toLowerCase() === selectedManager.toLowerCase();

    return matchesSearch && matchesDept && matchesStage && matchesStatus && matchesManager;
  });

  const isFiltered =
    searchTerm !== '' ||
    selectedDept !== 'all' ||
    selectedStage !== 'all' ||
    selectedStatus !== 'all' ||
    selectedManager !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedStage('all');
    setSelectedStatus('all');
    setSelectedManager('all');
  };

  // Row Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredReviews.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Reminder
  const handleSendBulkReminder = () => {
    onShowToast?.(
      'success',
      'Reminders Sent',
      `Review deadline reminders sent to ${selectedIds.length} employees and their managers.`
    );
    setSelectedIds([]);
  };

  // Single Reminder
  const handleSendSingleReminder = (rev: CycleReviewItem) => {
    setOpenActionId(null);
    onShowToast?.('success', 'Reminder Sent', `Reminder sent successfully to ${rev.employeeName}.`);
  };

  // Stage Badge Helper
  const renderStageBadge = (stage: ReviewCurrentStage) => {
    switch (stage) {
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'Final Review':
        return <span className="pms-badge badge-info">Final Review</span>;
      case 'Manager Review':
        return <span className="pms-badge badge-primary">Manager Review</span>;
      case 'Self Review':
      default:
        return <span className="pms-badge badge-neutral">Self Review</span>;
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: ReviewStageStatus | CycleParticipationStatus, subNote?: string) => {
    switch (status) {
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'In Progress':
        return <span className="pms-badge badge-info">In Progress</span>;
      case 'Pending':
        return (
          <div className="stage-status-cell">
            <span className="pms-badge badge-info">Pending</span>
            {subNote && <span style={{ fontSize: '0.65rem', color: '#0284C7', fontWeight: 500 }}>{subNote}</span>}
          </div>
        );
      case 'Not Started':
        return <span className="pms-badge badge-neutral">Not Started</span>;
      case 'Overdue':
        return (
          <div className="stage-status-cell">
            <span className="pms-badge badge-danger">Overdue</span>
            {subNote && <span className="overdue-sub-note">{subNote}</span>}
          </div>
        );
      default:
        return <span className="pms-badge badge-neutral">{status}</span>;
    }
  };

  // Attention Items
  const attentionItems = [
    {
      name: 'Karan Desai',
      employeeId: 'emp-5',
      stage: 'Manager Review',
      note: 'Overdue by 3 days',
      isOverdue: true
    },
    {
      name: 'Pooja Nair',
      employeeId: 'emp-10',
      stage: 'Manager Review',
      note: 'Overdue by 2 days',
      isOverdue: true
    },
    {
      name: 'Amit Kumar',
      employeeId: 'emp-3',
      stage: 'Manager Review',
      note: 'Due Today',
      isOverdue: false
    }
  ];

  return (
    <div className="cycle-reviews-tab-content animate-fade-in">
      {/* 1. Tab Inner Header */}
      <div className="reviews-tab-inner-header">
        <div className="reviews-tab-title-group">
          <h2 className="reviews-tab-title">Cycle Reviews</h2>
          <p className="reviews-tab-sub">
            Track self reviews, manager reviews, and final performance reviews.
          </p>
        </div>
      </div>

      {/* 2. 4 Compact Summary Cards */}
      <div className="reviews-metrics-grid">
        <div className="review-metric-card">
          <div className="review-metric-left">
            <span className="review-metric-label">Self Reviews</span>
            <span className="review-metric-val" style={{ color: '#047857' }}>
              {CYCLE_REVIEWS_SUMMARY.selfReviewsCompleted} / {CYCLE_REVIEWS_SUMMARY.totalEmployees}
            </span>
            <span className="review-metric-sub">Completed (82%)</span>
          </div>
          <div className="review-metric-icon green">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="review-metric-card">
          <div className="review-metric-left">
            <span className="review-metric-label">Manager Reviews</span>
            <span className="review-metric-val" style={{ color: '#0284C7' }}>
              {CYCLE_REVIEWS_SUMMARY.managerReviewsCompleted} / {CYCLE_REVIEWS_SUMMARY.totalEmployees}
            </span>
            <span className="review-metric-sub">Completed (68%)</span>
          </div>
          <div className="review-metric-icon blue">
            <Users size={18} />
          </div>
        </div>

        <div className="review-metric-card">
          <div className="review-metric-left">
            <span className="review-metric-label">Final Reviews</span>
            <span className="review-metric-val" style={{ color: '#7C3AED' }}>
              {CYCLE_REVIEWS_SUMMARY.finalReviewsCompleted} / {CYCLE_REVIEWS_SUMMARY.totalEmployees}
            </span>
            <span className="review-metric-sub">Completed (42%)</span>
          </div>
          <div className="review-metric-icon purple">
            <Award size={18} />
          </div>
        </div>

        <div className="review-metric-card">
          <div className="review-metric-left">
            <span className="review-metric-label">Overdue</span>
            <span className="review-metric-val" style={{ color: '#DC2626' }}>
              {CYCLE_REVIEWS_SUMMARY.overdueCount}
            </span>
            <span className="review-metric-sub">Requires action</span>
          </div>
          <div className="review-metric-icon red">
            <AlertCircle size={18} />
          </div>
        </div>
      </div>

      {/* 3. Review Stage Progress Overview */}
      <div className="review-stage-progress-card">
        <span className="distribution-title">Review Stage Progress</span>
        <div className="stage-progress-3-grid">
          {/* Stage 1 */}
          <div className="stage-progress-box">
            <div className="stage-box-header-row">
              <span className="stage-box-title-text">1. Self Review</span>
              <span className="stage-box-percent-badge">{CYCLE_REVIEWS_SUMMARY.stages.selfReview.percent}% Complete</span>
            </div>
            <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
              <div className="sixtifi-progress-bar-fill complete" style={{ width: `${CYCLE_REVIEWS_SUMMARY.stages.selfReview.percent}%` }} />
            </div>
            <span className="stage-box-count-text">
              {CYCLE_REVIEWS_SUMMARY.stages.selfReview.completed} / {CYCLE_REVIEWS_SUMMARY.stages.selfReview.total} Employees
            </span>
          </div>

          {/* Stage 2 */}
          <div className="stage-progress-box">
            <div className="stage-box-header-row">
              <span className="stage-box-title-text">2. Manager Review</span>
              <span className="stage-box-percent-badge">{CYCLE_REVIEWS_SUMMARY.stages.managerReview.percent}% Complete</span>
            </div>
            <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
              <div className="sixtifi-progress-bar-fill primary" style={{ width: `${CYCLE_REVIEWS_SUMMARY.stages.managerReview.percent}%` }} />
            </div>
            <span className="stage-box-count-text">
              {CYCLE_REVIEWS_SUMMARY.stages.managerReview.completed} / {CYCLE_REVIEWS_SUMMARY.stages.managerReview.total} Employees
            </span>
          </div>

          {/* Stage 3 */}
          <div className="stage-progress-box">
            <div className="stage-box-header-row">
              <span className="stage-box-title-text">3. Final Review</span>
              <span className="stage-box-percent-badge">{CYCLE_REVIEWS_SUMMARY.stages.finalReview.percent}% Complete</span>
            </div>
            <div className="sixtifi-progress-bar-bg" style={{ height: '6px' }}>
              <div className="sixtifi-progress-bar-fill warning" style={{ width: `${CYCLE_REVIEWS_SUMMARY.stages.finalReview.percent}%` }} />
            </div>
            <span className="stage-box-count-text">
              {CYCLE_REVIEWS_SUMMARY.stages.finalReview.completed} / {CYCLE_REVIEWS_SUMMARY.stages.finalReview.total} Employees
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bulk Action Banner (Appears on Selection) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-banner">
          <div className="bulk-left-info">
            <UserCheck size={16} />
            <span>{selectedIds.length} employee{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>
          <div className="bulk-actions-right">
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
              onClick={handleSendBulkReminder}
            >
              <Mail size={13} />
              <span>Send Reminder ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* 5. Filter Toolbar */}
      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          {/* Search */}
          <div className="emp-search-wrap">
            <Search size={14} className="emp-search-icon" />
            <input
              type="text"
              className="emp-search-input"
              placeholder="Search employees..."
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

          {/* Review Stage */}
          <select
            className="emp-filter-select"
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
          >
            <option value="all">All Stages</option>
            <option value="self review">Self Review</option>
            <option value="manager review">Manager Review</option>
            <option value="final review">Final Review</option>
            <option value="completed">Completed</option>
          </select>

          {/* Review Status */}
          <select
            className="emp-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
            <option value="not started">Not Started</option>
            <option value="overdue">Overdue</option>
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
          Showing <strong>{filteredReviews.length}</strong> of 248 reviews
        </div>
      </div>

      {/* 6. Review Tracking Table */}
      <div className="emp-table-card">
        {filteredReviews.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No employee reviews match your current filters</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
              Try adjusting your query or reset the filters to monitor cycle review progress.
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
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredReviews.length &&
                        filteredReviews.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all reviews"
                    />
                  </th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Self Review</th>
                  <th>Manager Review</th>
                  <th>Final Review</th>
                  <th>Current Stage</th>
                  <th>Overall Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((rev) => {
                  const isSelected = selectedIds.includes(rev.id);
                  const isMenuOpen = openActionId === rev.id;

                  return (
                    <tr key={rev.id} className={isSelected ? 'is-row-selected' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(rev.id)}
                          aria-label={`Select review for ${rev.employeeName}`}
                        />
                      </td>

                      {/* Employee Cell */}
                      <td>
                        <div className="emp-cell-content">
                          <div className="emp-avatar-box" style={{ backgroundColor: rev.avatarBg }}>
                            {rev.initials}
                          </div>
                          <div className="emp-name-text-col">
                            <span
                              className="emp-name-title"
                              onClick={() =>
                                onNavigate(
                                  `/performance/cycles/${cycleId}/reviews/${rev.employeeId}`
                                )
                              }
                            >
                              {rev.employeeName}
                            </span>
                            <span className="emp-designation-sub">
                              {rev.employeeCode} • {rev.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>{rev.department}</td>

                      {/* Self Review */}
                      <td>{renderStatusBadge(rev.selfReviewStatus)}</td>

                      {/* Manager Review */}
                      <td>{renderStatusBadge(rev.managerReviewStatus, rev.managerReviewNote)}</td>

                      {/* Final Review */}
                      <td>{renderStatusBadge(rev.finalReviewStatus)}</td>

                      {/* Current Stage */}
                      <td>{renderStageBadge(rev.currentStage)}</td>

                      {/* Overall Status */}
                      <td>{renderStatusBadge(rev.overallStatus)}</td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                          style={{ margin: '0 auto', width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(isMenuOpen ? null : rev.id);
                          }}
                          aria-label={`Actions for ${rev.employeeName}`}
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
                                onNavigate(
                                  `/performance/cycles/${cycleId}/reviews/${rev.employeeId}`
                                );
                              }}
                            >
                              <Eye size={13} />
                              <span>View Review</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                onNavigate(
                                  `/performance/cycles/${cycleId}/employees/${rev.employeeId}`
                                );
                              }}
                            >
                              <User size={13} />
                              <span>View Performance</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => handleSendSingleReminder(rev)}
                            >
                              <Mail size={13} />
                              <span>Send Reminder</span>
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

      {/* 7. Reviews Requiring Attention Section */}
      <div className="attention-section-card">
        <span className="distribution-title">Reviews Requiring Attention</span>
        <div className="attention-grid-list">
          {attentionItems.map((item, idx) => (
            <div key={idx} className="attention-item-card">
              <div className="attention-item-left">
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: item.isOverdue ? '#FEE2E2' : '#FEF3C7',
                    color: item.isOverdue ? '#DC2626' : '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <AlertCircle size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: item.isOverdue ? '#DC2626' : '#B45309', fontWeight: 500 }}>
                    {item.stage} • {item.note}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="pms-btn pms-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() =>
                  onNavigate(`/performance/cycles/${cycleId}/reviews/${item.employeeId}`)
                }
              >
                View Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
