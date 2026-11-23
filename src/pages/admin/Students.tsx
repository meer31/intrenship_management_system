import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Eye,
  Edit2,
  Power,
  Mail,
  Phone,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { studentService } from '../../services/student.service';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { Student, Department, Batch } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const studentFormSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  rollNumber: z.string().min(5, 'Valid roll number required (e.g. 2021-CS-101)'),
  cnic: z.string().min(13, 'CNIC must be in format 35201-XXXXXXX-X'),
  email: z.string().email('Valid institutional email required'),
  cellNumber: z.string().min(10, 'Valid contact number required'),
  departmentId: z.string().min(1, 'Please select a department'),
  batchId: z.string().min(1, 'Please select an academic batch'),
  cgpa: z.number().min(0).max(4.0, 'CGPA must be between 0.0 and 4.0'),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deactivatingStudent, setDeactivatingStudent] = useState<Student | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stdData, deptData, batchData] = await Promise.all([
        studentService.getAll(),
        departmentService.getAll(),
        batchService.getAll(),
      ]);
      setStudents(stdData);
      setDepartments(deptData);
      setBatches(batchData);
    } catch {
      toast.error('Failed to load student directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingStudent(null);
    reset({
      fullName: '',
      rollNumber: '',
      cnic: '',
      email: '',
      cellNumber: '',
      departmentId: departments[0]?.id || '',
      batchId: batches[0]?.id || '',
      cgpa: 3.2,
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
      departmentId: student.departmentId,
      batchId: student.batchId,
      cgpa: student.cgpa || 3.0,
    });
    setIsAddEditModalOpen(true);
  };

  const onSubmitStudent = async (data: StudentFormData) => {
    try {
      const saved = await studentService.save({
        id: editingStudent?.id,
        ...data,
      });
      toast.success(
        editingStudent
          ? `Student ${saved.fullName} updated successfully`
          : `Student ${saved.fullName} enrolled successfully`
      );
      setIsAddEditModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save student record');
    }
  };

  const handleToggleStatus = async () => {
    if (!deactivatingStudent) return;
    try {
      const updated = await studentService.toggleStatus(deactivatingStudent.id);
      toast.success(
        `Student ${deactivatingStudent.fullName} is now ${updated?.status.toLowerCase()}`
      );
      setDeactivatingStudent(null);
      loadData();
    } catch {
      toast.error('Failed to update student status');
    }
  };

  // Filtered & Paginated records
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchesSearch =
        std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.cnic.includes(searchQuery);

      const matchesDept = !deptFilter || std.departmentId === deptFilter;
      const matchesBatch = !batchFilter || std.batchId === batchFilter;

      return matchesSearch && matchesDept && matchesBatch;
    });
  }, [students, searchQuery, deptFilter, batchFilter]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Directory & Enrolment"
        description="Comprehensive institutional registry of undergraduate and postgraduate students eligible for corporate internships."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Enrol New Student
          </Button>
        }
      />

      {/* Search and Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-1 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll number, or CNIC..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
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

      {/* Students Data Table */}
      <Card>
        {isLoading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title="No students found"
            description="No student profiles match your search criteria or selected filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setDeptFilter('');
              setBatchFilter('');
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Student Details</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Department & Batch</th>
                    <th className="py-3 px-4">Contact & CNIC</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {student.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-navy">{student.fullName}</p>
                            <p className="text-[11px] text-text-secondary">{student.email}</p>
                          </div>
                        </div>
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
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{student.departmentName}</p>
                        <p className="text-[11px] text-text-secondary">{student.batchName}</p>
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
                          <button
                            type="button"
                            onClick={() => setDeactivatingStudent(student)}
                            title={student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded hover:bg-slate-100 ${
                              student.status === 'ACTIVE'
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
        title={editingStudent ? 'Edit Student Profile' : 'Enrol New Student'}
        description="Fill in the verified student identification and academic division details."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmitStudent)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Full Name"
              placeholder="e.g. Hamza Farooq"
              error={errors.fullName?.message}
              required
              {...register('fullName')}
            />
            <Input
              label="Roll Number"
              placeholder="e.g. 2021-CS-104"
              error={errors.rollNumber?.message}
              required
              {...register('rollNumber')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National ID / CNIC"
              placeholder="35201-1234567-1"
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
              label="Cell Contact Number"
              placeholder="+92 300 1234567"
              error={errors.cellNumber?.message}
              required
              {...register('cellNumber')}
            />
            <Input
              label="Cumulative GPA (CGPA)"
              type="number"
              step="0.01"
              placeholder="3.50"
              error={errors.cgpa?.message}
              required
              {...register('cgpa', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department"
              options={departments.map((d) => ({ value: d.id, label: `${d.name} (${d.code})` }))}
              error={errors.departmentId?.message}
              required
              {...register('departmentId')}
            />
            <Select
              label="Academic Batch"
              options={batches.map((b) => ({ value: b.id, label: b.name }))}
              error={errors.batchId?.message}
              required
              {...register('batchId')}
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" isLoading={isSubmitting}>
              {editingStudent ? 'Save Changes' : 'Confirm Enrolment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title="Student Academic Record"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-navy text-white flex items-center justify-center font-bold text-base">
                {viewingStudent.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">{viewingStudent.fullName}</h3>
                <p className="text-xs text-text-secondary font-mono">{viewingStudent.rollNumber}</p>
                <div className="mt-1">
                  <Badge status={viewingStudent.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingStudent.departmentName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Academic Batch</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingStudent.batchName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Cumulative GPA</span>
                <p className="font-bold text-teal mt-0.5">{viewingStudent.cgpa?.toFixed(2) || 'N/A'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">CNIC Number</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewingStudent.cnic}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{viewingStudent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{viewingStudent.cellNumber}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingStudent(null)}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingStudent}
        onClose={() => setDeactivatingStudent(null)}
        onConfirm={handleToggleStatus}
        title={deactivatingStudent?.status === 'ACTIVE' ? 'Deactivate Student Account?' : 'Reactivate Student Account?'}
        message={
          deactivatingStudent?.status === 'ACTIVE'
            ? `Are you sure you want to deactivate ${deactivatingStudent?.fullName}? The student will be temporarily blocked from submitting new internship applications.`
            : `Reactivate ${deactivatingStudent?.fullName}? The student will regain full portal submission privileges.`
        }
        confirmText={deactivatingStudent?.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
        variant={deactivatingStudent?.status === 'ACTIVE' ? 'danger' : 'teal'}
      />
    </div>
  );
};
