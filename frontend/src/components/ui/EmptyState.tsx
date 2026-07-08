import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'No results found',
  description = 'There are no records to display.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-full mb-4">
        <Inbox className="text-gray-400 dark:text-slate-500" size={32} />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
