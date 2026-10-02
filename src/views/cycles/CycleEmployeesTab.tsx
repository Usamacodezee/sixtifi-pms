import React, { useState, useEffect, useRef } from 'react';
import {
  CycleEmployeeParticipation,
  ReviewStageStatus,
  CycleParticipationStatus
} from '../../types/performance';
import { MOCK_CYCLE_EMPLOYEES, CYCLE_EMPLOYEES_SUMMARY } from '../../data/mockCycleEmployees';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  Search,
  Filter,
  X,
  Mail,
  MoreVertical,
  Eye,
  Target,
  Award,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import './CycleEmployeesTab.css';

export interface CycleEmployeesTabProps {
  cycleId: string;
  cycleName?: string;
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const CycleEmployeesTab: React.FC<CycleEmployeesTabProps> = ({
  cycleId,
  cycleName = 'FY 2026–27 Annual Performance Review',
  onNavigate,
  onShowToast
}) => {
  const [employees, setEmployees] = useState<CycleEmployeeParticipation[]>(MOCK_CYCLE_EMPLOYEES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
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
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'all' || emp.department.toLowerCase() === selectedDept.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || emp.overallStatus.toLowerCase() === selectedStatus.toLowerCase();
    const matchesManager = selectedManager === 'all' || emp.manager.toLowerCase() === selectedManager.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus && matchesManager;
  });

  const isFiltered =
    searchTerm !== '' || selectedDept !== 'all' || selectedStatus !== 'all' || selectedManager !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setSelectedManager('all');
  };

  // Row Selection Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id));
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
      `Performance review reminders successfully sent to ${selectedIds.length} employees.`
    );
    setSelectedIds([]);
  };

  // Individual Reminder
  const handleSendSingleReminder = (emp: CycleEmployeeParticipation) => {
    setOpenActionId(null);
    onShowToast?.('success', 'Reminder Sent', `Reminder sent successfully to ${emp.name}.`);
  };

  // Status Badge Component
  const renderStatusBadge = (status: ReviewStageStatus | CycleParticipationStatus, subNote?: string) => {
    switch (status) {
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'In Progress':
        return <span className="pms-badge badge-info">In Progress</span>;
      case 'Pending':
        return <span className="pms-badge badge-info">Pending</span>;
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

  return (
    <div className="cycle-employees-tab-content animate-fade-in">
      {/* 1. Tab Inner Header */}
      <div className="employees-tab-inner-header">
        <div className="employees-tab-title-group">
          <h2 className="employees-tab-title">Cycle Employees</h2>
          <p className="employees-tab-sub">
            Monitor employee participation and performance review progress for this cycle.
          </p>
        </div>
        <div className="employees-tab-info-pill">
          <span>Participating Employees:</span>
          <strong>248</strong>
        </div>
      </div>

      {/* 2. 4 Compact Summary Cards */}
      <div className="emp-metrics-grid">
        <div className="emp-metric-card">
          <div className="emp-metric-left">
            <span className="emp-metric-label">Total Employees</span>
            <span className="emp-metric-val">{CYCLE_EMPLOYEES_SUMMARY.totalEmployees}</span>
          </div>
          <div className="emp-metric-icon blue">
            <Users size={18} />
          </div>
        </div>

        <div className="emp-metric-card">
          <div className="emp-metric-left">
            <span className="emp-metric-label">Reviews Completed</span>
            <span className="emp-metric-val" style={{ color: '#047857' }}>
              {CYCLE_EMPLOYEES_SUMMARY.reviewsCompleted}
            </span>
          </div>
          <div className="emp-metric-icon green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="emp-metric-card">
          <div className="emp-metric-left">
            <span className="emp-metric-label">In Progress</span>
            <span className="emp-metric-val" style={{ color: '#0284C7' }}>
              {CYCLE_EMPLOYEES_SUMMARY.inProgress}
            </span>
          </div>
          <div className="emp-metric-icon purple">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="emp-metric-card">
          <div className="emp-metric-left">
            <span className="emp-metric-label">Not Started</span>
            <span className="emp-metric-val" style={{ color: '#B45309' }}>
              {CYCLE_EMPLOYEES_SUMMARY.notStarted}
            </span>
          </div>
          <div className="emp-metric-icon amber">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* 3. Bulk Action Banner (Appears on Selection) */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-banner">
          <div className="bulk-left-info">
            <CheckCircle2 size={16} />
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

      {/* 4. Filters & Search Toolbar */}
      <div className="emp-filter-toolbar">
        <div className="emp-toolbar-left">
          {/* Search Box */}
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

          {/* Department Filter */}
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
            <option value="customer support">Customer Support</option>
          </select>

          {/* Status Filter */}
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

          {/* Manager Filter */}
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

          {/* Clear Filters CTA */}
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
          Showing <strong>{filteredEmployees.length}</strong> of 248 employees
        </div>
      </div>

      {/* 5. Employee Participation Table */}
      <div className="emp-table-card">
        {filteredEmployees.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>No employees match your filters</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, maxWidth: 360 }}>
              Try adjusting your search criteria or clear active filters to view all participating employees.
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
                        selectedIds.length === filteredEmployees.length &&
                        filteredEmployees.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all employees"
                    />
                  </th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Manager</th>
                  <th>Goals</th>
                  <th>Self Review</th>
                  <th>Manager Review</th>
                  <th>Final Review</th>
                  <th>Overall Status</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id);
                  const isMenuOpen = openActionId === emp.id;

                  return (
                    <tr key={emp.id} className={isSelected ? 'is-row-selected' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(emp.id)}
                          aria-label={`Select ${emp.name}`}
                        />
                      </td>

                      {/* Employee Cell */}
                      <td>
                        <div className="emp-cell-content">
                          <div className="emp-avatar-box" style={{ backgroundColor: emp.avatarBg }}>
                            {emp.initials}
                          </div>
                          <div className="emp-name-text-col">
                            <span
                              className="emp-name-title"
                              onClick={() =>
                                onNavigate(`/performance/employees/${emp.id}`)
                              }
                            >
                              {emp.name}
                            </span>
                            <span className="emp-designation-sub">
                              {emp.employeeCode} • {emp.designation}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td>{emp.department}</td>

                      {/* Manager */}
                      <td>{emp.manager}</td>

                      {/* Goals Progress */}
                      <td>
                        <div className="emp-goals-cell">
                          <span className="emp-goals-text">
                            {emp.goalsUpdated} / {emp.goalsTotal}
                          </span>
                          <div className="sixtifi-progress-bar-bg" style={{ width: '45px', height: '5px' }}>
                            <div
                              className={`sixtifi-progress-bar-fill ${
                                emp.goalsUpdated === emp.goalsTotal
                                  ? 'complete'
                                  : emp.goalsUpdated > 0
                                  ? 'primary'
                                  : 'warning'
                              }`}
                              style={{
                                width: `${
                                  emp.goalsTotal > 0 ? (emp.goalsUpdated / emp.goalsTotal) * 100 : 0
                                }%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Self Review Status */}
                      <td>{renderStatusBadge(emp.selfReviewStatus)}</td>

                      {/* Manager Review Status */}
                      <td>{renderStatusBadge(emp.managerReviewStatus, emp.managerReviewNote)}</td>

                      {/* Final Review Status */}
                      <td>{renderStatusBadge(emp.finalReviewStatus)}</td>

                      {/* Overall Status */}
                      <td>{renderStatusBadge(emp.overallStatus)}</td>

                      {/* Row Action Popover */}
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          className={`more-trigger-btn ${isMenuOpen ? 'is-active' : ''}`}
                          style={{ margin: '0 auto', width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(isMenuOpen ? null : emp.id);
                          }}
                          aria-label={`Actions for ${emp.name}`}
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
                                  `/performance/employees/${emp.id}`
                                );
                              }}
                            >
                              <Eye size={13} />
                              <span>View Performance</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                onNavigate(
                                  `/performance/cycles/${cycleId}/employees/${emp.id}/goals`
                                );
                              }}
                            >
                              <Target size={13} />
                              <span>View Goals</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => {
                                setOpenActionId(null);
                                onNavigate(
                                  `/performance/cycles/${cycleId}/employees/${emp.id}/reviews`
                                );
                              }}
                            >
                              <Award size={13} />
                              <span>View Reviews</span>
                            </button>

                            <button
                              type="button"
                              className="more-menu-item"
                              onClick={() => handleSendSingleReminder(emp)}
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
    </div>
  );
};
