import * as XLSX from 'xlsx';
import { ProjectParticipation } from '@/types';
import { calcMonths } from '@/lib/utils';

// When you add a new column to the participations table, add a matching entry here.
const COLUMNS: { header: string; value: (p: ProjectParticipation) => string | number }[] = [
  { header: 'Employee',     value: (p) => p.employee ? `${p.employee.lastName} ${p.employee.firstName}` : `#${p.employeeId}` },
  { header: 'Department',   value: (p) => p.employee?.department ?? '' },
  { header: 'Project Code', value: (p) => p.project?.projectCode ?? '' },
  { header: 'Project',      value: (p) => p.project?.name ?? `#${p.projectId}` },
  { header: 'Role',         value: (p) => p.role?.name ?? `#${p.roleId}` },
  { header: 'Start Date',   value: (p) => p.startDate },
  { header: 'End Date',     value: (p) => p.endDate ?? '' },
  { header: 'Months',       value: (p) => calcMonths(p.startDate, p.endDate) },
];

export function exportParticipationsToXlsx(
  participations: ProjectParticipation[],
  filename = 'participations.xlsx',
): void {
  const rows = participations.map((p) => {
    const row: Record<string, string | number> = {};
    for (const col of COLUMNS) row[col.header] = col.value(p);
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((c) => c.header) });

  const colWidths = COLUMNS.map((col) => {
    const maxLen = Math.max(
      col.header.length,
      ...participations.map((p) => String(col.value(p)).length),
    );
    return { wch: Math.min(maxLen + 2, 60) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Participations');
  XLSX.writeFile(wb, filename);
}
