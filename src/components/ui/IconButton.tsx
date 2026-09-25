import React from 'react';
import { clsx } from 'clsx';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  active?: boolean;
  activeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'glass' | 'ghost' | 'surface' | 'accent';
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  active = false,
  activeColor,
  size = 'md',
  variant = 'glass',
  tooltip,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm p-1.5',
    md: 'w-10 h-10 text-base p-2 min-w-[44px] min-h-[44px]',
    lg: 'w-12 h-12 text-lg p-3 min-w-[48px] min-h-[48px]',
  }[size];

  const variantClasses = {
    glass: 'soft-glass text-app-secondary hover:text-app-primary hover:bg-elevated/80 shadow-glass',
    ghost: 'bg-transparent text-app-secondary hover:text-app-primary hover:bg-white/10',
    surface: 'bg-surface text-app-secondary hover:text-app-primary border border-subtle hover:border-strong',
    accent: 'bg-accent text-player hover:bg-accent-hover font-bold shadow-md',
  }[variant];

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl transition-all duration-140 select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-40 disabled:pointer-events-none',
        sizeClasses,
        variantClasses,
        active && (activeColor || 'text-accent bg-accent/20 border-accent/40'),
        className
      )}
      title={tooltip}
      aria-label={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};
