import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  wrapperStyle?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  wrapperStyle,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const selectClasses = [
    'mech-select',
    error ? 'mech-input-error' : '', // Reuse input error styling
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mech-input-wrapper" style={wrapperStyle}>
      {label && (
        <label htmlFor={selectId} className="mech-input-label">
          {label}
        </label>
      )}
      <select id={selectId} className={selectClasses} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mech-input-error-msg">{error}</span>}
    </div>
  );
};

