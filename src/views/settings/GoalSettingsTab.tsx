import React, { useState } from 'react';
import { GoalSettings } from '../../data/mockSettings';
import { ToastType } from '../../components/ui/Toast';
import { Check } from 'lucide-react';

export interface GoalSettingsTabProps {
  settings: GoalSettings;
  onSave: (settings: GoalSettings) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
}

const TOGGLE_ROWS: Array<{ key: keyof GoalSettings; label: string; desc: string }> = [
  { key: 'requireManagerApprovalForGoals', label: 'Require Manager Approval for New Goals', desc: 'Goals an employee creates must be approved by their manager before becoming active.' },
  { key: 'allowGoalEditsAfterCycleStart', label: 'Allow Goal Edits After Cycle Start', desc: 'Employees and managers can edit goal targets once the Appraisal Cycle is active.' },
  { key: 'sendProgressReminders', label: 'Send Automated Progress Reminders', desc: 'Employees receive automated reminder notifications to log their goal achievement progress.' }
];

export const GoalSettingsTab: React.FC<GoalSettingsTabProps> = ({ settings, onSave, onShowToast }) => {
  const [local, setLocal] = useState<GoalSettings>(settings);

  const handleToggle = (key: keyof GoalSettings) => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(local);
    onShowToast?.('success', 'Settings saved successfully.', 'Goal configuration updated for this session.');
  };

  return (
    <div className="settings-section-card">
      <div className="form-section-header">
        <h2 className="form-section-title">Goal Settings</h2>
        <p className="form-section-subtitle">Goal configuration for this Appraisal Cycle.</p>
      </div>

      <div className="settings-toggle-stack">
        {TOGGLE_ROWS.map((row) => (
          <div key={row.key} className="toggle-setting-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {row.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.desc}</span>
            </div>
            <button
              type="button"
              className={`toggle-switch-btn ${local[row.key] ? 'is-active' : ''}`}
              onClick={() => handleToggle(row.key)}
              aria-label={`Toggle ${row.label}`}
            >
              <div className="toggle-switch-knob" />
            </button>
          </div>
        ))}
      </div>

      <div className="settings-section-footer">
        <button type="button" className="pms-btn pms-btn-primary" style={{ padding: '8px 18px', gap: 6 }} onClick={handleSave}>
          <Check size={14} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};
