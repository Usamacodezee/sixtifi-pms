import React from 'react';
import { AlertCircle } from 'lucide-react';
import { DynamicQuestion } from '../../data/reviewEngine';
import { RatingScale } from './RatingScale';

export interface DynamicQuestionFieldProps {
  question: DynamicQuestion;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  error?: string;
}

/**
 * Shared rendering engine for DynamicQuestion objects. Renders the correct
 * control for the question's type (Short Text / Long Text / Rating /
 * Yes-No / Single Select) and is reused as-is by the employee Self Review,
 * the Manager Review form, and the Question Template preview so the
 * question architecture is never duplicated.
 */
export const DynamicQuestionField: React.FC<DynamicQuestionFieldProps> = ({
  question,
  value,
  onChange,
  readOnly = false,
  error
}) => {
  if (readOnly) {
    if (question.type === 'Rating') {
      return <RatingScale value={Number(value) || 0} readOnly labels={question.ratingLabels} />;
    }
    return (
      <div className="self-review-readonly-field">
        {value || <em style={{ color: 'var(--text-muted)' }}>Not answered</em>}
      </div>
    );
  }

  switch (question.type) {
    case 'Rating':
      return (
        <RatingScale
          value={Number(value) || 0}
          onChange={(rating) => onChange(String(rating))}
          error={error}
          idPrefix={question.id}
          labels={question.ratingLabels}
        />
      );

    case 'Yes/No':
      return (
        <div className="question-engine-input-yes-no">
          <button
            type="button"
            className={`question-engine-btn-yes-no ${value === 'Yes' ? 'is-active' : ''}`}
            onClick={() => onChange('Yes')}
          >
            Yes
          </button>
          <button
            type="button"
            className={`question-engine-btn-yes-no ${value === 'No' ? 'is-active' : ''}`}
            onClick={() => onChange('No')}
          >
            No
          </button>
          {error && (
            <div className="form-error-msg">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    case 'Single Select':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(question.options || []).map((opt) => (
            <label
              key={opt}
              className={`question-engine-btn-yes-no ${value === opt ? 'is-active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer' }}
            >
              <input
                type="radio"
                name={question.id}
                checked={value === opt}
                onChange={() => onChange(opt)}
                style={{ accentColor: '#0284C7' }}
              />
              <span>{opt}</span>
            </label>
          ))}
          {error && (
            <div className="form-error-msg">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}
        </div>
      );

    case 'Short Text':
      return (
        <>
          <input
            type="text"
            className={`form-input ${error ? 'is-invalid' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your response here..."
            required={question.required}
          />
          {error && (
            <div className="form-error-msg">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}
        </>
      );

    case 'Long Text':
    default:
      return (
        <>
          <textarea
            className={`form-textarea ${error ? 'is-invalid' : ''}`}
            rows={4}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your detailed response here..."
            required={question.required}
          />
          {error && (
            <div className="form-error-msg">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}
        </>
      );
  }
};
