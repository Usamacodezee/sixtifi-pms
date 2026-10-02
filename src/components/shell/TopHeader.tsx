import React from 'react';
import { Search, Bell, HelpCircle, ChevronDown, Building, Sparkles } from 'lucide-react';
import { UserRole } from '../../types/performance';
import { RoleSwitcher } from './RoleSwitcher';
import './TopHeader.css';

export interface TopHeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentRole,
  onRoleChange,
  onShowToast
}) => {
  const getRoleBadgeTitle = () => {
    switch (currentRole) {
      case 'Employee':
        return { name: 'Priya Sharma', role: 'Software Engineer', initials: 'PS' };
      case 'Manager':
        return { name: 'Amit Patel', role: 'Engineering Lead', initials: 'AP' };
      case 'HR/Admin':
      default:
        return { name: 'Rahul Shah', role: 'HR Director', initials: 'RS' };
    }
  };

  const userProfile = getRoleBadgeTitle();

  return (
    <header className="app-top-header">
      {/* Left: Search Input */}
      <div className="header-search-container">
        <Search size={16} className="header-search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Search performance, goals, reviews... (⌘K)"
          onClick={() => onShowToast?.('info', 'Global Search', 'Quick search shortcut overlay activated.')}
        />
        <kbd className="header-search-kbd">⌘K</kbd>
      </div>

      {/* Center/Right: Role Switcher Demo Controller */}
      <div className="header-center-controls">
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
      </div>

      {/* Right Actions */}
      <div className="header-actions">
        {/* Tenant Selector */}
        <div className="tenant-pill" title="Active Workspace">
          <Building size={14} className="tenant-icon" />
          <span className="tenant-name">Sixtifi HQ</span>
          <ChevronDown size={12} className="tenant-chevron" />
        </div>

        <div className="header-divider"></div>

        {/* Notification Icon */}
        <button
          className="header-icon-btn"
          title="Notifications"
          onClick={() =>
            onShowToast?.(
              'info',
              'Cycle Reminder',
              'Q3 Appraisal self-review submission deadline is in 4 days.'
            )
          }
        >
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        {/* Help Icon */}
        <button
          className="header-icon-btn"
          title="Performance Help & Documentation"
          onClick={() =>
            onShowToast?.(
              'info',
              'PMS Guide',
              'Viewing performance appraisal documentation and guidelines.'
            )
          }
        >
          <HelpCircle size={18} />
        </button>

        <div className="header-divider"></div>

        {/* User Profile Pill */}
        <div className="user-profile-pill" title={`Logged in as ${userProfile.name} (${currentRole})`}>
          <div className="user-avatar">{userProfile.initials}</div>
          <div className="user-info">
            <span className="user-name">{userProfile.name}</span>
            <span className="user-role">{userProfile.role}</span>
          </div>
          <ChevronDown size={14} className="user-chevron" />
        </div>
      </div>
    </header>
  );
};
