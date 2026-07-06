'use client';

import { useState } from 'react';
import { FileDown, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { Employee } from '@/types';
import { fullName } from '@/lib/utils';

const TEMPLATES = [
  {
    id: 'navy',
    name: 'Navy Blue',
    description: 'Επαγγελματικό & κλασικό',
    headerColor: '#1B2A4A',
    accentColor: '#D0D8EE',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    description: 'Σύγχρονο & εταιρικό',
    headerColor: '#2D2170',
    accentColor: '#D5D2F0',
  },
  {
    id: 'teal',
    name: 'Teal',
    description: 'Δυναμικό & φρέσκο',
    headerColor: '#0A5260',
    accentColor: '#C8E3E7',
  },
] as const;

type TemplateId = typeof TEMPLATES[number]['id'];

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee;
}

export default function CVDownloadModal({ open, onClose, employee }: Props) {
  const [selected, setSelected] = useState<TemplateId>('navy');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cv/${employee.id}?template=${selected}`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${employee.lastName}_${employee.firstName}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('CV download failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Λήψη Βιογραφικού" className="max-w-xl">
      <p className="text-sm text-slate-500 mb-5">
        Επιλέξτε χρωματική θεματική για το βιογραφικό του{' '}
        <span className="font-semibold text-slate-700">{fullName(employee)}</span>.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setSelected(tpl.id)}
            className={`relative rounded-xl border-2 p-0 overflow-hidden text-left transition-all focus:outline-none ${
              selected === tpl.id
                ? 'border-blue-500 shadow-md shadow-blue-100'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Template preview */}
            <div className="w-full">
              {/* Header band */}
              <div
                className="w-full flex flex-col items-center justify-center py-3 px-2 gap-1"
                style={{ backgroundColor: tpl.headerColor }}
              >
                <div className="w-16 h-1.5 rounded-full bg-white opacity-90" />
                <div className="w-10 h-1 rounded-full bg-white opacity-50" />
              </div>
              {/* Content preview */}
              <div className="px-3 py-2 bg-white space-y-1.5">
                {/* Section header */}
                <div
                  className="w-full h-2 rounded-sm"
                  style={{ backgroundColor: tpl.headerColor, opacity: 0.85 }}
                />
                {/* Content rows */}
                <div className="space-y-1 pt-0.5">
                  {[100, 80, 90].map((w, i) => (
                    <div key={i} className="flex gap-1">
                      <div
                        className="h-1.5 rounded-full bg-slate-200"
                        style={{ width: `${w}%` }}
                      />
                    </div>
                  ))}
                </div>
                {/* Second section header */}
                <div
                  className="w-full h-2 rounded-sm mt-1"
                  style={{ backgroundColor: tpl.headerColor, opacity: 0.85 }}
                />
                {[70, 90, 60].map((w, i) => (
                  <div key={i} className="flex gap-1">
                    <div
                      className="h-1.5 rounded-full bg-slate-200"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected checkmark */}
            {selected === tpl.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}

            {/* Label */}
            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-semibold text-slate-700">{tpl.name}</p>
              <p className="text-xs text-slate-400 leading-tight">{tpl.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Άκυρο
        </Button>
        <Button onClick={handleDownload} loading={loading} className="gap-2">
          <FileDown size={15} />
          Λήψη .docx
        </Button>
      </div>
    </Modal>
  );
}
