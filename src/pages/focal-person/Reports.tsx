import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatsCard } from '../../components/common/StatsCard';
import { ExportButtons } from '../../components/common/ExportButtons';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/application.service';
import { batchService } from '../../services/batch.service';
import { reportService } from '../../services/report.service';
import { Application, Batch, CompletionReport } from '../../types';

export const FocalPersonReports: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [applications, setApplications] = useState<Application[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [reports, setReports] = useState<CompletionReport[]>([]);
  const [batchFilter, setBatchFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [apps, bts, reps] = await Promise.all([
          applicationService.getByDepartmentId(deptId),
          batchService.getAll(),
          reportService.getByDepartmentId(deptId),
        ]);
        setApplications(apps);
        setBatches(bts);
        setReports(reps);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [deptId]);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => !batchFilter || app.batchId === batchFilter);
  }, [applications, batchFilter]);

  const totalCompleted = filteredApps.filter((a) => a.status === 'COMPLETED').length;
  const totalApproved = filteredApps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length;
  const totalPending = filteredApps.filter(
    (a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'FORWARDED_TO_DIRECTOR'
  ).length;

  // Batch breakdown chart data for this department
  const batchChartData = useMemo(() => {
    return batches.map((b) => {
      const bApps = applications.filter((a) => a.batchId === b.id);
      return {
        name: b.name.split(' ')[0] + ' ' + b.name.split(' ')[1],
        Submissions: bApps.length,
        Approved: bApps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length,
        Completed: bApps.filter((a) => a.status === 'COMPLETED').length,
      };
    });
  }, [batches, applications]);

  const exportColumns = [
    { header: 'Student Name', key: 'studentName' as keyof Application },
    { header: 'Roll Number', key: 'rollNumber' as keyof Application },
    { header: 'Academic Batch', key: 'batchName' as keyof Application },
    { header: 'Target Internship', key: 'internshipTitle' as keyof Application },
    { header: 'Employer', key: 'companyName' as keyof Application },
    { header: 'Application Date', key: 'applicationDate' as keyof Application },
    { header: 'Status', key: 'status' as keyof Application },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Internship Analytics — ${deptName}`}
        description={`Placement KPIs, completion reports, and student cohort statistics exclusively for the Department of ${deptName}.`}
        actions={
          <ExportButtons
            data={filteredApps}
            columns={exportColumns}
            fileNamePrefix={`${deptName.replace(/\s+/g, '_')}_Internship_Report`}
            title={`Department of ${deptName} — Internship Placement Report`}
          />
        }
      />

      {/* Cohort Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Filter by Cohort:
          </label>
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="py-1.5 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            <option value="">All Department Cohorts</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          title="Total Department Applications"
          value={filteredApps.length}
          icon={<FileText className="w-5 h-5" />}
          color="navy"
          subtitle={`${totalPending} awaiting review`}
        />
        <StatsCard
          title="Approved Nominations"
          value={totalApproved}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Letters endorsed"
        />
        <StatsCard
          title="Completed Training"
          value={totalCompleted}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Credits cleared"
        />
        <StatsCard
          title="Submitted Reports"
          value={reports.length}
          icon={<FileText className="w-5 h-5" />}
          color="purple"
          subtitle="Archived in repository"
        />
      </div>

      {/* Cohort Placement Chart */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-sm font-bold text-navy-900">
              {deptName} Cohort Performance
            </h3>
            <p className="text-xs text-text-secondary">
              Applications vs approved placements across student batches
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchChartData}>
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
                <Bar dataKey="Submissions" name="Applications" fill="#142D4E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Approved" name="Approved Placements" fill="#168F88" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" name="Completed Training" fill="#3D68A1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
