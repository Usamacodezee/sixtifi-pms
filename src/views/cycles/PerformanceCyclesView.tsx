import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { PerformanceCycle, CycleStatus, CycleType } from '../../types/performance';
import { MOCK_PERFORMANCE_CYCLES, CYCLES_SUMMARY_METRICS } from '../../data/mockCycles';
import {
  CalendarClock,
  Plus,
  Search,
  CheckCircle2,
  FileEdit,
  Award,
  MoreVertical,
  Eye,
  Copy,
  Power,
  Trash2,
  Clock,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';
import './PerformanceCyclesView.css';

export interface PerformanceCyclesViewProps {
  cycles?: PerformanceCycle[];
  onNavigate: (route: string) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const PerformanceCyclesView: React.FC<PerformanceCyclesViewProps> = ({
  cycles = MOCK_PERFORMANCE_CYCLES,
  onNavigate,
  onShowToast
}) => {
  // State for search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  // Dynamic summary metrics
  const activeCount = cycles.filter((c) => c.status === 'Active').length;
  const draftCount = cycles.filter((c) => c.status === 'Draft').length;
  const completedCount = cycles.filter((c) => c.status === 'Completed').length;
  const totalCount = cycles.length;

  // Close action popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter logic
  const filteredCycles = cycles.filter((cycle) => {
    const matchesSearch =
      cycle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cycle.duration.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || cycle.status.toLowerCase() === selectedStatus.toLowerCase();

    const matchesType =
      selectedType === 'all' || cycle.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const isFiltered = searchTerm !== '' || selectedStatus !== 'all' || selectedType !== 'all';

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  const getStatusBadge = (status: CycleStatus) => {
    switch (status) {
      case 'Active':
        return <span className="pms-badge badge-success">Active</span>;
      case 'Completed':
        return <span className="pms-badge badge-info">Completed</span>;
      case 'Draft':
        return <span className="pms-badge badge-warning">Draft</span>;
      case 'Archived':
      default:
        return <span className="pms-badge badge-neutral">Archived</span>;
    }
  };

  const renderActionItems = (cycle: PerformanceCycle) => {
    const handleActionClick = (actionName: string) => {
      setOpenActionId(null);
      if (actionName === 'View Cycle') {
        onNavigate(`/performance/cycles/${cycle.id}`);
      } else if (actionName === 'Edit' || actionName === 'Edit Cycle') {
        onNavigate(`/performance/cycles/create`);
        onShowToast?.('info', `Edit ${cycle.name}`, 'Navigated to cycle editor placeholder.');
      } else {
        onShowToast?.('info', actionName, `Action triggered for "${cycle.name}".`);
      }
    };

    switch (cycle.status) {
      case 'Draft':
        return (
          <>
            <button className="popover-item" onClick={() => handleActionClick('Edit')}>
              <FileEdit size={13} />
              <span>Edit</span>
            </button>
            <button className="popover-item" onClick={() => handleActionClick('Preview')}>
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button className="popover-item" onClick={() => handleActionClick('Activate')}>
              <Power size={13} />
              <span>Activate</span>
            </button>
            <button className="popover-item text-red" onClick={() => handleActionClick('Delete')}>
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </>
        );

      case 'Active':
        return (
          <>
            <button className="popover-item" onClick={() => handleActionClick('View Cycle')}>
              <Eye size={13} />
              <span>View Cycle</span>
            </button>
            <button className="popover-item" onClick={() => handleActionClick('Edit Cycle')}>
              <FileEdit size={13} />
              <span>Edit Cycle</span>
            </button>
            <button className="popover-item text-red" onClick={() => handleActionClick('Close Cycle')}>
              <Power size={13} />
              <span>Close Cycle</span>
            </button>
          </>
        );

      case 'Completed':
      default:
        return (
          <>
            <button className="popover-item" onClick={() => handleActionClick('View Cycle')}>
              <Eye size={13} />
              <span>View Cycle</span>
            </button>
            <button className="popover-item" onClick={() => handleActionClick('Duplicate Cycle')}>
              <Copy size={13} />
              <span>Duplicate Cycle</span>
            </button>
          </>
        );
    }
  };

  return (
    <div className="cycles-page-container animate-fade-in">
      {/* 1. Page Header */}
      <PageHeader
        title="Appraisal Cycles"
        subtitle="Create and manage Appraisal Cycles across your organization."
        breadcrumbs={[
          { label: 'Platform', href: '#' },
          { label: 'Performance', href: '#' },
          { label: 'Appraisal Cycles' }
        ]}
        actions={
          <button
            className="pms-btn pms-btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.825rem', gap: '6px' }}
            onClick={() => onNavigate('/performance/cycles/create')}
          >
            <Plus size={16} />
            <span>Create Appraisal Cycle</span>
          </button>
        }
      />

      {/* 2. Compact Summary Cards */}
      <div className="cycles-summary-grid">
        <div className="cycle-stat-card">
          <div className="stat-card-left">
            <span className="stat-card-label">Total Cycles</span>
            <span className="stat-card-val">{totalCount}</span>
          </div>
          <div className="stat-card-icon-box blue">
            <Layers size={18} />
          </div>
        </div>

        <div className="cycle-stat-card">
          <div className="stat-card-left">
            <span className="stat-card-label">Active</span>
            <span className="stat-card-val" style={{ color: '#047857' }}>
              {activeCount}
            </span>
          </div>
          <div className="stat-card-icon-box green">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="cycle-stat-card">
          <div className="stat-card-left">
            <span className="stat-card-label">Draft</span>
            <span className="stat-card-val" style={{ color: '#B45309' }}>
              {draftCount}
            </span>
          </div>
          <div className="stat-card-icon-box amber">
            <FileEdit size={18} />
          </div>
        </div>

        <div className="cycle-stat-card">
          <div className="stat-card-left">
            <span className="stat-card-label">Completed</span>
            <span className="stat-card-val" style={{ color: '#6D28D9' }}>
              {completedCount}
            </span>
          </div>
          <div className="stat-card-icon-box purple">
            <Award size={18} />
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Toolbar */}
      <div className="cycles-filter-toolbar">
        <div className="toolbar-left-group">
          {/* Search Box */}
          <div className="search-input-wrapper">
            <Search size={14} className="search-input-icon" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search Appraisal Cycles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: 8, color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Cycle Type Filter */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select-field"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="annual">Annual</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>

          {isFiltered && (
            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <div className="toolbar-right-group">
          <span className="results-count-text">
            Showing {filteredCycles.length} of {cycles.length} cycles
          </span>
        </div>
      </div>

      {/* 4. Appraisal Cycles Table */}
      <div className="cycles-table-card">
        {filteredCycles.length > 0 ? (
          <div className="cycles-table-wrapper">
            <table className="cycles-table">
              <thead>
                <tr>
                  <th>Cycle Name</th>
                  <th>Cycle Type</th>
                  <th>Duration</th>
                  <th>Employees</th>
                  <th>Review Progress</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCycles.map((cycle) => (
                  <tr key={cycle.id}>
                    {/* Cycle Name */}
                    <td>
                      <div className="cycle-name-cell">
                        <span
                          className="cycle-name-link"
                          onClick={() => onNavigate(`/performance/cycles/${cycle.id}`)}
                          title="Click to view cycle details"
                        >
                          {cycle.name}
                        </span>
                      </div>
                    </td>

                    {/* Cycle Type */}
                    <td>
                      <span className="cycle-type-tag">{cycle.type}</span>
                    </td>

                    {/* Duration */}
                    <td>
                      <span className="cycle-duration-text">{cycle.duration}</span>
                    </td>

                    {/* Employees */}
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {cycle.employeesCount} {cycle.employeesCount === 1 ? 'employee' : 'employees'}
                      </span>
                    </td>

                    {/* Review Progress */}
                    <td>
                      <div className="cycle-progress-cell">
                        <div className="cycle-progress-bar-bg">
                          <div
                            className={`cycle-progress-bar-fill ${cycle.reviewProgress === 100 ? 'complete' : ''}`}
                            style={{ width: `${cycle.reviewProgress}%` }}
                          ></div>
                        </div>
                        <span className="cycle-progress-percent">{cycle.reviewProgress}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>{getStatusBadge(cycle.status)}</td>

                    {/* Actions Menu */}
                    <td style={{ textAlign: 'right' }}>
                      <div
                        className="action-menu-container"
                        ref={openActionId === cycle.id ? actionMenuRef : undefined}
                      >
                        <button
                          className={`action-trigger-btn ${openActionId === cycle.id ? 'is-open' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionId(openActionId === cycle.id ? null : cycle.id);
                          }}
                          title="Cycle Actions"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openActionId === cycle.id && (
                          <div className="action-popover-menu">
                            {renderActionItems(cycle)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="cycles-empty-state">
            <div className="empty-state-icon-box">
              <CalendarClock size={24} />
            </div>
            <h4 className="empty-state-title">No Appraisal Cycles found</h4>
            <p className="empty-state-desc">
              {isFiltered
                ? 'No cycles match your current search and filter criteria. Try resetting filters or search terms.'
                : 'Create your first Appraisal Cycle to start setting goals and managing employee performance.'}
            </p>
            {isFiltered ? (
              <button className="pms-btn pms-btn-secondary" onClick={handleClearFilters}>
                Reset Filters
              </button>
            ) : (
              <button
                className="pms-btn pms-btn-primary"
                onClick={() => onNavigate('/performance/cycles/create')}
              >
                <Plus size={14} />
                <span>Create Appraisal Cycle</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
