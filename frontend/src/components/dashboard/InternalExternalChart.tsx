'use client';

import Card from '@/components/ui/Card';
import ApexChart from '@/components/ui/ApexChart';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { donutOptions } from '@/lib/chartConfig';

export default function InternalExternalChart() {
  const { data, isLoading } = useDashboardSummary();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const overview = data?.data?.overview;
  const internal = overview?.internalEmployees ?? 0;
  const external = overview?.externalEmployees ?? 0;

  const series = [internal, external];
  const labels = ['Internal', 'External Partners'];
  const colors = ['#6366F1', '#F59E0B'];

  const options = {
    ...donutOptions(isDark, labels, colors, 'Total'),
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
            value: {
              fontSize: '28px',
              fontWeight: 800,
              color: isDark ? '#F1F5F9' : '#1E293B',
              fontFamily: 'Outfit, sans-serif',
            },
          },
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Internal vs External</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Employee type breakdown</p>
      {isLoading ? (
        <div className="h-72 bg-slate-50 dark:bg-slate-700/30 rounded-xl animate-pulse" />
      ) : internal + external === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">No employee data available.</div>
      ) : (
        <ApexChart type="donut" series={series} options={options} height={280} />
      )}
    </Card>
  );
}
