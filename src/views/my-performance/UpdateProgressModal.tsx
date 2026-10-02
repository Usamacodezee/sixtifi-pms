import React, { useEffect, useState } from 'react';
import { MyGoalItem, calculateGoalStatus } from '../../data/mockMyGoals';
import { GoalStatus } from '../../types/performance';
import {
  achievementFromProgress,
  progressFromAchievement
} from '../../utils/goalProgressSync';
import {
  X,
  Lock,
  UploadCloud,
  FileText,
  AlertCircle,
  Info
} from 'lucide-react';

export interface UpdateProgressModalProps {
  goal: MyGoalItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalId: string, updatedFields: {
    progress: number;
    currentAchievement: string;
    comment?: string;
    attachmentName?: string;
  }) => void;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSave
}) => {
  const [progressInput, setProgressInput] = useState<string>(goal.progress.toString());
  const [achievementInput, setAchievementInput] = useState<string>(goal.currentAchievement);
  const [commentInput, setCommentInput] = useState<string>('');
  const [attachment, setAttachment] = useState<string | null>(goal.evidencePlaceholder || null);
  const [error, setError] = useState<string | null>(null);
  /** Which field the user last edited — used to avoid feedback loops. */
  const [lastEdited, setLastEdited] = useState<'progress' | 'achievement' | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setProgressInput(goal.progress.toString());
    setAchievementInput(goal.currentAchievement);
    setCommentInput('');
    setAttachment(goal.evidencePlaceholder || null);
    setError(null);
    setLastEdited(null);
  }, [isOpen, goal]);

  if (!isOpen) return null;

  const currentNum = Number(progressInput);
  const isValidNum = !isNaN(currentNum) && progressInput.trim() !== '';
  const isOutOfRange = isValidNum && (currentNum < 0 || currentNum > 100);

  const previewStatus: GoalStatus =
    isValidNum && !isOutOfRange ? calculateGoalStatus(currentNum) : goal.status;

  const validateProgress = (val: string) => {
    const num = Number(val);
    if (val.trim() === '') {
      setError('Progress percentage is required.');
    } else if (isNaN(num)) {
      setError('Please enter a valid number.');
    } else if (num < 0 || num > 100) {
      setError('Progress must be between 0% and 100%.');
    } else {
      setError(null);
    }
  };

  const handleProgressChange = (val: string) => {
    setLastEdited('progress');
    setProgressInput(val);
    validateProgress(val);
    const num = Number(val);
    if (val.trim() !== '' && !isNaN(num) && num >= 0 && num <= 100) {
      setAchievementInput(
        achievementFromProgress(num, goal.target, goal.currentAchievement, goal.progress)
      );
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleProgressChange(e.target.value);
  };

  const handleAchievementChange = (val: string) => {
    setLastEdited('achievement');
    setAchievementInput(val);
    const derived = progressFromAchievement(
      val,
      goal.target,
      goal.currentAchievement,
      goal.progress
    );
    if (derived !== null) {
      setProgressInput(String(derived));
      setError(null);
    }
  };

  const handleSimulateUpload = () => {
    const sampleFiles = [
      'Q4_Performance_Evidence.pdf',
      'Client_Meeting_Signoff.pdf',
      'Revenue_Milestone_Data.xlsx',
      'Certification_Receipt.pdf'
    ];
    setAttachment(sampleFiles[Math.floor(Math.random() * sampleFiles.length)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let num = Number(progressInput);

    // If user last edited achievement, prefer derived progress
    if (lastEdited === 'achievement') {
      const derived = progressFromAchievement(
        achievementInput,
        goal.target,
        goal.currentAchievement,
        goal.progress
      );
      if (derived !== null) num = derived;
    }

    if (progressInput.trim() === '' || isNaN(num)) {
      setError('Please provide a valid progress percentage.');
      return;
    }
    if (num < 0 || num > 100) {
      setError('Progress must be between 0% and 100%.');
      return;
    }

    const syncedAchievement =
      achievementInput.trim() ||
      achievementFromProgress(num, goal.target, goal.currentAchievement, goal.progress);

    onSave(goal.id, {
      progress: num,
      currentAchievement: syncedAchievement,
      comment: commentInput.trim() || undefined,
      attachmentName: attachment || undefined
    });
  };

  const renderStatusBadge = (status: GoalStatus) => {
    switch (status) {
      case 'On Track':
        return <span className="pms-badge badge-success">On Track</span>;
      case 'Completed':
        return <span className="pms-badge badge-success">Completed</span>;
      case 'At Risk':
        return <span className="pms-badge badge-warning">At Risk</span>;
      case 'Needs Attention':
        return <span className="pms-badge badge-danger">Needs Attention</span>;
      default:
        return <span className="pms-badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h3 className="modal-title">Update Goal Progress</h3>
            <p className="modal-subtitle">
              Progress % and current value stay linked to your target.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-goal-summary-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="modal-goal-summary-title">{goal.title}</span>
                <span className="pms-badge badge-neutral" style={{ fontSize: '0.65rem', gap: 4 }}>
                  <Lock size={10} />
                  <span>Cycle Managed</span>
                </span>
              </div>
              <div className="modal-goal-summary-meta">
                <span>
                  Target: <strong>{goal.target}</strong>
                </span>
                <span>•</span>
                <span>
                  Appraisal Weight: <strong>{goal.weight}%</strong>
                </span>
                <span>•</span>
                <span>
                  Due: <strong>{goal.dueDate}</strong>
                </span>
              </div>
            </div>

            <div className="manager-controlled-notice">
              <Info size={14} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
              <span>
                Changing <strong>Progress %</strong> updates <strong>Current</strong> from the target
                (and the other way around when Current is numeric).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="progress-input">
                <span>Current Progress (%)</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>0% – 100%</span>
              </label>

              <div className="progress-input-row">
                <div className="progress-number-box">
                  <input
                    id="progress-input"
                    type="number"
                    min="0"
                    max="100"
                    className={`form-input ${error ? 'is-invalid' : ''}`}
                    value={progressInput}
                    onChange={(e) => handleProgressChange(e.target.value)}
                    placeholder="82"
                  />
                  <span className="progress-percent-symbol">%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  className="progress-slider"
                  value={isValidNum && !isOutOfRange ? currentNum : 0}
                  onChange={handleSliderChange}
                />
              </div>

              {error && (
                <div className="form-error-msg">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}

              <div className="status-preview-box">
                <span style={{ color: 'var(--text-secondary)' }}>Calculated Goal Status:</span>
                <div>{renderStatusBadge(previewStatus)}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="achievement-input">
                <span>Current (numerical value)</span>
                <span className="form-label-optional">Synced with %</span>
              </label>
              <input
                id="achievement-input"
                type="text"
                className="form-input"
                value={achievementInput}
                onChange={(e) => handleAchievementChange(e.target.value)}
                placeholder="e.g. ₹85 Lakh / 15 Accounts / 90%"
                required
              />
              <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Against target <strong>{goal.target}</strong>. Edit either field — the other updates
                automatically when both are numeric.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="comment-input">
                <span>Progress Notes & Narrative</span>
                <span className="form-label-optional">Optional</span>
              </label>
              <textarea
                id="comment-input"
                className="form-textarea"
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add context, achievements, or blockers regarding this update for your manager..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Supporting Evidence / Attachment</span>
                <span className="form-label-optional">Optional</span>
              </label>
              {attachment ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    borderRadius: 6
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.75rem',
                      color: '#0369A1'
                    }}
                  >
                    <FileText size={14} />
                    <span style={{ fontWeight: 600 }}>{attachment}</span>
                  </div>
                  <button
                    type="button"
                    style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}
                    onClick={() => setAttachment(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className="attachment-upload-box"
                  onClick={handleSimulateUpload}
                  role="button"
                  tabIndex={0}
                >
                  <UploadCloud size={16} />
                  <span>Click to attach proof or milestone document (PDF, Excel, Doc)</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="pms-btn pms-btn-secondary"
              style={{ padding: '7px 14px', fontSize: '0.78rem' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pms-btn pms-btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.78rem' }}
              disabled={!!error || progressInput.trim() === ''}
            >
              Save Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
