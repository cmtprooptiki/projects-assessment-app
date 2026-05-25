'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string | number;
  onChange?: (e: { target: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const selected = options.find((o) => String(o.value) === String(value ?? ''));

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSelect = (val: string | number) => {
    onChange?.({ target: { value: String(val) } });
    setOpen(false);
  };

  const isEmpty = value === '' || value === undefined || value === null;

  return (
    <div className={cn('flex flex-col gap-1', className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className={cn(
            'w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            isEmpty
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-slate-800 dark:text-slate-100',
            error
              ? 'border-red-400 focus:ring-red-400 bg-white dark:bg-slate-700'
              : open
                ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500 bg-white dark:bg-slate-700'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="truncate leading-snug">
            {selected ? selected.label : (placeholder ?? 'Select…')}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              'shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1.5 w-full min-w-max rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/70 dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
            <ul className="max-h-60 overflow-y-auto py-1.5 space-y-0.5 px-1.5">
              {placeholder && (
                <li
                  onClick={() => handleSelect('')}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer select-none transition-colors',
                    isEmpty
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <span className="w-3.5 shrink-0 flex items-center justify-center">
                    {isEmpty && <Check size={13} strokeWidth={2.5} />}
                  </span>
                  {placeholder}
                </li>
              )}
              {options.map((opt) => {
                const isSelected = String(opt.value) === String(value ?? '');
                return (
                  <li
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer select-none transition-colors',
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    )}
                  >
                    <span className="w-3.5 shrink-0 flex items-center justify-center">
                      {isSelected && <Check size={13} strokeWidth={2.5} />}
                    </span>
                    {opt.label}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
