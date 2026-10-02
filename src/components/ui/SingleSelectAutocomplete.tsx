import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Globe } from 'lucide-react';
import './SingleSelectAutocomplete.css';

export interface AutocompleteOption {
  value: string;
  label: string;
  sub?: string;
}

export interface SingleSelectAutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  id?: string;
  allLabel?: string;
}

export const SingleSelectAutocomplete: React.FC<SingleSelectAutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select or search...',
  disabled = false,
  hasError = false,
  id,
  allLabel = 'All'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find matching option object
  const selectedOption = options.find(
    (o) =>
      o.value.toLowerCase() === value.toLowerCase() ||
      o.label.toLowerCase() === value.toLowerCase()
  );

  // Sync input query when closed or value changes externally
  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedOption ? selectedOption.label : value);
    }
  }, [value, isOpen, selectedOption]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions =
    query.trim() && isOpen
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(query.toLowerCase()) ||
            o.value.toLowerCase().includes(query.toLowerCase()) ||
            (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
        )
      : options;

  const handleSelect = (opt: AutocompleteOption) => {
    onChange(opt.value);
    setQuery(opt.label);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % Math.max(1, filteredOptions.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length > 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (query.trim()) {
        onChange(query.trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`single-autocomplete-container ${isOpen ? 'is-open' : ''} ${hasError ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <div
        className="single-autocomplete-input-wrap"
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            if (inputRef.current) inputRef.current.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="single-autocomplete-input"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => {
            setIsOpen(true);
            // Select all text on focus for easy replacement
            if (inputRef.current) {
              inputRef.current.select();
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="single-autocomplete-actions">
          {value && !disabled && (
            <button
              type="button"
              className="single-autocomplete-clear-btn"
              onClick={handleClear}
              title="Clear selection"
              tabIndex={-1}
            >
              <X size={13} />
            </button>
          )}
          <ChevronDown size={14} className={`single-autocomplete-chevron ${isOpen ? 'is-expanded' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="single-autocomplete-dropdown animate-fade-in-fast">
          {filteredOptions.length === 0 ? (
            <div className="single-autocomplete-empty">
              <span>No options matching &quot;{query}&quot;</span>
              {query.trim() && (
                <button
                  type="button"
                  className="single-autocomplete-custom-btn"
                  onClick={() => {
                    onChange(query.trim());
                    setIsOpen(false);
                  }}
                >
                  Use &quot;{query.trim()}&quot;
                </button>
              )}
            </div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected =
                opt.value.toLowerCase() === value.toLowerCase() ||
                opt.label.toLowerCase() === value.toLowerCase();
              const isHighlighted = idx === highlightedIndex;
              const isAllOption =
                opt.value.toLowerCase() === 'all' ||
                opt.label.toLowerCase().startsWith('all');

              return (
                <div
                  key={opt.value}
                  className={`single-autocomplete-option ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'is-highlighted' : ''} ${isAllOption ? 'is-all-option' : ''}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                >
                  <div className="single-autocomplete-option-content">
                    <span className="single-autocomplete-option-label">
                      {isAllOption && <Globe size={13} className="single-autocomplete-all-icon" />}
                      {opt.label}
                    </span>
                    {opt.sub && <span className="single-autocomplete-option-sub">{opt.sub}</span>}
                  </div>
                  {isSelected && <Check size={14} className="single-autocomplete-check-icon" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
