'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD or ''
  onChange?: (value: string) => void;
  hint?: string;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DatePicker({
  label, value, onChange, hint, required,
  minYear = 1940,
  maxYear = new Date().getFullYear() + 1,
}: DatePickerProps) {
  const parse = (v?: string) => {
    if (!v) return { y: '', m: '', d: '' };
    const [y, m, d] = v.split('-');
    return { y: y ?? '', m: m ?? '', d: d ?? '' };
  };

  const [parts, setParts] = useState(() => parse(value));

  useEffect(() => { setParts(parse(value)); }, [value]);

  const daysInMonth = parts.y && parts.m
    ? new Date(parseInt(parts.y), parseInt(parts.m), 0).getDate()
    : 31;

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const handle = (key: 'y' | 'm' | 'd', val: string) => {
    const next = { ...parts, [key]: val };
    setParts(next);
    if (next.y && next.m && next.d) {
      onChange?.(`${next.y}-${next.m}-${next.d}`);
    } else {
      onChange?.('');
    }
  };

  const sel = cn(
    'rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm',
    'text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
    'hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer'
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <select value={parts.d} onChange={(e) => handle('d', e.target.value)} className={cn(sel, 'w-[72px]')}>
          <option value="">Day</option>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = String(i + 1).padStart(2, '0');
            return <option key={d} value={d}>{i + 1}</option>;
          })}
        </select>

        <select value={parts.m} onChange={(e) => handle('m', e.target.value)} className={cn(sel, 'flex-1')}>
          <option value="">Month</option>
          {MONTHS.map((name, i) => {
            const m = String(i + 1).padStart(2, '0');
            return <option key={m} value={m}>{name}</option>;
          })}
        </select>

        <select value={parts.y} onChange={(e) => handle('y', e.target.value)} className={cn(sel, 'w-[90px]')}>
          <option value="">Year</option>
          {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
        </select>
      </div>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
