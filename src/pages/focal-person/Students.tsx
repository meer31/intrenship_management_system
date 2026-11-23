import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Mail,
  Phone,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { studentService } from '../../services/student.service';
import { batchService } from '../../services/batch.service';
import { useAuth } from '../../context/AuthContext';
import { Student, Batch } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const studentSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  rollNumber: z.string().min(5, 'Valid roll number required'),
  cnic: z.string().min(13, 'Valid CNIC required (35201-XXXXXXX-X)'),
  email: z.string().email('Valid institutional email required'),
  cellNumber: z.string().min(10, 'Contact number required'),
  batchId: z.string().min(1, 'Please select an academic cohort'),
  cgpa: z.number().min(0).max(4.0, 'CGPA between 0.0 and 4.0'),
});

type StudentFormData = z.infer<typeof studentSchema>;

export const FocalPersonStudents: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stdData, batchData] = await Promise.all([
        studentService.getByDepartment(deptId),
        batchService.getAll(),
      ]);
      setStudents(stdData);
      setBatches(batchData);
    } catch {
      toast.error('Failed to load department student roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deptId]);

  const openAddModal = () => {
    setEditingStudent(null);
    reset({
      fullName: '',
      rollNumber: '',
      cnic: '',
      email: '',
      cellNumber: '',
      batchId: batches[0]?.id || '',
      cgpa: 3.25,
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    reset({
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      cnic: student.cnic,
      email: student.email,
      cellNumber: student.cellNumber,
      batchId: student.batchId,
      cgpa: student.cgpa || 3.0,
    });
    setIsAddEditModalOpen(true);
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      await studentService.save({
        id: editingStudent?.id,
        fullName: data.fullName,
        rollNumber: data.rollNumber,
        cnic: data.cnic,
        email: data.email,
        cellNumber: data.cellNumber,
        departmentId: deptId,
        batchId: data.batchId,
        cgpa: data.cgpa,
      });

      toast.success(
        editingStudent
          ? `Student ${data.fullName} profile updated`
          : `Student ${data.fullName} registered under ${deptName}`
      );

      setIsAddEditModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save student profile');
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchesSearch =
        std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.cnic.includes(searchQuery);

      const matchesBatch = !batchFilter || std.batchId === batchFilter;
      return matchesSearch && matchesBatch;
    });
  }, [students, searchQuery, batchFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Student Directory — ${deptName}`}
        description={`Manage enrolled students, academic standing, and eligibility profiles for the Department of ${deptName}.`}
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Register Student
          </Button>
        }
      />

      {/* Search & Cohort Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${deptName} students by name, roll no, or CNIC...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={batchFilter}
              onChange={(e) => {
                setBatchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="">All Academic Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            description={`No students registered under ${deptName} match your criteria.`}
            actionLabel="Register Student"
            onAction={openAddModal}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Cohort / Batch</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-navy">{student.fullName}</p>
                        <p className="text-[11px] text-text-secondary">{student.email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {student.rollNumber}
                        </span>
                        {typeof student.cgpa === 'number' && (
                          <p className="text-[11px] text-teal font-semibold mt-0.5">
                            CGPA: {student.cgpa.toFixed(2)}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {student.batchName}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-800">{student.cellNumber}</p>
                        <p className="text-[11px] font-mono text-slate-400">{student.cnic}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={student.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            title="View Student"
                            className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                            className="p-1.5 rounded text-slate-500 hover:text-teal hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredStudents.length}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : `Register Student — ${deptName}`}
        description="Department is automatically assigned from your focal person faculty account."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-200 text-xs">
            <span className="text-teal-800 font-semibold">Assigned Department: </span>
            <span className="font-bold text-teal-950">{deptName}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name"
              placeholder="e.g. Fatima Zahra"
              error={errors.fullName?.message}
              required
              {...register('fullName')}
            />
            <Input
              label="Roll Number"
              placeholder="e.g. 2021-CS-112"
              error={errors.rollNumber?.message}
              required
              {...register('rollNumber')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National CNIC Number"
              placeholder="35201-XXXXXXX-X"
              error={errors.cnic?.message}
              required
              {...register('cnic')}
            />
            <Input
              label="Institutional Email"
              type="email"
              placeholder="name@student.qodex.edu.pk"
              error={errors.email?.message}
              required
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              placeholder="+92 300 1234567"
              error={errors.cellNumber?.message}
              required
              {...register('cellNumber')}
            />
            <Input
              label="Cumulative GPA"
              type="number"
              step="0.01"
              placeholder="3.50"
              error={errors.cgpa?.message}
              required
              {...register('cgpa', { valueAsNumber: true })}
            />
          </div>

          <Select
            label="Academic Batch"
            options={batches.map((b) => ({ value: b.id, label: b.name }))}
            error={errors.batchId?.message}
            required
            {...register('batchId')}
          />

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              {editingStudent ? 'Save Changes' : 'Confirm Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title="Student Dossier"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-base">
                {viewingStudent.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingStudent.fullName}</h3>
                <p className="text-xs text-text-secondary font-mono">{viewingStudent.rollNumber}</p>
                <div className="mt-1">
                  <Badge status={viewingStudent.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Cohort & CGPA</span>
                <p className="font-bold text-slate-800 mt-0.5">{viewingStudent.batchName}</p>
                <p className="text-teal font-semibold">CGPA: {viewingStudent.cgpa?.toFixed(2)}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-border space-y-1">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{viewingStudent.cellNumber}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
