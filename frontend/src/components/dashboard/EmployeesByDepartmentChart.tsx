'use client';

import Card from '@/components/ui/Card';
import ApexChart from '@/components/ui/ApexChart';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { useTheme } from '@/lib/theme';
import { baseOptions, COLORS } from '@/lib/chartConfig';

export default function EmployeesByDepartmentChart() {
  const { data, isLoading } = useDashboardSummary();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const items = data?.data?.employeesByDepartment ?? [];
  const categories = items.map((i) => i.department ?? 'Unassigned');
  const values = items.map((i) => parseInt(i.count, 10));

  const base = baseOptions(isDark);
  const options: any = {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        horizontal: true,
        barHeight: '60%',
        distributed: true,
      },
    },
    colors: COLORS,
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'horizontal', shadeIntensity: 0.2, opacityFrom: 1, opacityTo: 0.85 },
    },
    dataLabels: {
      enabled: true,
      formatter: (v: number) => v,
      style: { fontSize: '11px', fontWeight: 700, colors: ['#fff'] },
      dropShadow: { enabled: false },
    },
    legend: { show: false },
    xaxis: {
      ...base.xaxis,
      categories,
      labels: {
        ...base.xaxis?.labels,
        formatter: (v: number) => Math.round(v),
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', colors: isDark ? '#94A3B8' : '#64748B', fontFamily: 'Outfit, sans-serif' },
        maxWidth: 160,
      },
    },
    tooltip: { ...base.tooltip, x: { show: true }, y: { formatter: (v: number) => `${v} employees` } },
    grid: { ...base.grid, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  };

  const series = [{ name: 'Employees', data: values }];

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Employees by Department</h2>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Active headcount per department</p>
      {isLoading ? (
        <div className="h-72 bg-slate-50 dark:bg-slate-700/30 rounded-xl animate-pulse" />
      ) : values.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">No employee data available.</div>
      ) : (
        <ApexChart type="bar" series={series} options={options} height={Math.max(220, categories.length * 40 + 40)} />
      )}
    </Card>
  );
}
