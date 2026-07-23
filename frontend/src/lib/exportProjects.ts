import * as XLSX from 'xlsx';
import { Project } from '@/types';

// ── Column definitions ────────────────────────────────────────────────────────
// When you add a new column to the projects table, add a matching entry here.
const COLUMNS: { header: string; value: (p: Project) => string | number }[] = [
  { header: 'Code',       value: (p) => p.projectCode },
  { header: 'Name',       value: (p) => p.name },
  { header: 'Acronym',    value: (p) => p.acronym ?? '' },
  { header: 'Client',     value: (p) => p.client?.name ?? '' },
  { header: 'Start Date', value: (p) => p.startDate ?? '' },
  { header: 'End Date',   value: (p) => p.endDate ?? '' },
  { header: 'Contracts',  value: (p) => p.contracts?.length ?? 0 },
  { header: 'Description', value: (p) => p.description ?? '' },
];

export function exportProjectsToXlsx(projects: Project[], filename = 'projects.xlsx'): void {
  const rows = projects.map((p) => {
    const row: Record<string, string | number> = {};
    for (const col of COLUMNS) row[col.header] = col.value(p);
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((c) => c.header) });

  // Auto-width: fit each column to the widest cell value
  const colWidths = COLUMNS.map((col) => {
    const maxLen = Math.max(
      col.header.length,
      ...projects.map((p) => String(col.value(p)).length),
    );
    return { wch: Math.min(maxLen + 2, 60) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  XLSX.writeFile(wb, filename);
}
