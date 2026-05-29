'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Pencil, Trash2, GraduationCap, Languages } from 'lucide-react';
import { PageSpinner } from '@/components/ui/Spinner';
import EmployeeForm from '@/components/employees/EmployeeForm';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import { useEducation, useCreateEducation, useUpdateEducation, useDeleteEducation } from '@/hooks/useEducation';
import { useLanguages, useCreateLanguage, useUpdateLanguage, useDeleteLanguage } from '@/hooks/useLanguages';
import type { Education, Language } from '@/types';

const emptyEdu = { institutionName: '', degreeTitle: '', specialization: '', dateAwarded: '', recognized: '' };

const recognizedOptions = [
  { value: '', label: '—' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];
const emptyLang = { language: '', degreeTitle: '', level: '' };

type EduMode = null | 'create' | { edit: Education };
type LangMode = null | 'create' | { edit: Language };

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

  const isEditingEdu = eduMode && typeof eduMode === 'object';
  const isEditingLang = langMode && typeof langMode === 'object';

  // Education handlers
  const handleOpenCreateEdu = () => { setEduForm(emptyEdu); setEduError(''); setEduMode('create'); };
  const handleOpenEditEdu = (edu: Education) => {
    setEduForm({ institutionName: edu.institutionName, degreeTitle: edu.degreeTitle, specialization: edu.specialization ?? '', dateAwarded: edu.dateAwarded ? edu.dateAwarded.slice(0, 10) : '', recognized: edu.recognized ?? '' });
    setEduError(''); setEduMode({ edit: edu });
  };
  const handleEduSave = async (e: React.FormEvent) => {
    e.preventDefault(); setEduError(''); setEduSaving(true);
    try {
      const payload = { institutionName: eduForm.institutionName, degreeTitle: eduForm.degreeTitle, specialization: eduForm.specialization || undefined, dateAwarded: eduForm.dateAwarded || undefined, recognized: (eduForm.recognized as 'yes' | 'no' | '') || undefined };
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

  if (isLoading) return <PageSpinner />;

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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{edu.degreeTitle}</p>
                        {edu.recognized === 'yes' && <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Recognized</span>}
                        {edu.recognized === 'no' && <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">Not recognized</span>}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{edu.institutionName}{edu.specialization ? ` · ${edu.specialization}` : ''}</p>
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

      {/* Education Modals */}
      <Modal open={!!eduMode} onClose={() => setEduMode(null)} title={isEditingEdu ? 'Edit Education' : 'Add Education'}>
        <form onSubmit={handleEduSave} className="space-y-4">
          <Input label="Institution Name" value={eduForm.institutionName} onChange={(e) => setEduForm(f => ({ ...f, institutionName: e.target.value }))} placeholder="University of Athens" required autoFocus />
          <Input label="Degree Title" value={eduForm.degreeTitle} onChange={(e) => setEduForm(f => ({ ...f, degreeTitle: e.target.value }))} placeholder="Bachelor of Science" required />
          <Input label="Specialization" value={eduForm.specialization} onChange={(e) => setEduForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Computer Science" />
          <Input label="Date Awarded" type="date" value={eduForm.dateAwarded} onChange={(e) => setEduForm(f => ({ ...f, dateAwarded: e.target.value }))} />
          <Select label="Recognized" options={recognizedOptions} value={eduForm.recognized} onChange={(e) => setEduForm(f => ({ ...f, recognized: e.target.value }))} />
          {eduError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{eduError}</div>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setEduMode(null)}>Cancel</Button>
            <Button type="submit" loading={eduSaving}>{isEditingEdu ? 'Update' : 'Add'}</Button>
          </div>
        </form>
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
