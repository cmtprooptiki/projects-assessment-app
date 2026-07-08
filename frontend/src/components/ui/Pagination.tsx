import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-xl">
      <p className="text-sm text-gray-600 dark:text-slate-400">
        Showing <span className="font-medium">{from}</span> to{' '}
        <span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page <= 1
              ? 'text-gray-300 cursor-not-allowed dark:text-slate-600'
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
          )}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                pageNum === page
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            page >= totalPages
              ? 'text-gray-300 cursor-not-allowed dark:text-slate-600'
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700'
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
