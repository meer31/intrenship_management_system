import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  Briefcase,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  FileText,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { StatsCard } from '../../components/common/StatsCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { studentService } from '../../services/student.service';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { internshipService } from '../../services/internship.service';
import { applicationService } from '../../services/application.service';
import { reportService } from '../../services/report.service';
import { Application } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDepartments: 0,
    totalBatches: 0,
    totalInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    completedInternships: 0,
    pendingReports: 0,
  });

  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [departmentChartData, setDepartmentChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const [students, depts, batches, internships, applications, reports] = await Promise.all([
        studentService.getAll(),
        departmentService.getAll(),
        batchService.getAll(),
        internshipService.getAll(),
        applicationService.getAll(),
        reportService.getAll(),
      ]);

      const pendingApps = applications.filter(
        (a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'FORWARDED_TO_DIRECTOR' || a.status === 'APPLIED'
      ).length;
      const approvedApps = applications.filter((a) => a.status === 'APPROVED_BY_DIRECTOR').length;
      const rejectedApps = applications.filter(
        (a) => a.status === 'REJECTED_BY_FOCAL' || a.status === 'REJECTED_BY_DIRECTOR'
      ).length;
      const completedApps = applications.filter((a) => a.status === 'COMPLETED').length;
      const pendingReps = reports.filter((r) => r.status === 'PENDING_REVIEW').length;

      setStats({
        totalStudents: students.length,
        totalDepartments: depts.length,
        totalBatches: batches.length,
        totalInternships: internships.length,
        totalApplications: applications.length,
        pendingApplications: pendingApps,
        approvedApplications: approvedApps,
        rejectedApplications: rejectedApps,
        completedInternships: completedApps,
        pendingReports: pendingReps,
      });

      setRecentApplications(applications.slice(0, 5));

      // Build department stats
      const deptData = depts.map((d) => {
        const deptApps = applications.filter((a) => a.departmentId === d.id);
        return {
          name: d.code,
          fullName: d.name,
          applications: deptApps.length,
          placed: deptApps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length,
        };
      });
      setDepartmentChartData(deptData);
    };

    loadDashboardData();
  }, []);

  // Trend Chart Data (Monthly)
  const trendData = [
    { month: 'Jul', applications: 18, approved: 12 },
    { month: 'Aug', applications: 35, approved: 24 },
    { month: 'Sep', applications: 62, approved: 48 },
    { month: 'Oct', applications: 84, approved: 65 },
    { month: 'Nov', applications: 110, approved: 82 },
    { month: 'Dec', applications: 95, approved: 76 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorate Administration Overview"
        description="Institutional management metrics, active placement pipelines, and cross-departmental internship analytics."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/admin/students')}
              leftIcon={<PlusCircle className="w-4 h-4 text-teal" />}
            >
              Add Student
            </Button>
            <Button
              variant="teal"
              size="sm"
              onClick={() => navigate('/admin/internships')}
              leftIcon={<Briefcase className="w-4 h-4" />}
            >
              New Internship
            </Button>
          </div>
        }
      />

      {/* 10 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="w-5 h-5" />}
          color="navy"
          subtitle="Registered cohort"
        />
        <StatsCard
          title="Departments"
          value={stats.totalDepartments}
          icon={<Building2 className="w-5 h-5" />}
          color="teal"
          subtitle="Active faculties"
        />
        <StatsCard
          title="Active Batches"
          value={stats.totalBatches}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
          subtitle="Academic years"
        />
        <StatsCard
          title="Internships"
          value={stats.totalInternships}
          icon={<Briefcase className="w-5 h-5" />}
          color="navy"
          subtitle="Corporate slots"
        />
        <StatsCard
          title="Applications"
          value={stats.totalApplications}
          icon={<FileCheck2 className="w-5 h-5" />}
          color="purple"
          subtitle="Total submissions"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingApplications}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Focal & Director"
        />
        <StatsCard
          title="Approved"
          value={stats.approvedApplications}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
          subtitle="Letter issued"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejectedApplications}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
          subtitle="Criteria not met"
        />
        <StatsCard
          title="Completed"
          value={stats.completedInternships}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Verified training"
        />
        <StatsCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={<FileText className="w-5 h-5" />}
          color="amber"
          subtitle="Awaiting review"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application & Approval Trend Chart */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Internship Application Trend</h3>
              <p className="text-xs text-text-secondary">Monthly submission vs approval volume</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal font-semibold">
              <TrendingUp className="w-4 h-4" />
              <span>+28% this cycle</span>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#142D4E" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#142D4E" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#168F88" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#168F88" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #DCE4EC',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#142D4E"
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    name="Approved Placements"
                    stroke="#168F88"
                    fillOpacity={1}
                    fill="url(#colorApproved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Department-wise Placement Comparison */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Department-wise Applications & Placements</h3>
              <p className="text-xs text-text-secondary">Performance comparison by academic division</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/reports')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          </CardHeader>
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #DCE4EC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="applications" name="Applications" fill="#142D4E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" name="Approved Placements" fill="#168F88" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Applications Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-bold text-navy-900">Recent Internship Applications</h3>
                <p className="text-xs text-text-secondary">Latest submissions awaiting focal or director review</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/applications')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Internship</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-navy">{app.studentName}</p>
                        <p className="text-[11px] text-text-secondary font-mono">{app.rollNumber}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700">{app.departmentName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 truncate max-w-[160px]">{app.internshipTitle}</p>
                        <p className="text-[11px] text-text-secondary">{app.companyName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={app.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/admin/applications')}
                          className="text-teal hover:text-teal-700"
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Operations Panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
              Institutional Quick Links
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/admin/focal-persons')}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-teal hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-navy">Focal Persons Directory</p>
                  <p className="text-[11px] text-text-secondary">Assign & monitor department leads</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/report-repository')}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-teal hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-navy">Submitted Final Reports</p>
                  <p className="text-[11px] text-text-secondary">Grade & verify student training</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/batches')}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-teal hover:bg-teal-50/40 transition-all flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-semibold text-navy">Batch Eligibility Setup</p>
                  <p className="text-[11px] text-text-secondary">Graduating vs Junior cohorts</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-navy to-navy-950 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-teal" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Industry Liaison Note
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official approval letters automatically generate encrypted verification keys upon Director confirmation. Downloadable for all enrolled partner companies.
            </p>
            <div className="mt-4">
              <Button
                variant="teal"
                size="sm"
                className="w-full"
                onClick={() => navigate('/admin/applications')}
              >
                Process Pending Approvals
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
