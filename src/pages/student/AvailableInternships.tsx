import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import { internshipService } from '../../services/internship.service';
import { applicationService } from '../../services/application.service';
import { departmentService } from '../../services/department.service';
import { useAuth } from '../../context/AuthContext';
import { Internship, Application, Department } from '../../types';

export const StudentAvailableInternships: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [internships, setInternships] = useState<Internship[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [ints, depts, apps] = await Promise.all([
          internshipService.getPublished(),
          departmentService.getAll(),
          user ? applicationService.getByStudentId(user.id) : Promise.resolve([]),
        ]);
        setInternships(ints);
        setDepartments(depts);
        setMyApplications(apps);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const appliedInternshipIds = useMemo(() => {
    return new Set(myApplications.map((a) => a.internshipId));
  }, [myApplications]);

  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = !deptFilter || item.eligibleDepartmentIds.includes(deptFilter);
      const matchesType = !workTypeFilter || item.type === workTypeFilter;

      return matchesSearch && matchesDept && matchesType;
    });
  }, [internships, searchQuery, deptFilter, workTypeFilter]);

  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const paginatedInternships = filteredInternships.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Internship Opportunities"
        description="Official institutional postings from corporate partners. Select an opportunity to review eligibility prerequisites and submit your nomination."
      />

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative col-span-1 sm:col-span-1 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
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
              <option value="">All Eligible Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={workTypeFilter}
              onChange={(e) => {
                setWorkTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            >
              <option value="">All Work Modes</option>
              <option value="On-site">On-site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Internships Grid */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : filteredInternships.length === 0 ? (
        <EmptyState
          title="No internships match your criteria"
          description="Try broadening your search keywords or resetting your department filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setDeptFilter('');
            setWorkTypeFilter('');
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedInternships.map((int) => {
              const hasApplied = appliedInternshipIds.has(int.id);
              const isEligible = !user?.departmentId || int.eligibleDepartmentIds.includes(user.departmentId);

              return (
                <Card
                  key={int.id}
                  hover
                  className="p-5 flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0">
                          <img
                            src={int.companyLogo}
                            alt={int.companyName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy text-sm line-clamp-1 group-hover:text-teal transition-colors">
                            {int.title}
                          </h3>
                          <p className="text-xs font-semibold text-teal">{int.companyName}</p>
                        </div>
                      </div>
                      {hasApplied && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          Applied
                        </span>
                      )}
                    </div>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 mb-3">
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

                    {/* Description snippet */}
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed mb-4">
                      {int.description}
                    </p>

                    {/* Quota & Eligibility summary */}
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-border text-[11px] space-y-1 mb-2">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Total Available Seats:</span>
                        <span className="text-navy font-bold">{int.totalSlots} Slots</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Deadline:</span>
                        <span className="font-medium text-slate-700">{int.applicationDeadline}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        Eligible: {int.eligibleDepartmentNames.join(', ')}
                      </div>
                    </div>
                  </div>

                  {/* Footer / CTA */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <div>
                      {!isEligible ? (
                        <span className="text-[10px] text-danger font-medium">Not open for your major</span>
                      ) : (
                        <span className="text-[10px] text-teal font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Eligible to Apply
                        </span>
                      )}
                    </div>

                    <Button
                      variant={hasApplied ? 'secondary' : 'teal'}
                      size="sm"
                      onClick={() => navigate(`/student/internships/${int.id}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {hasApplied ? 'View Status' : 'Details & Apply'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredInternships.length}
            itemsPerPage={itemsPerPage}
          />
        </>
      )}
    </div>
  );
};
