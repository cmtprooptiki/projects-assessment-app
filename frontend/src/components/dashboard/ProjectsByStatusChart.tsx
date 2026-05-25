'use client';

import Card from '@/components/ui/Card';
import ApexChart from '@/components/ui/ApexChart';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { donutOptions } from '@/lib/chartConfig';
import { statusLabel } from '@/lib/utils';
import { ProjectStatus } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  completed: '#6366F1',
  on_hold: '#FBA849',
  cancelled: '#EF4444',
};

export default function ProjectsByStatusChart() {
  const { data, isLoading } = useDashboardSummary();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const items = data?.data?.projectsByStatus ?? [];
  const series = items.map((i) => parseInt(i.count, 10));
  const labels = items.map((i) => statusLabel(i.status as ProjectStatus));
  const colors = items.map((i) => STATUS_COLORS[i.status] ?? '#6366F1');

  const options = {
    ...donutOptions(isDark, labels, colors, 'Projects'),
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '13px',
              fontWeight: 600,
              color: isDark ? '#64748B' : '#94A3B8',
              fontFamily: 'Outfit, sans-serif',
              formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
            },
            value: { fontSize: '28px', fontWeight: 800, color: isDark ? '#F1F5F9' : '#1E293B', fontFamily: 'Outfit, sans-serif' },
          },
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Projects by Status</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Distribution across all statuses</p>
      {isLoading ? (
        <div className="h-72 bg-slate-50 dark:bg-slate-700/30 rounded-xl animate-pulse" />
      ) : series.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">No project data available.</div>
      ) : (
        <ApexChart type="donut" series={series} options={options} height={280} />
      )}
    </Card>
  );
}
