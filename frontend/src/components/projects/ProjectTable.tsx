'use client';

import { useState } from 'react';
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

interface Props {
  projects: Project[];
  sortBy?: string;
  sortOrder?: SortDir;
  onSort?: (field: SortField) => void;
  onDeleted?: () => void;
  isAdmin?: boolean;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={13} className="text-gray-300 shrink-0" />;
  return dir === 'asc'
    ? <ChevronUp   size={13} className="text-indigo-500 shrink-0" />
    : <ChevronDown size={13} className="text-indigo-500 shrink-0" />;
}

export default function ProjectTable({ projects, sortBy = 'projectCode', sortOrder = 'asc', onSort, onDeleted, isAdmin = false }: Props) {
  const [deleting, setDeleting] = useState<Project | null>(null);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteProject.mutateAsync(deleting.id);
    setDeleting(null);
    onDeleted?.();
  };

  if (projects.length === 0)
    return <EmptyState title="No projects found" description="Try adjusting your filters or create a new project." />;

  const thCls = (field: SortField) => cn(
    'text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide select-none whitespace-nowrap',
    'hover:bg-slate-50 transition-colors',
    onSort ? 'cursor-pointer' : '',
    sortBy === field ? 'text-indigo-600' : 'text-gray-500',
  );

  const Th = ({ field, label }: { field: SortField; label: string }) => (
    <th className={thCls(field)} onClick={() => onSort?.(field)}>
      <span className="flex items-center gap-1">
        {label}
        <SortIcon active={sortBy === field} dir={sortOrder} />
      </span>
    </th>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <Th field="projectCode" label="Code" />
              <Th field="name"        label="Name" />
              <Th field="acronym"     label="Acronym" />
              <Th field="client"      label="Client" />
              <Th field="startDate"   label="Period" />
              <Th field="contracts"   label="Contracts" />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map((p) => (
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
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                    )}
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
