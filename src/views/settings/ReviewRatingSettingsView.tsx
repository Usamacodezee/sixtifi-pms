import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  ReviewRatingSettings,
  DEFAULT_REVIEW_RATING_SETTINGS
} from '../../data/mockSettings';
import { ToastType } from '../../components/ui/Toast';
import { Check, AlertCircle, RotateCcw, X } from 'lucide-react';
import '../cycles/CreateCycleWizard.css';
import './SettingsStyles.css';

export interface ReviewRatingSettingsViewProps {
  settings: ReviewRatingSettings;
  onSave: (settings: ReviewRatingSettings) => void;
  onNavigate: (route: string) => void;
  onShowToast?: (type: ToastType, title: string, desc?: string) => void;
  embedded?: boolean;
}

const getBadgeStyle = (label?: string) => {
  if (!label) return { bg: '#F1F5F9', color: '#64748B', border: '#CBD5E1' };
  const l = label.toLowerCase();
  if (l.includes('outstanding') || l.includes('superstar') || l.includes('exceeds')) {
    return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
  }
  if (l.includes('meets') || l.includes('proficient') || l.includes('good')) {
    return { bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' };
  }
  if (l.includes('needs') || l.includes('developing') || l.includes('improvement')) {
    return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
  }
  return { bg: '#FEE2E2', color: '#DC2626', border: '#FCA5A5' };
};

export const ReviewRatingSettingsView: React.FC<ReviewRatingSettingsViewProps> = ({
  settings,
  onSave,
  onNavigate,
  onShowToast,
  embedded = false
}) => {
  const [local, setLocal] = useState<ReviewRatingSettings>(settings);
  const [showResetModal, setShowResetModal] = useState(false);

  // --- Derived / validation (recomputed live so errors show inline as-you-type) ---
  const mappingLabelsValid = local.mapping.every((row) => row.label.trim().length > 0);

  const sortedMapping = [...local.mapping].sort((a, b) => a.minScore - b.minScore);
  const rangeErrors: Record<string, string> = {};
  sortedMapping.forEach((row, idx) => {
    if (Number.isNaN(row.minScore) || Number.isNaN(row.maxScore)) {
      rangeErrors[row.id] = 'Enter valid numbers.';
    } else if (row.minScore < 1 || row.maxScore > 5) {
      rangeErrors[row.id] = 'Range must stay between 1.0 and 5.0.';
    } else if (row.minScore > row.maxScore) {
      rangeErrors[row.id] = 'Min must be less than or equal to Max.';
    } else if (idx > 0 && row.minScore <= sortedMapping[idx - 1].maxScore) {
      rangeErrors[row.id] = 'This range overlaps with another range.';
    }
  });
  const rangesValid = Object.keys(rangeErrors).length === 0;

  const deadlineErrors: Record<string, string> = {};
  if (local.deadlines.selfReviewDays <= 0) deadlineErrors.selfReviewDays = 'Must be greater than 0.';
  if (local.deadlines.managerReviewDays <= 0) deadlineErrors.managerReviewDays = 'Must be greater than 0.';
  if (local.deadlines.finalReviewDays <= 0) deadlineErrors.finalReviewDays = 'Must be greater than 0.';
  const deadlinesValid = Object.keys(deadlineErrors).length === 0;

  const isFormValid = mappingLabelsValid && rangesValid && deadlinesValid;

  // --- Handlers ---
  const updateVisibility = (key: keyof ReviewRatingSettings['employeeVisibility']) => {
    setLocal((prev) => ({
      ...prev,
      employeeVisibility: { ...prev.employeeVisibility, [key]: !prev.employeeVisibility[key] }
    }));
  };

  const updateDeadline = (key: keyof ReviewRatingSettings['deadlines'], value: number) => {
    setLocal((prev) => ({ ...prev, deadlines: { ...prev.deadlines, [key]: value } }));
  };

  const updateMappingRow = (id: string, field: 'minScore' | 'maxScore' | 'label' | 'description', value: string) => {
    setLocal((prev) => ({
      ...prev,
      mapping: prev.mapping.map((row) =>
        row.id === id
          ? { ...row, [field]: field === 'label' || field === 'description' ? value : Number(value) }
          : row
      )
    }));
  };

  const handleSave = () => {
    if (!isFormValid) {
      onShowToast?.('error', 'Fix validation errors', 'Please resolve the highlighted fields before saving.');
      return;
    }
    onSave(local);
    onShowToast?.('success', 'Review & rating settings saved successfully.', 'Your configuration is active for this session.');
  };

  const handleCancel = () => {
    setLocal(settings);
    onNavigate('/performance/settings');
  };

  const handleConfirmReset = () => {
    setShowResetModal(false);
    setLocal(DEFAULT_REVIEW_RATING_SETTINGS);
    onSave(DEFAULT_REVIEW_RATING_SETTINGS);
    onShowToast?.('success', 'Settings reset to default.', 'Default rating mapping was restored.');
  };

  return (
    <div className={embedded ? 'settings-embedded-panel' : 'settings-page animate-fade-in'}>
      {!embedded && (
        <PageHeader
          title="Review & Rating"
          subtitle="Configure rating mapping, visibility, and default deadlines. Performance weights and review flow are managed per cycle when creating a Appraisal Cycle."
          breadcrumbs={[
            { label: 'Platform', href: '#' },
            { label: 'Performance', href: '#' },
            { label: 'Settings', href: '#/performance/settings' },
            { label: 'Review & Rating' }
          ]}
        />
      )}

      {embedded && (
        <div className="settings-embedded-header">
          <div>
            <h2 className="settings-embedded-title">Review & Rating Default Template</h2>
            <p className="settings-embedded-subtitle">
              Default baseline rating mapping for Appraisal Cycles. Review &amp; rating score mapping is configured directly inside Appraisal Cycle setup.
            </p>
          </div>
        </div>
      )}

      <div style={{ padding: '12px 16px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369A1', display: 'block' }}>
            💡 Configured Directly in Appraisal Cycle Setup
          </span>
          <span style={{ fontSize: '0.75rem', color: '#0C4A6E' }}>
            Review &amp; Rating score mapping and rating scale thresholds are managed directly when setting up a Appraisal Cycle (Step 3: Performance Setup).
          </span>
        </div>
        <button
          type="button"
          className="pms-btn pms-btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => onNavigate('/performance/cycles/new')}
        >
          Go to Cycle Setup &rarr;
        </button>
      </div>

      {/* 1. Final Rating Mapping (Contiguous Range Only Editing) */}
      <div className="settings-section-card">
        <div className="form-section-header">
          <h2 className="form-section-title">Final Rating Mapping</h2>
          <p className="form-section-subtitle">
            Adjust the score range threshold for each rating band. Ranges auto-align continuously from 1.0 to 5.0 without any skipped scores or gaps.
          </p>
        </div>

        <div className="form-section-gap">
          {[...local.mapping].sort((a, b) => b.minScore - a.minScore).map((row, idx, arr) => {
            const badge = getBadgeStyle(row.label);
            const isTop = idx === 0;
            const isBottom = idx === arr.length - 1;

            return (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '14px 16px',
                  background: '#FFFFFF',
                  borderRadius: 8,
                  border: `1px solid ${badge.border}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 999,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`
                    }}
                  >
                    {row.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {row.description}
                  </span>
                </div>

                {/* Score Range Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Range:</span>

                  {!isBottom ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        step={0.1}
                        min={1.1}
                        max={4.9}
                        className="form-input-text"
                        style={{ width: 68, textAlign: 'center', fontWeight: 700, padding: '4px 6px' }}
                        value={row.minScore}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (Number.isNaN(val)) return;

                          setLocal((prev) => {
                            const sorted = [...prev.mapping].sort((a, b) => b.minScore - a.minScore);
                            const i = sorted.findIndex((r) => r.id === row.id);
                            if (i === -1) return prev;

                            const upperMin = i === 0 ? 5.0 : sorted[i - 1].minScore;
                            const lowerMin = i === sorted.length - 1 ? 1.0 : sorted[i + 1].minScore;

                            const maxAllowed = Number((upperMin - 0.1).toFixed(1));
                            const minAllowed = Number((lowerMin + 0.1).toFixed(1));
                            const clamped = Math.min(maxAllowed, Math.max(minAllowed, val));

                            sorted[i].minScore = Number(clamped.toFixed(1));

                            // Auto-align maxScores seamlessly so no scores are skipped
                            const recomputed = sorted.map((r, index) => {
                              const max = index === 0 ? 5.0 : Number((sorted[index - 1].minScore - 0.1).toFixed(1));
                              return { ...r, maxScore: max };
                            });

                            return { ...prev, mapping: recomputed };
                          });
                        }}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>–</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'center' }}>
                        {row.maxScore.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 30, textAlign: 'center' }}>
                        1.0
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>–</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', width: 40, textAlign: 'center' }}>
                        {row.maxScore.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* 10 & 11. Bottom Action Bar */}
      <div className="settings-section-footer" style={{ justifyContent: 'space-between', borderTop: 'none', paddingTop: 0 }}>
        <button
          type="button"
          className="pms-btn pms-btn-secondary"
          style={{ padding: '8px 16px', gap: 6 }}
          onClick={() => setShowResetModal(true)}
        >
          <RotateCcw size={14} />
          <span>Reset to Default</span>
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="pms-btn pms-btn-secondary" style={{ padding: '8px 16px' }} onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="pms-btn pms-btn-primary" style={{ padding: '8px 18px', gap: 6 }} onClick={handleSave}>
            <Check size={14} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-backdrop" onClick={() => setShowResetModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3 className="modal-title">Reset review and rating settings?</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowResetModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
              <p>Your current configuration will be replaced with the default PMS settings.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="pms-btn pms-btn-secondary" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button type="button" className="pms-btn pms-btn-primary" style={{ backgroundColor: '#DC2626' }} onClick={handleConfirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
