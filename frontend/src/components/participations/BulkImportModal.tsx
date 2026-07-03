'use client';

import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useBulkPreviewParticipations, useBulkConfirmParticipations } from '@/hooks/useParticipations';
import type { BulkPreviewSuccessRow, BulkPreviewErrorRow } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtDate(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SuccessRow({ row, idx }: { row: BulkPreviewSuccessRow; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-slate-400 w-6 shrink-0">#{row.rowIndex}</span>
          <CheckCircle size={15} className="text-emerald-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{row.employeeName}</span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:block">·</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 truncate hidden sm:block">{row.projectName}</span>
          <span className="text-slate-300 dark:text-slate-600 hidden sm:block">·</span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hidden sm:block">{row.roleName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
            {row.periods.length} period{row.periods.length !== 1 ? 's' : ''}
          </span>
          {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden mb-2">
            {row.projectName} · <span className="text-indigo-500">{row.roleName}</span>
          </p>
          {row.periods.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ErrorRow({ row }: { row: BulkPreviewErrorRow }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <span className="text-xs font-mono text-slate-400 w-6 shrink-0 mt-0.5">#{row.rowIndex}</span>
      <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
      <div className="min-w-0">
        {(row.employeeId || row.projectId) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
            {row.employeeId ? `Employee #${row.employeeId}` : ''}
            {row.employeeId && row.projectId ? ' · ' : ''}
            {row.projectId ? `Project #${row.projectId}` : ''}
          </p>
        )}
        <p className="text-sm text-red-700 dark:text-red-400">{row.reason}</p>
      </div>
    </div>
  );
}

type Step = 'upload' | 'preview' | 'done';

export default function BulkImportModal({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>('upload');
  const [previewData, setPreviewData] = useState<{ success: BulkPreviewSuccessRow[]; errors: BulkPreviewErrorRow[] } | null>(null);
  const [doneResult, setDoneResult] = useState<{ imported: number; participationsCreated: number } | null>(null);

  const preview = useBulkPreviewParticipations();
  const confirm = useBulkConfirmParticipations();

  const handleClose = () => {
    setFile(null);
    setStep('upload');
    setPreviewData(null);
    setDoneResult(null);
    preview.reset();
    confirm.reset();
    onClose();
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    preview.reset();
  };

  const handlePreview = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await preview.mutateAsync(fd);
      setPreviewData(res.data);
      setStep('preview');
    } catch {}
  };

  const handleConfirm = async () => {
    if (!previewData || previewData.success.length === 0) return;
    const rows = previewData.success.map((r) => ({
      employeeId: r.employeeId,
      projectId:  r.projectId,
      roleId:     r.roleId,
      periods:    r.periods,
    }));
    try {
      const res = await confirm.mutateAsync({ rows });
      setDoneResult({ imported: res.imported, participationsCreated: res.participationsCreated });
      setStep('done');
    } catch {}
  };

  const totalPeriods = previewData?.success.reduce((s, r) => s + r.periods.length, 0) ?? 0;

  return (
    <Modal open={open} onClose={handleClose} title="Bulk Import Participations">
      {/* ── Step 1: Upload ── */}
      {step === 'upload' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload an Excel (.xlsx/.xls) or CSV file with columns:
            <span className="font-mono text-indigo-600 dark:text-indigo-400"> employeeId, projectId, roleId, isExternal</span>.
            Dates are computed automatically from each employee's availability periods and the project's contracts.
          </p>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
            className="border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
          >
            <FileSpreadsheet size={36} className="text-slate-300 dark:text-slate-600" />
            {file ? (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB — click to change</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Drop file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-0.5">.xlsx, .xls, .csv — max 10 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
          </div>

          {preview.error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertTriangle size={15} className="shrink-0" />
              {preview.error.message || 'Failed to process file.'}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="button" loading={preview.isPending} disabled={!file} onClick={handlePreview}>
              <Upload size={15} />
              Preview
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview ── */}
      {step === 'preview' && previewData && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-lg">
              <CheckCircle size={15} className="text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {previewData.success.length} employee{previewData.success.length !== 1 ? 's' : ''} ready
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500">({totalPeriods} periods total)</span>
            </div>
            {previewData.errors.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                <XCircle size={15} className="text-red-500" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                  {previewData.errors.length} row{previewData.errors.length !== 1 ? 's' : ''} failed
                </span>
              </div>
            )}
          </div>

          {/* Rows */}
          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
            {previewData.success.map((r, i) => <SuccessRow key={i} row={r} idx={i} />)}
            {previewData.errors.map((r, i) => <ErrorRow key={i} row={r} />)}
          </div>

          {confirm.error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertTriangle size={15} className="shrink-0" />
              {confirm.error.message || 'Import failed.'}
            </div>
          )}

          <div className="flex justify-between gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => setStep('upload')}>← Back</Button>
            <Button
              type="button"
              loading={confirm.isPending}
              disabled={previewData.success.length === 0}
              onClick={handleConfirm}
            >
              Import {previewData.success.length} employee{previewData.success.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === 'done' && doneResult && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Import complete</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {doneResult.imported} employee–project pair{doneResult.imported !== 1 ? 's' : ''} imported
              — <span className="font-semibold text-indigo-600 dark:text-indigo-400">{doneResult.participationsCreated} participation records</span> created.
            </p>
          </div>
          <Button onClick={handleClose}>Close</Button>
        </div>
      )}
    </Modal>
  );
}
