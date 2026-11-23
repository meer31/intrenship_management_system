import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  FileText,
  Clock,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatsCard } from '../../components/common/StatsCard';
import { ExportButtons } from '../../components/common/ExportButtons';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { internshipService } from '../../services/internship.service';
import { applicationService } from '../../services/application.service';
import { reportService } from '../../services/report.service';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { Application, Department, Batch, Internship, CompletionReport } from '../../types';

export const AdminReports: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [reports, setReports] = useState<CompletionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      try {
        const [apps, depts, bts, ints, reps] = await Promise.all([
          applicationService.getAll(),
          departmentService.getAll(),
          batchService.getAll(),
          internshipService.getAll(),
          reportService.getAll(),
        ]);
        setApplications(apps);
        setDepartments(depts);
        setBatches(bts);
        setInternships(ints);
        setReports(reps);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchDept = !deptFilter || app.departmentId === deptFilter;
      const matchBatch = !batchFilter || app.batchId === batchFilter;
      const matchCompany = !companyFilter || app.companyName.toLowerCase().includes(companyFilter.toLowerCase());
      return matchDept && matchBatch && matchCompany;
    });
  }, [applications, deptFilter, batchFilter, companyFilter]);

  // Dynamic Metrics
  const totalCompleted = filteredApps.filter((a) => a.status === 'COMPLETED').length;
  const totalApproved = filteredApps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR').length;
  const totalPending = filteredApps.filter(
    (a) => a.status === 'FORWARDED_TO_DIRECTOR' || a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'APPLIED'
  ).length;

  const pendingReportsCount = reports.filter((r) => r.status === 'PENDING_REVIEW').length;
  const submittedReportsCount = reports.length;

  // Chart 1: Department Statistics
  const deptChartData = useMemo(() => {
    return departments.map((d) => {
      const dApps = filteredApps.filter((a) => a.departmentId === d.id);
      return {
        name: d.code,
        fullName: d.name,
        Total: dApps.length,
        Approved: dApps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length,
        Completed: dApps.filter((a) => a.status === 'COMPLETED').length,
      };
    });
  }, [departments, filteredApps]);

  // Chart 2: Company Distribution
  const companyChartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach((a) => {
      map[a.companyName] = (map[a.companyName] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredApps]);

  const PIE_COLORS = ['#142D4E', '#168F88', '#3D68A1', '#64C3BC', '#D69E36', '#8B5CF6'];

  // Export Columns definition
  const exportColumns = [
    { header: 'Student Name', key: 'studentName' as keyof Application },
    { header: 'Roll Number', key: 'rollNumber' as keyof Application },
    { header: 'Department', key: 'departmentName' as keyof Application },
    { header: 'Batch', key: 'batchName' as keyof Application },
    { header: 'Internship Title', key: 'internshipTitle' as keyof Application },
    { header: 'Company Name', key: 'companyName' as keyof Application },
    { header: 'Application Date', key: 'applicationDate' as keyof Application },
    { header: 'Current Status', key: 'status' as keyof Application },
    { header: 'Letter No.', key: (a: Application) => a.approvalLetterNumber || 'N/A' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Placement Analytics & Reports"
        description="Comprehensive audit data, departmental benchmarks, corporate recruitment metrics, and printable documentation."
        actions={
          <ExportButtons
            data={filteredApps}
            columns={exportColumns}
            fileNamePrefix="Institutional_Internship_Report"
            title="Institutional Internship Management Report"
          />
        }
      />

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Department Filter
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Academic Batch Filter
            </label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="">All Student Cohorts</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Company Filter
            </label>
            <input
              type="text"
              placeholder="e.g. Systems Limited, Arbisoft..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>
        </div>
      </Card>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatsCard
          title="Total Applications"
          value={filteredApps.length}
          icon={<FileText className="w-5 h-5" />}
          color="navy"
          subtitle={`${internships.length} corporate postings`}
        />
        <StatsCard
          title="Approved Nominations"
          value={totalApproved}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Letters endorsed"
        />
        <StatsCard
          title="Completed Internships"
          value={totalCompleted}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Degree credit earned"
        />
        <StatsCard
          title="Pending Evaluation"
          value={totalPending}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="In pipeline"
        />
        <StatsCard
          title="Completion Reports"
          value={submittedReportsCount}
          icon={<BarChart3 className="w-5 h-5" />}
          color="purple"
          subtitle={`${pendingReportsCount} pending grading`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department-wise Breakdown Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Departmental Placement Benchmarks
                </h3>
                <p className="text-xs text-text-secondary">
                  Applications vs Approved placements across faculties
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptChartData}>
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
                    <Bar dataKey="Total" name="Total Applications" fill="#142D4E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Approved" name="Approved Placements" fill="#168F88" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Completed" name="Completed Training" fill="#3D68A1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Company Distribution Pie Chart */}
        <div>
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-bold text-navy-900">Corporate Share</h3>
                <p className="text-xs text-text-secondary">Distribution by employer partner</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-72 w-full">
                {companyChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={companyChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                      >
                        {companyChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid #DCE4EC',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Tabular Data Breakdown */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Tabular Records Audit Log</h3>
            <p className="text-xs text-text-secondary">Filtered placement records ready for compliance export</p>
          </div>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Employer & Internship</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ref / Letter No.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-navy">{a.studentName}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">{a.rollNumber}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{a.departmentName}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{a.companyName}</p>
                    <p className="text-[11px] text-text-secondary">{a.internshipTitle}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-teal">{a.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {a.approvalLetterNumber || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
};
