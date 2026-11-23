import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Eye,
  Globe,
  Building,
  Calendar,
  Clock,
  Layers,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
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
import { internshipService } from '../../services/internship.service';
import { departmentService } from '../../services/department.service';
import { batchService } from '../../services/batch.service';
import { Internship, Department, Batch, DepartmentSlot, BatchSlot } from '../../types';
import { toast } from 'sonner';

export const AdminInternships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DRAFT'>('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [viewingInternship, setViewingInternship] = useState<Internship | null>(null);
  const [deletingInternship, setDeletingInternship] = useState<Internship | null>(null);

  // Form State for Multi-section Internship Form
  const [formTitle, setFormTitle] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('Lahore (On-site)');
  const [formType, setFormType] = useState<'On-site' | 'Remote' | 'Hybrid'>('On-site');
  const [formStipend, setFormStipend] = useState('PKR 45,000 / Month');
  const [formDuration, setFormDuration] = useState('8 Weeks');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formSelectedDepts, setFormSelectedDepts] = useState<string[]>([]);
  const [formSelectedBatches, setFormSelectedBatches] = useState<string[]>([]);
  const [formDeadline, setFormDeadline] = useState('2026-12-31');
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formTotalSlots, setFormTotalSlots] = useState(10);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [intData, deptData, batchData] = await Promise.all([
        internshipService.getAll(),
        departmentService.getAll(),
        batchService.getAll(),
      ]);
      setInternships(intData);
      setDepartments(deptData);
      setBatches(batchData);
    } catch {
      toast.error('Failed to load internships');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingInternship(null);
    setFormTitle('');
    setFormCompany('');
    setFormLocation('Lahore (On-site)');
    setFormType('On-site');
    setFormStipend('PKR 40,000 / Month');
    setFormDuration('8 Weeks');
    setFormDescription('');
    setFormRequirements('Strong computer science fundamentals\nProficiency in modern tech stack\nGood communication skills');
    setFormSelectedDepts(departments.slice(0, 2).map((d) => d.id));
    setFormSelectedBatches(batches.slice(0, 1).map((b) => b.id));
    setFormDeadline('2026-12-31');
    setFormIsPublished(true);
    setFormTotalSlots(10);
    setIsModalOpen(true);
  };

  const openEditModal = (int: Internship) => {
    setEditingInternship(int);
    setFormTitle(int.title);
    setFormCompany(int.companyName);
    setFormLocation(int.location);
    setFormType(int.type);
    setFormStipend(int.stipend);
    setFormDuration(int.duration);
    setFormDescription(int.description);
    setFormRequirements(int.requirements.join('\n'));
    setFormSelectedDepts(int.eligibleDepartmentIds);
    setFormSelectedBatches(int.eligibleBatchIds);
    setFormDeadline(int.applicationDeadline);
    setFormIsPublished(int.isPublished);
    setFormTotalSlots(int.totalSlots);
    setIsModalOpen(true);
  };

  const handleSaveInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formCompany || !formDescription) {
      toast.error('Please complete all mandatory fields');
      return;
    }

    if (formSelectedDepts.length === 0) {
      toast.error('Please select at least one eligible department');
      return;
    }

    const reqArray = formRequirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    // Build department slots
    const deptSlots: DepartmentSlot[] = formSelectedDepts.map((id) => {
      const d = departments.find((dept) => dept.id === id);
      const slotShare = Math.max(1, Math.floor(formTotalSlots / formSelectedDepts.length));
      return {
        departmentId: id,
        departmentName: d ? d.name : id,
        totalSlots: slotShare,
        filledSlots: 0,
      };
    });

    // Build batch slots
    const bSlots: BatchSlot[] = formSelectedBatches.map((id) => {
      const b = batches.find((batch) => batch.id === id);
      return {
        batchId: id,
        batchName: b ? b.name : id,
        totalSlots: formTotalSlots,
        filledSlots: 0,
      };
    });

    try {
      await internshipService.save({
        id: editingInternship?.id,
        title: formTitle,
        companyName: formCompany,
        location: formLocation,
        type: formType,
        stipend: formStipend,
        duration: formDuration,
        description: formDescription,
        requirements: reqArray,
        eligibleDepartmentIds: formSelectedDepts,
        eligibleBatchIds: formSelectedBatches,
        departmentSlots: deptSlots,
        batchSlots: bSlots,
        totalSlots: formTotalSlots,
        applicationDeadline: formDeadline,
        isPublished: formIsPublished,
        status: formIsPublished ? 'ACTIVE' : 'DRAFT',
      });

      toast.success(
        editingInternship
          ? `Internship "${formTitle}" updated successfully`
          : `Internship "${formTitle}" created successfully`
      );
      setIsModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save internship');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const updated = await internshipService.togglePublish(id);
      toast.success(
        updated?.isPublished
          ? 'Internship published to student portal'
          : 'Internship unpublished (hidden from students)'
      );
      loadData();
    } catch {
      toast.error('Failed to change publication status');
    }
  };

  const handleDelete = async () => {
    if (!deletingInternship) return;
    try {
      await internshipService.delete(deletingInternship.id);
      toast.success(`Internship "${deletingInternship.title}" removed`);
      setDeletingInternship(null);
      loadData();
    } catch {
      toast.error('Failed to delete internship');
    }
  };

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isPublished) ||
        (statusFilter === 'DRAFT' && !item.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [internships, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Corporate Internship Management"
        description="Configure institutional internship postings, quotas, departmental slot reservations, and application deadlines."
        actions={
          <Button
            variant="teal"
            size="sm"
            onClick={openAddModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Create New Internship
          </Button>
        }
      />

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company name, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="ALL">All Publication Statuses</option>
              <option value="ACTIVE">Published (Active)</option>
              <option value="DRAFT">Unpublished (Draft)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Internships List */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filteredInternships.length === 0 ? (
        <EmptyState
          title="No internships found"
          description="No internship opportunities match your filter criteria."
          actionLabel="Create Internship"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInternships.map((int) => (
            <Card key={int.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0">
                      <img
                        src={int.companyLogo}
                        alt={int.companyName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-sm line-clamp-1">{int.title}</h3>
                      <p className="text-xs font-semibold text-teal">{int.companyName}</p>
                    </div>
                  </div>
                  <Badge status={int.isPublished ? 'ACTIVE' : 'DRAFT'} size="sm" />
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 mb-3">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {int.location}
                  </span>
                  <span className="flex items-center gap-1 bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium">
                    <DollarSign className="w-3 h-3 text-teal" />
                    {int.stipend}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {int.duration}
                  </span>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                  {int.description}
                </p>

                {/* Department Quotas & Slots Preview */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-border text-[11px] space-y-1.5 mb-3">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Total Quota Slots:</span>
                    <span className="text-navy font-bold">{int.totalSlots} Seats</span>
                  </div>
                  <div className="text-text-secondary flex flex-wrap gap-1">
                    <span className="font-medium text-slate-600">Eligible Departments:</span>
                    {int.eligibleDepartmentNames.join(', ')}
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Deadline:</span>
                    <span className="font-medium text-slate-700">{int.applicationDeadline}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(int.id)}
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                    int.isPublished
                      ? 'text-amber-600 hover:text-amber-700'
                      : 'text-teal hover:text-teal-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {int.isPublished ? 'Unpublish' : 'Publish'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingInternship(int)}
                    title="View Details"
                    className="p-1.5 rounded text-slate-500 hover:text-navy hover:bg-slate-100"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(int)}
                    title="Edit Internship"
                    className="p-1.5 rounded text-slate-500 hover:text-teal hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingInternship(int)}
                    title="Delete"
                    className="p-1.5 rounded text-slate-400 hover:text-danger hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Multi-Section Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInternship ? 'Edit Internship Opportunity' : 'Create New Internship Posting'}
        description="Configure corporate partner details, quota breakdown, and student eligibility criteria."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveInternship} className="space-y-5">
          {/* Section 1: Basic Corporate Info */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 pb-1 border-b border-border">
              1. Position & Corporate Partner Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Internship Title"
                placeholder="e.g. Full Stack Software Engineer Intern"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
              <Input
                label="Company Name"
                placeholder="e.g. Systems Limited"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />
              <Input
                label="Location & Workplace"
                placeholder="e.g. Lahore (Hybrid) / Islamabad"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Work Mode"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  options={[
                    { value: 'On-site', label: 'On-site' },
                    { value: 'Remote', label: 'Remote' },
                    { value: 'Hybrid', label: 'Hybrid' },
                  ]}
                />
                <Input
                  label="Duration"
                  placeholder="8 Weeks"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3.5">
              <Input
                label="Stipend / Compensation"
                placeholder="e.g. PKR 45,000 / Month"
                value={formStipend}
                onChange={(e) => setFormStipend(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Description & Requirements */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 pb-1 border-b border-border">
              2. Job Scope & Qualifications
            </h4>
            <Textarea
              label="Job Description & Responsibilities"
              rows={3}
              placeholder="Outline project deliverables, team mentoring, and practical training scope..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
            />

            <div className="mt-3">
              <Textarea
                label="Key Prerequisites / Requirements (one per line)"
                rows={3}
                placeholder="e.g.&#10;Data Structures & Algorithms&#10;React.js and TypeScript&#10;Minimum CGPA 3.0"
                value={formRequirements}
                onChange={(e) => setFormRequirements(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Eligibility & Quota Slots */}
          <div>
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2.5 pb-1 border-b border-border">
              3. Department Quota & Eligibility Matrix
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Eligible Departments *
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-border p-2.5 rounded-lg bg-slate-50/50">
                  {departments.map((d) => {
                    const checked = formSelectedDepts.includes(d.id);
                    return (
                      <label key={d.id} className="flex items-center text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormSelectedDepts([...formSelectedDepts, d.id]);
                            } else {
                              setFormSelectedDepts(formSelectedDepts.filter((id) => id !== d.id));
                            }
                          }}
                          className="rounded border-border text-teal focus:ring-teal mr-2"
                        />
                        <span>{d.name} ({d.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Eligible Batches *
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-border p-2.5 rounded-lg bg-slate-50/50">
                  {batches.map((b) => {
                    const checked = formSelectedBatches.includes(b.id);
                    return (
                      <label key={b.id} className="flex items-center text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormSelectedBatches([...formSelectedBatches, b.id]);
                            } else {
                              setFormSelectedBatches(formSelectedBatches.filter((id) => id !== b.id));
                            }
                          }}
                          className="rounded border-border text-teal focus:ring-teal mr-2"
                        />
                        <span>{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <Input
                label="Total Institutional Slots"
                type="number"
                min="1"
                value={formTotalSlots}
                onChange={(e) => setFormTotalSlots(Number(e.target.value))}
                required
              />
              <Input
                label="Application Deadline"
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                required
              />
            </div>

            <div className="mt-3.5">
              <label className="flex items-center text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="rounded border-border text-teal focus:ring-teal mr-2"
                />
                <span className="font-semibold text-navy">
                  Publish immediately to student portal upon saving
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal">
              {editingInternship ? 'Save Changes' : 'Create Internship Opportunity'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Internship Details Modal */}
      {viewingInternship && (
        <Modal
          isOpen={!!viewingInternship}
          onClose={() => setViewingInternship(null)}
          title="Internship Specifications"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0">
                <img
                  src={viewingInternship.companyLogo}
                  alt={viewingInternship.companyName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-navy text-base">{viewingInternship.title}</h3>
                <p className="text-xs font-semibold text-teal">{viewingInternship.companyName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge status={viewingInternship.isPublished ? 'ACTIVE' : 'DRAFT'} size="sm" />
                  <span className="text-xs text-text-secondary">• {viewingInternship.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Role Description
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-border">
                {viewingInternship.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Candidate Prerequisites
              </h4>
              <ul className="text-xs text-slate-700 space-y-1 bg-slate-50 p-3 rounded-lg border border-border list-disc list-inside">
                {viewingInternship.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Eligible Departments</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {viewingInternship.eligibleDepartmentNames.join(', ')}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-border">
                <span className="text-slate-400 font-medium">Total Reserved Slots</span>
                <p className="font-bold text-teal mt-0.5">{viewingInternship.totalSlots} Seats</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingInternship(null)}>
                Close Specifications
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingInternship}
        onClose={() => setDeletingInternship(null)}
        onConfirm={handleDelete}
        title="Archive / Delete Internship?"
        message={`Are you sure you want to remove "${deletingInternship?.title}" from ${deletingInternship?.companyName}?`}
        confirmText="Delete Internship"
        variant="danger"
      />
    </div>
  );
};
