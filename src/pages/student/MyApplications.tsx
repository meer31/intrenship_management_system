import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  FileSignature,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { PdfLetterPreviewModal } from '../../components/common/PdfLetterPreviewModal';
import { applicationService } from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';

export const StudentMyApplications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [letterModalApp, setLetterModalApp] = useState<Application | null>(null);

  useEffect(() => {
    const loadApps = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await applicationService.getByStudentId(user.id);
        setApplications(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadApps();
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Internship Applications"
        description="Track the real-time review progress of your institutional internship submissions across Department Focal and Directorate review."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={() => navigate('/student/internships')}
          >
            Browse New Positions
          </Button>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            description="You have not submitted any internship nominations for the current cycle."
            actionLabel="Explore Available Positions"
            onAction={() => navigate('/student/internships')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Internship Position</th>
                  <th className="py-3 px-4">Company / Organization</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Current Review Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{app.internshipTitle}</p>
                      <p className="text-[11px] text-text-secondary">{app.batchName}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-teal text-xs">{app.companyName}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {app.applicationDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={app.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setViewingApp(app)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>

                        {(app.status === 'APPROVED_BY_DIRECTOR' || app.status === 'COMPLETED') && (
                          <Button
                            variant="teal"
                            size="sm"
                            onClick={() => setLetterModalApp(app)}
                            leftIcon={<FileSignature className="w-3.5 h-3.5" />}
                          >
                            Letter
                          </Button>
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

      {/* Details & Review History Modal */}
      {viewingApp && (
        <Modal
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          title="Application Status & Milestone Details"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingApp.internshipTitle}</h3>
                <p className="text-teal font-semibold text-xs">{viewingApp.companyName}</p>
              </div>
              <Badge status={viewingApp.status} size="md" />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <span className="text-slate-400 font-medium">Application Date:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{viewingApp.applicationDate}</p>
            </div>

            {viewingApp.statementOfPurpose && (
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="font-bold text-navy uppercase tracking-wider block mb-1">
                  Submitted Statement of Purpose
                </span>
                <p className="text-slate-700 leading-relaxed">{viewingApp.statementOfPurpose}</p>
              </div>
            )}

            {/* Review History Trail */}
            <div>
              <span className="font-bold text-navy uppercase tracking-wider block mb-2">
                Verification & Approval Audit Trail
              </span>
              {viewingApp.reviewHistory.length === 0 ? (
                <div className="bg-slate-50 p-3 rounded-lg text-slate-500 italic border border-border">
                  Application received and currently queued for Department Focal Person initial review.
                </div>
              ) : (
                <div className="space-y-2">
                  {viewingApp.reviewHistory.map((rev, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between font-bold text-navy">
                        <span>{rev.stage === 'FOCAL_PERSON' ? 'Department Focal Person' : 'Directorate Office'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{rev.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mt-1 italic">"{rev.comment}"</p>
                      <p className="text-[10px] text-teal font-medium mt-1">Signed by: {rev.reviewerName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* If approved, show letter reference */}
            {viewingApp.approvalLetterNumber && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">
                    Official Endorsement Letter
                  </span>
                  <p className="font-mono font-bold text-navy text-xs mt-0.5">
                    {viewingApp.approvalLetterNumber}
                  </p>
                </div>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => {
                    const target = viewingApp;
                    setViewingApp(null);
                    setLetterModalApp(target);
                  }}
                  leftIcon={<FileSignature className="w-3.5 h-3.5" />}
                >
                  View Letter
                </Button>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Approval Letter Preview */}
      <PdfLetterPreviewModal
        isOpen={!!letterModalApp}
        onClose={() => setLetterModalApp(null)}
        application={letterModalApp}
      />
    </div>
  );
};
