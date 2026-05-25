'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmployeeAvatar from '@/components/ui/EmployeeAvatar';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { formatDate, fullName, statusVariant, statusLabel } from '@/lib/utils';
import { ProjectStatus } from '@/types';

export default function RecentParticipations() {
  const { data, isLoading } = useDashboardSummary();
  const participations = data?.data?.recentParticipations ?? [];

  return (
    <Card>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent Participations</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest activity across all projects</p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
          Last 5
        </span>
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-slate-100 dark:bg-slate-700 rounded-full" />
                <div className="h-3 w-48 bg-slate-50 dark:bg-slate-700/50 rounded-full" />
              </div>
              <div className="h-5 w-16 bg-slate-100 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      ) : participations.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm text-slate-400">No participations yet.</div>
      ) : (
        <div className="divide-y divide-slate-50 dark:divide-slate-700">
          {participations.map((p) => {
            return (
              <div key={p.id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex items-center gap-4">
                {p.employee ? (
                  <EmployeeAvatar employee={p.employee} size="sm" className="w-9 h-9" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">#</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {p.employee ? fullName(p.employee) : `Employee #${p.employeeId}`}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {p.project?.name ?? `Project #${p.projectId}`}
                    {p.role && <span className="text-slate-300 dark:text-slate-600"> · {p.role.name}</span>}
                    <span className="text-slate-300 dark:text-slate-600">
                      {' '}· {formatDate(p.startDate)}
                      {p.endDate ? ` — ${formatDate(p.endDate)}` : ' (ongoing)'}
                    </span>
                  </p>
                </div>
                <div className="shrink-0">
                  {p.project?.status && (
                    <Badge variant={statusVariant(p.project.status as ProjectStatus)}>
                      {statusLabel(p.project.status as ProjectStatus)}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
