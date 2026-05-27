import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  className = '',
  children,
  ...props
}) => {
  const classes = [
    'mech-badge',
    `mech-badge-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};
