'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, FileText, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Project } from '@/types';
import { useDeleteProject } from '@/hooks/useProjects';
import { formatDate, cn } from '@/lib/utils';

type SortField = 'projectCode' | 'name' | 'acronym' | 'client' | 'startDate' | 'contracts';
type SortDir   = 'asc' | 'desc';

interface Props { projects: Project[]; onDeleted?: () => void; }

function SortIcon({ field, active, dir }: { field: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={13} className="text-gray-300 shrink-0" />;
  return dir === 'asc'
    ? <ChevronUp  size={13} className="text-indigo-500 shrink-0" />
    : <ChevronDown size={13} className="text-indigo-500 shrink-0" />;
}

export default function ProjectTable({ projects, onDeleted }: Props) {
  const [deleting, setDeleting]   = useState<Project | null>(null);
  const [sortField, setSortField] = useState<SortField>('projectCode');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');
  const deleteProject = useDeleteProject();

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      switch (sortField) {
        case 'projectCode': va = a.projectCode ?? ''; vb = b.projectCode ?? ''; break;
        case 'name':        va = a.name        ?? ''; vb = b.name        ?? ''; break;
        case 'acronym':     va = a.acronym     ?? ''; vb = b.acronym     ?? ''; break;
        case 'client':      va = a.client?.name ?? ''; vb = b.client?.name ?? ''; break;
        case 'startDate':   va = a.startDate   ?? ''; vb = b.startDate   ?? ''; break;
        case 'contracts':   va = a.contracts?.length ?? 0; vb = b.contracts?.length ?? 0; break;
      }
      const cmp = typeof va === 'number'
        ? va - (vb as number)
        : va.localeCompare(vb as string, 'el', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [projects, sortField, sortDir]);

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteProject.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (projects.length === 0)
    return <EmptyState title="No projects found" description="Try adjusting your filters or create a new project." />;

  const thCls = (field: SortField) => cn(
    'text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap',
    'hover:bg-slate-50 transition-colors',
    sortField === field ? 'text-indigo-600' : 'text-gray-500',
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className={thCls('projectCode')} onClick={() => handleSort('projectCode')}>
                <span className="flex items-center gap-1">Code <SortIcon field="projectCode" active={sortField === 'projectCode'} dir={sortDir} /></span>
              </th>
              <th className={thCls('name')} onClick={() => handleSort('name')}>
                <span className="flex items-center gap-1">Name <SortIcon field="name" active={sortField === 'name'} dir={sortDir} /></span>
              </th>
              <th className={thCls('acronym')} onClick={() => handleSort('acronym')}>
                <span className="flex items-center gap-1">Acronym <SortIcon field="acronym" active={sortField === 'acronym'} dir={sortDir} /></span>
              </th>
              <th className={thCls('client')} onClick={() => handleSort('client')}>
                <span className="flex items-center gap-1">Client <SortIcon field="client" active={sortField === 'client'} dir={sortDir} /></span>
              </th>
              <th className={thCls('startDate')} onClick={() => handleSort('startDate')}>
                <span className="flex items-center gap-1">Period <SortIcon field="startDate" active={sortField === 'startDate'} dir={sortDir} /></span>
              </th>
              <th className={thCls('contracts')} onClick={() => handleSort('contracts')}>
                <span className="flex items-center gap-1">Contracts <SortIcon field="contracts" active={sortField === 'contracts'} dir={sortDir} /></span>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{p.projectCode}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.acronym}</td>
                <td className="px-4 py-3 text-gray-600">{p.client?.name ?? <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {p.startDate ? (
                    <span>
                      {formatDate(p.startDate)}
                      <span className="text-gray-400"> – </span>
                      {p.endDate ? formatDate(p.endDate) : <span className="text-green-600 font-medium">Present</span>}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.contracts?.length
                    ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"><FileText size={11} />{p.contracts.length}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/projects/${p.id}/edit`}><Button variant="ghost" size="sm"><Pencil size={14} /></Button></Link>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete Project">
        <p className="text-sm text-gray-600 mb-6">Delete <span className="font-semibold text-gray-900">{deleting?.name}</span>? All linked contracts will be unlinked but not deleted.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteProject.isPending} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </>
  );
}
