import React from 'react';
import { UserRole } from '../../types/performance';
import { Shield, User, Users } from 'lucide-react';
import './RoleSwitcher.css';

export interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const roles: Array<{ id: UserRole; label: string; icon: any; description: string }> = [
    { id: 'Employee', label: 'Employee', icon: User, description: 'Overview, Goals, My Performance' },
    { id: 'Manager', label: 'Manager', icon: Users, description: 'Overview, Goals, My Performance, My Team' },
    { id: 'HR/Admin', label: 'HR / Admin', icon: Shield, description: 'All Performance modules' }
  ];

  return (
    <div className="role-switcher-container">
      <span className="role-switcher-label">PREVIEW ROLE:</span>
      <div className="role-switcher-pill-group">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              className={`role-pill-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onRoleChange(r.id)}
              title={`${r.label} View: ${r.description}`}
            >
              <Icon size={12} className="role-pill-icon" />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
