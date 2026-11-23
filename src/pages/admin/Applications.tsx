import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  FileSignature,
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
import { PdfLetterPreviewModal } from '../../components/common/PdfLetterPreviewModal';
import { applicationService } from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';
import { toast } from 'sonner';

export const AdminApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  // Modals
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [reviewingApp, setReviewingApp] = useState<Application | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [directorRemarks, setDirectorRemarks] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Letter Preview
  const [letterModalApp, setLetterModalApp] = useState<Application | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await applicationService.getAll();
      setApplications(data);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      forwarded: applications.filter((a) => a.status === 'FORWARDED_TO_DIRECTOR').length,
      pendingFocal: applications.filter((a) => a.status === 'PENDING_FOCAL_REVIEW' || a.status === 'APPLIED').length,
      approved: applications.filter((a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED').length,
      rejected: applications.filter((a) => a.status === 'REJECTED_BY_DIRECTOR' || a.status === 'REJECTED_BY_FOCAL').length,
    };
  }, [applications]);

  const tabs = [
    { id: 'ALL', label: 'All Submissions', count: counts.all },
    { id: 'FORWARDED_TO_DIRECTOR', label: 'Awaiting Director Decision', count: counts.forwarded },
    { id: 'PENDING_FOCAL', label: 'Focal Review Pending', count: counts.pendingFocal },
    { id: 'APPROVED', label: 'Officially Approved', count: counts.approved },
    { id: 'REJECTED', label: 'Rejected', count: counts.rejected },
  ];

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'FORWARDED_TO_DIRECTOR') {
        matchesTab = app.status === 'FORWARDED_TO_DIRECTOR';
      } else if (activeTab === 'PENDING_FOCAL') {
        matchesTab = app.status === 'PENDING_FOCAL_REVIEW' || app.status === 'APPLIED';
      } else if (activeTab === 'APPROVED') {
        matchesTab = app.status === 'APPROVED_BY_DIRECTOR' || app.status === 'COMPLETED';
      } else if (activeTab === 'REJECTED') {
        matchesTab = app.status === 'REJECTED_BY_DIRECTOR' || app.status === 'REJECTED_BY_FOCAL';
      }

      return matchesSearch && matchesTab;
    });
  }, [applications, searchQuery, activeTab]);

  const openDecisionModal = (app: Application, action: 'APPROVE' | 'REJECT') => {
    setReviewingApp(app);
    setReviewAction(action);
    setDirectorRemarks(
      action === 'APPROVE'
        ? 'Application verified by Directorate of Industrial Liaison. Formal endorsement letter granted.'
        : 'Application could not be approved due to quota limitations or academic eligibility constraints.'
    );
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp || !user) return;

    setIsSubmittingDecision(true);
    try {
      const updated = await applicationService.directorReview(
        reviewingApp.id,
        reviewAction,
        directorRemarks,
        user
      );

      toast.success(
        reviewAction === 'APPROVE'
          ? `Application approved. Official Letter #${updated.approvalLetterNumber} issued!`
          : `Application for ${reviewingApp.studentName} marked as rejected.`
      );

      setReviewingApp(null);
      loadData();

      if (reviewAction === 'APPROVE') {
        setLetterModalApp(updated);
      }
    } catch {
      toast.error('Failed to submit director decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Application Review"
        description="Evaluate student internship nominations forwarded by Department Focal Persons and make final institutional placement decisions."
      />

      {/* Filter Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, company, or internship title..."
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
            title="No applications found"
            description="No student applications match the active tab and search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-4">Internship & Company</th>
                  <th className="py-3 px-4">Department & Batch</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Current Status</th>
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

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{app.departmentName}</p>
                      <p className="text-[11px] text-text-secondary">{app.batchName}</p>
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
                          title="View Details"
                          className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* If forwarded to director, show fast decision buttons */}
                        {app.status === 'FORWARDED_TO_DIRECTOR' && (
                          <>
                            <button
                              type="button"
                              onClick={() => openDecisionModal(app, 'APPROVE')}
                              title="Approve Nomination"
                              className="px-2 py-1 bg-teal-50 text-teal hover:bg-teal-100 rounded font-semibold text-[11px] flex items-center gap-1 border border-teal-200"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openDecisionModal(app, 'REJECT')}
                              title="Reject Application"
                              className="px-2 py-1 bg-red-50 text-danger hover:bg-red-100 rounded font-semibold text-[11px] flex items-center gap-1 border border-red-200"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* If approved, show letter preview button */}
                        {(app.status === 'APPROVED_BY_DIRECTOR' || app.status === 'COMPLETED') && (
                          <button
                            type="button"
                            onClick={() => setLetterModalApp(app)}
                            title="View Official Approval Letter"
                            className="px-2 py-1 bg-navy-50 text-navy hover:bg-navy-100 rounded font-semibold text-[11px] flex items-center gap-1 border border-navy-200"
                          >
                            <FileSignature className="w-3.5 h-3.5 text-teal" />
                            <span>Letter</span>
                          </button>
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

      {/* Application Details & Review History Modal */}
      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title="Application Dossier & Review Audit"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-base">{viewingApp.studentName}</h3>
                <p className="text-xs text-text-secondary font-mono">{viewingApp.rollNumber} • {viewingApp.departmentName}</p>
              </div>
              <Badge status={viewingApp.status} size="md" />
            </div>

            {/* Application Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Internship Role</span>
                <p className="font-bold text-navy mt-0.5">{viewingApp.internshipTitle}</p>
                <p className="text-teal font-semibold">{viewingApp.companyName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Academic Standing</span>
                <p className="font-bold text-slate-800 mt-0.5">CGPA: {viewingApp.cgpa.toFixed(2)}</p>
                <p className="text-text-secondary">{viewingApp.batchName}</p>
              </div>
            </div>

            {/* Statement of purpose */}
            {viewingApp.statementOfPurpose && (
              <div>
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                  Statement of Purpose
                </h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-border leading-relaxed">
                  {viewingApp.statementOfPurpose}
                </p>
              </div>
            )}

            {/* Resume File */}
            <div className="bg-slate-50 p-3 rounded-lg border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                <span className="font-medium text-slate-800">
                  {viewingApp.resumeFileName || 'Student_Curriculum_Vitae.pdf'}
                </span>
              </div>
              <span className="text-[11px] text-teal font-semibold">Verified Attachment</span>
            </div>

            {/* Audit & Review History */}
            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                Review History & Institutional Sign-off
              </h4>
              <div className="space-y-2">
                {viewingApp.reviewHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No review milestones recorded yet.</p>
                ) : (
                  viewingApp.reviewHistory.map((rev, i) => (
                    <div
                      key={i}
                      className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy">
                          {rev.stage === 'FOCAL_PERSON' ? 'Department Focal Person' : 'Directorate Office'}
                        </span>
                        <span className="text-[10px] text-slate-400">{rev.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mt-1">"{rev.comment || 'No remarks provided'}"</p>
                      <p className="text-[10px] text-teal font-medium mt-1">Signed by: {rev.reviewerName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2">
              {viewingApp.status === 'FORWARDED_TO_DIRECTOR' && (
                <>
                  <Button
                    variant="teal"
                    size="sm"
                    onClick={() => {
                      setViewingApp(null);
                      openDecisionModal(viewingApp, 'APPROVE');
                    }}
                  >
                    Make Decision
                  </Button>
                </>
              )}
              <Button variant="secondary" size="sm" onClick={() => setViewingApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Decision Modal */}
      {reviewingApp && (
        <Modal
          isOpen={!!reviewingApp}
          onClose={() => setReviewingApp(null)}
          title={reviewAction === 'APPROVE' ? 'Director Institutional Approval' : 'Director Application Rejection'}
          maxWidth="md"
        >
          <form onSubmit={handleDecisionSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs">
              <p className="text-slate-500 font-medium">Candidate:</p>
              <p className="font-bold text-navy text-sm">{reviewingApp.studentName} ({reviewingApp.rollNumber})</p>
              <p className="text-slate-700 mt-1">
                Applying for <strong className="text-teal">{reviewingApp.internshipTitle}</strong> at <strong>{reviewingApp.companyName}</strong>
              </p>
            </div>

            <Textarea
              label="Director Official Remarks / Justification"
              rows={3}
              value={directorRemarks}
              onChange={(e) => setDirectorRemarks(e.target.value)}
              required
            />

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setReviewingApp(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewAction === 'APPROVE' ? 'teal' : 'danger'}
                isLoading={isSubmittingDecision}
              >
                {reviewAction === 'APPROVE' ? 'Issue Official Approval Letter' : 'Confirm Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Approval Letter PDF Preview Modal */}
      <PdfLetterPreviewModal
        isOpen={!!letterModalApp}
        onClose={() => setLetterModalApp(null)}
        application={letterModalApp}
      />
    </div>
  );
};
