export const FONT = 'Outfit, sans-serif';
export const COLORS = ['#6366F1', '#0ABFBC', '#FBA849', '#EF4444', '#8B5CF6', '#10B981', '#F43F5E'];

const labelStyle = (isDark: boolean) => ({
  colors: isDark ? '#64748B' : '#94A3B8',
  fontSize: '12px',
  fontFamily: FONT,
  fontWeight: 500,
});

export function baseOptions(isDark: boolean) {
  return {
    chart: { background: 'transparent', fontFamily: FONT, toolbar: { show: false } },
    grid: {
      borderColor: isDark ? '#334155' : '#F1F5F9',
      strokeDashArray: 4,
    },
    tooltip: { theme: isDark ? 'dark' : 'light', style: { fontFamily: FONT, fontSize: '13px' } },
    states: { hover: { filter: { type: 'darken', value: 0.1 } } },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: labelStyle(isDark) } },
    yaxis: { labels: { style: labelStyle(isDark) } },
  };
}

export function hBarOptions(isDark: boolean, categories: string[], colors = COLORS): any {
  const base = baseOptions(isDark);
  return {
    ...base,
    chart: { ...base.chart, type: 'bar' },
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '60%', distributed: true } },
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { ...base.grid, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
    xaxis: {
      ...base.xaxis,
      categories,
      labels: {
        ...base.xaxis.labels,
        formatter: (val: number) => Number.isInteger(val) ? String(val) : '',
      },
    },
  };
}

export function donutOptions(isDark: boolean, labels: string[], colors = COLORS, totalLabel = 'Total'): any {
  return {
    chart: { type: 'donut', background: 'transparent', fontFamily: FONT },
    colors,
    labels,
    legend: {
      position: 'bottom',
      fontFamily: FONT,
      fontSize: '12px',
      fontWeight: 500,
      labels: { colors: isDark ? '#94A3B8' : '#64748B' },
      markers: { width: 9, height: 9, radius: 5 },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: totalLabel,
              fontSize: '12px',
              fontWeight: 600,
              color: isDark ? '#64748B' : '#94A3B8',
              fontFamily: FONT,
              formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
            },
            value: { fontSize: '26px', fontWeight: 800, color: isDark ? '#F1F5F9' : '#1E293B', fontFamily: FONT },
          },
        },
      },
    },
    stroke: { width: 0 },
    tooltip: { theme: isDark ? 'dark' : 'light', style: { fontFamily: FONT, fontSize: '13px' } },
  };
}
