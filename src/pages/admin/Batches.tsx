import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { batchService } from '../../services/batch.service';
import { Batch } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const batchSchema = z.object({
  name: z.string().min(3, 'Batch name required (e.g. Fall 2021)'),
  startYear: z.number().min(2018).max(2035, 'Invalid start year'),
  endYear: z.number().min(2020).max(2040, 'Invalid end year'),
});

type BatchFormData = z.infer<typeof batchSchema>;

export const AdminBatches: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await batchService.getAll();
      setBatches(data);
    } catch {
      toast.error('Failed to load academic batches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingBatch(null);
    reset({
      name: '',
      startYear: 2022,
      endYear: 2026,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    reset({
      name: batch.name,
      startYear: batch.startYear,
      endYear: batch.endYear,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: BatchFormData) => {
    try {
      await batchService.save({
        id: editingBatch?.id,
        name: data.name,
        startYear: data.startYear,
        endYear: data.endYear,
      });

      toast.success(
        editingBatch
          ? `Batch ${data.name} updated successfully`
          : `Batch ${data.name} initialized successfully`
      );
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save batch record');
    }
  };

  const handleDelete = async () => {
    if (!deletingBatch) return;
    try {
      await batchService.delete(deletingBatch.id);
      toast.success(`Batch ${deletingBatch.name} removed`);
      setDeletingBatch(null);
      loadData();
    } catch {
      toast.error('Failed to delete batch');
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter((b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [batches, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Batch Management"
        description="Configure academic cohorts, graduation timelines, and internship eligibility windows."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create Batch
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search batches by session name or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      {/* Batches Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : filteredBatches.length === 0 ? (
        <EmptyState
          title="No batches found"
          description="No academic batches match your search query."
          actionLabel="Create Batch"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredBatches.map((batch) => (
            <Card key={batch.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <Badge status={batch.status} size="sm" />
                </div>

                <h3 className="font-bold text-navy text-sm">{batch.name}</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Tenure: <span className="font-semibold text-slate-700">{batch.startYear} — {batch.endYear}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-navy" />
                    Enrolled Students:
                  </span>
                  <span className="font-bold text-slate-900">{batch.studentCount || 0}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(batch)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingBatch(batch)}
                  className="text-slate-400 hover:text-danger hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Batch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBatch ? 'Edit Academic Batch' : 'Create Academic Batch'}
        description="Specify the cohort label and commencement/graduation calendar."
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Batch Identifier"
            placeholder="e.g. Fall 2021 (Graduating 2025)"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Year"
              type="number"
              placeholder="2021"
              error={errors.startYear?.message}
              required
              {...register('startYear', { valueAsNumber: true })}
            />
            <Input
              label="End Year"
              type="number"
              placeholder="2025"
              error={errors.endYear?.message}
              required
              {...register('endYear', { valueAsNumber: true })}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              {editingBatch ? 'Save Changes' : 'Initialize Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingBatch}
        onClose={() => setDeletingBatch(null)}
        onConfirm={handleDelete}
        title="Remove Academic Batch?"
        message={`Are you sure you want to remove ${deletingBatch?.name}? Verify that student records have been appropriately archived.`}
        confirmText="Delete Batch"
        variant="danger"
      />
    </div>
  );
};
