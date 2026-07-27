'use client';

import { useState, useMemo } from 'react';
import JSZip from 'jszip';
import { FileDown, Loader2, Search, CheckSquare, Square, X, Archive } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Employee } from '@/types';


function useEmployeeList() {
  return useQuery<{ success: boolean; data: Employee[] }>({
    queryKey: ['employees-all'],
    queryFn: () => api.get('/employees?limit=500').then((r) => r.data),
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CVExportPage() {
  const { data, isLoading } = useEmployeeList();
  const employees = useMemo(
    () =>
      (data?.data ?? [])
        .slice()
        .sort((a, b) => {
          const nameA = `${a.lastNameGr || a.lastName} ${a.firstNameGr || a.firstName}`;
          const nameB = `${b.lastNameGr || b.lastName} ${b.firstNameGr || b.firstName}`;
          return nameA.localeCompare(nameB, 'el');
        }),
    [data],
  );

  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState<Set<number>>(new Set());
  const [exporting, setExporting]     = useState(false);
  const [progress, setProgress]       = useState('');
  const [error, setError]             = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? employees.filter((e) =>
          `${e.lastNameGr || e.lastName} ${e.firstNameGr || e.firstName}`.toLowerCase().includes(q) ||
          `${e.lastName} ${e.firstName}`.toLowerCase().includes(q) ||
          (e.department ?? '').toLowerCase().includes(q),
        )
      : employees;
  }, [employees, search]);

  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll  = () => setSelected(new Set(filtered.map((e) => e.id)));
  const clearAll   = () => setSelected(new Set());
  const allChecked = filtered.length > 0 && filtered.every((e) => selected.has(e.id));

  const handleExport = async () => {
    if (selected.size === 0) return;
    setError('');
    setExporting(true);

    const ids = Array.from(selected);
    const empMap = new Map(employees.map((e) => [e.id, e]));

    try {
      if (ids.length === 1) {
        // Single export — download .docx directly
        const emp = empMap.get(ids[0])!;
        setProgress(`Δημιουργία CV για ${emp.lastNameGr || emp.lastName} ${emp.firstNameGr || emp.firstName}...`);
        const res = await api.get(`/cv/${ids[0]}`, {
          params: { template: 'classic' },
          responseType: 'blob',
        });
        const blob = new Blob([res.data as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        downloadBlob(blob, `CV_${emp.lastName}_${emp.firstName}.docx`);
      } else {
        // Multi export — fetch all in parallel, zip them
        setProgress(`Δημιουργία ${ids.length} CVs...`);
        const results = await Promise.allSettled(
          ids.map((id) =>
            api
              .get(`/cv/${id}`, { params: { template: 'classic' }, responseType: 'arraybuffer' })
              .then((res) => ({ id, buffer: res.data as ArrayBuffer })),
          ),
        );

        const zip = new JSZip();
        let ok = 0;
        for (const result of results) {
          if (result.status === 'fulfilled') {
            const { id, buffer } = result.value;
            const emp = empMap.get(id)!;
            zip.file(`CV_${emp.lastName}_${emp.firstName}.docx`, buffer);
            ok++;
          }
        }

        if (ok === 0) throw new Error('Αποτυχία δημιουργίας όλων των CVs.');

        setProgress(`Συμπίεση ${ok} αρχείων...`);
        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        downloadBlob(zipBlob, `CVs_export_${new Date().toISOString().slice(0, 10)}.zip`);

        if (ok < ids.length)
          setError(`${ids.length - ok} CV(s) απέτυχαν και δεν συμπεριλήφθηκαν.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την εξαγωγή.');
    } finally {
      setExporting(false);
      setProgress('');
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV Export</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Επιλέξτε έναν ή περισσότερους υπαλλήλους και εξάγετε τα βιογραφικά τους.
        </p>
      </div>

      <Card>
        <div className="p-6 space-y-4">

          {/* Search + select-all toolbar */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
              Υπάλληλοι
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Αναζήτηση..."
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={allChecked ? clearAll : selectAll}
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2 py-1.5"
              >
                {allChecked
                  ? <><Square size={14} /> Αποεπιλογή</>
                  : <><CheckSquare size={14} /> Όλοι</>}
              </button>
            </div>

            {/* Employee list */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Δεν βρέθηκαν υπάλληλοι.</p>
              ) : (
                filtered.map((emp) => {
                  const checked = selected.has(emp.id);
                  return (
                    <label
                      key={emp.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                        checked
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOne(emp.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {emp.lastNameGr || emp.lastName} {emp.firstNameGr || emp.firstName}
                        </p>
                        {emp.department && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{emp.department}</p>
                        )}
                      </div>
                      {emp.isExternal && (
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          External
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            {/* Selection count */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
              <span>{filtered.length} υπάλληλοι</span>
              {selected.size > 0 && (
                <button onClick={clearAll} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline">
                  <X size={11} /> {selected.size} επιλεγμένοι — Καθαρισμός
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={selected.size === 0 || exporting}
            loading={exporting}
            className="w-full"
          >
            {exporting ? (
              <><Loader2 size={16} className="animate-spin" /> {progress || 'Εξαγωγή...'}</>
            ) : selected.size === 0 ? (
              <><FileDown size={16} /> Επιλέξτε υπαλλήλους</>
            ) : selected.size === 1 ? (
              <><FileDown size={16} /> Εξαγωγή CV (.docx)</>
            ) : (
              <><Archive size={16} /> Εξαγωγή {selected.size} CVs (.zip)</>
            )}
          </Button>
        </div>
      </Card>

      {/* Info panel */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300 space-y-1.5">
        <p className="font-semibold">Το εξαγόμενο CV περιλαμβάνει:</p>
        <ul className="space-y-0.5 pl-4 list-disc text-indigo-600 dark:text-indigo-400">
          <li>Προσωπικά στοιχεία (όνομα, πατρώνυμο, στοιχεία επικοινωνίας)</li>
          <li>Εκπαίδευση (ίδρυμα, σχολή, τμήμα, τίτλος, ειδικότητα)</li>
          <li>Ξένες γλώσσες</li>
          <li>Επαγγελματική εμπειρία (έργα συμμετοχής, ρόλοι, περίοδοι)</li>
          <li>Δημοσιεύσεις</li>
        </ul>
        <p className="text-indigo-500 dark:text-indigo-500 text-xs pt-1">
          Πολλαπλά CVs εξάγονται ως αρχείο .zip με ξεχωριστό .docx για κάθε υπάλληλο.
        </p>
      </div>
    </div>
  );
}
