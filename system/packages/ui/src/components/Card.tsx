import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  glow = false,
  className = '',
  children,
  ...props
}) => {
  const classes = [
    'mech-card',
    interactive ? 'mech-card-interactive' : '',
    glow ? 'mech-card-glow' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
