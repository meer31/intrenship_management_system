import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  RotateCcw,
  Save,
  Database,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { mockStorage } from '../../mocks/mockStorage';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  const [portalName, setPortalName] = useState('Internship Management Portal');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [directorateEmail, setDirectorateEmail] = useState('liaison.internships@qodex.edu.pk');
  const [contactPhone, setContactPhone] = useState('+92 42 111 222 333');
  const [minCgpaRequirement, setMinCgpaRequirement] = useState('2.50');
  const [autoNotifyFocal, setAutoNotifyFocal] = useState(true);
  const [autoNotifyDirector, setAutoNotifyDirector] = useState(true);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    toast.success('Institutional configurations updated successfully');
  };

  const handleResetData = () => {
    mockStorage.resetToDefault();
    setIsResetConfirmOpen(false);
    toast.success('Portal mock datastore restored to institutional defaults');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional System Settings"
        description="Configure academic parameters, global portal identity, eligibility thresholds, and datastore management."
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Institutional Identity Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy-900">Portal & Institutional Identity</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Portal Official Name"
                value={portalName}
                onChange={(e) => setPortalName(e.target.value)}
                required
              />
              <Input
                label="Active Academic Cycle"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Directorate Liaison Email"
                type="email"
                value={directorateEmail}
                onChange={(e) => setDirectorateEmail(e.target.value)}
                required
              />
              <Input
                label="Helpline Contact Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
              />
            </div>
          </CardBody>
        </Card>

        {/* Academic Eligibility Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy-900">Academic Placement Policies</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Institutional CGPA Threshold"
                type="number"
                step="0.05"
                value={minCgpaRequirement}
                onChange={(e) => setMinCgpaRequirement(e.target.value)}
                helperText="Students below this threshold cannot submit self-nominations"
              />
              <Select
                label="Automatic Approval Letter Issuance"
                value="IMMEDIATE"
                onChange={() => {}}
                options={[
                  { value: 'IMMEDIATE', label: 'Issue with Unique Ref No. on Director Approval' },
                  { value: 'MANUAL', label: 'Require Manual Barcode Verification First' },
                ]}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotifyFocal}
                  onChange={(e) => setAutoNotifyFocal(e.target.checked)}
                  className="rounded border-border text-teal focus:ring-teal mr-2"
                />
                <span>Automatically dispatch notification to Department Focal Person upon new application</span>
              </label>

              <label className="flex items-center text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotifyDirector}
                  onChange={(e) => setAutoNotifyDirector(e.target.checked)}
                  className="rounded border-border text-teal focus:ring-teal mr-2"
                />
                <span>Automatically dispatch notification to Director upon nomination endorsement</span>
              </label>
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            <Button type="submit" variant="teal" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Datastore Reset & Demo Environment */}
      <Card className="border-red-200 bg-red-50/20">
        <CardHeader className="border-red-100">
          <div className="flex items-center gap-2 text-danger">
            <Database className="w-4 h-4" />
            <h3 className="text-sm font-bold">Mock Datastore Maintenance</h3>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-xs text-slate-600 leading-relaxed">
            Resetting the datastore will restore all departments, batches, focal persons, students, sample applications, and letters back to the clean initial demo state.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Mock Datastore to Defaults
            </Button>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Datastore to Defaults?"
        message="This will overwrite any freshly created students, departments, or custom applications and reload the initial demo data."
        confirmText="Confirm Reset"
        variant="danger"
      />
    </div>
  );
};
