import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  DollarSign,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { internshipService } from '../../services/internship.service';
import { useAuth } from '../../context/AuthContext';
import { Internship } from '../../types';

export const FocalPersonInternships: React.FC = () => {
  const { user } = useAuth();
  const deptId = user?.departmentId || 'dept-1';
  const deptName = user?.departmentName || 'Computer Science';

  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingInternship, setViewingInternship] = useState<Internship | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await internshipService.getForDepartment(deptId);
        setInternships(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [deptId]);

  const filteredInternships = useMemo(() => {
    return internships.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [internships, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department Internship Opportunities — ${deptName}`}
        description={`Available corporate placements and quota allocations open to students of ${deptName}.`}
      />

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search department openings by job title or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </Card>

      {/* Internships Grid */}
      {isLoading ? (
        <TableSkeleton rows={3} cols={4} />
      ) : filteredInternships.length === 0 ? (
        <EmptyState
          title="No opportunities currently open"
          description={`There are currently no active internship quotas allocated for ${deptName}.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInternships.map((int) => (
            <Card key={int.id} hover className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
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
                </div>

                <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                  {int.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-lg border border-border text-xs space-y-1.5 mb-2">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Total Quota:</span>
                    <span className="text-navy font-bold">{int.totalSlots} Seats</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Deadline:</span>
                    <span className="font-medium text-slate-700">{int.applicationDeadline}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Eligible Batches: <span className="text-slate-700">{int.eligibleBatchNames.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setViewingInternship(int)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Details & Criteria
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {viewingInternship && (
        <Modal
          isOpen={!!viewingInternship}
          onClose={() => setViewingInternship(null)}
          title="Placement Specification"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0">
                <img
                  src={viewingInternship.companyLogo}
                  alt={viewingInternship.companyName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm">{viewingInternship.title}</h3>
                <p className="text-xs font-semibold text-teal">{viewingInternship.companyName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{viewingInternship.location} • {viewingInternship.type}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <span className="font-bold text-navy uppercase tracking-wider block mb-1">
                Role Description
              </span>
              <p className="text-slate-700 leading-relaxed">{viewingInternship.description}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <span className="font-bold text-navy uppercase tracking-wider block mb-1">
                Academic & Technical Prerequisites
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {viewingInternship.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewingInternship(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
