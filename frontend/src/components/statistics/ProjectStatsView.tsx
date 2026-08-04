'use client';

import { useState, useMemo } from 'react';
import { Users, Link2, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ApexChart from '@/components/ui/ApexChart';
import Select from '@/components/ui/Select';
import SortableTh from '@/components/ui/SortableTh';
import { useProjectDashboard } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { hBarOptions, donutOptions, COLORS, FONT } from '@/lib/chartConfig';
import { formatDate } from '@/lib/utils';

interface Props { projectId: number; }

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

export default function ProjectStatsView({ projectId }: Props) {
  const { data, isLoading } = useProjectDashboard(projectId);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [participantsFilter, setParticipantsFilter] = useState('');
  const [sortBy, setSortBy]       = useState('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  // Pull participations before early returns so hooks always run in same order
  const rawData = (data as any)?.data ?? (data as any);
  const participations: any[] = rawData?.participations ?? [];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    participations.forEach((p) => {
      years.add(new Date(p.startDate).getFullYear());
      if (p.endDate) years.add(new Date(p.endDate).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [participations, currentYear]);

  // Assign a stable color to each unique employee (by id)
  const employeeColorMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    let idx = 0;
    participations.forEach((p) => {
      const id = p.employee?.id ?? p.employeeId;
      if (!(id in map)) { map[id] = COLORS[idx % COLORS.length]; idx++; }
    });
    return map;
  }, [participations]);

  // Gantt rows: filter to selected year, clip start/end
  const ganttRows = useMemo(() => {
    const yearStart = new Date(selectedYear, 0, 1).getTime();
    const yearEnd   = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();
    const today     = Date.now();

    return participations
      .filter((p) => {
        const start = new Date(p.startDate).getTime();
        const end   = p.endDate ? new Date(p.endDate).getTime() : today;
        return start <= yearEnd && end >= yearStart;
      })
      .map((p) => {
        const empId     = p.employee?.id ?? p.employeeId;
        const empName   = `${p.employee.firstName} ${p.employee.lastName}`;
        const clipStart = Math.max(new Date(p.startDate).getTime(), yearStart);
        const clipEnd   = Math.min(p.endDate ? new Date(p.endDate).getTime() : today, yearEnd);
        const mStart = new Date(p.startDate);
        const mEnd   = p.endDate ? new Date(p.endDate) : new Date();
        const months = Math.max(1,
          (mEnd.getFullYear() - mStart.getFullYear()) * 12 +
          (mEnd.getMonth() - mStart.getMonth()) + 1
        );
        return {
          x: empName,
          y: [clipStart, clipEnd] as [number, number],
          fillColor: employeeColorMap[empId] ?? COLORS[0],
          role: (p.role?.name ?? '') as string,
          originalStart: p.startDate as string,
          originalEnd:   (p.endDate ?? null) as string | null,
          months,
        };
      })
      .sort((a, b) => a.x.localeCompare(b.x));
  }, [participations, selectedYear, employeeColorMap]);

  const uniqueGanttEmployees = useMemo(
    () => new Set(ganttRows.map((r) => r.x)).size,
    [ganttRows]
  );

  // Sum totalMonths per unique employee across all their participations
  const perEmployeeMonths = useMemo(() => {
    const map = new Map<number, { name: string; totalMonths: number }>();
    participations.forEach((p: any) => {
      const id = p.employee?.id ?? p.employeeId;
      const name = `${p.employee.firstName} ${p.employee.lastName}`;
      const prev = map.get(id);
      if (prev) prev.totalMonths += p.totalMonths ?? 0;
      else map.set(id, { name, totalMonths: p.totalMonths ?? 0 });
    });
    return Array.from(map.values());
  }, [participations]);

  // Filtered + sorted Participants rows
  const displayParticipations = useMemo(() => {
    const q = participantsFilter.toLowerCase();
    const filtered = q
      ? participations.filter((p: any) =>
          (`${p.employee?.firstName} ${p.employee?.lastName}`).toLowerCase().includes(q) ||
          (p.employee?.department ?? '').toLowerCase().includes(q) ||
          (p.role?.name ?? '').toLowerCase().includes(q)
        )
      : participations;

    return [...filtered].sort((a: any, b: any) => {
      let av: any, bv: any;
      switch (sortBy) {
        case 'employee':
          av = `${a.employee?.lastName} ${a.employee?.firstName}`.toLowerCase();
          bv = `${b.employee?.lastName} ${b.employee?.firstName}`.toLowerCase();
          break;
        case 'role':    av = a.role?.name ?? '';  bv = b.role?.name ?? '';  break;
        case 'endDate':
          av = a.endDate ?? '9999-12-31';
          bv = b.endDate ?? '9999-12-31';
          break;
        case 'months':  av = a.totalMonths ?? 0; bv = b.totalMonths ?? 0; break;
        default:        av = a.startDate ?? '';   bv = b.startDate ?? '';  break;
      }
      if (av < bv) return sortOrder === 'asc' ? -1 : 1;
      if (av > bv) return sortOrder === 'asc' ?  1 : -1;
      return 0;
    });
  }, [participations, participantsFilter, sortBy, sortOrder]);

  const exportParticipants = (proj: any) => {
    const rows = displayParticipations.map((p: any) => ({
      'Employee':   `${p.employee?.lastName} ${p.employee?.firstName}`,
      'Department': p.employee?.department ?? '',
      'Role':       p.role?.name ?? '',
      'Start Date': p.startDate ?? '',
      'End Date':   p.endDate ?? 'Ongoing',
      'Months':     p.totalMonths ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [28, 20, 22, 12, 12, 8].map(wch => ({ wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, `participants_${proj.projectCode ?? proj.name}.xlsx`);
  };

  // --- Early returns (after all hooks) ---
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-white dark:bg-slate-800 rounded-2xl" />)}
        </div>
        <div className="h-72 bg-white dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }
  if (!data) return null;

  const { project, stats } = rawData;

  const barOpts = {
    ...hBarOptions(isDark, perEmployeeMonths.map((e) => e.name)),
    tooltip: { theme: isDark ? 'dark' : 'light', y: { formatter: (v: number) => `${v} months` } },
  };

  const roleCounts: Record<string, number> = {};
  participations.forEach((p: any) => { roleCounts[p.role.name] = (roleCounts[p.role.name] ?? 0) + 1; });
  const roleNames = Object.keys(roleCounts);
  const roleValues = Object.values(roleCounts);

  const tableRow = 'hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors';
  const tdBase = 'px-3 py-3';
  const th = 'text-left px-3 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide';

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
      min: new Date(selectedYear, 0, 1).getTime(),
      max: new Date(selectedYear, 11, 31).getTime(),
      labels: {
        format: 'MMM',
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

  const ganttHeight = Math.max(160, uniqueGanttEmployees * 64 + 80);

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
          {project.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{project.name}</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {project.client?.name ?? ''}
          {project.acronym ? <> &middot; <span className="italic">{project.acronym}</span></> : ''}
          </p>
        </div>
        {project.projectCode && (
          <Badge variant="info">{project.projectCode}</Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Participants"   value={stats.totalParticipants}   icon={Users} gradient="from-indigo-500 to-violet-600" shadow="shadow-indigo-100 dark:shadow-indigo-900/20" />
        <StatCard label="Total Participations" value={stats.totalParticipations} icon={Link2} gradient="from-teal-400 to-cyan-500"     shadow="shadow-cyan-100 dark:shadow-cyan-900/20" />
      </div>

      {participations.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-400">No participations yet for this project.</Card>
      ) : (
        <>
          {/* Summary charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Months Contributed per Employee</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Total months each employee worked on this project</p>
              <ApexChart type="bar" series={[{ name: 'Months', data: perEmployeeMonths.map((e) => e.totalMonths) }]} options={barOpts} height={240} />
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Participations by Role</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">How roles are distributed across this project</p>
              <ApexChart type="donut" series={roleValues} options={donutOptions(isDark, roleNames)} height={240} />
            </Card>
          </div>

          {/* Gantt section */}
          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Team Timeline</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Employee participation periods across the year</p>
              </div>
              <div className="w-28">
                <Select
                  value={selectedYear}
                  options={availableYears.map((y) => ({ value: y, label: String(y) }))}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                />
              </div>
            </div>

            {ganttRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm font-medium text-slate-400">No participations in {selectedYear}</p>
                <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">Try selecting a different year</p>
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

          {/* Participants table */}
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Participants
                {participantsFilter && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {displayParticipations.length} / {participations.length} rows
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={participantsFilter}
                    onChange={e => setParticipantsFilter(e.target.value)}
                    placeholder="Filter by employee or role…"
                    className="pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
                  />
                </div>
                <button
                  onClick={() => exportParticipants(project)}
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
                    <SortableTh field="employee"  label="Employee"   sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="role"      label="Role"       sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="startDate" label="Start Date" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="endDate"   label="End Date"   sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortableTh field="months"    label="Months"     sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {displayParticipations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-400">No results match your filter.</td>
                    </tr>
                  ) : displayParticipations.map((p: any) => (
                    <tr key={p.id} className={tableRow}>
                      <td className={`${tdBase} font-semibold text-slate-800 dark:text-slate-200`}>{p.employee.firstName} {p.employee.lastName}</td>
                      <td className={`${tdBase} text-slate-500 dark:text-slate-400`}>{p.role.name}</td>
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
