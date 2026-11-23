import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  FileText,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatsCard } from '../../components/common/StatsCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/student.service';
import { applicationService } from '../../services/application.service';
import { internshipService } from '../../services/internship.service';
import { reportService } from '../../services/report.service';
import { Application, Internship } from '../../types';

export const FocalPersonDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalApplications: 0,
    pendingNominations: 0,
    approvedNominations: 0,
    rejectedNominations: 0,
    completedInternships: 0,
    pendingReports: 0,
    submittedReports: 0,
  });

  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [activeInternships, setActiveInternships] = useState<Internship[]>([]);

  useEffect(() => {
    const loadFocalData = async () => {
      const [students, applications, allInternships, reports] = await Promise.all([
        studentService.getByDepartment(deptId),
        applicationService.getByDepartmentId(deptId),
        internshipService.getForDepartment(deptId),
        reportService.getByDepartmentId(deptId),
      ]);

      const pending = applications.filter(
        (a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'APPLIED'
      ).length;

      const approved = applications.filter(
        (a) => a.status === 'FORWARDED_TO_DIRECTOR' || a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED'
      ).length;

      const rejected = applications.filter(
        (a) => a.status === 'REJECTED_BY_FOCAL' || a.status === 'REJECTED_BY_DIRECTOR'
      ).length;

      const completed = applications.filter((a) => a.status === 'COMPLETED').length;
      const pendingReps = reports.filter((r) => r.status === 'PENDING_REVIEW').length;

      setStats({
        totalStudents: students.length,
        totalApplications: applications.length,
        pendingNominations: pending,
        approvedNominations: approved,
        rejectedNominations: rejected,
        completedInternships: completed,
        pendingReports: pendingReps,
        submittedReports: reports.length,
      });

      setRecentApplications(applications.slice(0, 5));
      setActiveInternships(allInternships.slice(0, 3));
    };

    loadFocalData();
  }, [deptId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Focal Person Portal — ${deptName}`}
        description="Monitor student eligibility, review nomination applications, and endorse candidates for Director placement."
        badge={
          <span className="bg-teal-50 text-teal-800 text-xs px-2.5 py-1 rounded-full font-bold border border-teal-200">
            {deptName}
          </span>
        }
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/focal-person/nominations')}
            leftIcon={<FileCheck2 className="w-4 h-4" />}
          >
            Review Pending Requests ({stats.pendingNominations})
          </Button>
        }
      />

      {/* 8 Department Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <StatsCard
          title="Department Students"
          value={stats.totalStudents}
          icon={<Users className="w-5 h-5" />}
          color="navy"
          subtitle="Enrolled cohort"
        />
        <StatsCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          subtitle="Submitted by students"
        />
        <StatsCard
          title="Pending Nominations"
          value={stats.pendingNominations}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Awaiting your review"
        />
        <StatsCard
          title="Endorsed / Approved"
          value={stats.approvedNominations}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="teal"
          subtitle="Forwarded / Approved"
        />
        <StatsCard
          title="Rejected Nominations"
          value={stats.rejectedNominations}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
          subtitle="Did not meet criteria"
        />
        <StatsCard
          title="Completed Internships"
          value={stats.completedInternships}
          icon={<Award className="w-5 h-5" />}
          color="teal"
          subtitle="Credits verified"
        />
        <StatsCard
          title="Submitted Reports"
          value={stats.submittedReports}
          icon={<FileText className="w-5 h-5" />}
          color="purple"
          subtitle="Total uploaded"
        />
        <StatsCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Awaiting evaluation"
        />
      </div>

      {/* Main Content: Pending Applications & Active Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Applications Review Queue */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Department Student Applications
                </h3>
                <p className="text-xs text-text-secondary">
                  Recent nominations submitted by {deptName} students
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/focal-person/nominations')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review Queue
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Target Internship</th>
                    <th className="py-3 px-4">Applied Date</th>
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
                        <p className="font-medium text-slate-900">{app.internshipTitle}</p>
                        <p className="text-[11px] text-teal font-semibold">{app.companyName}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.applicationDate}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={app.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/focal-person/nominations')}
                          className="text-teal hover:text-teal-700 font-semibold"
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

        {/* Available Internships for this Department */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider">
                Available Department Slots
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/focal-person/internships')}
                className="text-xs p-0 text-teal"
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {activeInternships.map((int) => (
                <div
                  key={int.id}
                  className="p-3 rounded-lg border border-border bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-navy text-xs line-clamp-1">{int.title}</h5>
                      <p className="text-teal font-semibold text-[11px]">{int.companyName}</p>
                    </div>
                    <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                      {int.totalSlots} Slots
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                    <span>Deadline: {int.applicationDeadline}</span>
                    <span className="text-navy font-semibold">{int.type}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-teal-50/60 border border-teal-200">
            <div className="flex items-center gap-2 mb-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-teal" />
              <span>Focal Endorsement Policy</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              When you approve a student's nomination, their profile is forwarded immediately to the Director with your endorsement. Once approved by the Director, the official institutional recommendation letter is generated.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
