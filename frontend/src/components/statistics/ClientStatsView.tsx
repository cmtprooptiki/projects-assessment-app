'use client';

import { useState, useMemo } from 'react';
import { Briefcase, Users, Link2, TrendingUp, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '@/components/ui/Card';
import ApexChart from '@/components/ui/ApexChart';
import SortableTh from '@/components/ui/SortableTh';
import { useClientDashboard } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { hBarOptions, donutOptions, COLORS } from '@/lib/chartConfig';
import { formatDate } from '@/lib/utils';

const TIMELINE_COLORS = ['#10B981', '#6366F1'];

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

  // Extract projects before early returns so all hooks run unconditionally
  const rawData = (data as any)?.data ?? (data as any);
  const projects: any[] = rawData?.projects ?? [];

  const [projectsFilter, setProjectsFilter] = useState('');
  const [sortBy, setSortBy]       = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const displayProjects = useMemo(() => {
    const q = projectsFilter.toLowerCase();
    const filtered = q
      ? projects.filter((p: any) =>
          (p.name ?? '').toLowerCase().includes(q) ||
          (p.projectCode ?? '').toLowerCase().includes(q)
        )
      : projects;

    return [...filtered].sort((a: any, b: any) => {
      let av: any, bv: any;
      switch (sortBy) {
        case 'projectCode':      av = a.projectCode ?? '';      bv = b.projectCode ?? '';      break;
        case 'endDate':
          av = a.endDate ?? '9999-12-31';
          bv = b.endDate ?? '9999-12-31';
          break;
        case 'uniqueEmployees':  av = a.uniqueEmployees ?? 0;  bv = b.uniqueEmployees ?? 0;  break;
        case 'totalMonths':      av = a.totalMonths ?? 0;      bv = b.totalMonths ?? 0;      break;
        case 'startDate':        av = a.startDate ?? '';        bv = b.startDate ?? '';        break;
        default:                 av = (a.name ?? '').toLowerCase(); bv = (b.name ?? '').toLowerCase(); break;
      }
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ?  1 : -1;
      return 0;
    });
  }, [projects, projectsFilter, sortBy, sortOrder]);

  const exportProjects = (clientName: string) => {
    const rows = displayProjects.map((p: any) => ({
      'Project':      p.name ?? '',
      'Code':         p.projectCode ?? '',
      'Start Date':   p.startDate ? formatDate(p.startDate) : '',
      'End Date':     p.endDate ? formatDate(p.endDate) : 'Ongoing',
      'Participants': p.uniqueEmployees ?? 0,
      'Months':       p.totalMonths ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [36, 12, 12, 12, 14, 8].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, `projects_${clientName.replace(/\s+/g, '_')}.xlsx`);
  };

  // --- Early returns (after all hooks) ---
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
  const { client, topEmployees, stats } = rawData;

  const projBarOpts = {
    ...hBarOptions(isDark, projects.map((p: any) => p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name)),
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} participations` } },
  };

  const today = new Date().toISOString().slice(0, 10);
  const ongoingCount = projects.filter((p: any) => !p.endDate || p.endDate >= today).length;
  const completedCount = projects.length - ongoingCount;
  const timelineLabels = ['Ongoing', 'Completed'];
  const timelineValues = [ongoingCount, completedCount];

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
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Projects by Timeline</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Ongoing vs completed projects</p>
              <ApexChart type="donut" series={timelineValues} options={donutOptions(isDark, timelineLabels, TIMELINE_COLORS, 'Projects')} height={240} />
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
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Projects
                {projectsFilter && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {displayProjects.length} / {projects.length} rows
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={projectsFilter}
                    onChange={e => setProjectsFilter(e.target.value)}
                    placeholder="Filter by name or code…"
                    className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                  />
                </div>
                <button
                  onClick={() => exportProjects(client.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <Download size={13} />
                  Export XLSX
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    <SortableTh field="name"            label="Project"      sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="projectCode"     label="Code"         sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="startDate"       label="Start"        sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="endDate"         label="End"          sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="uniqueEmployees" label="Participants"  sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="totalMonths"     label="Months"       sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {displayProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">No results match your filter.</td>
                    </tr>
                  ) : displayProjects.map((p: any) => (
                    <tr key={p.id} className={tableRow}>
                      <td className={`${tdBase} font-semibold text-slate-800 dark:text-slate-200`}>{p.name}</td>
                      <td className={`${tdBase} text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold`}>{p.projectCode}</td>
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
