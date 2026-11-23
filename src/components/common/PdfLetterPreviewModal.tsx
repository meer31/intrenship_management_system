import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, Download, Award, ShieldCheck } from 'lucide-react';
import { Application } from '../../types';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export interface PdfLetterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export const PdfLetterPreviewModal: React.FC<PdfLetterPreviewModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!application) return null;

  const letterNo = application.approvalLetterNumber || `IMP/2026/ACAD-${Math.floor(1000 + Math.random() * 9000)}`;
  const dateStr = application.approvalLetterIssuedAt || new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF('portrait', 'pt', 'a4');
      const margin = 40;

      // Header Banner
      doc.setFillColor(20, 45, 78); // Navy
      doc.rect(margin, 35, 515, 60, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('INSTITUTIONAL INTERNSHIP MANAGEMENT PORTAL', margin + 20, 60);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(230, 235, 245);
      doc.text('DIRECTORATE OF INDUSTRIAL LIAISON & CAREER SERVICES', margin + 20, 78);

      // Letter metadata
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Ref: ${letterNo}`, margin, 130);
      doc.text(`Date: ${dateStr}`, 440, 130);

      // Recipient
      doc.setFont('helvetica', 'bold');
      doc.text('To:', margin, 160);
      doc.text(`The Human Resources / Talent Acquisition Department`, margin, 175);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 143, 136); // Teal
      doc.text(`${application.companyName}`, margin, 190);

      // Subject
      doc.setTextColor(20, 45, 78);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('SUBJECT: OFFICIAL RECOMMENDATION & NOMINATION FOR INTERNSHIP', margin, 220);
      doc.setDrawColor(22, 143, 136);
      doc.setLineWidth(1.5);
      doc.line(margin, 225, margin + 450, 225);

      // Body text
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);

      const bodyParagraph1 = `Dear Sir / Madam,

It is a matter of privilege to introduce and formally recommend our bonafide student, whose credentials and academic standing have been verified through the institutional portal:`;
      doc.text(doc.splitTextToSize(bodyParagraph1, 515), margin, 245);

      // Student Info Box
      doc.setFillColor(244, 247, 250);
      doc.rect(margin, 285, 515, 95, 'F');
      doc.setDrawColor(220, 228, 236);
      doc.rect(margin, 285, 515, 95, 'S');

      doc.setFont('helvetica', 'bold');
      doc.text('Student Full Name:', margin + 15, 305);
      doc.setFont('helvetica', 'normal');
      doc.text(application.studentName, margin + 140, 305);

      doc.setFont('helvetica', 'bold');
      doc.text('Registration / Roll No:', margin + 15, 325);
      doc.setFont('helvetica', 'normal');
      doc.text(application.rollNumber, margin + 140, 325);

      doc.setFont('helvetica', 'bold');
      doc.text('Department:', margin + 15, 345);
      doc.setFont('helvetica', 'normal');
      doc.text(application.departmentName, margin + 140, 345);

      doc.setFont('helvetica', 'bold');
      doc.text('Academic Batch:', margin + 15, 365);
      doc.setFont('helvetica', 'normal');
      doc.text(application.batchName, margin + 140, 365);

      const bodyParagraph2 = `The student has applied for the position of "${application.internshipTitle}" at your esteemed organization. The Departmental Focal Person has reviewed their academic progress (Cumulative GPA: ${application.cgpa.toFixed(2)}) and endorsed this application for official institutional placement.

During this internship tenure, the student is expected to adhere strictly to your corporate code of conduct, non-disclosure policies, and organizational security protocols. Upon successful completion, the student will submit a formal completion report verified by their industry supervisor to the Departmental Review Committee.`;

      doc.text(doc.splitTextToSize(bodyParagraph2, 515), margin, 405);

      // Signatures
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(20, 45, 78);
      doc.text('Prof. Dr. Arshad Munir', margin + 40, 680);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Director, Industrial Liaison & Internships', margin + 40, 695);
      doc.text('Qodex Institutional Portal', margin + 40, 707);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('Departmental Focal Person', 360, 680);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Department of ${application.departmentName}`, 360, 695);
      doc.text('Verified & Forwarded', 360, 707);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Verification Key: ${letterNo} | Issued via Qodex Software Internship Management Portal`, margin, 780);

      doc.save(`Internship_Approval_Letter_${application.rollNumber}.pdf`);
      toast.success('Approval letter downloaded as PDF');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF letter');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Internship Approval Letter"
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-border no-print">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <span>Official Institutional Document with Digital Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print
            </Button>
            <Button
              type="button"
              variant="teal"
              size="sm"
              onClick={handleDownloadPdf}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
          </div>
        </div>

        {/* Printable Official Letter Preview */}
        <div
          ref={printRef}
          className="bg-white border border-slate-300 rounded-lg p-8 sm:p-12 shadow-sm text-slate-800 font-sans"
        >
          {/* Institution Header */}
          <div className="border-b-2 border-navy pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-navy">
                  DIRECTORATE OF INDUSTRIAL LIAISON & CAREER SERVICES
                </h2>
                <p className="text-xs text-slate-600 font-medium tracking-wide uppercase mt-0.5">
                  Institutional Internship Management Portal • Academic Year 2026
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white font-bold text-lg">
                <Award className="w-7 h-7 text-teal-300" />
              </div>
            </div>
          </div>

          {/* Letter Reference & Date */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-6">
            <div>
              Ref. No: <span className="font-mono text-navy font-bold">{letterNo}</span>
            </div>
            <div>
              Date of Issue: <span className="font-medium text-slate-600">{dateStr}</span>
            </div>
          </div>

          {/* Addressee */}
          <div className="mb-6 text-xs text-slate-800 leading-relaxed">
            <p className="font-bold">To:</p>
            <p>The Human Resources & Internship Coordinator</p>
            <p className="text-sm font-bold text-teal">{application.companyName}</p>
          </div>

          {/* Subject */}
          <div className="bg-slate-50 border-l-4 border-teal p-3 mb-6">
            <h4 className="text-xs sm:text-sm font-bold text-navy uppercase tracking-wide">
              Subject: Formal Institutional Recommendation & Approval for Internship
            </h4>
          </div>

          {/* Body */}
          <div className="text-xs text-slate-700 space-y-3 leading-relaxed text-justify">
            <p>
              Dear Sir / Madam,
            </p>
            <p>
              We are pleased to introduce and endorse the application of our bonafide regular student for the position of{' '}
              <strong className="text-slate-900 font-semibold">{application.internshipTitle}</strong> at your prestigious organization:
            </p>

            {/* Student Details Card */}
            <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/80 p-4 rounded-lg border border-border text-xs">
              <div>
                <span className="text-slate-500 font-medium">Student Full Name:</span>
                <p className="font-bold text-navy">{application.studentName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Roll / Registration Number:</span>
                <p className="font-mono font-bold text-slate-900">{application.rollNumber}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Department:</span>
                <p className="font-semibold text-slate-900">{application.departmentName}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Academic Batch & CGPA:</span>
                <p className="font-semibold text-slate-900">
                  {application.batchName} (CGPA: {application.cgpa.toFixed(2)})
                </p>
              </div>
            </div>

            <p>
              The student has been vetted through the university focal person review process and meets all institutional criteria for industry practical training. We request your organization to kindly provide them an opportunity to apply their technical skills during the stipulated tenure.
            </p>
            <p>
              Upon conclusion of the internship, the student must submit an authenticated Internship Completion Report along with their industry evaluation to complete their degree degree graduation requirements.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
            <div>
              <div className="h-10 flex items-center">
                <span className="font-serif italic text-navy text-lg">Dr. Tariq Mahmood</span>
              </div>
              <div className="border-t border-slate-400 pt-1 w-44">
                <p className="text-xs font-bold text-slate-900">Department Focal Person</p>
                <p className="text-[10px] text-slate-500">{application.departmentName}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="h-10 flex items-center justify-end">
                <span className="font-serif italic text-teal text-xl font-bold">Prof. Dr. Arshad Munir</span>
              </div>
              <div className="border-t border-slate-400 pt-1 w-48 text-left">
                <p className="text-xs font-bold text-navy">Prof. Dr. Arshad Munir</p>
                <p className="text-[10px] text-slate-500">Director, Industrial Liaison & Internships</p>
              </div>
            </div>
          </div>

          {/* Digital Stamp Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
            Official System Generated Document • Directorate of Industrial Liaison • Qodex Software IMS
          </div>
        </div>
      </div>
    </Modal>
  );
};
