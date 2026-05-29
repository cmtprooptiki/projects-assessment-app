'use client';

import { Briefcase, Users, Link2, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ApexChart from '@/components/ui/ApexChart';
import { useClientDashboard } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { hBarOptions, donutOptions, COLORS } from '@/lib/chartConfig';
import { formatDate, statusLabel, statusVariant } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981', completed: '#6366F1',
};

interface Props { clientId: number; }

function StatCard({ label, value, icon: Icon, gradient, shadow }: {
  label: string; value: string | number; icon: React.ElementType; gradient: string; shadow: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md ${shadow} shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function ClientStatsView({ clientId }: Props) {
  const { data, isLoading } = useClientDashboard(clientId);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-white dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;
  const { client, projects, topEmployees, stats } = data.data ?? data;

  const projBarOpts = {
    ...hBarOptions(isDark, projects.map((p: any) => p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name)),
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} participations` } },
  };

  const statusEntries = Object.entries(
    projects.reduce((acc: Record<string, number>, p: any) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1; return acc;
    }, {})
  );
  const statusColors = statusEntries.map(([s]) => STATUS_COLORS[s] ?? '#6366F1');
  const statusLabels = statusEntries.map(([s]) => statusLabel(s as any));
  const statusValues = statusEntries.map(([, v]) => v as number);

  const empBarOpts = {
    ...hBarOptions(isDark, topEmployees.map((e: any) => `${e.employee.firstName} ${e.employee.lastName}`)),
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} months` } },
  };

  const th = 'text-left px-3 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide';
  const tdBase = 'px-3 py-3';
  const tableRow = 'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{client.name}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {client.industry ?? 'No industry specified'}
            {client.contactEmail && <> &middot; {client.contactEmail}</>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={stats.totalProjects} icon={Briefcase} gradient="from-indigo-500 to-violet-600" shadow="shadow-indigo-100 dark:shadow-indigo-900/20" />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={TrendingUp} gradient="from-teal-400 to-cyan-500" shadow="shadow-cyan-100 dark:shadow-cyan-900/20" />
        <StatCard label="Employees" value={stats.uniqueEmployees} icon={Users} gradient="from-orange-400 to-amber-500" shadow="shadow-orange-100 dark:shadow-orange-900/20" />
        <StatCard label="Participations" value={stats.totalParticipations} icon={Link2} gradient="from-blue-500 to-blue-600" shadow="shadow-blue-100 dark:shadow-blue-900/20" />
      </div>

      {projects.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">No projects assigned to this client yet.</Card>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Participations per Project</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Number of participations on each project</p>
              <ApexChart type="bar" series={[{ name: 'Participations', data: projects.map((p: any) => p.participationCount) }]} options={projBarOpts} height={Math.max(200, projects.length * 52)} />
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Projects by Status</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Current status breakdown</p>
              <ApexChart type="donut" series={statusValues} options={donutOptions(isDark, statusLabels, statusColors, 'Projects')} height={240} />
            </Card>
          </div>

          {topEmployees.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Top Employees by Months Contributed</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Most active employees across this client's projects</p>
              <ApexChart type="bar" series={[{ name: 'Months', data: topEmployees.map((e: any) => e.totalMonths) }]} options={empBarOpts} height={Math.max(180, topEmployees.length * 50)} />
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Projects</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Project', 'Code', 'Status', 'Start', 'End', 'Participants', 'Months'].map((h) => <th key={h} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {projects.map((p: any) => (
                    <tr key={p.id} className={tableRow}>
                      <td className={`${tdBase} font-semibold text-slate-800 dark:text-slate-200`}>{p.name}</td>
                      <td className={`${tdBase} text-slate-400 dark:text-slate-500 font-mono text-xs`}>{p.code}</td>
                      <td className={tdBase}><Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge></td>
                      <td className={`${tdBase} text-slate-500 dark:text-slate-400`}>{formatDate(p.startDate)}</td>
                      <td className={tdBase}>{p.endDate ? <span className="text-slate-500 dark:text-slate-400">{formatDate(p.endDate)}</span> : <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Ongoing</span>}</td>
                      <td className={`${tdBase} text-slate-500 dark:text-slate-400`}>{p.uniqueEmployees}</td>
                      <td className={`${tdBase} font-semibold text-indigo-600 dark:text-indigo-400`}>{p.totalMonths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
