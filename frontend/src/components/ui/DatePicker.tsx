'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

export default function DatePicker({
  label, value, onChange, hint, required,
  minYear = 1940,
  maxYear = new Date().getFullYear() + 1,
}: DatePickerProps) {
  const today = new Date();
  const selected = value ? new Date(value + 'T00:00:00') : null;

  const [open, setOpen]           = useState(false);
  const [viewYear, setViewYear]   = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth()    ?? today.getMonth());
  const [yearMode, setYearMode]   = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setYearMode(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day: number) => {
    const y = String(viewYear);
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange?.(`${y}-${m}-${d}`);
    setOpen(false);
    setYearMode(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1; // Mon-first

  const displayValue = selected
    ? selected.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const triggerCls = cn(
    'w-full flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
    'bg-white dark:bg-slate-700',
    'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500',
    displayValue ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500',
  );

  return (
    <div className="flex flex-col gap-1 relative" ref={ref}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button type="button" onClick={() => { setOpen(o => !o); setYearMode(false); }} className={triggerCls}>
        <Calendar size={15} className="text-slate-400 shrink-0" />
        <span className="flex-1 text-left">{displayValue || 'Select date'}</span>
        {value && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange?.(''); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs leading-none px-0.5"
          >✕</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 z-50 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronLeft size={15} className="text-slate-500" />
            </button>

            <button type="button" onClick={() => setYearMode(y => !y)}
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {MONTHS[viewMonth]} {viewYear}
            </button>

            <button type="button" onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ChevronRight size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Year grid */}
          {yearMode ? (
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-0.5">
              {years.map(y => (
                <button key={y} type="button"
                  onClick={() => { setViewYear(y); setYearMode(false); }}
                  className={cn(
                    'text-xs py-1.5 rounded-lg transition-colors font-medium',
                    y === viewYear
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                  )}>
                  {y}
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Weekday labels */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: offset }).map((_, i) => <div key={`pad-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selected &&
                    selected.getFullYear() === viewYear &&
                    selected.getMonth()    === viewMonth &&
                    selected.getDate()     === day;
                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth()    === viewMonth &&
                    today.getDate()     === day;
                  return (
                    <button key={day} type="button" onClick={() => selectDay(day)}
                      className={cn(
                        'text-xs py-1.5 rounded-lg transition-colors w-full',
                        isSelected && 'bg-indigo-600 text-white font-semibold',
                        !isSelected && isToday && 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold',
                        !isSelected && !isToday && 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700',
                      )}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}
