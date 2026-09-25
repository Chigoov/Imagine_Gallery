import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'neutral' | 'pin' | 'fav' | 'heart' | 'glass';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
}) => {
  const variantClasses = {
    accent: 'bg-accent/20 text-accent border border-accent/40',
    neutral: 'bg-surface text-app-secondary border border-subtle',
    pin: 'bg-pin/20 text-pin border border-pin/40 font-semibold',
    fav: 'bg-fav/20 text-fav border border-fav/40',
    heart: 'bg-heart/20 text-heart border border-heart/40',
    glass: 'soft-glass text-app-primary border-white/10 shadow-glass',
  }[variant];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        variantClasses,
        className
      )}
    >
      {children}
    </span>
  );
};
