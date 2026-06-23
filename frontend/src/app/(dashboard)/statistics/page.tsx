'use client';

import { useState } from 'react';
import { BarChart2, Users, Briefcase, Building2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useEmployees } from '@/hooks/useEmployees';
import { useClients } from '@/hooks/useClients';
import ProjectStatsView from '@/components/statistics/ProjectStatsView';
import EmployeeStatsView from '@/components/statistics/EmployeeStatsView';
import ClientStatsView from '@/components/statistics/ClientStatsView';
import Select from '@/components/ui/Select';

type Tab = 'project' | 'employee' | 'client';

const tabs: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'project', label: 'By Project', icon: Briefcase },
  { id: 'employee', label: 'By Employee', icon: Users },
  { id: 'client', label: 'By Client', icon: Building2 },
];

export default function StatisticsPage() {
  const [tab, setTab] = useState<Tab>('project');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: projectsData } = useProjects({ limit: 999 });
  const { data: employeesData } = useEmployees({ limit: 999 });
  const { data: clientsData } = useClients({ limit: 999 });

  const projects = projectsData?.data ?? [];
  const employees = employeesData?.data ?? [];
  const clients = clientsData?.data ?? [];

  const EmptyPrompt = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{text}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-200">
          <BarChart2 size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Statistics</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">Detailed analytics by project, employee, or client</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'project' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Select Project</span>
            <div className="w-72">
              <Select
                placeholder="— Choose a project —"
                value={selectedProjectId ?? ''}
                options={projects.map((p) => ({ value: p.id, label: `${p.projectCode} – ${p.name}` }))}
                onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value, 10) : null)}
              />
            </div>
          </div>
          {selectedProjectId
            ? <ProjectStatsView projectId={selectedProjectId} />
            : <EmptyPrompt icon={Briefcase} text="Select a project to view its statistics" />}
        </div>
      )}

      {tab === 'employee' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Select Employee</span>
            <div className="w-72">
              <Select
                placeholder="— Choose an employee —"
                value={selectedEmployeeId ?? ''}
                options={employees.map((e) => ({ value: e.id, label: `${e.firstName} ${e.lastName} — ${e.department}` }))}
                onChange={(e) => setSelectedEmployeeId(e.target.value ? parseInt(e.target.value, 10) : null)}
              />
            </div>
          </div>
          {selectedEmployeeId
            ? <EmployeeStatsView employeeId={selectedEmployeeId} />
            : <EmptyPrompt icon={Users} text="Select an employee to view their statistics" />}
        </div>
      )}

      {tab === 'client' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">Select Client</span>
            <div className="w-72">
              <Select
                placeholder="— Choose a client —"
                value={selectedClientId ?? ''}
                options={clients.map((c) => ({ value: c.id, label: c.name + (c.industry ? ` — ${c.industry}` : '') }))}
                onChange={(e) => setSelectedClientId(e.target.value ? parseInt(e.target.value, 10) : null)}
              />
            </div>
          </div>
          {selectedClientId
            ? <ClientStatsView clientId={selectedClientId} />
            : <EmptyPrompt icon={Building2} text="Select a client to view their statistics" />}
        </div>
      )}
    </div>
  );
}
