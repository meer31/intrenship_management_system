import React, { useState, useEffect } from 'react';
import {
  Download,
  Eye,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { PdfLetterPreviewModal } from '../../components/common/PdfLetterPreviewModal';
import { applicationService } from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';
import { Application } from '../../types';

export const StudentApprovalLetters: React.FC = () => {
  const { user } = useAuth();
  const [approvedApplications, setApprovedApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    const loadApproved = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const apps = await applicationService.getByStudentId(user.id);
        const approved = apps.filter(
          (a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED'
        );
        setApprovedApplications(approved);
      } finally {
        setIsLoading(false);
      }
    };
    loadApproved();
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Internship Approval Letters"
        description="Formal institutional endorsement documents stamped by the Directorate of Industrial Liaison for submitted corporate placements."
      />

      <Card>
        {isLoading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : approvedApplications.length === 0 ? (
          <EmptyState
            title="No approved letters available yet"
            description="Once your internship application has been approved by the Directorate, your official signed letters will appear here."
            icon={<Award className="w-8 h-8 text-slate-400" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Placement & Employer</th>
                  <th className="py-3 px-4">Official Reference No.</th>
                  <th className="py-3 px-4">Issuance Date</th>
                  <th className="py-3 px-4">Document Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{app.internshipTitle}</p>
                      <p className="text-teal font-semibold text-xs">{app.companyName}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {app.approvalLetterNumber || 'IMP/2026/CS-0941'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {app.approvalLetterIssuedAt || app.applicationDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                        Director Endorsed
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Preview Letter
                        </Button>
                        <Button
                          variant="teal"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          leftIcon={<Download className="w-3.5 h-3.5" />}
                        >
                          Download PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Official Approval Letter Preview & Download Modal */}
      <PdfLetterPreviewModal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
      />
    </div>
  );
};
