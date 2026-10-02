import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { UserRole } from '../../types/performance';
import './AppShell.css';

export interface AppShellProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  children: React.ReactNode;
  onShowToast?: (type: any, title: string, desc?: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeRoute,
  onNavigate,
  currentUserRole,
  onRoleChange,
  children,
  onShowToast
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="sixtifi-app-root">
      {/* Primary Sidebar */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        currentUserRole={currentUserRole}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="sixtifi-main-wrapper">
        {/* Top Header */}
        <TopHeader
          currentRole={currentUserRole}
          onRoleChange={onRoleChange}
          onShowToast={onShowToast}
        />

        {/* Dynamic Route Content */}
        <main className="sixtifi-content-area animate-fade-in" key={activeRoute}>
          {children}
        </main>
      </div>
    </div>
  );
};
