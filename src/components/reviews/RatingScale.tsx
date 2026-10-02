import React from 'react';
import { RATING_LABELS } from '../../data/reviewEngine';

export interface RatingScaleProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  error?: string;
  idPrefix?: string;
  labels?: string[];
}

export const RatingScale: React.FC<RatingScaleProps> = ({
  value,
  onChange,
  readOnly = false,
  error,
  idPrefix,
  labels
}) => {
  const scaleLabels = labels && labels.length === 5 ? labels : RATING_LABELS;
  const getLabel = (rating: number) => (rating >= 1 && rating <= 5 ? scaleLabels[rating - 1] : '');

  if (readOnly) {
    return (
      <div className="self-review-readonly-rating">
        {value > 0 ? `${value} — ${getLabel(value)}` : 'Not rated'}
      </div>
    );
  }

  return (
    <div>
      <div className="competency-rating-row">
        {scaleLabels.map((_, idx) => {
          const num = idx + 1;
          return (
            <button
              key={num}
              type="button"
              id={idPrefix ? `${idPrefix}-${num}` : undefined}
              className={`competency-rating-btn ${value === num ? 'is-active' : ''}`}
              onClick={() => onChange?.(num)}
            >
              {num}
            </button>
          );
        })}
        <span className="competency-rating-label-preview">
          {value > 0 ? getLabel(value) : 'Please select rating'}
        </span>
      </div>
      {error && (
        <div className="form-error-msg" style={{ marginTop: 4 }}>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
