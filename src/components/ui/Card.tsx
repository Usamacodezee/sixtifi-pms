import React from 'react';
import './Card.css';

export interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false
}) => {
  const hasHeader = title || subtitle || action;

  return (
    <div className={`sixtifi-card ${className}`}>
      {hasHeader && (
        <div className="card-header">
          <div className="card-header-titles">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-header-action">{action}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export interface EmptyPlaceholderProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="empty-placeholder-container">
      {icon && <div className="empty-icon-wrapper">{icon}</div>}
      <h4 className="empty-title">{title}</h4>
      <p className="empty-description">{description}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};
