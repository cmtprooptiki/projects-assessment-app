import { ProjectStatus } from '@/types';

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function fullName(employee: {
  firstName: string;
  lastName: string;
}): string {
  return `${employee.firstName} ${employee.lastName}`;
}

export function calcMonths(
  startDate: string,
  endDate?: string | null
): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;
  return Math.max(0, months);
}

export function statusLabel(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    active: 'Active',
    completed: 'Completed',
  };
  return map[status] ?? status;
}

export function statusVariant(status: ProjectStatus): 'success' | 'info' {
  return status === 'completed' ? 'info' : 'success';
}
