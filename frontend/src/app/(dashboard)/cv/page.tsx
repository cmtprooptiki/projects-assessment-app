'use client';

import { useState } from 'react';
import { FileDown, Loader2, GraduationCap, Briefcase, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Employee } from '@/types';

function useEmployeeList() {
  return useQuery<{ success: boolean; data: Employee[] }>({
    queryKey: ['employees-all'],
    queryFn: () => api.get('/employees?limit=500').then((r) => r.data),
  });
}

export default function CVExportPage() {
  const { data, isLoading } = useEmployeeList();
  const employees = data?.data ?? [];

  const [selectedId, setSelectedId] = useState('');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const selected = employees.find((e) => String(e.id) === selectedId);

  const employeeOptions = [
    { value: '', label: 'Επιλογή υπαλλήλου...' },
    ...employees
      .slice()
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'el'))
      .map((e) => ({ value: String(e.id), label: `${e.lastName} ${e.firstName}` })),
  ];

  const handleExport = async () => {
    if (!selectedId) return;
    setError('');
    setExporting(true);
    try {
      const response = await api.get(`/cv/${selectedId}`, { responseType: 'blob' });
      const blob = new Blob([response.data as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fn = response.headers['content-disposition']?.match(/filename\*?=(?:UTF-8'')?([^;\n]+)/)?.[1];
      a.download = fn ? decodeURIComponent(fn) : `CV_${selected?.lastName ?? 'export'}.docx`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Σφάλμα κατά την εξαγωγή.');
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">CV Export</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Επιλέξτε υπάλληλο και εξάγετε το βιογραφικό σε μορφή Word (.docx).
        </p>
      </div>

      {/* Selection card */}
      <Card>
        <div className="p-6 space-y-5">
          <Select
            label="Υπάλληλος"
            options={employeeOptions}
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          />

          {/* Employee preview */}
          {selected && (
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {selected.firstName.charAt(0)}{selected.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selected.lastName} {selected.firstName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selected.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white dark:bg-slate-700 rounded-lg p-2.5 border border-slate-200 dark:border-slate-600">
                  <User size={14} className="mx-auto mb-1 text-indigo-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Τμήμα</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{selected.department}</p>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-2.5 border border-slate-200 dark:border-slate-600">
                  <GraduationCap size={14} className="mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Εκπαίδευση</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {(selected.education ?? []).length} εγγραφές
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-700 rounded-lg p-2.5 border border-slate-200 dark:border-slate-600">
                  <Briefcase size={14} className="mx-auto mb-1 text-amber-500" />
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Συμμετοχές</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {(selected.participations ?? []).length} έργα
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleExport}
            disabled={!selectedId || exporting}
            loading={exporting}
            className="w-full"
          >
            {exporting ? (
              <><Loader2 size={16} className="animate-spin" /> Δημιουργία CV...</>
            ) : (
              <><FileDown size={16} /> Εξαγωγή CV (.docx)</>
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
        </ul>
      </div>
    </div>
  );
}
