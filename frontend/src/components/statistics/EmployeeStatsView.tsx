'use client';

import { useMemo } from 'react';
import { Briefcase, Link2, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ApexChart from '@/components/ui/ApexChart';
import EmployeeAvatar from '@/components/ui/EmployeeAvatar';
import { useEmployeeDashboard } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { hBarOptions, COLORS, FONT } from '@/lib/chartConfig';
import { formatDate } from '@/lib/utils';

interface Props { employeeId: number; }

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

export default function EmployeeStatsView({ employeeId }: Props) {
  const { data, isLoading } = useEmployeeDashboard(employeeId);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Pull participations out before early returns so hooks are always called in the same order
  const rawData = (data as any)?.data ?? data as any;
  const participations: any[] = rawData?.participations ?? [];

  // Assign a stable color to each unique project (by id)
  const projectColorMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    let idx = 0;
    participations.forEach((p) => {
      const id = p.project?.id ?? p.projectId;
      if (!(id in map)) { map[id] = COLORS[idx % COLORS.length]; idx++; }
    });
    return map;
  }, [participations]);

  // Full-span Gantt: no year clipping, show complete participation history
  const ganttRows = useMemo(() => {
    const today = Date.now();
    return participations
      .map((p) => {
        const projId = p.project?.id ?? p.projectId;
        const startTs = new Date(p.startDate).getTime();
        const endTs   = p.endDate ? new Date(p.endDate).getTime() : today;
        const mStart  = new Date(p.startDate);
        const mEnd    = p.endDate ? new Date(p.endDate) : new Date();
        const months  = Math.max(1,
          (mEnd.getFullYear() - mStart.getFullYear()) * 12 +
          (mEnd.getMonth() - mStart.getMonth()) + 1
        );
        return {
          x: p.project.name as string,
          y: [startTs, endTs] as [number, number],
          fillColor: projectColorMap[projId] ?? COLORS[0],
          role: (p.role?.name ?? '') as string,
          originalStart: p.startDate as string,
          originalEnd:   (p.endDate ?? null) as string | null,
          months,
        };
      })
      .sort((a, b) => a.x.localeCompare(b.x));
  }, [participations, projectColorMap]);

  const ganttMinMax = useMemo(() => {
    if (ganttRows.length === 0) return { min: undefined, max: undefined };
    const allTs = ganttRows.flatMap((r) => [r.y[0], r.y[1]]);
    return { min: Math.min(...allTs), max: Math.max(...allTs) };
  }, [ganttRows]);

  const uniqueGanttProjects = useMemo(
    () => new Set(ganttRows.map((r) => r.x)).size,
    [ganttRows]
  );

  // Sum totalMonths per unique project across all participations
  const perProjectMonths = useMemo(() => {
    const map = new Map<number, { name: string; totalMonths: number }>();
    participations.forEach((p: any) => {
      const id = p.project?.id ?? p.projectId;
      const name = p.project.name as string;
      const prev = map.get(id);
      if (prev) prev.totalMonths += p.totalMonths ?? 0;
      else map.set(id, { name, totalMonths: p.totalMonths ?? 0 });
    });
    return Array.from(map.values());
  }, [participations]);

  // --- Early returns (after all hooks) ---
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-white dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }
  if (!data) return null;

  const { employee, stats } = rawData;

  const barOpts = {
    ...hBarOptions(isDark, perProjectMonths.map((p) => p.name)),
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} months` } },
  };

  const th = 'text-left px-3 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide';
  const tdBase = 'px-3 py-3';
  const tableRow = 'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors';

  // Gantt chart options
  const ganttOptions: any = {
    chart: {
      type: 'rangeBar',
      background: 'transparent',
      fontFamily: FONT,
      zoom: { enabled: true },
      selection: { enabled: false },
      toolbar: {
        show: true,
        tools: { download: false, selection: false, zoom: false, zoomin: true, zoomout: true, pan: true, reset: true },
      },
      events: {
        mounted: (ctx: any) => {
          let panActive = false;
          const panIcon = ctx.el?.querySelector('.apexcharts-pan-icon');
          if (panIcon) {
            panIcon.addEventListener('click', () => { panActive = !panActive; }, true);
          }
          const onUp = () => {
            if (panActive) {
              panActive = false;
              setTimeout(() => ctx.toolbar?.handlePanning?.(), 0);
            }
          };
          ctx.el?.addEventListener('mouseup', onUp);
          ctx._panCleanup = () => ctx.el?.removeEventListener('mouseup', onUp);
        },
        destroyed: (ctx: any) => { ctx._panCleanup?.(); },
      },
    },
    plotOptions: {
      bar: { horizontal: true, rangeBarGroupRows: true, borderRadius: 4, barHeight: '55%' },
    },
    xaxis: {
      type: 'datetime',
      min: ganttMinMax.min,
      max: ganttMinMax.max,
      labels: {
        format: "MMM 'yy",
        datetimeUTC: false,
        style: { colors: isDark ? '#94a3b8' : '#64748b', fontFamily: FONT, fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#cbd5e1' : '#475569', fontFamily: FONT, fontSize: '13px' },
      },
    },
    grid: {
      borderColor: isDark ? '#334155' : '#e2e8f0',
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: ({ dataPointIndex, w }: any) => {
        const d = w.config.series[0].data[dataPointIndex];
        if (!d) return '';
        const fmt = (iso: string) =>
          new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const s = fmt(d.originalStart);
        const e = d.originalEnd ? fmt(d.originalEnd) : 'Ongoing';
        const bg     = isDark ? '#1e293b' : '#ffffff';
        const border = isDark ? '#334155' : '#e2e8f0';
        const text   = isDark ? '#e2e8f0' : '#1e293b';
        const sub    = isDark ? '#94a3b8' : '#64748b';
        const dot    = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${d.fillColor};margin-right:6px"></span>`;
        return `<div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:10px 14px;font-family:${FONT};font-size:12px;color:${text};min-width:180px;box-shadow:0 6px 20px rgba(0,0,0,.15)">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px">${dot}${d.x}</div>
          ${d.role ? `<div style="color:${sub};margin-bottom:5px;padding-left:14px">${d.role}</div>` : ''}
          <div style="color:${sub};padding-left:14px">${s} → ${e}</div>
          <div style="color:${sub};padding-left:14px;margin-top:3px;font-weight:600">${d.months} month${d.months !== 1 ? 's' : ''}</div>
        </div>`;
      },
    },
    legend: { show: false },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  const ganttHeight = Math.max(160, uniqueGanttProjects * 64 + 80);

  return (
    <div className="space-y-6">
      {/* Employee header */}
      <div className="flex items-center gap-3">
        <EmployeeAvatar employee={employee} size="md" className="shadow-md shadow-indigo-200" />
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{employee.firstName} {employee.lastName}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">{employee.department}</p>
        </div>
        <Badge variant={employee.isActive ? 'success' : 'default'}>
          {employee.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Projects"  value={stats.totalProjects}        icon={Briefcase} gradient="from-indigo-500 to-violet-600" shadow="shadow-indigo-100 dark:shadow-indigo-900/20" />
        <StatCard label="Active Now"      value={stats.activeParticipations} icon={Link2}     gradient="from-teal-400 to-cyan-500"     shadow="shadow-cyan-100 dark:shadow-cyan-900/20" />
        <StatCard label="Total Months"    value={stats.totalMonths}          icon={Clock}     gradient="from-orange-400 to-amber-500"  shadow="shadow-orange-100 dark:shadow-orange-900/20" />
      </div>

      {participations.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">No project participations yet for this employee.</Card>
      ) : (
        <>
          {/* Monthly breakdown bar chart */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Months per Project</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Time contributed to each project</p>
            <ApexChart type="bar" series={[{ name: 'Months', data: perProjectMonths.map((p) => p.totalMonths) }]} options={barOpts} height={Math.max(200, perProjectMonths.length * 50)} />
          </Card>

          {/* Gantt section */}
          <Card className="p-6">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project Timeline</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Full participation history across all projects</p>
            </div>

            {ganttRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <p className="text-sm font-medium">No project participations found</p>
              </div>
            ) : (
              <>
                {/* Color legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
                  {Array.from(new Map(ganttRows.map((r) => [r.x, r.fillColor]))).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                      {name}
                    </div>
                  ))}
                </div>

                <ApexChart
                  type="rangeBar"
                  series={[{ name: 'Participation', data: ganttRows }]}
                  options={ganttOptions}
                  height={ganttHeight}
                />
              </>
            )}
          </Card>

          {/* Project history table */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Project History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Project', 'Role', 'Start Date', 'End Date', 'Months'].map((h) => <th key={h} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {participations.map((p: any) => (
                    <tr key={p.id} className={tableRow}>
                      <td className={`${tdBase} font-semibold text-slate-800 dark:text-slate-200`}>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 mr-1">{p.project?.projectCode}</span>{p.project?.name}
                      </td>
                      <td className={`${tdBase} text-slate-500 dark:text-slate-400`}>{p.role?.name}</td>
                      <td className={`${tdBase} text-slate-500 dark:text-slate-400`}>{formatDate(p.startDate)}</td>
                      <td className={tdBase}>{p.endDate ? <span className="text-slate-500 dark:text-slate-400">{formatDate(p.endDate)}</span> : <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Ongoing</span>}</td>
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
