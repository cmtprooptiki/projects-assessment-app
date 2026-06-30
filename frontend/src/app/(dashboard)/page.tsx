import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ProjectsByStatusChart from '@/components/dashboard/ProjectsByStatusChart';
import EmployeesByDepartmentChart from '@/components/dashboard/EmployeesByDepartmentChart';
import InternalExternalChart from '@/components/dashboard/InternalExternalChart';
import RecentParticipations from '@/components/dashboard/RecentParticipations';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <SummaryCards />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectsByStatusChart />
        <EmployeesByDepartmentChart />
        <InternalExternalChart />
      </div>
      <RecentParticipations />
    </div>
  );
}
