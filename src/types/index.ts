export type Role = 'ADMIN' | 'FOCAL_PERSON' | 'STUDENT';

export type ApplicationStatus =
  | 'APPLIED'
  | 'PENDING_FOCAL_REVIEW'
  | 'REJECTED_BY_FOCAL'
  | 'FORWARDED_TO_DIRECTOR'
  | 'APPROVED_BY_DIRECTOR'
  | 'REJECTED_BY_DIRECTOR'
  | 'COMPLETED';

export type ReportStatus = 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'APPROVED' | 'REVISIONS_REQUESTED';

export type EntityStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  departmentId?: string;
  departmentName?: string;
  rollNumber?: string;
  batchId?: string;
  batchName?: string;
  cellNumber?: string;
  cnic?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: EntityStatus;
  focalPersonId?: string;
  focalPersonName?: string;
  studentCount?: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  status: EntityStatus;
  departmentIds?: string[];
  studentCount?: number;
  createdAt: string;
}

export interface FocalPerson {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  assignedDepartmentId: string;
  assignedDepartmentName: string;
  accountStatus: EntityStatus;
  designation: string;
  createdAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  rollNumber: string;
  cnic: string;
  departmentId: string;
  departmentName: string;
  batchId: string;
  batchName: string;
  cellNumber: string;
  email: string;
  cgpa?: number;
  status: EntityStatus;
  createdAt: string;
}

export interface DepartmentSlot {
  departmentId: string;
  departmentName: string;
  totalSlots: number;
  filledSlots: number;
}

export interface BatchSlot {
  batchId: string;
  batchName: string;
  totalSlots: number;
  filledSlots: number;
}

export interface Internship {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  type: 'On-site' | 'Remote' | 'Hybrid';
  stipend: string;
  duration: string; // e.g. "8 Weeks"
  description: string;
  requirements: string[];
  eligibleDepartmentIds: string[];
  eligibleDepartmentNames: string[];
  eligibleBatchIds: string[];
  eligibleBatchNames: string[];
  departmentSlots: DepartmentSlot[];
  batchSlots: BatchSlot[];
  totalSlots: number;
  applicationDeadline: string;
  isPublished: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
}

export interface ApplicationReviewHistory {
  stage: 'FOCAL_PERSON' | 'DIRECTOR';
  action: 'FORWARDED' | 'APPROVED' | 'REJECTED';
  reviewerName: string;
  reviewerRole: Role;
  comment?: string;
  timestamp: string;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentId: string;
  departmentName: string;
  batchId: string;
  batchName: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  applicationDate: string;
  status: ApplicationStatus;
  statementOfPurpose?: string;
  resumeFileName?: string;
  cgpa: number;
  focalPersonRemarks?: string;
  directorRemarks?: string;
  reviewHistory: ApplicationReviewHistory[];
  approvalLetterIssuedAt?: string;
  approvalLetterNumber?: string;
  completionReportId?: string;
}

export interface CompletionReport {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentId: string;
  departmentName: string;
  batchName: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  submissionDate: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  reportSummary: string;
  status: ReportStatus;
  grade?: 'Satisfactory' | 'Unsatisfactory' | 'Excellent';
  reviewerRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalDepartments: number;
  totalBatches: number;
  totalInternships: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  completedInternships: number;
  pendingReports: number;
  submittedReports: number;
  // Specific for Focal Person
  departmentStudents?: number;
  departmentApplications?: number;
  pendingNominations?: number;
  approvedNominations?: number;
  rejectedNominations?: number;
}
