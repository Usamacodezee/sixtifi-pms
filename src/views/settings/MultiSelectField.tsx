import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  sub?: string;
}

export interface MultiSelectFieldProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  options,
  selected,
  onChange,
  searchable = false,
  placeholder = 'Search...'
}) => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const remove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  return (
    <div className="multiselect-field">
      {searchable && (
        <div className="emp-search-wrap" style={{ maxWidth: 'none' }}>
          <Search size={14} className="emp-search-icon" />
          <input
            type="text"
            className="emp-search-input"
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div className="multiselect-box">
        {filtered.length === 0 ? (
          <div className="multiselect-empty">No matches found.</div>
        ) : (
          filtered.map((opt) => (
            <label key={opt.value} className="multiselect-option-row">
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{opt.label}</span>
                {opt.sub && <span className="multiselect-option-sub">{opt.sub}</span>}
              </span>
            </label>
          ))
        )}
      </div>

      {selected.length > 0 && (
        <div className="multiselect-pills">
          {selected.map((value) => {
            const opt = options.find((o) => o.value === value);
            return (
              <span key={value} className="multiselect-pill">
                <span>{opt?.label || value}</span>
                <button type="button" onClick={() => remove(value)} aria-label={`Remove ${opt?.label || value}`}>
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
