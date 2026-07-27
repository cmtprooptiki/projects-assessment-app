'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, X, Wand2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Employee } from '@/types';
import { getPhotoUrl } from '@/lib/photoUrl';
import { useDepartments } from '@/hooks/useDepartments';
import api from '@/lib/api';

interface Props {
  defaultValues?: Partial<Employee>;
  onSubmit: (data: FormData) => Promise<void>;
  submitLabel?: string;
}

export default function EmployeeForm({ defaultValues, onSubmit, submitLabel = 'Save Employee' }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: deptData } = useDepartments({ limit: 999 });
  const departments = deptData?.data ?? [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autofillLoading, setAutofillLoading] = useState(false);

  // Fields locked for Azure-synced employees (those with an azureId)
  const isAzureSynced = !!defaultValues?.azureId;

  const [form, setForm] = useState({
    firstName: defaultValues?.firstName ?? '',
    firstNameGr: defaultValues?.firstNameGr ?? '',
    lastName: defaultValues?.lastName ?? '',
    lastNameGr: defaultValues?.lastNameGr ?? '',
    email: defaultValues?.email ?? '',
    department: defaultValues?.department ?? '',
    isActive: defaultValues?.isActive ?? true,
    isExternal: defaultValues?.isExternal ?? false,
    fatherName: defaultValues?.fatherName ?? '',
    motherName: defaultValues?.motherName ?? '',
    dateOfBirth: defaultValues?.dateOfBirth ? defaultValues.dateOfBirth.slice(0, 10) : '',
    placeOfBirth: defaultValues?.placeOfBirth ?? '',
    phone: defaultValues?.phone ?? '',
    homeAddress: defaultValues?.homeAddress ?? '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(getPhotoUrl(defaultValues?.photo) ?? null);
  const [clearPhoto, setClearPhoto] = useState(false);

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setClearPhoto(false);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setClearPhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const initials = `${form.firstName[0] ?? '?'}${form.lastName[0] ?? '?'}`.toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.department) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('firstName', form.firstName.trim());
      fd.append('firstNameGr', form.firstNameGr.trim());
      fd.append('lastName', form.lastName.trim());
      fd.append('lastNameGr', form.lastNameGr.trim());
      fd.append('email', form.email.trim());
      fd.append('department', form.department);
      fd.append('isActive', String(form.isActive));
      fd.append('isExternal', String(form.isExternal));
      if (form.fatherName) fd.append('fatherName', form.fatherName.trim());
      if (form.motherName) fd.append('motherName', form.motherName.trim());
      if (form.dateOfBirth) fd.append('dateOfBirth', form.dateOfBirth);
      if (form.placeOfBirth) fd.append('placeOfBirth', form.placeOfBirth.trim());
      if (form.phone) fd.append('phone', form.phone.trim());
      if (form.homeAddress) fd.append('homeAddress', form.homeAddress.trim());
      if (photoFile) fd.append('photo', photoFile);
      if (clearPhoto) fd.append('clearPhoto', 'true');
      await onSubmit(fd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Basic Info */}
      <Card className="p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Basic Information</h2>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {photoPreview
                ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                : initials}
            </div>
            {photoPreview && (
              <button type="button" onClick={handleRemovePhoto}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                <X size={11} />
              </button>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Profile Photo</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Optional · JPG, PNG, WebP · max 2 MB</p>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Camera size={13} />
              {photoPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {isAzureSynced && (
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg">
            <span className="font-semibold">Azure AD sync:</span> Name and email are managed by Microsoft 365 and cannot be edited here.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name (EN)" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="John" required disabled={isAzureSynced} />
          <Input label="Last Name (EN)" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" required disabled={isAzureSynced} />
        </div>

        {/* Greek names with auto-fill */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ελληνικό Όνομα (για CV)</span>
            <button
              type="button"
              disabled={autofillLoading || !form.firstName.trim() || !form.lastName.trim()}
              onClick={async () => {
                setAutofillLoading(true);
                try {
                  const res = await api.post('/employees/suggest-greek-names', {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                  });
                  const { firstNameGr, lastNameGr } = res.data.data;
                  setForm((f) => ({ ...f, firstNameGr, lastNameGr }));
                } catch {
                  setError('Could not auto-fill Greek names. Please fill in manually.');
                } finally {
                  setAutofillLoading(false);
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 size={12} className={autofillLoading ? 'animate-spin' : ''} />
              {autofillLoading ? 'Filling...' : 'Auto-fill (AI)'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Όνομα (GR)" value={form.firstNameGr} onChange={(e) => set('firstNameGr', e.target.value)} placeholder="Ιωάννης" />
            <Input label="Επώνυμο (GR)" value={form.lastNameGr} onChange={(e) => set('lastNameGr', e.target.value)} placeholder="Παπαδόπουλος" />
          </div>
        </div>

        <Input label="Email Address" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="john.doe@company.com" required disabled={isAzureSynced} />

        <Select
          label="Department"
          placeholder="Select department"
          options={departments.map((d) => ({ value: d.name, label: d.name }))}
          value={form.department}
          onChange={(e) => set('department', e.target.value)}
          required
        />

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
          </div>
          <div className="flex items-center gap-3">
            <input id="isExternal" type="checkbox" checked={form.isExternal} onChange={(e) => set('isExternal', e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500" />
            <label htmlFor="isExternal" className="text-sm font-medium text-slate-700 dark:text-slate-300">External partner</label>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card className="p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Personal Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Father's Name" value={form.fatherName ?? ''} onChange={(e) => set('fatherName', e.target.value)} placeholder="Παρωνύμιο" />
          <Input label="Mother's Name" value={form.motherName ?? ''} onChange={(e) => set('motherName', e.target.value)} placeholder="Μητρώνυμο" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DatePicker label="Date of Birth" value={form.dateOfBirth ?? ''} onChange={(v) => set('dateOfBirth', v)} />
          <Input label="Place of Birth" value={form.placeOfBirth ?? ''} onChange={(e) => set('placeOfBirth', e.target.value)} placeholder="City, Country" />
        </div>

        <Input label="Phone" type="tel" value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="+30 210 0000000" />

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Home Address</label>
          <textarea
            value={form.homeAddress ?? ''}
            onChange={(e) => set('homeAddress', e.target.value)}
            placeholder="Street, City, Postal Code"
            rows={2}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
