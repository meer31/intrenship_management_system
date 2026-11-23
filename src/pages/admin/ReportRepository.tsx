import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { reportService } from '../../services/report.service';
import { CompletionReport, ReportStatus } from '../../types';
import { toast } from 'sonner';

export const AdminReportRepository: React.FC = () => {
  const [reports, setReports] = useState<CompletionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [viewingReport, setViewingReport] = useState<CompletionReport | null>(null);
  const [gradingReport, setGradingReport] = useState<CompletionReport | null>(null);
  const [grade, setGrade] = useState<'Satisfactory' | 'Unsatisfactory' | 'Excellent'>('Excellent');
  const [remarks, setRemarks] = useState('');
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await reportService.getAll();
      setReports(data);
    } catch {
      toast.error('Failed to load report repository');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openGradingModal = (report: CompletionReport) => {
    setGradingReport(report);
    setGrade(report.grade || 'Excellent');
    setRemarks(report.reviewerRemarks || 'Report meets institutional standards.');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingReport) return;

    setIsSubmittingGrade(true);
    try {
      await reportService.reviewReport(
        gradingReport.id,
        'APPROVED',
        grade,
        remarks,
        'Prof. Dr. Arshad Munir (Director)'
      );
      toast.success(`Internship report evaluated as "${grade}"`);
      setGradingReport(null);
      loadData();
    } catch {
      toast.error('Failed to evaluate report');
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const handleDownloadFile = (report: CompletionReport) => {
    // Generate mock text blob to download
    const content = `INSTITUTIONAL INTERNSHIP COMPLETION REPORT
==========================================
Student Name: ${report.studentName}
Roll Number: ${report.rollNumber}
Department: ${report.departmentName}
Academic Cohort: ${report.batchName}

Internship Position: ${report.internshipTitle}
Corporate Employer: ${report.companyName}
Submission Date: ${report.submissionDate}
Evaluation Status: ${report.status}
Grade: ${report.grade || 'Pending Evaluation'}

EXECUTIVE SUMMARY:
${report.reportSummary}

Verified by Directorate of Industrial Liaison & Internships.
Qodex Software Institutional Portal.`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${report.fileName}`);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.internshipTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internship Completion Report Repository"
        description="Centralized institutional digital archive of submitted post-internship evaluation reports, technical documentation, and grading dossiers."
      />

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by student name, roll number, or employer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="ALL">All Report Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved & Graded</option>
              <option value="REVISIONS_REQUESTED">Revisions Requested</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={6} />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="No reports found"
            description="No internship reports match your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student Name & Roll No</th>
                  <th className="py-3 px-4">Employer & Internship</th>
                  <th className="py-3 px-4">Submitted File</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Evaluation Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{report.studentName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{report.rollNumber}</p>
                      <p className="text-[11px] text-text-secondary">{report.departmentName}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{report.companyName}</p>
                      <p className="text-[11px] text-text-secondary">{report.internshipTitle}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-teal shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[150px]">
                            {report.fileName}
                          </p>
                          <span className="text-[10px] text-slate-400">{report.fileSize}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {report.submissionDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <Badge status={report.status} size="sm" />
                        {report.grade && (
                          <p className="text-[11px] font-bold text-teal">
                            Grade: {report.grade}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingReport(report)}
                          title="View Details"
                          className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(report)}
                          title="Download Report"
                          className="p-1.5 rounded text-slate-500 hover:text-teal hover:bg-slate-100"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openGradingModal(report)}
                          title="Grade Report"
                          className="px-2.5 py-1 bg-teal-50 text-teal hover:bg-teal-100 border border-teal-200 rounded font-semibold text-[11px]"
                        >
                          {report.grade ? 'Re-grade' : 'Grade'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Report Modal */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          title="Internship Completion Dossier"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-base">{viewingReport.studentName}</h3>
                <p className="text-xs text-text-secondary font-mono">{viewingReport.rollNumber} • {viewingReport.departmentName}</p>
              </div>
              <Badge status={viewingReport.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Internship Placement</span>
                <p className="font-bold text-navy mt-0.5">{viewingReport.internshipTitle}</p>
                <p className="text-teal font-semibold">{viewingReport.companyName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Submitted Documentation</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingReport.fileName}</p>
                <p className="text-slate-400">{viewingReport.fileSize} • {viewingReport.submissionDate}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Student Report Executive Summary
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-border leading-relaxed">
                {viewingReport.reportSummary}
              </p>
            </div>

            {viewingReport.reviewedBy && (
              <div className="bg-teal-50/60 p-3.5 rounded-lg border border-teal-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900">Official Evaluation: {viewingReport.grade}</span>
                  <span className="text-[10px] text-teal-700">{viewingReport.reviewedAt}</span>
                </div>
                <p className="text-slate-700 mt-1 italic">"{viewingReport.reviewerRemarks}"</p>
                <p className="text-[10px] text-teal-800 mt-1 font-semibold">Evaluator: {viewingReport.reviewedBy}</p>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadFile(viewingReport)}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download Attachment
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Grading Modal */}
      {gradingReport && (
        <Modal
          isOpen={!!gradingReport}
          onClose={() => setGradingReport(null)}
          title="Evaluate & Grade Internship Report"
          maxWidth="md"
        >
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs">
              <p className="text-slate-500 font-medium">Student:</p>
              <p className="font-bold text-navy text-sm">{gradingReport.studentName} ({gradingReport.rollNumber})</p>
              <p className="text-slate-700 mt-1 font-medium">{gradingReport.companyName} — {gradingReport.internshipTitle}</p>
            </div>

            <Select
              label="Evaluation Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value as any)}
              options={[
                { value: 'Excellent', label: 'Excellent (Exceeds expectations with industry praise)' },
                { value: 'Satisfactory', label: 'Satisfactory (Meets degree graduation requirements)' },
                { value: 'Unsatisfactory', label: 'Unsatisfactory (Incomplete deliverables)' },
              ]}
              required
            />

            <Textarea
              label="Faculty / Director Evaluation Remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide constructive feedback on technical report quality..."
              required
            />

            <div className="pt-3 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setGradingReport(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="teal" isLoading={isSubmittingGrade}>
                Confirm & Record Grade
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
