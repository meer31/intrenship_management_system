import React, { useState } from 'react';
import {
  GraduationCap,
  Phone,
  Save,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const StudentProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [cellNumber, setCellNumber] = useState(user?.cellNumber || '+92 300 5551234');
  const [personalEmail, setPersonalEmail] = useState('hamza.personal@gmail.com');
  const [linkedInUrl, setLinkedInUrl] = useState('https://linkedin.com/in/hamza-farooq-dev');
  const [githubUrl, setGithubUrl] = useState('https://github.com/hamza-farooq');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        cellNumber,
      });
      toast.success('Contact information updated successfully');
    } catch {
      toast.error('Failed to update student profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Student Academic Profile"
        description="Your institutional enrolment records, academic division, and verified candidate contact information."
      />

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Academic Identity Details (Locked / Verified) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-teal" />
              <h3 className="text-sm font-bold text-navy-900">
                Institutional Academic Standing (Registrar Verified)
              </h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Student Full Name
                </span>
                <p className="font-bold text-navy text-sm mt-0.5">{user?.name}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Roll / Registration No.
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {user?.rollNumber || '2021-CS-104'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  National CNIC Number
                </span>
                <p className="font-mono text-slate-800 text-sm mt-0.5">
                  {user?.cnic || '35201-1234567-1'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Department
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {user?.departmentName || 'Computer Science'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Enrolled Cohort / Batch
                </span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {user?.batchName || 'Fall 2021 (Graduating 2025)'}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                  Cumulative GPA
                </span>
                <p className="font-bold text-teal text-sm mt-0.5">3.68 / 4.00</p>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-text-secondary">
              * Official academic credentials, degree programs, and roll numbers cannot be altered directly. Please contact your Department Focal Person for record adjustments.
            </p>
          </CardBody>
        </Card>

        {/* Contact Information & External Links (Editable) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal" />
              <h3 className="text-sm font-bold text-navy-900">
                Contact Details & Industry Profiles
              </h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Cell / WhatsApp Number"
                value={cellNumber}
                onChange={(e) => setCellNumber(e.target.value)}
                placeholder="+92 300 1234567"
                required
              />
              <Input
                label="Institutional Email (Primary)"
                value={user?.email || 'hamza.cs@student.qodex.edu.pk'}
                disabled
                helperText="Used for official nomination notices & letters"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Secondary / Personal Email"
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="personal@gmail.com"
              />
              <Input
                label="LinkedIn Public Profile"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <Input
                label="GitHub / Portfolio Website"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              variant="teal"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Contact Updates
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
