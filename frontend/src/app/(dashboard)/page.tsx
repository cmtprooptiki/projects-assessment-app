import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ProjectsByStatusChart from '@/components/dashboard/ProjectsByStatusChart';
import EmployeesByDepartmentChart from '@/components/dashboard/EmployeesByDepartmentChart';
import RecentParticipations from '@/components/dashboard/RecentParticipations';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectsByStatusChart />
        <EmployeesByDepartmentChart />
      </div>
      <RecentParticipations />
    </div>
  );
}
