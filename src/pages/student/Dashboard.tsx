import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  Award,
  FileText,
  Bell,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatsCard } from '../../components/common/StatsCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { internshipService } from '../../services/internship.service';
import { applicationService } from '../../services/application.service';
import { reportService } from '../../services/report.service';
import { notificationService } from '../../services/notification.service';
import { Application, Internship, Notification } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [availableCount, setAvailableCount] = useState(0);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [latestInternships, setLatestInternships] = useState<Internship[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user) return;
      const [allInts, apps, reports, notifs] = await Promise.all([
        internshipService.getPublished(),
        applicationService.getByStudentId(user.id),
        reportService.getByStudentId(user.id),
        notificationService.getForUser(user.id),
      ]);

      // Filter available internships for student's department if present
      const eligible = allInts.filter(
        (i) => !user.departmentId || i.eligibleDepartmentIds.includes(user.departmentId)
      );

      setAvailableCount(eligible.length);
      setLatestInternships(eligible.slice(0, 3));
      setMyApplications(apps);
      setNotifications(notifs.slice(0, 3));

      // Calculate pending reports (approved apps that don't have an approved report)
      const approvedApps = apps.filter((a) => a.status === 'APPROVED_BY_DIRECTOR');
      const approvedRepAppIds = reports.filter((r) => r.status === 'APPROVED').map((r) => r.applicationId);
      const pendingReps = approvedApps.filter((a) => !approvedRepAppIds.includes(a.id)).length;
      setPendingReportsCount(pendingReps);
    };

    loadStudentData();
  }, [user]);

  const approvedAppsCount = myApplications.filter(
    (a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED'
  ).length;
  const pendingAppsCount = myApplications.filter(
    (a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'FORWARDED_TO_DIRECTOR' || a.status === 'APPLIED'
  ).length;
  const rejectedAppsCount = myApplications.filter(
    (a) => a.status === 'REJECTED_BY_FOCAL' || a.status === 'REJECTED_BY_DIRECTOR'
  ).length;
  const completedCount = myApplications.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-navy-900 rounded-card p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal/10 -skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Session 2026 • Career Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Roll No: <span className="font-mono text-teal-300 font-semibold">{user?.rollNumber || '2021-CS-104'}</span> • {user?.departmentName || 'Computer Science'} ({user?.batchName || 'Fall 2021'})
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              variant="teal"
              size="sm"
              onClick={() => navigate('/student/internships')}
              leftIcon={<Briefcase className="w-4 h-4" />}
            >
              Explore Opportunities
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/student/applications')}
            >
              My Applications
            </Button>
          </div>
        </div>
      </div>

      {/* 7 Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <StatsCard
          title="Available"
          value={availableCount}
          icon={<Briefcase className="w-4 h-4" />}
          color="teal"
          subtitle="Open for you"
        />
        <StatsCard
          title="Applications"
          value={myApplications.length}
          icon={<FileText className="w-4 h-4" />}
          color="navy"
          subtitle="Submitted"
        />
        <StatsCard
          title="Approved"
          value={approvedAppsCount}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="teal"
          subtitle="Nominated"
        />
        <StatsCard
          title="Pending"
          value={pendingAppsCount}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          subtitle="In review"
        />
        <StatsCard
          title="Rejected"
          value={rejectedAppsCount}
          icon={<XCircle className="w-4 h-4" />}
          color="red"
          subtitle="Not selected"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={<Award className="w-4 h-4" />}
          color="teal"
          subtitle="Finished"
        />
        <StatsCard
          title="Reports Due"
          value={pendingReportsCount}
          icon={<FileText className="w-4 h-4" />}
          color="amber"
          subtitle="Pending report"
        />
      </div>

      {/* Application Status Timeline / Stepper */}
      <Card className="p-5">
        <h3 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">
          Institutional Placement Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white text-[10px] font-bold">1</span>
              <span className="font-bold text-xs text-navy">Submit Application</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Select eligible corporate opening, submit statement of purpose & CV.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold">2</span>
              <span className="font-bold text-xs text-navy">Focal Review</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Department Focal Person verifies your academic standing & prerequisite labs.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-white text-[10px] font-bold">3</span>
              <span className="font-bold text-xs text-navy">Director Approval</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Director confirms placement quota and issues your official signed Letter.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-700 text-white text-[10px] font-bold">4</span>
              <span className="font-bold text-xs text-navy">Final Report</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-snug">
              Submit your verified completion report to earn institutional degree credits.
            </p>
          </div>
        </div>
      </Card>

      {/* Split Section: My Recent Applications & Latest Openings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Applications Card */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-navy-900">My Recent Applications</h3>
              <p className="text-xs text-text-secondary">Track live review status and official decisions</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/applications')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {myApplications.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-secondary">
                You have not submitted any internship applications yet.
              </div>
            ) : (
              myApplications.map((app) => (
                <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-navy text-xs">{app.internshipTitle}</h4>
                    <p className="text-teal font-semibold text-[11px]">{app.companyName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Applied on {app.applicationDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={app.status} size="sm" />
                    {app.status === 'APPROVED_BY_DIRECTOR' && (
                      <button
                        type="button"
                        onClick={() => navigate('/student/approval-letters')}
                        className="text-[10px] text-teal font-bold block mt-1 hover:underline"
                      >
                        Download Letter →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Latest Opportunities Card */}
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-sm font-bold text-navy-900">Featured Openings</h3>
              <p className="text-xs text-text-secondary">Internship quotas open for your department</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/internships')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Browse All
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {latestInternships.map((int) => (
              <div key={int.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0">
                    <img src={int.companyLogo} alt={int.companyName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-xs line-clamp-1">{int.title}</h4>
                    <p className="text-teal font-semibold text-[11px]">{int.companyName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Deadline: {int.applicationDeadline} • {int.type}</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/student/internships/${int.id}`)}
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Notifications preview if any */}
      {notifications.length > 0 && (
        <Card className="p-4 bg-slate-50 border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-teal" />
              Latest System Notifications
            </span>
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-xs text-teal font-medium hover:underline"
            >
              View all ({notifications.length})
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {notifications.map((n) => (
              <div key={n.id} className="p-2.5 rounded-lg bg-white border border-border">
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="text-text-secondary text-[11px] mt-0.5 line-clamp-1">{n.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
