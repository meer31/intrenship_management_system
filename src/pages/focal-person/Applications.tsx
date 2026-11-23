import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { applicationService } from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';
import { toast } from 'sonner';

export const FocalPersonApplications: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('PENDING');

  // Review Modals
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewAction, setReviewAction] = useState<'FORWARD' | 'REJECT'>('FORWARD');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await applicationService.getByDepartmentId(deptId);
      setApplications(data);
    } catch {
      toast.error('Failed to load nomination requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptId]);

  const counts = useMemo(() => {
    return {
      pending: applications.filter(
        (a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'APPLIED'
      ).length,
      forwarded: applications.filter((a) => a.status === 'FORWARDED_TO_DIRECTOR').length,
      approved: applications.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED_BY_FOCAL').length,
      all: applications.length,
    };
  }, [applications]);

  const tabs = [
    { id: 'PENDING', label: 'Pending Endorsement', count: counts.pending },
    { id: 'FORWARDED', label: 'Forwarded to Director', count: counts.forwarded },
    { id: 'APPROVED', label: 'Director Approved', count: counts.approved },
    { id: 'REJECTED', label: 'Rejected by Focal', count: counts.rejected },
    { id: 'ALL', label: 'All Submissions', count: counts.all },
  ];

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'PENDING') {
        matchesTab = app.status === 'PENDING_FOCAL_REVIEW' || app.status === 'APPLIED';
      } else if (activeTab === 'FORWARDED') {
        matchesTab = app.status === 'FORWARDED_TO_DIRECTOR';
      } else if (activeTab === 'APPROVED') {
        matchesTab = app.status === 'APPROVED_BY_DIRECTOR' || app.status === 'COMPLETED';
      } else if (activeTab === 'REJECTED') {
        matchesTab = app.status === 'REJECTED_BY_FOCAL';
      }

      return matchesSearch && matchesTab;
    });
  }, [applications, searchQuery, activeTab]);

  const openReviewModal = (app: Application, action: 'FORWARD' | 'REJECT') => {
    setReviewingApp(app);
    setReviewAction(action);
    setRemarks(
      action === 'FORWARD'
        ? 'Verified academic standing, prerequisite coursework completion, and departmental clearance. Endorsed for Director approval.'
        : 'Candidate does not fulfill minimum departmental requirements or course prerequisites for this position.'
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp || !user) return;

    setIsSubmitting(true);
    try {
      await applicationService.focalPersonReview(
        reviewingApp.id,
        reviewAction,
        remarks,
        user
      );

      toast.success(
        reviewAction === 'FORWARD'
          ? `Nomination endorsed and forwarded to Director for ${reviewingApp.studentName}`
          : `Application rejected for ${reviewingApp.studentName}`
      );

      setReviewingApp(null);
      loadData();
    } catch {
      toast.error('Failed to submit focal review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Student Nomination Requests — ${deptName}`}
        description="Verify departmental academic criteria, review student dossiers, and endorse candidates for final Director placement."
      />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search nominations by student name, roll number, or employer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            title="No nomination requests"
            description="No student applications in this status filter for your department."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Target Internship & Company</th>
                  <th className="py-3 px-4">Cohort / Batch</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{app.studentName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {app.rollNumber}
                        </span>
                        <span className="text-[11px] font-semibold text-teal">
                          CGPA: {app.cgpa.toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{app.internshipTitle}</p>
                      <p className="text-[11px] font-bold text-teal">{app.companyName}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {app.batchName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {app.applicationDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={app.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingApp(app)}
                          title="View Application Dossier"
                          className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {(app.status === 'PENDING_FOCAL_REVIEW' || app.status === 'APPLIED') && (
                          <>
                            <button
                              type="button"
                              onClick={() => openReviewModal(app, 'FORWARD')}
                              title="Endorse & Forward to Director"
                              className="px-2.5 py-1 bg-teal-50 text-teal hover:bg-teal-100 rounded font-semibold text-[11px] flex items-center gap-1 border border-teal-200"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Endorse</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openReviewModal(app, 'REJECT')}
                              title="Reject Nomination"
                              className="px-2.5 py-1 bg-red-50 text-danger hover:bg-red-100 rounded font-semibold text-[11px] flex items-center gap-1 border border-red-200"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Dossier Modal */}
      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title="Candidate Nomination Dossier"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingApp.studentName}</h3>
                <p className="text-text-secondary font-mono">{viewingApp.rollNumber} • {viewingApp.departmentName}</p>
              </div>
              <Badge status={viewingApp.status} size="md" />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <span className="text-slate-400 font-medium">Applied Position:</span>
              <p className="font-bold text-navy text-sm mt-0.5">{viewingApp.internshipTitle}</p>
              <p className="text-teal font-semibold">{viewingApp.companyName}</p>
            </div>

            {viewingApp.statementOfPurpose && (
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="font-bold text-navy uppercase tracking-wider block mb-1">
                  Statement of Purpose
                </span>
                <p className="text-slate-700 leading-relaxed">{viewingApp.statementOfPurpose}</p>
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                <span className="font-medium text-slate-800">{viewingApp.resumeFileName || 'Resume.pdf'}</span>
              </div>
              <span className="text-[11px] text-teal font-semibold">Student Attachment</span>
            </div>

            {/* Audit Milestones */}
            {viewingApp.reviewHistory.length > 0 && (
              <div>
                <span className="font-bold text-navy uppercase tracking-wider block mb-1.5">
                  Review Audit Trail
                </span>
                <div className="space-y-1.5">
                  {viewingApp.reviewHistory.map((rev, i) => (
                    <div key={i} className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{rev.reviewerName} ({rev.reviewerRole})</span>
                        <span className="text-[10px] text-slate-400">{rev.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              {(viewingApp.status === 'PENDING_FOCAL_REVIEW' || viewingApp.status === 'APPLIED') && (
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => {
                    setViewingApp(null);
                    openReviewModal(viewingApp, 'FORWARD');
                  }}
                >
                  Endorse Application
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setViewingApp(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Endorse / Reject Decision Modal */}
      {reviewingApp && (
        <Modal
          isOpen={!!reviewingApp}
          onClose={() => setReviewingApp(null)}
          title={reviewAction === 'FORWARD' ? 'Endorse & Forward to Director' : 'Reject Nomination Request'}
          maxWidth="md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs">
              <p className="text-slate-500 font-medium">Student Candidate:</p>
              <p className="font-bold text-navy text-sm">{reviewingApp.studentName} ({reviewingApp.rollNumber})</p>
              <p className="text-slate-700 mt-1">
                Applying for <strong className="text-teal">{reviewingApp.internshipTitle}</strong> at <strong>{reviewingApp.companyName}</strong>
              </p>
            </div>

            <Textarea
              label={reviewAction === 'FORWARD' ? 'Focal Person Recommendation Notes' : 'Rejection Reason / Deficiencies *'}
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setReviewingApp(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewAction === 'FORWARD' ? 'teal' : 'danger'}
                isLoading={isSubmitting}
              >
                {reviewAction === 'FORWARD' ? 'Forward to Director' : 'Confirm Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
