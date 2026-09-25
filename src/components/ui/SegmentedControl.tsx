import React from 'react';
import { clsx } from 'clsx';

export interface Option<T extends string | number> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string | number> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={clsx(
        'inline-flex flex-wrap p-1 bg-elevated/70 border border-subtle rounded-xl select-none',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={clsx(
              'rounded-lg min-h-11 flex-1 font-medium transition-all duration-140 flex items-center justify-center gap-1.5',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
              isSelected
                ? 'bg-surface text-app-primary shadow-sm border border-white/10'
                : 'text-app-muted hover:text-app-secondary'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
