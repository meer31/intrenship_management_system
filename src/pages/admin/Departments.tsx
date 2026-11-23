import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Users,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { departmentService } from '../../services/department.service';
import { focalPersonService } from '../../services/focalPerson.service';
import { Department, FocalPerson } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const deptSchema = z.object({
  name: z.string().min(3, 'Department name must be at least 3 characters'),
  code: z.string().min(2, 'Department code required (e.g. CS, SE, EE)').max(6),
  description: z.string().min(5, 'Provide a brief academic description'),
  focalPersonId: z.string().optional(),
});

type DeptFormData = z.infer<typeof deptSchema>;

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [focalPersons, setFocalPersons] = useState<FocalPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeptFormData>({
    resolver: zodResolver(deptSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptData, fpData] = await Promise.all([
        departmentService.getAll(),
        focalPersonService.getAll(),
      ]);
      setDepartments(deptData);
      setFocalPersons(fpData);
    } catch {
      toast.error('Failed to load academic departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    reset({
      name: '',
      code: '',
      description: '',
      focalPersonId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    reset({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      focalPersonId: dept.focalPersonId || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: DeptFormData) => {
    try {
      const selectedFp = focalPersons.find((f) => f.id === data.focalPersonId);
      await departmentService.save({
        id: editingDept?.id,
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
        focalPersonId: data.focalPersonId,
        focalPersonName: selectedFp ? selectedFp.fullName : undefined,
      });

      toast.success(
        editingDept
          ? `Department ${data.name} updated successfully`
          : `Department ${data.name} added successfully`
      );
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save department');
    }
  };

  const handleDelete = async () => {
    if (!deletingDept) return;
    try {
      await departmentService.delete(deletingDept.id);
      toast.success(`Department ${deletingDept.name} removed`);
      setDeletingDept(null);
      loadData();
    } catch {
      toast.error('Failed to remove department');
    }
  };

  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description="Configure institutional academic faculties, department codes, and assigned focal persons."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Add Department
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments by name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      {/* Department Cards Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="No academic departments match your search term."
          actionLabel="Add Department"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept) => (
            <Card key={dept.id} hover className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-50 text-navy font-bold text-sm border border-navy-100">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-sm">{dept.name}</h3>
                      <p className="text-[11px] text-text-secondary">Code: {dept.code}</p>
                    </div>
                  </div>
                  <Badge status={dept.status} size="sm" />
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                  {dept.description}
                </p>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <UserCheck className="w-3.5 h-3.5 text-teal" />
                      Focal Person:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {dept.focalPersonName || 'Not Assigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-navy" />
                      Enrolled Students:
                    </span>
                    <span className="font-semibold text-slate-800">{dept.studentCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(dept)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingDept(dept)}
                  className="text-slate-400 hover:text-danger hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Academic Department' : 'Create Academic Department'}
        description="Define department identifiers and appoint a faculty focal person."
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Department Full Name"
            placeholder="e.g. Department of Computer Science"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department Code"
              placeholder="e.g. CS"
              error={errors.code?.message}
              required
              {...register('code')}
            />

            <Select
              label="Assign Focal Person"
              placeholder="Select faculty member"
              options={focalPersons.map((fp) => ({
                value: fp.id,
                label: `${fp.fullName} (${fp.assignedDepartmentName})`,
              }))}
              error={errors.focalPersonId?.message}
              {...register('focalPersonId')}
            />
          </div>

          <Textarea
            label="Department Scope & Description"
            rows={3}
            placeholder="Overview of curriculum, degree programs, and primary industry focus..."
            error={errors.description?.message}
            required
            {...register('description')}
          />

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingDept}
        onClose={() => setDeletingDept(null)}
        onConfirm={handleDelete}
        title="Remove Department?"
        message={`Are you sure you want to delete ${deletingDept?.name}? This action should only be taken if no students or focal persons are currently associated.`}
        confirmText="Delete Department"
        variant="danger"
      />
    </div>
  );
};
