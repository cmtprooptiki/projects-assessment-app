'use client';

import { useState } from 'react';
import { FileDown, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { Employee } from '@/types';
import { fullName } from '@/lib/utils';

type TemplateId = 'navy' | 'indigo' | 'teal';

// Mini layout previews drawn with divs — distinct per layout
function PreviewClassic({ color, accent }: { color: string; accent: string }) {
  return (
    <div className="w-full bg-white">
      {/* Full-width colored banner */}
      <div className="w-full py-3 flex flex-col items-center gap-1" style={{ backgroundColor: color }}>
        <div className="w-14 h-1.5 rounded-full bg-white opacity-90" />
        <div className="w-8 h-1 rounded-full bg-white opacity-50" />
      </div>
      {/* Personal info grid (4 col look) */}
      <div className="px-2 py-1.5 grid grid-cols-4 gap-0.5">
        {[40, 60, 40, 60, 40, 60, 40, 60].map((w, i) => (
          <div key={i} className="h-1 rounded-full" style={{ backgroundColor: i % 2 === 0 ? '#CBD5E1' : '#E2E8F0', width: `${w}%` }} />
        ))}
      </div>
      {/* Section 1 */}
      <div className="px-2 pb-1">
        <div className="w-full h-2 rounded-sm mb-1" style={{ backgroundColor: color }} />
        <div className="flex gap-1 mb-0.5">
          {[40, 30, 20].map((w, i) => <div key={i} className="h-1 rounded-full bg-slate-300" style={{ width: `${w}%` }} />)}
        </div>
        {[100, 85].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.38, w * 0.3, w * 0.2].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%`, backgroundColor: i === 0 && j === 0 ? accent : undefined }} />
            ))}
          </div>
        ))}
      </div>
      {/* Section 2 */}
      <div className="px-2 pb-2">
        <div className="w-full h-2 rounded-sm mb-1" style={{ backgroundColor: color }} />
        {[100, 85, 70].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.35, w * 0.25, w * 0.28].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSidebar({ color }: { color: string }) {
  return (
    <div className="w-full bg-white flex" style={{ minHeight: 120 }}>
      {/* Sidebar */}
      <div className="flex-none w-[35%] flex flex-col px-1.5 py-2 gap-1" style={{ backgroundColor: color }}>
        <div className="w-full h-1.5 rounded-full bg-white opacity-90" />
        <div className="w-3/4 h-1 rounded-full bg-white opacity-50" />
        <div className="mt-1 w-1/2 h-0.5 rounded-full bg-white opacity-30" />
        {[70, 55, 70, 55].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white opacity-25" style={{ width: `${w}%` }} />
        ))}
        <div className="mt-1 w-1/2 h-0.5 rounded-full bg-white opacity-30" />
        {[60, 50].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white opacity-25" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Main content */}
      <div className="flex-1 px-2 py-2 flex flex-col gap-1">
        <div className="w-full h-2 rounded-sm mb-1" style={{ backgroundColor: color }} />
        <div className="flex gap-1">
          {[45, 30, 20].map((w, i) => <div key={i} className="h-1 rounded-full bg-slate-300" style={{ width: `${w}%` }} />)}
        </div>
        {[90, 75].map((w, i) => (
          <div key={i} className="flex gap-1">
            {[w * 0.42, w * 0.32, w * 0.2].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
        <div className="w-full h-2 rounded-sm mt-1 mb-1" style={{ backgroundColor: color }} />
        {[85, 70, 60].map((w, i) => (
          <div key={i} className="flex gap-1">
            {[w * 0.35, w * 0.28, w * 0.25].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewMinimal({ color }: { color: string }) {
  return (
    <div className="w-full bg-white px-2 py-2">
      {/* 2-col header: name left + contact right */}
      <div className="flex justify-between items-end mb-1.5">
        <div className="flex flex-col gap-0.5">
          <div className="h-2 w-16 rounded-full" style={{ backgroundColor: color, opacity: 0.9 }} />
          <div className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="h-1 w-10 rounded-full bg-slate-300" />
          <div className="h-1 w-8 rounded-full bg-slate-200" />
          <div className="h-1 w-12 rounded-full bg-slate-200" />
        </div>
      </div>
      {/* Thick divider line */}
      <div className="w-full h-0.5 mb-1.5 rounded-full" style={{ backgroundColor: color }} />
      {/* Section 1 heading */}
      <div className="h-1.5 w-14 rounded-full mb-1" style={{ backgroundColor: color, opacity: 0.8 }} />
      {/* Underlined col headers */}
      <div className="flex gap-1 mb-1 pb-0.5 border-b" style={{ borderColor: color }}>
        {[38, 30, 22].map((w, i) => <div key={i} className="h-1 rounded-full bg-slate-400" style={{ width: `${w}%` }} />)}
      </div>
      {[90, 75, 80].map((w, i) => (
        <div key={i} className="flex gap-1 mb-0.5">
          {[w * 0.4, w * 0.3, w * 0.22].map((cw, j) => (
            <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
          ))}
        </div>
      ))}
      {/* Section 2 heading */}
      <div className="h-1.5 w-20 rounded-full mt-1.5 mb-1" style={{ backgroundColor: color, opacity: 0.8 }} />
      <div className="flex gap-1 mb-1 pb-0.5 border-b" style={{ borderColor: color }}>
        {[32, 25, 22, 15].map((w, i) => <div key={i} className="h-1 rounded-full bg-slate-400" style={{ width: `${w}%` }} />)}
      </div>
      {[85, 70].map((w, i) => (
        <div key={i} className="flex gap-1 mb-0.5">
          {[w * 0.34, w * 0.26, w * 0.27].map((cw, j) => (
            <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

const PREVIEWS: Record<TemplateId, (color: string, accent: string) => React.ReactNode> = {
  navy:   (c, a) => <PreviewClassic color={c} accent={a} />,
  indigo: (c, _) => <PreviewSidebar color={c} />,
  teal:   (c, _) => <PreviewMinimal color={c} />,
};

const TEMPLATES: { id: TemplateId; name: string; description: string; headerColor: string; accentColor: string }[] = [
  { id: 'navy',   name: 'Classic',  description: 'Κλασικό με πλήρη πίνακα',  headerColor: '#1B2A4A', accentColor: '#D0D8EE' },
  { id: 'indigo', name: 'Sidebar',  description: 'Πλαϊνή στήλη, σύγχρονο',  headerColor: '#2D2170', accentColor: '#D5D2F0' },
  { id: 'teal',   name: 'Minimal',  description: 'Καθαρό, χωρίς πλαίσια',   headerColor: '#0A5260', accentColor: '#C8E3E7' },
];

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
      const res = await api.get(`/cv/${employee.id}?template=${selected}`, { responseType: 'blob' });
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
    <Modal open={open} onClose={onClose} title="Λήψη Βιογραφικού" className="max-w-2xl">
      <p className="text-sm text-slate-500 mb-5">
        Επιλέξτε πρότυπο για το βιογραφικό του{' '}
        <span className="font-semibold text-slate-700">{fullName(employee)}</span>.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
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
            {/* Layout-specific preview */}
            <div className="w-full overflow-hidden" style={{ background: 'white' }}>
              {PREVIEWS[tpl.id](tpl.headerColor, tpl.accentColor)}
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
        <Button variant="secondary" onClick={onClose} disabled={loading}>Άκυρο</Button>
        <Button onClick={handleDownload} loading={loading} className="gap-2">
          <FileDown size={15} />
          Λήψη .docx
        </Button>
      </div>
    </Modal>
  );
}
