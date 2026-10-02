import React from 'react';
import './PageHeader.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'neutral' | 'danger';
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeVariant = 'primary',
  actions,
  breadcrumbs
}) => {
  return (
    <div className="sixtifi-page-header">
      <div className="page-header-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="page-breadcrumbs" aria-label="Breadcrumb">
            <ol>
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="breadcrumb-item">
                  {crumb.href ? (
                    <a href={crumb.href}>{crumb.label}</a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge && <span className={`page-title-badge badge-${badgeVariant}`}>{badge}</span>}
        </div>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
