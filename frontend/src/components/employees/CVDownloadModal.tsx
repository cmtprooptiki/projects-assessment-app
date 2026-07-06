'use client';

import { useState } from 'react';
import { FileDown, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { Employee } from '@/types';
import { fullName } from '@/lib/utils';

type TemplateId = 'navy' | 'indigo' | 'teal';

// ─── Mini layout preview components ──────────────────────────────────────────

// Layout 1: Contemporary — photo left | name+contact right header, rule, sections
function PreviewContemporary({ color }: { color: string }) {
  return (
    <div className="w-full bg-white pb-2">
      {/* Header: photo square left + text right */}
      <div className="flex gap-2 p-2">
        <div className="flex-none w-10 h-12 rounded bg-slate-200" />
        <div className="flex-1 flex flex-col justify-center gap-1 pt-1">
          <div className="h-2.5 w-20 rounded-sm font-bold" style={{ backgroundColor: color, opacity: 0.9 }} />
          <div className="h-1 w-14 rounded-full bg-slate-300" />
          <div className="h-1 w-16 rounded-full bg-slate-200" />
          <div className="h-1 w-12 rounded-full bg-slate-200" />
        </div>
      </div>
      {/* Thick colored rule */}
      <div className="mx-2 mb-2 h-0.5 rounded-full" style={{ backgroundColor: color }} />
      {/* Section 1: title with underline + rows */}
      <div className="px-2 mb-2">
        <div className="flex items-end gap-1 mb-1 pb-0.5 border-b" style={{ borderColor: color }}>
          <div className="h-2 w-14 rounded-sm font-bold" style={{ backgroundColor: color, opacity: 0.85 }} />
        </div>
        <div className="flex gap-1 mb-1">
          {[42, 32, 22].map((w, i) => (
            <div key={i} className="h-1 rounded-full" style={{ width: `${w}%`, backgroundColor: i === 0 ? color : '#CBD5E1', opacity: i === 0 ? 0.5 : 1 }} />
          ))}
        </div>
        {[95, 80].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.42, w * 0.31, w * 0.2].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
      {/* Section 2 */}
      <div className="px-2">
        <div className="flex items-end gap-1 mb-1 pb-0.5 border-b" style={{ borderColor: color }}>
          <div className="h-2 w-12 rounded-sm" style={{ backgroundColor: color, opacity: 0.85 }} />
        </div>
        {[90, 75].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.4, w * 0.33, w * 0.2].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Layout 2: Sidebar — colored left column (photo+info+languages) | white right (education)
function PreviewSidebar({ color }: { color: string }) {
  return (
    <div className="w-full flex" style={{ minHeight: 130 }}>
      {/* Sidebar */}
      <div className="flex-none w-[32%] flex flex-col items-center px-1.5 py-2 gap-1.5" style={{ backgroundColor: color }}>
        {/* Photo circle */}
        <div className="w-8 h-10 rounded bg-white opacity-25" />
        {/* Name */}
        <div className="w-full h-1.5 rounded-full bg-white opacity-80" />
        <div className="w-3/4 h-1 rounded-full bg-white opacity-50" />
        {/* Section labels */}
        <div className="w-full mt-1 h-0.5 rounded-full bg-white opacity-30" />
        {[65, 55, 65, 50, 60].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white" style={{ width: `${w}%`, opacity: i % 2 === 0 ? 0.3 : 0.15 }} />
        ))}
        <div className="w-full mt-0.5 h-0.5 rounded-full bg-white opacity-30" />
        {[55, 45].map((w, i) => (
          <div key={i} className="h-1 rounded-full bg-white" style={{ width: `${w}%`, opacity: 0.25 }} />
        ))}
      </div>
      {/* Main content */}
      <div className="flex-1 px-2 py-2 flex flex-col gap-1 bg-white">
        {/* Section title with underline */}
        <div className="flex items-end gap-1 mb-0.5 pb-0.5 border-b" style={{ borderColor: color }}>
          <div className="h-1.5 w-14 rounded-sm" style={{ backgroundColor: color, opacity: 0.85 }} />
        </div>
        {/* Col headers */}
        <div className="flex gap-1">
          {[40, 33].map((w, i) => (
            <div key={i} className="h-1 rounded-full" style={{ width: `${w}%`, backgroundColor: color, opacity: 0.45 }} />
          ))}
        </div>
        {[92, 78, 85].map((w, i) => (
          <div key={i} className="flex gap-1">
            {[w * 0.42, w * 0.35].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
        <div className="flex items-end gap-1 mt-1.5 mb-0.5 pb-0.5 border-b" style={{ borderColor: color }}>
          <div className="h-1.5 w-16 rounded-sm" style={{ backgroundColor: color, opacity: 0.85 }} />
        </div>
        {[80, 65].map((w, i) => (
          <div key={i} className="flex gap-1">
            {[w * 0.4, w * 0.35].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Layout 3: Bold Header — full colored banner with photo right, accent-bar sections
function PreviewBoldHeader({ color, lt }: { color: string; lt: string }) {
  return (
    <div className="w-full bg-white">
      {/* Colored header band: name left + photo right */}
      <div className="flex justify-between items-center px-2 py-2" style={{ backgroundColor: color }}>
        <div className="flex flex-col gap-1">
          <div className="h-2 w-16 rounded-sm bg-white opacity-90" />
          <div className="h-2 w-12 rounded-sm bg-white opacity-90" />
          <div className="h-1 w-10 rounded-full bg-white opacity-40 mt-0.5" />
          <div className="h-1 w-14 rounded-full bg-white opacity-30" />
        </div>
        {/* Photo placeholder */}
        <div className="flex-none w-9 h-11 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
      </div>
      {/* Personal info strip */}
      <div className="px-2 py-1 flex gap-2" style={{ backgroundColor: lt }}>
        {[45, 45].map((w, i) => (
          <div key={i} className="flex gap-1" style={{ width: `${w}%` }}>
            <div className="h-1 rounded-full bg-slate-400" style={{ width: '40%' }} />
            <div className="h-1 rounded-full bg-slate-300" style={{ width: '55%' }} />
          </div>
        ))}
      </div>
      {/* Section with left accent bar */}
      <div className="px-2 py-1">
        {/* Accent bar title */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex-none w-0.5 h-3 rounded-full" style={{ backgroundColor: color }} />
          <div className="h-2 w-14 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }} />
        </div>
        <div className="flex gap-1 mb-1">
          {[40, 32, 22].map((w, i) => (
            <div key={i} className="h-1 rounded-full" style={{ width: `${w}%`, backgroundColor: color, opacity: 0.4 }} />
          ))}
        </div>
        {[92, 78].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.41, w * 0.31, w * 0.21].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
        {/* Second section */}
        <div className="flex items-center gap-1 mb-1 mt-1.5">
          <div className="flex-none w-0.5 h-3 rounded-full" style={{ backgroundColor: color }} />
          <div className="h-2 w-11 rounded-sm" style={{ backgroundColor: color, opacity: 0.8 }} />
        </div>
        {[85, 70].map((w, i) => (
          <div key={i} className="flex gap-1 mb-0.5">
            {[w * 0.38, w * 0.33, w * 0.2].map((cw, j) => (
              <div key={j} className="h-1 rounded-full bg-slate-200" style={{ width: `${cw}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const TEMPLATES: {
  id: TemplateId; name: string; description: string;
  color: string; lt?: string;
  preview: (color: string, lt: string) => React.ReactNode;
}[] = [
  {
    id: 'navy',
    name: 'Contemporary',
    description: 'Φωτογραφία αριστερά, κλασικές ενότητες',
    color: '#1B2A4A',
    preview: (c) => <PreviewContemporary color={c} />,
  },
  {
    id: 'indigo',
    name: 'Sidebar',
    description: 'Πλαϊνή στήλη με στοιχεία & φωτογραφία',
    color: '#2D2170',
    preview: (c) => <PreviewSidebar color={c} />,
  },
  {
    id: 'teal',
    name: 'Bold Header',
    description: 'Έντονη κεφαλίδα, ενότητες με γραμμή',
    color: '#0A5260',
    lt: '#DEF0F3',
    preview: (c, lt) => <PreviewBoldHeader color={c} lt={lt} />,
  },
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
            <div className="w-full overflow-hidden bg-white">
              {tpl.preview(tpl.color, tpl.lt ?? '#F0F4FF')}
            </div>

            {selected === tpl.id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow">
                <Check size={11} className="text-white" strokeWidth={3} />
              </div>
            )}

            <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
              <p className="text-xs font-semibold text-slate-700">{tpl.name}</p>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">{tpl.description}</p>
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
