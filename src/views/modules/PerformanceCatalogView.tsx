import React, { useMemo, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, EmptyPlaceholder } from '../../components/ui/Card';
import { ToastType } from '../../components/ui/Toast';
import { Search, LayoutGrid, Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import './ModuleStyles.css';
import '../cycles/CycleEmployeesTab.css';
import '../cycles/PerformanceCyclesView.css';

export interface CatalogColumn {
  key: string;
  label: string;
  width?: string;
  render?: (row: CatalogRow) => React.ReactNode;
}

export interface CatalogRow {
  id: string;
  [key: string]: unknown;
}

export interface CatalogStat {
  label: string;
  value: string | number;
}

export interface PerformanceCatalogViewProps {
  title: string;
  subtitle: string;
  breadcrumb: string;
  columns: CatalogColumn[];
  rows: CatalogRow[];
  stats?: CatalogStat[];
  searchKeys?: string[];
  statusKey?: string;
  statusOptions?: string[];
  primaryActionLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onPrimaryAction?: () => void;
  onRowAction?: (row: CatalogRow) => void;
  rowActionLabel?: string;
  detailRenderer?: (row: CatalogRow) => React.ReactNode;
  /** When true, omit page header (for Settings embed). */
  embedded?: boolean;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (['active', 'completed', 'approved', 'closed', 'responded'].includes(s)) {
    return 'badge-success';
  }
  if (['pending', 'draft', 'scheduled', 'open'].includes(s)) {
    return 'badge-warning';
  }
  if (['overdue', 'rejected'].includes(s)) {
    return 'badge-danger';
  }
  if (['in progress'].includes(s)) {
    return 'badge-info';
  }
  return 'badge-neutral';
};

export const PerformanceCatalogView: React.FC<PerformanceCatalogViewProps> = ({
  title,
  subtitle,
  breadcrumb,
  columns,
  rows,
  stats = [],
  searchKeys = [],
  statusKey,
  statusOptions = [],
  primaryActionLabel,
  emptyTitle = 'No records',
  emptyDescription = 'Nothing to show for the current filters.',
  onPrimaryAction,
  onRowAction,
  rowActionLabel = 'Open',
  detailRenderer,
  embedded = false,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus =
        !statusKey ||
        statusFilter === 'all' ||
        String(row[statusKey] ?? '').toLowerCase() === statusFilter.toLowerCase();

      if (!matchesStatus) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const keys = searchKeys.length ? searchKeys : columns.map((c) => c.key);
      return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(q));
    });
  }, [rows, searchTerm, statusFilter, statusKey, searchKeys, columns]);

  const selected = filtered.find((r) => r.id === selectedId) || null;

  const handlePrimary = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    onShowToast?.('info', `${title}`, 'Create action is available in the live demo mock.');
  };

  return (
    <div className={`perf-module-page ${embedded ? 'is-embedded' : 'animate-fade-in'}`}>
      {!embedded && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: breadcrumb }
          ]}
          actions={
            primaryActionLabel ? (
              <button
                type="button"
                className="pms-btn pms-btn-primary"
                style={{ padding: '7px 14px', gap: 6 }}
                onClick={handlePrimary}
              >
                <Plus size={14} />
                <span>{primaryActionLabel}</span>
              </button>
            ) : undefined
          }
        />
      )}

      {embedded && (
        <div className="settings-embedded-header">
          <div>
            <h2 className="settings-embedded-title">{title}</h2>
            <p className="settings-embedded-subtitle">{subtitle}</p>
          </div>
          {primaryActionLabel && (
            <button
              type="button"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 14px', gap: 6 }}
              onClick={handlePrimary}
            >
              <Plus size={14} />
              <span>{primaryActionLabel}</span>
            </button>
          )}
        </div>
      )}

      {stats.length > 0 && (
        <div className="perf-module-summary">
          {stats.map((stat) => (
            <div key={stat.label} className="cycle-stat-card">
              <div className="stat-card-left">
                <span className="stat-card-label">{stat.label}</span>
                <span className="stat-card-val">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Card title={`${title} (${filtered.length})`}>
        <div className="emp-filter-toolbar">
          <div className="emp-search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <Search size={14} className="emp-search-icon" />
            <input
              className="emp-search-input"
              placeholder="Search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {statusKey && statusOptions.length > 0 && (
            <select
              className="emp-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyPlaceholder
            icon={<LayoutGrid size={26} />}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <div className="pms-table-container perf-module-table-wrap">
            <table className="pms-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{ width: 110 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className={`perf-module-row-clickable ${selectedId === row.id ? 'is-selected' : ''}`}
                    onClick={() => setSelectedId(row.id)}
                  >
                    {columns.map((col) => {
                      const raw = row[col.key];
                      const content = col.render
                        ? col.render(row)
                        : col.key.toLowerCase().includes('status')
                          ? (
                            <span className={`pms-badge ${statusBadge(String(raw ?? ''))}`}>
                              {String(raw ?? '—')}
                            </span>
                          )
                          : String(raw ?? '—');
                      return <td key={col.key}>{content}</td>;
                    })}
                    <td>
                      <button
                        type="button"
                        className="pms-btn pms-btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.78rem', gap: 4 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(row.id);
                          onRowAction?.(row);
                        }}
                      >
                        <span>{rowActionLabel}</span>
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && detailRenderer && (
          <div className="perf-module-detail-panel">
            {detailRenderer(selected)}
            {onRowAction && (
              <div className="perf-module-detail-actions">
                <button
                  type="button"
                  className="pms-btn pms-btn-primary"
                  style={{ padding: '7px 14px', gap: 6 }}
                  onClick={() => onRowAction(selected)}
                >
                  <CheckCircle2 size={14} />
                  <span>{rowActionLabel}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
