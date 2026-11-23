import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowLeft,
  ShieldCheck,
  Send,
} from 'lucide-react';

import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { internshipService } from '../../services/internship.service';
import { applicationService } from '../../services/application.service';
import { studentService } from '../../services/student.service';
import { useAuth } from '../../context/AuthContext';
import { Internship, Application, Student } from '../../types';
import { toast } from 'sonner';

export const StudentInternshipDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [sop, setSop] = useState('');
  const [resumeFileName, setResumeFileName] = useState('Hamza_Farooq_Resume_2026.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const int = await internshipService.getById(id);
        setInternship(int || null);

        if (user) {
          const [apps, students] = await Promise.all([
            applicationService.getByStudentId(user.id),
            studentService.getAll(),
          ]);
          const app = apps.find((a) => a.internshipId === id);
          setExistingApplication(app || null);

          const std = students.find((s) => s.id === user.id) || {
            id: user.id,
            fullName: user.name,
            rollNumber: user.rollNumber || '2021-CS-104',
            cnic: user.cnic || '35201-1234567-1',
            departmentId: user.departmentId || 'dept-1',
            departmentName: user.departmentName || 'Computer Science',
            batchId: user.batchId || 'batch-2021',
            batchName: user.batchName || 'Fall 2021',
            cellNumber: user.cellNumber || '+92 300 5551234',
            email: user.email,
            cgpa: 3.68,
            status: 'ACTIVE',
            createdAt: '2021-09-15',
          };
          setCurrentStudent(std);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="p-8 text-center bg-white rounded-card">
        <h3 className="text-sm font-semibold text-navy">Internship Not Found</h3>
        <p className="text-xs text-text-secondary mt-1">
          This placement opportunity is unavailable or has been archived.
        </p>
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/student/internships')}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  // Eligibility evaluation
  const isDeptEligible = !user?.departmentId || internship.eligibleDepartmentIds.includes(user.departmentId);
  const isBatchEligible = !user?.batchId || internship.eligibleBatchIds.includes(user.batchId);
  const isDeadlinePassed = new Date(internship.applicationDeadline) < new Date('2026-11-20');
  const hasAlreadyApplied = !!existingApplication;

  const canApply = isDeptEligible && isBatchEligible && !isDeadlinePassed && !hasAlreadyApplied && internship.isPublished;

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !internship) return;

    if (!sop.trim()) {
      toast.error('Please write a brief statement of purpose');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await applicationService.create({
        student: currentStudent,
        internship,
        statementOfPurpose: sop,
        resumeFileName,
      });

      toast.success('Internship application submitted successfully! Forwarded for Focal Person review.');
      setExistingApplication(created);
      setIsApplyModalOpen(false);
    } catch {
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/internships')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Listings
        </Button>
      </div>

      {/* Main Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-border shrink-0 shadow-sm">
              <img
                src={internship.companyLogo}
                alt={internship.companyName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal uppercase tracking-wider">
                  {internship.companyName}
                </span>
                <span className="text-slate-300">•</span>
                <Badge status={internship.isPublished ? 'ACTIVE' : 'DRAFT'} size="sm" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">
                {internship.title}
              </h1>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {internship.location}
                </span>
                <span className="flex items-center gap-1 bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-teal" />
                  {internship.stipend}
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {internship.duration} ({internship.type})
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {internship.totalSlots} Institutional Slots
                </span>
              </div>
            </div>
          </div>

          {/* Action / Application Button */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {hasAlreadyApplied ? (
              <div className="text-right">
                <Badge status={existingApplication.status} size="md" />
                <p className="text-[11px] text-text-secondary mt-1">
                  Submitted on {existingApplication.applicationDate}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate('/student/applications')}
                >
                  View in My Applications
                </Button>
              </div>
            ) : canApply ? (
              <Button
                variant="teal"
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Apply for Internship
              </Button>
            ) : (
              <Button variant="secondary" size="lg" disabled>
                Application Unavailable
              </Button>
            )}
          </div>
        </div>

        {/* Warning / Eligibility Status Banners */}
        {!internship.isPublished && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>This internship posting is currently in draft mode and not accepting public applications.</span>
          </div>
        )}

        {isDeadlinePassed && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>The application deadline for this position ({internship.applicationDeadline}) has passed.</span>
          </div>
        )}

        {!isDeptEligible && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>
              Your department ({user?.departmentName}) is not eligible for this quota. Open only for: {internship.eligibleDepartmentNames.join(', ')}.
            </span>
          </div>
        )}

        {!isBatchEligible && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-danger flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>
              Your academic batch ({user?.batchName}) is not included in this placement cycle. Open for: {internship.eligibleBatchNames.join(', ')}.
            </span>
          </div>
        )}
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Description & Prerequisites */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-3">
              Role Overview & Responsibilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {internship.description}
            </p>

            <h3 className="text-sm font-bold text-navy uppercase tracking-wider mt-6 mb-3">
              Candidate Prerequisites & Skill Requirements
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {internship.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right: Placement Summary & Eligibility Checklist */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3">
              Placement Parameters
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Application Deadline:</span>
                <span className="font-semibold text-slate-800">{internship.applicationDeadline}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Stipend Amount:</span>
                <span className="font-semibold text-teal">{internship.stipend}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Internship Duration:</span>
                <span className="font-semibold text-slate-800">{internship.duration}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Work Arrangement:</span>
                <span className="font-semibold text-slate-800">{internship.type}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Total Available Slots:</span>
                <span className="font-bold text-navy">{internship.totalSlots} Seats</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-teal-50/50 border border-teal-200">
            <div className="flex items-center gap-2 mb-2 text-teal-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <span>Nomination Endorsement</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Upon submitting your application, your Department Focal Person ({user?.departmentName}) will verify your GPA and academic standing. When endorsed, the Director will issue your official approval letter.
            </p>
          </Card>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${internship.title}`}
        description={`Submitting official institutional nomination for ${internship.companyName}.`}
        maxWidth="lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 font-medium">Applicant:</span>
                <p className="font-bold text-navy">{user?.name}</p>
                <p className="font-mono text-slate-600">{user?.rollNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Department & Batch:</span>
                <p className="font-semibold text-slate-800">{user?.departmentName}</p>
                <p className="text-slate-600">{user?.batchName}</p>
              </div>
            </div>
          </div>

          <Textarea
            label="Statement of Purpose / Why are you a good fit? *"
            rows={4}
            value={sop}
            onChange={(e) => setSop(e.target.value)}
            placeholder="Highlight relevant course projects, technical competencies, and your career motivation for this specific internship role..."
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Curriculum Vitae / Resume File (PDF) *
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-teal transition-colors bg-slate-50/50">
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-1 text-xs font-medium text-slate-800">
                {resumeFileName}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                PDF format up to 5MB (Official Student CV)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsApplyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
