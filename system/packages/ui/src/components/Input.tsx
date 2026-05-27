import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const inputClasses = [
    'mech-input',
    error ? 'mech-input-error' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="mech-input-wrapper">
      {label && (
        <label htmlFor={inputId} className="mech-input-label">
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <span className="mech-input-error-msg">{error}</span>}
    </div>
  );
};
