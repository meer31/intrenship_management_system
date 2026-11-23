import React, { useState } from 'react';
import {
  Building2,
  Save,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export const FocalPersonProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.name || 'Dr. Tariq Mahmood');
  const [cellNumber, setCellNumber] = useState(user?.cellNumber || '+92 300 1234567');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: fullName,
        cellNumber,
      });
      toast.success('Faculty profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Faculty Focal Person Profile"
        description="Your designated faculty credentials, department liaison authority, and institutional contact details."
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal text-white flex items-center justify-center font-bold text-lg">
                {user?.name?.slice(0, 2).toUpperCase() || 'FP'}
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">{user?.name}</h3>
                <p className="text-xs text-text-secondary">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-teal" />
                <div>
                  <span className="text-slate-500 font-medium">Assigned Department</span>
                  <p className="font-bold text-navy text-sm">{user?.departmentName || 'Computer Science'}</p>
                </div>
              </div>
              <span className="bg-teal text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                Active Faculty Focal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name & Title"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Institutional Email (Locked)"
                type="email"
                value={user?.email || 'focal.cs@qodex.edu.pk'}
                disabled
                helperText="Email changes must be requested through IT Administration"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Contact Number"
                value={cellNumber}
                onChange={(e) => setCellNumber(e.target.value)}
                required
              />
              <Input
                label="Department Office / Extension"
                defaultValue="Room 304, CS Faculty Block"
                placeholder="Office room number"
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
              Update Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};
