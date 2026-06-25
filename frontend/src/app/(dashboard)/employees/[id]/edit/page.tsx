'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, GraduationCap, Languages, CalendarDays } from 'lucide-react';
import { PageSpinner } from '@/components/ui/Spinner';
import EmployeeForm from '@/components/employees/EmployeeForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import DatePicker from '@/components/ui/DatePicker';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { useEducation, useCreateEducation, useUpdateEducation, useDeleteEducation } from '@/hooks/useEducation';
import { useLanguages, useCreateLanguage, useUpdateLanguage, useDeleteLanguage } from '@/hooks/useLanguages';
import { useAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability } from '@/hooks/useAvailability';
import type { Education, Language, AvailabilityPeriod } from '@/types';
import { INSTITUTION_HIERARCHY } from '@/data/institutionHierarchy';

const GREEK_INSTITUTIONS = [
  'Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών',
  'Εθνικό Μετσόβιο Πολυτεχνείο',
  'Οικονομικό Πανεπιστήμιο Αθηνών',
  'Γεωπονικό Πανεπιστήμιο Αθηνών',
  'Πάντειο Πανεπιστήμιο',
  'Πανεπιστήμιο Δυτικής Αττικής',
  'Χαροκόπειο Πανεπιστήμιο',
  'Πανεπιστήμιο Πειραιώς',
  'Αριστοτέλειο Πανεπιστήμιο Θεσσαλονίκης',
  'Πανεπιστήμιο Μακεδονίας',
  'Πανεπιστήμιο Δυτικής Μακεδονίας',
  'Διεθνές Πανεπιστήμιο της Ελλάδος',
  'Δημοκρίτειο Πανεπιστήμιο Θράκης',
  'Πανεπιστήμιο Ιωαννίνων',
  'Πανεπιστήμιο Θεσσαλίας',
  'Πανεπιστήμιο Πελοποννήσου',
  'Πανεπιστήμιο Πατρών',
  'Πανεπιστήμιο Αιγαίου',
  'Ιόνιο Πανεπιστήμιο',
  'Πανεπιστήμιο Κρήτης',
  'Πολυτεχνείο Κρήτης',
  'Ελληνικό Μεσογειακό Πανεπιστήμιο',
  'Ελληνικό Ανοικτό Πανεπιστήμιο',
  'Ανώτατη Σχολή Καλών Τεχνών',
  'Ανώτατη Σχολή Παιδαγωγικής και Τεχνολογικής Εκπαίδευσης',
  'Ανώτατη Σχολή Τουριστικής Εκπαίδευσης',
  'Ανώτατη Εκκλησιαστική Ακαδημία',
  'Μεσογειακό Αγρονομικό Ινστιτούτο Χανίων',
  'Στρατιωτικές Σχολές',
  'Σχολές Σωμάτων Ασφαλείας',
];

const institutionOptions = [
  { value: '', label: 'Επιλογή ιδρύματος...' },
  ...GREEK_INSTITUTIONS.map((name) => ({ value: name, label: name })),
];

const emptyEdu = { institutionName: '', schoolName: '', departmentName: '', degreeTitle: '', specialization: '', dateAwarded: '', recognized: '', degreeType: '' };
const degreeTypeOptions = [
  { value: '', label: '—' },
  { value: 'Πτυχίο', label: 'Πτυχίο' },
  { value: 'Μεταπτυχιακός Τίτλος Σπουδών', label: 'Μεταπτυχιακός Τίτλος Σπουδών' },
  { value: 'Διδακτορικός Τίτλος Σπουδών', label: 'Διδακτορικός Τίτλος Σπουδών' },
];
const recognizedOptions = [
  { value: '', label: '—' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
const emptyLang = { language: '', degreeTitle: '', level: '' };
const emptyAvail = { startDate: '', endDate: '', notes: '' };

type EduMode = null | 'create' | { edit: Education };
type LangMode = null | 'create' | { edit: Language };
type AvailMode = null | 'create' | { edit: AvailabilityPeriod };

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function calcYearsOfService(periods: AvailabilityPeriod[]): number | null {
  if (!periods.length) return null;
  const today = new Date();
  let totalMs = 0;
  for (const p of periods) {
    const start = new Date(p.startDate + 'T00:00:00');
    const end = p.endDate ? new Date(p.endDate + 'T00:00:00') : today;
    totalMs += Math.max(0, end.getTime() - start.getTime());
  }
  return Math.floor(totalMs / (365.25 * 24 * 60 * 60 * 1000));
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  const { data, isLoading } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  // Education state
  const { data: eduData, isLoading: loadingEdu } = useEducation(id);
  const educationList = eduData?.data ?? [];
  const [eduMode, setEduMode] = useState<EduMode>(null);
  const [deletingEdu, setDeletingEdu] = useState<Education | null>(null);
  const [eduForm, setEduForm] = useState(emptyEdu);
  const [eduInstMode, setEduInstMode] = useState<'text' | 'list'>('text');
  const [eduSchoolMode, setEduSchoolMode] = useState<'text' | 'list'>('text');
  const [eduDeptMode, setEduDeptMode] = useState<'text' | 'list'>('text');
  const [eduError, setEduError] = useState('');
  const [eduSaving, setEduSaving] = useState(false);
  const createEducation = useCreateEducation(id);
  const updateEducation = useUpdateEducation(id);
  const deleteEducation = useDeleteEducation(id);

  // Language state
  const { data: langData, isLoading: loadingLang } = useLanguages(id);
  const languageList = langData?.data ?? [];
  const [langMode, setLangMode] = useState<LangMode>(null);
  const [deletingLang, setDeletingLang] = useState<Language | null>(null);
  const [langForm, setLangForm] = useState(emptyLang);
  const [langError, setLangError] = useState('');
  const [langSaving, setLangSaving] = useState(false);
  const createLanguage = useCreateLanguage(id);
  const updateLanguage = useUpdateLanguage(id);
  const deleteLanguage = useDeleteLanguage(id);

  // Availability state
  const { data: availData, isLoading: loadingAvail } = useAvailability(id);
  const availList = availData?.data ?? [];
  const [availMode, setAvailMode] = useState<AvailMode>(null);
  const [deletingAvail, setDeletingAvail] = useState<AvailabilityPeriod | null>(null);
  const [availForm, setAvailForm] = useState(emptyAvail);
  const [availError, setAvailError] = useState('');
  const [availSaving, setAvailSaving] = useState(false);
  const createAvailability = useCreateAvailability(id);
  const updateAvailability = useUpdateAvailability(id);
  const deleteAvailability = useDeleteAvailability(id);

  const isEditingEdu = eduMode && typeof eduMode === 'object';
  const isEditingLang = langMode && typeof langMode === 'object';
  const isEditingAvail = availMode && typeof availMode === 'object';

  // Education handlers
  const handleOpenCreateEdu = () => { setEduForm(emptyEdu); setEduInstMode('text'); setEduSchoolMode('text'); setEduDeptMode('text'); setEduError(''); setEduMode('create'); };
  const handleOpenEditEdu = (edu: Education) => {
    const isKnownInst = GREEK_INSTITUTIONS.includes(edu.institutionName);
    const schoolName = edu.schoolName ?? '';
    const departmentName = edu.departmentName ?? '';
    const isKnownSchool = isKnownInst && schoolName
      ? Object.keys(INSTITUTION_HIERARCHY[edu.institutionName] ?? {}).includes(schoolName)
      : false;
    const isKnownDept = isKnownSchool && departmentName
      ? (INSTITUTION_HIERARCHY[edu.institutionName]?.[schoolName] ?? []).includes(departmentName)
      : false;
    setEduForm({ institutionName: edu.institutionName, schoolName, departmentName, degreeTitle: edu.degreeTitle, specialization: edu.specialization ?? '', dateAwarded: edu.dateAwarded ? edu.dateAwarded.slice(0, 10) : '', recognized: edu.recognized ?? '', degreeType: edu.degreeType ?? '' });
    setEduInstMode(isKnownInst ? 'list' : 'text');
    setEduSchoolMode(isKnownSchool ? 'list' : 'text');
    setEduDeptMode(isKnownDept ? 'list' : 'text');
    setEduError(''); setEduMode({ edit: edu });
  };
  const handleEduSave = async (e: React.FormEvent) => {
    e.preventDefault(); setEduError(''); setEduSaving(true);
    try {
      const payload = { institutionName: eduForm.institutionName, schoolName: eduForm.schoolName || undefined, departmentName: eduForm.departmentName || undefined, degreeTitle: eduForm.degreeTitle, degreeType: eduForm.degreeType || undefined, specialization: eduForm.specialization || undefined, dateAwarded: eduForm.dateAwarded || undefined, recognized: (eduForm.recognized as 'yes' | 'no' | '') || undefined };
      if (eduMode === 'create') await createEducation.mutateAsync(payload);
      else if (isEditingEdu) await updateEducation.mutateAsync({ id: eduMode.edit.id, data: payload });
      setEduMode(null);
    } catch (err) { setEduError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setEduSaving(false); }
  };
  const handleEduDelete = async () => {
    if (!deletingEdu) return;
    try { await deleteEducation.mutateAsync(deletingEdu.id); setDeletingEdu(null); } catch {}
  };

  // Language handlers
  const handleOpenCreateLang = () => { setLangForm(emptyLang); setLangError(''); setLangMode('create'); };
  const handleOpenEditLang = (lang: Language) => {
    setLangForm({ language: lang.language, degreeTitle: lang.degreeTitle ?? '', level: lang.level ?? '' });
    setLangError(''); setLangMode({ edit: lang });
  };
  const handleLangSave = async (e: React.FormEvent) => {
    e.preventDefault(); setLangError(''); setLangSaving(true);
    try {
      const payload = { language: langForm.language, degreeTitle: langForm.degreeTitle || undefined, level: langForm.level || undefined };
      if (langMode === 'create') await createLanguage.mutateAsync(payload);
      else if (isEditingLang) await updateLanguage.mutateAsync({ id: langMode.edit.id, data: payload });
      setLangMode(null);
    } catch (err) { setLangError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setLangSaving(false); }
  };
  const handleLangDelete = async () => {
    if (!deletingLang) return;
    try { await deleteLanguage.mutateAsync(deletingLang.id); setDeletingLang(null); } catch {}
  };

  // Availability handlers
  const handleOpenCreateAvail = () => { setAvailForm(emptyAvail); setAvailError(''); setAvailMode('create'); };
  const handleOpenEditAvail = (p: AvailabilityPeriod) => {
    setAvailForm({ startDate: p.startDate.slice(0, 10), endDate: p.endDate ? p.endDate.slice(0, 10) : '', notes: p.notes ?? '' });
    setAvailError(''); setAvailMode({ edit: p });
  };
  const handleAvailSave = async (e: React.FormEvent) => {
    e.preventDefault(); setAvailError('');
    if (!availForm.startDate) { setAvailError('Start date is required.'); return; }
    setAvailSaving(true);
    try {
      const payload = { startDate: availForm.startDate, endDate: availForm.endDate || undefined, notes: availForm.notes || undefined };
      if (availMode === 'create') await createAvailability.mutateAsync(payload);
      else if (isEditingAvail) await updateAvailability.mutateAsync({ id: availMode.edit.id, data: payload });
      setAvailMode(null);
    } catch (err) { setAvailError(err instanceof Error ? err.message : 'Something went wrong.'); }
    finally { setAvailSaving(false); }
  };
  const handleAvailDelete = async () => {
    if (!deletingAvail) return;
    try { await deleteAvailability.mutateAsync(deletingAvail.id); setDeletingAvail(null); } catch {}
  };

  if (isLoading) return <PageSpinner />;

  const yearsOfService = calcYearsOfService(availList);

  return (
    <div className="space-y-6">
      <EmployeeForm
        defaultValues={data?.data}
        onSubmit={async (formData) => {
          await updateEmployee.mutateAsync({ id, data: formData });
          router.push('/employees');
        }}
        submitLabel="Update Employee"
      />

      {/* Availability Section */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Availability Periods</h2>
            {yearsOfService !== null && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {yearsOfService} yr{yearsOfService !== 1 ? 's' : ''} of service
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleOpenCreateAvail}><Plus size={14} />Add Period</Button>
        </div>
        <Card>
          {loadingAvail ? <div className="p-6"><PageSpinner /></div>
            : availList.length === 0
            ? <EmptyState title="No availability periods" description="Add a period to track when this employee is available to work." />
            : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {availList.map((p) => (
                  <div key={p.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(p.startDate)}
                          <span className="mx-2 text-slate-400">→</span>
                          {p.endDate ? formatDate(p.endDate) : <span className="text-emerald-600 dark:text-emerald-400">Present</span>}
                        </p>
                        {p.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditAvail(p)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingAvail(p)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>

      {/* Education Section */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Education</h2>
          </div>
          <Button size="sm" onClick={handleOpenCreateEdu}><Plus size={14} />Add Education</Button>
        </div>
        <Card>
          {loadingEdu ? <div className="p-6"><PageSpinner /></div>
            : educationList.length === 0 ? <EmptyState title="No education records" description="Add education records for this employee." />
            : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {educationList.map((edu) => (
                  <div key={edu.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="min-w-0">
                      {edu.degreeType && <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">{edu.degreeType}</p>}
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{edu.degreeTitle}</p>
                        {edu.recognized === 'yes' && <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Recognized</span>}
                        {edu.recognized === 'no' && <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">Not recognized</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{edu.institutionName}{edu.schoolName ? ` · ${edu.schoolName}` : ''}{edu.departmentName ? ` · ${edu.departmentName}` : ''}{edu.specialization ? ` · ${edu.specialization}` : ''}</p>
                      {edu.dateAwarded && <p className="text-xs text-slate-400 mt-0.5">{new Date(edu.dateAwarded).getFullYear()}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditEdu(edu)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingEdu(edu)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>

      {/* Languages Section */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages size={18} className="text-indigo-600" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Languages</h2>
          </div>
          <Button size="sm" onClick={handleOpenCreateLang}><Plus size={14} />Add Language</Button>
        </div>
        <Card>
          {loadingLang ? <div className="p-6"><PageSpinner /></div>
            : languageList.length === 0 ? <EmptyState title="No language records" description="Add language certifications for this employee." />
            : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {languageList.map((lang) => (
                  <div key={lang.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{lang.language}{lang.level ? ` — ${lang.level}` : ''}</p>
                      {lang.degreeTitle && <p className="text-xs text-slate-500 dark:text-slate-400">{lang.degreeTitle}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditLang(lang)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingLang(lang)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>

      {/* Availability Modals */}
      <Modal open={!!availMode} onClose={() => setAvailMode(null)} title={isEditingAvail ? 'Edit Availability Period' : 'Add Availability Period'}>
        <form onSubmit={handleAvailSave} className="space-y-4">
          <DatePicker label="Start Date" value={availForm.startDate} onChange={(v) => setAvailForm(f => ({ ...f, startDate: v }))} required />
          <DatePicker label="End Date" value={availForm.endDate} onChange={(v) => setAvailForm(f => ({ ...f, endDate: v }))} hint="Leave empty if still working" />
          <Input label="Notes" value={availForm.notes} onChange={(e) => setAvailForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
          {availError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{availError}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAvailMode(null)}>Cancel</Button>
            <Button type="submit" loading={availSaving}>{isEditingAvail ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={!!deletingAvail} onClose={() => setDeletingAvail(null)} title="Delete Availability Period">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Delete period <span className="font-semibold">{deletingAvail ? formatDate(deletingAvail.startDate) : ''}</span>
          {deletingAvail?.endDate ? ` → ${formatDate(deletingAvail.endDate)}` : ' → Present'}?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingAvail(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteAvailability.isPending} onClick={handleAvailDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Education Modals */}
      <Modal open={!!eduMode} onClose={() => setEduMode(null)} title={isEditingEdu ? 'Edit Education' : 'Add Education'}>
        {(() => {
          const schoolsForInst = eduInstMode === 'list' && eduForm.institutionName
            ? Object.keys(INSTITUTION_HIERARCHY[eduForm.institutionName] ?? {})
            : [];
          const deptsForSchool = eduSchoolMode === 'list' && eduForm.institutionName && eduForm.schoolName
            ? INSTITUTION_HIERARCHY[eduForm.institutionName]?.[eduForm.schoolName] ?? []
            : [];
          return (
            <form onSubmit={handleEduSave} className="space-y-4">
              <Select label="Degree Type" options={degreeTypeOptions} value={eduForm.degreeType} onChange={(e) => setEduForm(f => ({ ...f, degreeType: e.target.value }))} />
              {/* Institution */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ίδρυμα <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-1 text-xs">
                    <button type="button" onClick={() => { setEduInstMode('text'); if (eduInstMode === 'list') setEduForm(f => ({ ...f, institutionName: '', schoolName: '', departmentName: '' })); setEduSchoolMode('text'); setEduDeptMode('text'); }}
                      className={`px-2 py-0.5 rounded transition-colors ${eduInstMode === 'text' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                      Ελεύθερο κείμενο
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button type="button" onClick={() => { setEduInstMode('list'); if (eduInstMode === 'text') setEduForm(f => ({ ...f, institutionName: '', schoolName: '', departmentName: '' })); setEduSchoolMode('text'); setEduDeptMode('text'); }}
                      className={`px-2 py-0.5 rounded transition-colors ${eduInstMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                      Από λίστα
                    </button>
                  </div>
                </div>
                {eduInstMode === 'text' ? (
                  <Input value={eduForm.institutionName} onChange={(e) => setEduForm(f => ({ ...f, institutionName: e.target.value }))} placeholder="πχ. Πανεπιστήμιο Αθηνών" required autoFocus />
                ) : (
                  <Select options={institutionOptions} value={eduForm.institutionName}
                    onChange={(e) => { setEduForm(f => ({ ...f, institutionName: e.target.value, schoolName: '', departmentName: '' })); setEduSchoolMode('text'); setEduDeptMode('text'); }} />
                )}
              </div>
              {/* School */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Σχολή</label>
                  {schoolsForInst.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <button type="button" onClick={() => { setEduSchoolMode('text'); if (eduSchoolMode === 'list') setEduForm(f => ({ ...f, schoolName: '', departmentName: '' })); setEduDeptMode('text'); }}
                        className={`px-2 py-0.5 rounded transition-colors ${eduSchoolMode === 'text' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        Ελεύθερο κείμενο
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button type="button" onClick={() => { setEduSchoolMode('list'); if (eduSchoolMode === 'text') setEduForm(f => ({ ...f, schoolName: '', departmentName: '' })); setEduDeptMode('text'); }}
                        className={`px-2 py-0.5 rounded transition-colors ${eduSchoolMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        Από λίστα
                      </button>
                    </div>
                  )}
                </div>
                {eduSchoolMode === 'list' && schoolsForInst.length > 0 ? (
                  <Select
                    options={[{ value: '', label: 'Επιλογή σχολής...' }, ...schoolsForInst.map(s => ({ value: s, label: s }))]}
                    value={eduForm.schoolName}
                    onChange={(e) => { setEduForm(f => ({ ...f, schoolName: e.target.value, departmentName: '' })); setEduDeptMode('text'); }}
                  />
                ) : (
                  <Input value={eduForm.schoolName} onChange={(e) => setEduForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="πχ. Πολυτεχνική Σχολή" />
                )}
              </div>
              {/* Department */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Τμήμα</label>
                  {deptsForSchool.length > 0 && (
                    <div className="flex items-center gap-1 text-xs">
                      <button type="button" onClick={() => { setEduDeptMode('text'); if (eduDeptMode === 'list') setEduForm(f => ({ ...f, departmentName: '' })); }}
                        className={`px-2 py-0.5 rounded transition-colors ${eduDeptMode === 'text' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        Ελεύθερο κείμενο
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <button type="button" onClick={() => { setEduDeptMode('list'); if (eduDeptMode === 'text') setEduForm(f => ({ ...f, departmentName: '' })); }}
                        className={`px-2 py-0.5 rounded transition-colors ${eduDeptMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                        Από λίστα
                      </button>
                    </div>
                  )}
                </div>
                {eduDeptMode === 'list' && deptsForSchool.length > 0 ? (
                  <Select
                    options={[{ value: '', label: 'Επιλογή τμήματος...' }, ...deptsForSchool.map(d => ({ value: d, label: d }))]}
                    value={eduForm.departmentName}
                    onChange={(e) => setEduForm(f => ({ ...f, departmentName: e.target.value }))}
                  />
                ) : (
                  <Input value={eduForm.departmentName} onChange={(e) => setEduForm(f => ({ ...f, departmentName: e.target.value }))} placeholder="πχ. Ηλεκτρολόγων Μηχανικών" />
                )}
              </div>
              <Input label="Degree Title" value={eduForm.degreeTitle} onChange={(e) => setEduForm(f => ({ ...f, degreeTitle: e.target.value }))} placeholder="πχ. Πολιτικός Μηχανικός" required />
              <Input label="Specialization" value={eduForm.specialization} onChange={(e) => setEduForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Computer Science" />
              <Input label="Date Awarded" type="date" value={eduForm.dateAwarded} onChange={(e) => setEduForm(f => ({ ...f, dateAwarded: e.target.value }))} />
              <Select label="Recognized" options={recognizedOptions} value={eduForm.recognized} onChange={(e) => setEduForm(f => ({ ...f, recognized: e.target.value }))} />
              {eduError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{eduError}</div>}
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setEduMode(null)}>Cancel</Button>
                <Button type="submit" loading={eduSaving}>{isEditingEdu ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          );
        })()}
      </Modal>
      <Modal open={!!deletingEdu} onClose={() => setDeletingEdu(null)} title="Delete Education Record">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Delete <span className="font-semibold">{deletingEdu?.degreeTitle}</span>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingEdu(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteEducation.isPending} onClick={handleEduDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Language Modals */}
      <Modal open={!!langMode} onClose={() => setLangMode(null)} title={isEditingLang ? 'Edit Language' : 'Add Language'}>
        <form onSubmit={handleLangSave} className="space-y-4">
          <Input label="Language" value={langForm.language} onChange={(e) => setLangForm(f => ({ ...f, language: e.target.value }))} placeholder="English" required autoFocus />
          <Input label="Degree Title / Certificate" value={langForm.degreeTitle} onChange={(e) => setLangForm(f => ({ ...f, degreeTitle: e.target.value }))} placeholder="University of Michigan" />
          <Input label="Level" value={langForm.level} onChange={(e) => setLangForm(f => ({ ...f, level: e.target.value }))} placeholder="C2 (Proficiency)" />
          {langError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{langError}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setLangMode(null)}>Cancel</Button>
            <Button type="submit" loading={langSaving}>{isEditingLang ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={!!deletingLang} onClose={() => setDeletingLang(null)} title="Delete Language Record">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Delete <span className="font-semibold">{deletingLang?.language}</span>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeletingLang(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteLanguage.isPending} onClick={handleLangDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
