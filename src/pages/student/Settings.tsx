import React, { useState } from 'react';
import {
  Lock,
  Bell,
  Save,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';

export const StudentSettings: React.FC = () => {
  const [notifyAppUpdates, setNotifyAppUpdates] = useState(true);
  const [notifyNewOpenings, setNotifyNewOpenings] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please complete all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSaving(false);
    toast.success('Security password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Student Portal Settings"
        description="Configure communication preferences and portal account security."
      />

      {/* Notifications Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal" />
            <h3 className="text-sm font-bold text-navy-900">Email & Alert Preferences</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <label className="flex items-center text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyAppUpdates}
              onChange={(e) => setNotifyAppUpdates(e.target.checked)}
              className="rounded border-border text-teal focus:ring-teal mr-2.5"
            />
            <span>Receive email notifications whenever application status changes (Focal Review, Director Approval)</span>
          </label>

          <label className="flex items-center text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyNewOpenings}
              onChange={(e) => setNotifyNewOpenings(e.target.checked)}
              className="rounded border-border text-teal focus:ring-teal mr-2.5"
            />
            <span>Receive weekly digest of new corporate internship openings eligible for your department</span>
          </label>
        </CardBody>
        <CardFooter className="justify-end">
          <Button
            variant="teal"
            size="sm"
            onClick={() => toast.success('Notification preferences saved')}
          >
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* Password & Security */}
      <form onSubmit={handlePasswordChange}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy-900">Change Account Password</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-3.5">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardBody>
          <CardFooter className="justify-end">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
