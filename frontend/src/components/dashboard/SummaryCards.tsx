'use client';

import { Users, Briefcase, Link2, FolderKanban, Building2, UserCheck } from 'lucide-react';
import { useDashboardSummary } from '@/hooks/useDashboard';

type OverviewKey =
  | 'totalEmployees' | 'activeEmployees'
  | 'internalEmployees' | 'externalEmployees'
  | 'totalProjects'
  | 'totalContracts' | 'activeContracts'
  | 'totalParticipations';

const metrics: Array<{
  key: OverviewKey;
  sub: OverviewKey | null;
  subLabel: string | null;
  label: string;
  icon: React.ElementType;
  gradient: string;
  shadow: string;
}> = [
  {
    key: 'totalEmployees',
    sub: 'activeEmployees',
    subLabel: 'active',
    label: 'Total Employees',
    icon: Users,
    gradient: 'from-teal-400 to-cyan-500',
    shadow: 'shadow-cyan-100 dark:shadow-cyan-900/20',
  },
  {
    key: 'internalEmployees',
    sub: null,
    subLabel: null,
    label: 'Internal Employees',
    icon: Building2,
    gradient: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-100 dark:shadow-indigo-900/20',
  },
  {
    key: 'externalEmployees',
    sub: null,
    subLabel: null,
    label: 'External Partners',
    icon: UserCheck,
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-100 dark:shadow-amber-900/20',
  },
  {
    key: 'totalProjects',
    sub: null,
    subLabel: null,
    label: 'Total Projects',
    icon: FolderKanban,
    gradient: 'from-emerald-400 to-green-500',
    shadow: 'shadow-emerald-100 dark:shadow-emerald-900/20',
  },
  {
    key: 'totalContracts',
    sub: 'activeContracts',
    subLabel: 'signed',
    label: 'Total Contracts',
    icon: Briefcase,
    gradient: 'from-violet-500 to-indigo-600',
    shadow: 'shadow-indigo-100 dark:shadow-indigo-900/20',
  },
  {
    key: 'totalParticipations',
    sub: null,
    subLabel: null,
    label: 'Participations',
    icon: Link2,
    gradient: 'from-orange-400 to-amber-500',
    shadow: 'shadow-orange-100 dark:shadow-orange-900/20',
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-3 w-28 bg-slate-100 dark:bg-slate-700 rounded-full" />
          <div className="h-9 w-20 bg-slate-100 dark:bg-slate-700 rounded-lg" />
          <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl" />
      </div>
    </div>
  );
}

export default function SummaryCards() {
  const { data, isLoading } = useDashboardSummary();
  const overview = data?.data?.overview;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.map(({ key, sub, subLabel, label, icon: Icon, gradient, shadow }) => (
        <div key={key} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 tracking-tight">
                {overview?.[key] ?? 0}
              </p>
              {sub && overview ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                  <span className="text-emerald-500 font-semibold">{overview[sub]}</span> {subLabel}
                </p>
              ) : (
                <p className="invisible text-xs mt-1.5">—</p>
              )}
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} shrink-0`}>
              <Icon size={22} className="text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
