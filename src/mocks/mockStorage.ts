import {
  Department,
  Batch,
  FocalPerson,
  Student,
  Internship,
  Application,
  CompletionReport,
  Notification,
  User,
  ApplicationStatus,
  ReportStatus,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_BATCHES,
  INITIAL_FOCAL_PERSONS,
  INITIAL_STUDENTS,
  INITIAL_INTERNSHIPS,
  INITIAL_APPLICATIONS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
} from './mockData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'imp_departments',
  BATCHES: 'imp_batches',
  FOCAL_PERSONS: 'imp_focal_persons',
  STUDENTS: 'imp_students',
  INTERNSHIPS: 'imp_internships',
  APPLICATIONS: 'imp_applications',
  REPORTS: 'imp_reports',
  NOTIFICATIONS: 'imp_notifications',
  CURRENT_USER: 'imp_current_user',
  TOKEN: 'imp_auth_token',
};

class MockStorageAdapter {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('Storage set error:', err);
    }
  }

  public init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
      this.set(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
      this.set(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FOCAL_PERSONS)) {
      this.set(STORAGE_KEYS.FOCAL_PERSONS, INITIAL_FOCAL_PERSONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.set(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INTERNSHIPS)) {
      this.set(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPLICATIONS)) {
      this.set(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      this.set(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.admin);
      this.set(STORAGE_KEYS.TOKEN, 'mock-jwt-admin-token');
    }
  }

  public resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.FOCAL_PERSONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.INTERNSHIPS);
    localStorage.removeItem(STORAGE_KEYS.APPLICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    this.init();
  }

  // --- Auth & Users ---
  public getCurrentUser(): User {
    this.init();
    return this.get<User>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.admin);
  }

  public setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.set(STORAGE_KEYS.TOKEN, `mock-jwt-${user.role.toLowerCase()}-token`);
  }

  public getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  public clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  }

  // --- Departments ---
  public getDepartments(): Department[] {
    this.init();
    return this.get<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  public saveDepartment(dept: Partial<Department> & { name: string; code: string }): Department {
    const list = this.getDepartments();
    if (dept.id) {
      const idx = list.findIndex((d) => d.id === dept.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...dept };
        this.set(STORAGE_KEYS.DEPARTMENTS, list);
        return list[idx];
      }
    }
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: dept.name,
      code: dept.code.toUpperCase(),
      description: dept.description || '',
      status: dept.status || 'ACTIVE',
      focalPersonId: dept.focalPersonId,
      focalPersonName: dept.focalPersonName,
      studentCount: dept.studentCount || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newDept);
    this.set(STORAGE_KEYS.DEPARTMENTS, list);
    return newDept;
  }

  public deleteDepartment(id: string): void {
    const list = this.getDepartments().filter((d) => d.id !== id);
    this.set(STORAGE_KEYS.DEPARTMENTS, list);
  }

  // --- Batches ---
  public getBatches(): Batch[] {
    this.init();
    return this.get<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  }

  public saveBatch(batch: Partial<Batch> & { name: string; startYear: number; endYear: number }): Batch {
    const list = this.getBatches();
    if (batch.id) {
      const idx = list.findIndex((b) => b.id === batch.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...batch };
        this.set(STORAGE_KEYS.BATCHES, list);
        return list[idx];
      }
    }
    const newBatch: Batch = {
      id: `batch-${Date.now()}`,
      name: batch.name,
      startYear: batch.startYear,
      endYear: batch.endYear,
      status: batch.status || 'ACTIVE',
      studentCount: batch.studentCount || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newBatch);
    this.set(STORAGE_KEYS.BATCHES, list);
    return newBatch;
  }

  public deleteBatch(id: string): void {
    const list = this.getBatches().filter((b) => b.id !== id);
    this.set(STORAGE_KEYS.BATCHES, list);
  }

  // --- Focal Persons ---
  public getFocalPersons(): FocalPerson[] {
    this.init();
    return this.get<FocalPerson[]>(STORAGE_KEYS.FOCAL_PERSONS, INITIAL_FOCAL_PERSONS);
  }

  public saveFocalPerson(fp: Partial<FocalPerson> & { fullName: string; email: string; assignedDepartmentId: string }): FocalPerson {
    const list = this.getFocalPersons();
    const depts = this.getDepartments();
    const dept = depts.find((d) => d.id === fp.assignedDepartmentId);

    if (fp.id) {
      const idx = list.findIndex((f) => f.id === fp.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...fp,
          assignedDepartmentName: dept ? dept.name : list[idx].assignedDepartmentName,
        };
        this.set(STORAGE_KEYS.FOCAL_PERSONS, list);
        return list[idx];
      }
    }
    const newFp: FocalPerson = {
      id: `fp-${Date.now()}`,
      fullName: fp.fullName,
      email: fp.email,
      contactNumber: fp.contactNumber || '',
      assignedDepartmentId: fp.assignedDepartmentId,
      assignedDepartmentName: dept ? dept.name : 'Unknown Department',
      accountStatus: fp.accountStatus || 'ACTIVE',
      designation: fp.designation || 'Lecturer & Focal Person',
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newFp);
    this.set(STORAGE_KEYS.FOCAL_PERSONS, list);
    return newFp;
  }

  public toggleFocalPersonStatus(id: string): FocalPerson | undefined {
    const list = this.getFocalPersons();
    const fp = list.find((f) => f.id === id);
    if (fp) {
      fp.accountStatus = fp.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.set(STORAGE_KEYS.FOCAL_PERSONS, list);
      return fp;
    }
  }

  // --- Students ---
  public getStudents(): Student[] {
    this.init();
    return this.get<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public saveStudent(std: Partial<Student> & { fullName: string; rollNumber: string; email: string; departmentId: string; batchId: string }): Student {
    const list = this.getStudents();
    const dept = this.getDepartments().find((d) => d.id === std.departmentId);
    const batch = this.getBatches().find((b) => b.id === std.batchId);

    if (std.id) {
      const idx = list.findIndex((s) => s.id === std.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...std,
          departmentName: dept ? dept.name : list[idx].departmentName,
          batchName: batch ? batch.name : list[idx].batchName,
        };
        this.set(STORAGE_KEYS.STUDENTS, list);
        return list[idx];
      }
    }
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      fullName: std.fullName,
      rollNumber: std.rollNumber,
      cnic: std.cnic || '35201-0000000-0',
      departmentId: std.departmentId,
      departmentName: dept ? dept.name : 'General',
      batchId: std.batchId,
      batchName: batch ? batch.name : 'General',
      cellNumber: std.cellNumber || '',
      email: std.email,
      cgpa: std.cgpa || 3.0,
      status: std.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    list.unshift(newStudent);
    this.set(STORAGE_KEYS.STUDENTS, list);
    return newStudent;
  }

  public toggleStudentStatus(id: string): Student | undefined {
    const list = this.getStudents();
    const std = list.find((s) => s.id === id);
    if (std) {
      std.status = std.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.set(STORAGE_KEYS.STUDENTS, list);
      return std;
    }
  }

  // --- Internships ---
  public getInternships(): Internship[] {
    this.init();
    return this.get<Internship[]>(STORAGE_KEYS.INTERNSHIPS, INITIAL_INTERNSHIPS);
  }

  public saveInternship(internship: Partial<Internship> & { title: string; companyName: string }): Internship {
    const list = this.getInternships();
    const allDepts = this.getDepartments();
    const allBatches = this.getBatches();

    const deptNames = (internship.eligibleDepartmentIds || []).map((id) => {
      const d = allDepts.find((dept) => dept.id === id);
      return d ? d.name : id;
    });

    const batchNames = (internship.eligibleBatchIds || []).map((id) => {
      const b = allBatches.find((batch) => batch.id === id);
      return b ? b.name : id;
    });

    if (internship.id) {
      const idx = list.findIndex((item) => item.id === internship.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          ...internship,
          eligibleDepartmentNames: deptNames.length ? deptNames : list[idx].eligibleDepartmentNames,
          eligibleBatchNames: batchNames.length ? batchNames : list[idx].eligibleBatchNames,
        };
        this.set(STORAGE_KEYS.INTERNSHIPS, list);
        return list[idx];
      }
    }

    const newInt: Internship = {
      id: `int-${Date.now()}`,
      title: internship.title,
      companyName: internship.companyName,
      companyLogo: internship.companyLogo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=60',
      location: internship.location || 'Lahore (On-site)',
      type: internship.type || 'On-site',
      stipend: internship.stipend || 'Unpaid',
      duration: internship.duration || '8 Weeks',
      description: internship.description || '',
      requirements: internship.requirements || [],
      eligibleDepartmentIds: internship.eligibleDepartmentIds || [],
      eligibleDepartmentNames: deptNames,
      eligibleBatchIds: internship.eligibleBatchIds || [],
      eligibleBatchNames: batchNames,
      departmentSlots: internship.departmentSlots || [],
      batchSlots: internship.batchSlots || [],
      totalSlots: internship.totalSlots || 10,
      applicationDeadline: internship.applicationDeadline || '2026-12-31',
      isPublished: internship.isPublished ?? true,
      status: internship.isPublished ? 'ACTIVE' : 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
    };

    list.unshift(newInt);
    this.set(STORAGE_KEYS.INTERNSHIPS, list);
    return newInt;
  }

  public toggleInternshipPublish(id: string): Internship | undefined {
    const list = this.getInternships();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.isPublished = !item.isPublished;
      item.status = item.isPublished ? 'ACTIVE' : 'DRAFT';
      this.set(STORAGE_KEYS.INTERNSHIPS, list);
      return item;
    }
  }

  public deleteInternship(id: string): void {
    const list = this.getInternships().filter((i) => i.id !== id);
    this.set(STORAGE_KEYS.INTERNSHIPS, list);
  }

  // --- Applications ---
  public getApplications(): Application[] {
    this.init();
    return this.get<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  public createApplication(data: {
    student: Student;
    internship: Internship;
    statementOfPurpose?: string;
    resumeFileName?: string;
  }): Application {
    const list = this.getApplications();
    const newApp: Application = {
      id: `app-${Date.now()}`,
      studentId: data.student.id,
      studentName: data.student.fullName,
      rollNumber: data.student.rollNumber,
      departmentId: data.student.departmentId,
      departmentName: data.student.departmentName,
      batchId: data.student.batchId,
      batchName: data.student.batchName,
      internshipId: data.internship.id,
      internshipTitle: data.internship.title,
      companyName: data.internship.companyName,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'PENDING_FOCAL_REVIEW',
      statementOfPurpose: data.statementOfPurpose || '',
      resumeFileName: data.resumeFileName || 'Resume.pdf',
      cgpa: data.student.cgpa || 3.0,
      reviewHistory: [],
    };

    list.unshift(newApp);
    this.set(STORAGE_KEYS.APPLICATIONS, list);

    // Also create notification for Focal Person
    this.addNotification({
      userId: 'fp-1',
      title: 'New Nomination Request',
      message: `${data.student.fullName} (${data.student.rollNumber}) applied for ${data.internship.title} at ${data.internship.companyName}.`,
      type: 'INFO',
      link: '/focal-person/nominations',
    });

    return newApp;
  }

  public focalPersonReview(
    applicationId: string,
    action: 'FORWARD' | 'REJECT',
    remarks: string,
    reviewer: FocalPerson | User
  ): Application {
    const list = this.getApplications();
    const app = list.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const reviewerName = 'fullName' in reviewer ? reviewer.fullName : reviewer.name;
    const timestamp = new Date().toLocaleString();
    if (action === 'FORWARD') {
      app.status = 'FORWARDED_TO_DIRECTOR';
      app.focalPersonRemarks = remarks;
      app.reviewHistory.push({
        stage: 'FOCAL_PERSON',
        action: 'FORWARDED',
        reviewerName,
        reviewerRole: 'FOCAL_PERSON',
        comment: remarks,
        timestamp,
      });

      this.addNotification({
        userId: 'admin-1',
        title: 'Application Forwarded for Approval',
        message: `${app.studentName} for ${app.companyName} forwarded by ${reviewerName}.`,
        type: 'INFO',
        link: '/admin/applications',
      });
    } else {
      app.status = 'REJECTED_BY_FOCAL';
      app.focalPersonRemarks = remarks;
      app.reviewHistory.push({
        stage: 'FOCAL_PERSON',
        action: 'REJECTED',
        reviewerName,
        reviewerRole: 'FOCAL_PERSON',
        comment: remarks,
        timestamp,
      });

      this.addNotification({
        userId: app.studentId,
        title: 'Application Update',
        message: `Your application for ${app.internshipTitle} was reviewed by Department Focal Person: ${remarks}`,
        type: 'ALERT',
        link: '/student/applications',
      });
    }

    this.set(STORAGE_KEYS.APPLICATIONS, list);
    return app;
  }

  public directorReview(
    applicationId: string,
    action: 'APPROVE' | 'REJECT',
    remarks: string,
    reviewer: User
  ): Application {
    const list = this.getApplications();
    const app = list.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const timestamp = new Date().toLocaleString();
    if (action === 'APPROVE') {
      app.status = 'APPROVED_BY_DIRECTOR';
      app.directorRemarks = remarks;
      app.approvalLetterIssuedAt = new Date().toISOString().split('T')[0];
      const deptCode = app.departmentName.includes('Computer') ? 'CS' : 'SE';
      app.approvalLetterNumber = `IMP/${new Date().getFullYear()}/${deptCode}-${Math.floor(1000 + Math.random() * 9000)}`;

      app.reviewHistory.push({
        stage: 'DIRECTOR',
        action: 'APPROVED',
        reviewerName: reviewer.name,
        reviewerRole: 'ADMIN',
        comment: remarks,
        timestamp,
      });

      this.addNotification({
        userId: app.studentId,
        title: 'Nomination Approved by Director',
        message: `Congratulations! Your internship nomination for ${app.companyName} has been approved. Your official approval letter is ready for download.`,
        type: 'SUCCESS',
        link: '/student/approval-letters',
      });
    } else {
      app.status = 'REJECTED_BY_DIRECTOR';
      app.directorRemarks = remarks;
      app.reviewHistory.push({
        stage: 'DIRECTOR',
        action: 'REJECTED',
        reviewerName: reviewer.name,
        reviewerRole: 'ADMIN',
        comment: remarks,
        timestamp,
      });

      this.addNotification({
        userId: app.studentId,
        title: 'Application Not Approved',
        message: `Your application for ${app.internshipTitle} at ${app.companyName} was not approved by the Director.`,
        type: 'ALERT',
        link: '/student/applications',
      });
    }

    this.set(STORAGE_KEYS.APPLICATIONS, list);
    return app;
  }

  // --- Completion Reports ---
  public getReports(): CompletionReport[] {
    this.init();
    return this.get<CompletionReport[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  }

  public submitReport(data: {
    applicationId: string;
    student: User | Student;
    internshipTitle: string;
    companyName: string;
    reportSummary: string;
    fileName: string;
    fileSize: string;
  }): CompletionReport {
    const list = this.getReports();
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === data.applicationId);

    const studentName = 'fullName' in data.student ? data.student.fullName : data.student.name;

    const newReport: CompletionReport = {
      id: `rep-${Date.now()}`,
      applicationId: data.applicationId,
      studentId: data.student.id,
      studentName,
      rollNumber: data.student.rollNumber || '2021-CS-104',
      departmentId: data.student.departmentId || 'dept-1',
      departmentName: data.student.departmentName || 'Computer Science',
      batchName: (data.student as User).batchName || 'Fall 2021',
      internshipId: app ? app.internshipId : 'int-1',
      internshipTitle: data.internshipTitle,
      companyName: data.companyName,
      submissionDate: new Date().toISOString().split('T')[0],
      fileName: data.fileName,
      fileSize: data.fileSize,
      reportSummary: data.reportSummary,
      status: 'PENDING_REVIEW',
    };

    list.unshift(newReport);
    this.set(STORAGE_KEYS.REPORTS, list);

    if (app) {
      app.completionReportId = newReport.id;
      this.set(STORAGE_KEYS.APPLICATIONS, apps);
    }

    this.addNotification({
      userId: 'admin-1',
      title: 'New Internship Completion Report',
      message: `${newReport.studentName} submitted final internship report for ${newReport.companyName}.`,
      type: 'INFO',
      link: '/admin/report-repository',
    });

    return newReport;
  }

  public reviewReport(
    reportId: string,
    status: ReportStatus,
    grade: 'Satisfactory' | 'Unsatisfactory' | 'Excellent',
    remarks: string,
    reviewerName: string
  ): CompletionReport {
    const list = this.getReports();
    const rep = list.find((r) => r.id === reportId);
    if (!rep) throw new Error('Report not found');

    rep.status = status;
    rep.grade = grade;
    rep.reviewerRemarks = remarks;
    rep.reviewedBy = reviewerName;
    rep.reviewedAt = new Date().toISOString().split('T')[0];

    // If report is approved, mark application as COMPLETED
    if (status === 'APPROVED') {
      const apps = this.getApplications();
      const app = apps.find((a) => a.id === rep.applicationId);
      if (app) {
        app.status = 'COMPLETED';
        this.set(STORAGE_KEYS.APPLICATIONS, apps);
      }
    }

    this.set(STORAGE_KEYS.REPORTS, list);
    return rep;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): Notification[] {
    this.init();
    const list = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return list;
    return list.filter((n) => n.userId === userId || n.userId === 'all');
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const notif = list.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public addNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const list = this.getNotifications();
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    list.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  }
}

export const mockStorage = new MockStorageAdapter();
