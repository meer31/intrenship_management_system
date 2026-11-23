import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Power,
  Eye,
  Mail,
  Phone,
  Building2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { focalPersonService } from '../../services/focalPerson.service';
import { departmentService } from '../../services/department.service';
import { FocalPerson, Department } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const focalPersonSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Valid institutional email required'),
  contactNumber: z.string().min(10, 'Contact number required'),
  assignedDepartmentId: z.string().min(1, 'Please assign a department'),
  designation: z.string().min(2, 'Designation required (e.g. Associate Professor)'),
});

type FocalPersonFormData = z.infer<typeof focalPersonSchema>;

export const AdminFocalPersons: React.FC = () => {
  const [focalPersons, setFocalPersons] = useState<FocalPerson[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFp, setEditingFp] = useState<FocalPerson | null>(null);
  const [viewingFp, setViewingFp] = useState<FocalPerson | null>(null);
  const [togglingFp, setTogglingFp] = useState<FocalPerson | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FocalPersonFormData>({
    resolver: zodResolver(focalPersonSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fpData, deptData] = await Promise.all([
        focalPersonService.getAll(),
        departmentService.getAll(),
      ]);
      setFocalPersons(fpData);
      setDepartments(deptData);
    } catch {
      toast.error('Failed to load focal persons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingFp(null);
    reset({
      fullName: '',
      email: '',
      contactNumber: '',
      assignedDepartmentId: departments[0]?.id || '',
      designation: 'Assistant Professor & Focal Person',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (fp: FocalPerson) => {
    setEditingFp(fp);
    reset({
      fullName: fp.fullName,
      email: fp.email,
      contactNumber: fp.contactNumber,
      assignedDepartmentId: fp.assignedDepartmentId,
      designation: fp.designation,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FocalPersonFormData) => {
    try {
      const saved = await focalPersonService.save({
        id: editingFp?.id,
        ...data,
      });

      toast.success(
        editingFp
          ? `Focal Person ${saved.fullName} updated successfully`
          : `Focal Person ${saved.fullName} appointed successfully`
      );
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save focal person record');
    }
  };

  const handleToggleStatus = async () => {
    if (!togglingFp) return;
    try {
      const updated = await focalPersonService.toggleStatus(togglingFp.id);
      toast.success(
        `Focal Person account is now ${updated?.accountStatus.toLowerCase()}`
      );
      setTogglingFp(null);
      loadData();
    } catch {
      toast.error('Failed to update account status');
    }
  };

  const filteredFPs = useMemo(() => {
    return focalPersons.filter(
      (fp) =>
        fp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fp.assignedDepartmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [focalPersons, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Focal Persons"
        description="Faculty coordinators authorized to evaluate student eligibility and endorse institutional nominations."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Appoint Focal Person
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search focal persons by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      {/* Focal Persons Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredFPs.length === 0 ? (
          <EmptyState
            title="No focal persons appointed"
            description="No faculty members match your search criteria."
            actionLabel="Appoint Focal Person"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Assigned Department</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFPs.map((fp) => (
                  <tr key={fp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {fp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-navy">{fp.fullName}</p>
                          <p className="text-[11px] text-text-secondary">{fp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{fp.designation}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-navy bg-navy-50 px-2 py-0.5 rounded">
                        <Building2 className="w-3.5 h-3.5 text-teal" />
                        {fp.assignedDepartmentName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700">{fp.contactNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={fp.accountStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingFp(fp)}
                          title="View Profile"
                          className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(fp)}
                          title="Edit Details"
                          className="p-1.5 rounded text-slate-500 hover:text-teal hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTogglingFp(fp)}
                          title={fp.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded hover:bg-slate-100 ${
                            fp.accountStatus === 'ACTIVE'
                              ? 'text-slate-500 hover:text-danger'
                              : 'text-slate-400 hover:text-teal'
                          }`}
                        >
                          <Power className="w-4 h-4" />
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

      {/* Add / Edit Focal Person Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFp ? 'Update Focal Person Appointment' : 'Appoint Faculty Focal Person'}
        description="Assign department endorsement authority to an institutional faculty member."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name & Title"
            placeholder="e.g. Dr. Tariq Mahmood"
            error={errors.fullName?.message}
            required
            {...register('fullName')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institutional Email"
              type="email"
              placeholder="faculty@qodex.edu.pk"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <Input
              label="Contact Number"
              placeholder="+92 300 1234567"
              error={errors.contactNumber?.message}
              required
              {...register('contactNumber')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assigned Department"
              options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
              error={errors.assignedDepartmentId?.message}
              required
              {...register('assignedDepartmentId')}
            />
            <Input
              label="Academic Designation"
              placeholder="e.g. Associate Professor"
              error={errors.designation?.message}
              required
              {...register('designation')}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              {editingFp ? 'Save Appointment' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Profile Modal */}
      {viewingFp && (
        <Modal
          isOpen={!!viewingFp}
          onClose={() => setViewingFp(null)}
          title="Focal Person Academic Profile"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-teal text-white flex items-center justify-center font-bold text-base">
                {viewingFp.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingFp.fullName}</h3>
                <p className="text-xs text-text-secondary">{viewingFp.designation}</p>
                <div className="mt-1">
                  <Badge status={viewingFp.accountStatus} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Assigned Department</span>
                <p className="font-bold text-navy mt-0.5">{viewingFp.assignedDepartmentName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border space-y-1.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{viewingFp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{viewingFp.contactNumber}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingFp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Status Toggle */}
      <ConfirmDialog
        isOpen={!!togglingFp}
        onClose={() => setTogglingFp(null)}
        onConfirm={handleToggleStatus}
        title={togglingFp?.accountStatus === 'ACTIVE' ? 'Deactivate Account?' : 'Reactivate Account?'}
        message={`Are you sure you want to change the status of ${togglingFp?.fullName}? Deactivated focal persons cannot endorse student applications.`}
        confirmText={togglingFp?.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
        variant={togglingFp?.accountStatus === 'ACTIVE' ? 'danger' : 'teal'}
      />
    </div>
  );
};
