'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function Combobox({ label, options, value, onChange, placeholder = 'All...', required }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
  };

  const displayValue = open ? query : (selected?.label ?? '');

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className="relative flex items-center cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 pl-8 pr-7 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
        />
        {value && (
          <button type="button" onClick={handleClear} className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[260px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-60 overflow-y-auto">
          <div
            onClick={() => handleSelect('')}
            className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            {placeholder}
          </div>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-500">No results</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  opt.value === value
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
