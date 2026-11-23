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
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { reportService } from '../../services/report.service';
import { useAuth } from '../../context/AuthContext';
import { CompletionReport } from '../../types';
import { toast } from 'sonner';

export const FocalPersonReportRepository: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [reports, setReports] = useState<CompletionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingReport, setViewingReport] = useState<CompletionReport | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getByDepartmentId(deptId);
        setReports(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [deptId]);

  const handleDownload = (report: CompletionReport) => {
    const content = `DEPARTMENT OF ${deptName.toUpperCase()}
INTERNSHIP COMPLETION DOSSIER
=====================================
Student Name: ${report.studentName}
Roll Number: ${report.rollNumber}
Internship: ${report.internshipTitle} (${report.companyName})
Submission Date: ${report.submissionDate}
Status: ${report.status}
Grade: ${report.grade || 'Pending'}

Summary:
${report.reportSummary}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${report.fileName}`);
  };

  const filteredReports = useMemo(() => {
    return reports.filter(
      (r) =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reports, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Report Repository — ${deptName}`}
        description={`Digital archive of technical completion reports submitted by students of the Department of ${deptName}.`}
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by student name, roll number, or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title="No reports submitted"
            description={`No completion reports currently recorded for ${deptName}.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Employer & Internship</th>
                  <th className="py-3 px-4">Report File</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Status & Grade</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-navy">{report.studentName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{report.rollNumber}</p>
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
                      <div className="space-y-0.5">
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
                          onClick={() => handleDownload(report)}
                          title="Download Document"
                          className="p-1.5 rounded text-slate-500 hover:text-teal hover:bg-slate-100"
                        >
                          <Download className="w-4 h-4" />
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

      {/* View Modal */}
      {viewingReport && (
        <Modal
          isOpen={!!viewingReport}
          onClose={() => setViewingReport(null)}
          title="Student Internship Report Dossier"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingReport.studentName}</h3>
                <p className="text-text-secondary font-mono">{viewingReport.rollNumber}</p>
              </div>
              <Badge status={viewingReport.status} size="md" />
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <span className="text-slate-400 font-medium">Internship Position</span>
              <p className="font-bold text-navy mt-0.5">{viewingReport.internshipTitle}</p>
              <p className="text-teal font-semibold">{viewingReport.companyName}</p>
            </div>

            <div>
              <span className="font-bold text-navy uppercase tracking-wider block mb-1">
                Executive Summary
              </span>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-border leading-relaxed">
                {viewingReport.reportSummary}
              </p>
            </div>

            {viewingReport.reviewedBy && (
              <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-200">
                <span className="font-bold text-teal-900 block">Grade Awarded: {viewingReport.grade}</span>
                <p className="text-slate-700 mt-1 italic">"{viewingReport.reviewerRemarks}"</p>
                <p className="text-[10px] text-teal-800 mt-1 font-semibold">Reviewed by: {viewingReport.reviewedBy}</p>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(viewingReport)}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download File
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewingReport(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
