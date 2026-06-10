'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useImportClients } from '@/hooks/useClients';

interface ImportResult {
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const TEMPLATE_HEADERS = 'name,code,industry,contactEmail,contactPhone,notes';
const TEMPLATE_EXAMPLE = 'Acme Corporation,ACME-001,Technology,info@acme.com,+30 210 0000000,Key client';

function downloadTemplate() {
  const csv = `${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'clients_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientImportModal({ open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const importClients = useImportClients();

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv')) pickFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    try {
      const res = await importClients.mutateAsync(file);
      setResult(res.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Import failed.';
      setResult({ created: 0, skipped: 0, errors: [{ row: 0, message: msg }] });
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Clients from CSV" className="max-w-lg">
      <div className="space-y-4">
        {/* Template download */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span>Columns: <span className="font-mono text-gray-700">name*, code, industry, contactEmail, contactPhone, notes</span></span>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium shrink-0 ml-3"
          >
            <Download size={12} />
            Template
          </button>
        </div>

        {/* Drop zone */}
        {!result && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
            `}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText size={28} className="text-indigo-500" />
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={28} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Drop a CSV file here or click to browse</p>
                <p className="text-xs text-gray-400">Max 5 MB</p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{result.created}</div>
                <div className="text-xs text-green-700 mt-0.5">Created</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
                <div className="text-xs text-yellow-700 mt-0.5">Skipped</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                <div className="text-xs text-red-700 mt-0.5">Errors</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <AlertCircle size={12} className="mt-0.5 shrink-0" />
                    <span>{e.row > 0 ? `Row ${e.row}: ` : ''}{e.message}</span>
                  </div>
                ))}
              </div>
            )}

            {result.created > 0 && result.errors.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <CheckCircle size={16} />
                All rows imported successfully.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {result ? (
            <>
              <button onClick={reset} className="text-sm text-indigo-600 hover:underline">Import another file</button>
              <Button onClick={handleClose}>Done</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!file} loading={importClients.isPending}>
                Import
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
