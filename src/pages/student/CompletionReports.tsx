import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { applicationService } from '../../services/application.service';
import { reportService } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';
import { Application, CompletionReport } from '../../types';
import { toast } from 'sonner';

export const StudentCompletionReports: React.FC = () => {
  const { user } = useAuth();

  const [approvedApplications, setApprovedApplications] = useState<Application[]>([]);
  const [submittedReports, setSubmittedReports] = useState<CompletionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedAppId, setSelectedAppId] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [apps, reps] = await Promise.all([
        applicationService.getByStudentId(user.id),
        reportService.getByStudentId(user.id),
      ]);
      const approved = apps.filter(
        (a) => a.status === 'APPROVED_BY_DIRECTOR' || a.status === 'COMPLETED'
      );
      setApprovedApplications(approved);
      setSubmittedReports(reps);

      if (approved.length > 0 && !selectedAppId) {
        setSelectedAppId(approved[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds the 10 MB maximum threshold');
        return;
      }
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    } else {
      setFileName(`${user?.name.replace(/\s+/g, '_')}_Internship_Report.pdf`);
      setFileSize('3.8 MB');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAppId) {
      toast.error('Please select an approved internship');
      return;
    }

    if (!fileName) {
      toast.error('Please upload your completion report document');
      return;
    }

    if (!reportSummary.trim()) {
      toast.error('Please provide an executive summary of your training');
      return;
    }

    const app = approvedApplications.find((a) => a.id === selectedAppId);
    if (!app) return;

    setIsSubmitting(true);
    setUploadProgress(25);

    // Simulated upload progress
    await new Promise((r) => setTimeout(r, 300));
    setUploadProgress(65);
    await new Promise((r) => setTimeout(r, 300));
    setUploadProgress(100);

    try {
      await reportService.submitReport({
        applicationId: selectedAppId,
        student: user,
        internshipTitle: app.internshipTitle,
        companyName: app.companyName,
        reportSummary,
        fileName,
        fileSize: fileSize || '3.5 MB',
      });

      toast.success('Internship Completion Report successfully submitted for faculty evaluation!');
      setReportSummary('');
      setFileName('');
      setUploadProgress(0);
      loadData();
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Internship Completion Report & Dossier"
        description="Submit your verified technical report, industry supervisor evaluations, and practical training documentation to earn institutional degree credits."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Submission Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal" />
                <h3 className="text-sm font-bold text-navy-900">
                  Submit Final Internship Documentation
                </h3>
              </div>
            </CardHeader>

            {approvedApplications.length === 0 ? (
              <CardBody>
                <div className="p-6 text-center text-xs text-text-secondary bg-slate-50 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No Approved Placements Available</p>
                  <p className="mt-1">
                    You can only submit completion reports for internships approved by the Directorate.
                  </p>
                </div>
              </CardBody>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <CardBody className="space-y-4">
                  {/* Select Placement */}
                  <Select
                    label="Associated Approved Placement *"
                    value={selectedAppId}
                    onChange={(e) => setSelectedAppId(e.target.value)}
                    options={approvedApplications.map((a) => ({
                      value: a.id,
                      label: `${a.internshipTitle} — ${a.companyName} (${a.approvalLetterNumber || 'Approved'})`,
                    }))}
                    required
                  />

                  {/* Summary Textarea */}
                  <Textarea
                    label="Executive Training Summary & Key Projects Completed *"
                    rows={4}
                    value={reportSummary}
                    onChange={(e) => setReportSummary(e.target.value)}
                    placeholder="Provide a concise summary describing major engineering accomplishments, modules developed, software frameworks utilized, and industrial supervisor sign-off..."
                    required
                  />

                  {/* File Upload Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Upload Signed Completion Report (PDF or DOCX) *
                    </label>

                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-teal transition-colors bg-slate-50/50 relative">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleSimulateFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileText className="mx-auto h-10 w-10 text-slate-400" />
                      {fileName ? (
                        <div className="mt-2">
                          <p className="text-xs font-bold text-teal">{fileName}</p>
                          <p className="text-[11px] text-slate-500">{fileSize}</p>
                          <span className="text-[10px] text-teal-700 font-semibold mt-1 inline-block">
                            Click to replace file
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-navy">
                            Click to select or drag and drop file here
                          </p>
                          <p className="text-[11px] text-text-secondary mt-1">
                            Accepted file formats: <strong className="text-slate-700">PDF, DOCX</strong> • Maximum size: <strong className="text-slate-700">10 MB</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Progress Bar if in progress */}
                  {uploadProgress > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Uploading document...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardBody>

                <CardFooter className="justify-end">
                  <Button
                    type="submit"
                    variant="teal"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Report for Faculty Grading
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>

        {/* Guidelines Card */}
        <div className="space-y-4">
          <Card className="p-5 bg-navy-50/50 border border-navy-100">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
              Submission Guidelines
            </h4>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed list-disc list-inside">
              <li>Include corporate supervisor performance evaluation form.</li>
              <li>Ensure clear documentation of system architecture and work samples.</li>
              <li>Do not include proprietary corporate secrets or confidential IP.</li>
              <li>Your Department Focal Person will evaluate your report as Excellent, Satisfactory, or request revisions.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Submission History Section */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-sm font-bold text-navy-900">Submitted Reports History</h3>
            <p className="text-xs text-text-secondary">Track grading evaluations and review status</p>
          </div>
        </CardHeader>

        {isLoading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : submittedReports.length === 0 ? (
          <EmptyState
            title="No completion reports submitted"
            description="Your submitted reports will appear here once uploaded."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Placement Title</th>
                  <th className="py-3 px-4">Submitted File</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Evaluation Status</th>
                  <th className="py-3 px-4">Awarded Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submittedReports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{rep.internshipTitle}</p>
                      <p className="text-[11px] text-teal font-semibold">{rep.companyName}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-teal" />
                        <span>{rep.fileName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rep.submissionDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge status={rep.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4">
                      {rep.grade ? (
                        <span className="font-bold text-teal text-xs">
                          {rep.grade}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Under Review</span>
                      )}
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
