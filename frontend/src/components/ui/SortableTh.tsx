'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  field: string;
  label: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  align?: 'left' | 'center';
  className?: string;
}

export default function SortableTh({ field, label, sortBy, sortOrder = 'asc', onSort, align = 'left', className }: Props) {
  const active = sortBy === field;

  return (
    <th
      onClick={() => onSort?.(field)}
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wide select-none whitespace-nowrap',
        align === 'center' ? 'text-center' : 'text-left',
        'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors',
        onSort ? 'cursor-pointer' : '',
        active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-slate-400',
        className,
      )}
    >
      <span className={cn('flex items-center gap-1', align === 'center' && 'justify-center')}>
        {label}
        {active ? (
          sortOrder === 'asc'
            ? <ChevronUp size={13} className="text-indigo-500 shrink-0" />
            : <ChevronDown size={13} className="text-indigo-500 shrink-0" />
        ) : (
          <ChevronsUpDown size={13} className="text-gray-300 dark:text-slate-600 shrink-0" />
        )}
      </span>
    </th>
  );
}
