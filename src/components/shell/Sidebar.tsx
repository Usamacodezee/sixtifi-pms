import React, { useState } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  Award,
  Users,
  CalendarClock,
  Sliders,
  CheckSquare,
  Receipt,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  Sparkles,
  BarChart3,
  Target,
  ClipboardList
} from 'lucide-react';
import { UserRole } from '../../types/performance';
import { getVisiblePerformanceSubmenu } from '../../data/navigation';
import './Sidebar.css';

export interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  currentUserRole: UserRole;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  currentUserRole,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Keep Performance expanded by default or if active
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(true);

  const isPerformanceActive = activeRoute.startsWith('/performance');
  const visibleSubmenuItems = getVisiblePerformanceSubmenu(currentUserRole);

  const getSubmenuIcon = (id: string) => {
    switch (id) {
      case 'overview':
        return LayoutDashboard;
      case 'my-performance':
        return Award;
      case 'my-team':
        return Users;
      case 'goals':
        return Target;
      case 'cycles':
        return CalendarClock;
      case 'reviews':
        return ClipboardList;
      case 'reports':
        return BarChart3;
      case 'settings':
        return Sliders;
      default:
        return TrendingUp;
    }
  };

  // Other Platform Modules (Standard Sixtifi Workforce Modules)
  const platformNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, route: '/tasks', badge: 3 },
    { id: 'expenses', label: 'Expenses', icon: Receipt, route: '/expenses' },
    { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy, route: '/helpdesk' }
  ];

  return (
    <aside className={`sixtifi-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-img-wrapper" title="Sixtifi">
          <img src="/sixtifi-icon-app.svg" alt="Sixtifi" className="sidebar-brand-icon-img" />
        </div>
        {!isCollapsed && (
          <div className="brand-text-group">
            <div className="brand-name-row">
              <span className="brand-name">Sixtifi</span>
              <span className="brand-dot">.</span>
            </div>
            <span className="brand-module-tag">PERFORMANCE</span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="sidebar-nav-container">
        {/* Core Platform Section */}
        <div className="nav-group">
          {!isCollapsed && <span className="nav-group-label">PLATFORM</span>}
          <ul className="nav-list">
            {platformNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => onNavigate(item.route)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={16} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    {!isCollapsed && item.badge !== undefined && (
                      <span className="count-badge">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Performance Module Section */}
        <div className="nav-group performance-nav-group">
          {!isCollapsed && (
            <div className="nav-group-header">
              <span className="nav-group-label">TALENT & APPRAISAL</span>
            </div>
          )}

          <div className={`module-accordion-wrapper ${isPerformanceActive ? 'is-module-active' : ''}`}>
            {/* Top-Level Performance Module Item */}
            <button
              className={`nav-item-btn module-header-btn ${isPerformanceActive ? 'is-active' : ''}`}
              onClick={() => {
                if (isCollapsed) {
                  onNavigate('/performance');
                } else {
                  setIsPerformanceOpen(!isPerformanceOpen);
                  if (!isPerformanceActive) {
                    onNavigate('/performance');
                  }
                }
              }}
              title={isCollapsed ? 'Performance' : undefined}
            >
              <TrendingUp size={16} className="nav-icon module-icon" />
              {!isCollapsed && (
                <>
                  <span className="nav-label module-name-label">Performance</span>
                  <span className="module-tag-indicator">PMS</span>
                  <span className="module-chevron">
                    {isPerformanceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>

            {/* Performance Submenu Items (Role Filtered) */}
            {(!isCollapsed && isPerformanceOpen) && (
              <ul className="submenu-list animate-fade-in">
                {visibleSubmenuItems.map((subItem) => {
                  const SubIcon = getSubmenuIcon(subItem.id);
                  const isSubActive =
                    activeRoute === subItem.route ||
                    (subItem.route === '/performance' &&
                      (activeRoute === '/performance/overview' || activeRoute === '/performance')) ||
                    (subItem.route !== '/performance' && activeRoute.startsWith(`${subItem.route}/`));

                  return (
                    <li key={subItem.id}>
                      <button
                        className={`submenu-item-btn ${isSubActive ? 'is-active' : ''}`}
                        onClick={() => onNavigate(subItem.route)}
                        title={subItem.label}
                      >
                        <div className="submenu-bullet-icon">
                          <SubIcon size={14} />
                        </div>
                        <span className="submenu-label">{subItem.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="sidebar-footer">
        <button
          className={`nav-item-btn ${activeRoute === '/settings' ? 'is-active' : ''}`}
          onClick={() => onNavigate('/settings')}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings size={16} className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Settings</span>}
        </button>
        <button
          className="nav-item-btn"
          onClick={() => onNavigate('/help')}
          title={isCollapsed ? 'Help & Support' : undefined}
        >
          <HelpCircle size={16} className="nav-icon" />
          {!isCollapsed && <span className="nav-label">Help & Guides</span>}
        </button>

        <button
          className="sidebar-collapse-toggle"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
